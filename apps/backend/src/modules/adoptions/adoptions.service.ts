/**
 * @file Adoptions Service
 * @description Business logic for adoption applications
 */

import { logger } from "../../config/logger";
import { eventBus } from "../../common/events";
import { ForbiddenError, NotFoundError, ValidationError } from "../../common/errors";
import * as petsRepo from "../pets/pets.repository";
import * as petsService from "../pets/pets.service";
import * as adoptionsRepo from "./adoptions.repository";
import type {
  CreateAdoptionApplicationDTO,
  CreateFollowupDTO,
  CreateInterviewDTO,
  UpdateFollowupDTO,
  UpdateInterviewDTO,
} from "./adoptions.dto";

// ===== STATE MACHINE =====

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["UNDER_REVIEW", "REJECTED", "REVOKED"],
  UNDER_REVIEW: ["INTERVIEW_SCHEDULED", "REJECTED", "REVOKED"],
  INTERVIEW_SCHEDULED: ["APPROVED", "REJECTED", "REVOKED"],
  APPROVED: ["PROBATION", "REVOKED"],
  PROBATION: ["COMPLETED", "REJECTED", "REVOKED"],
};

const MANDATORY_FOLLOWUP_MONTHS = [1, 3, 6];

function validateTransition(currentStatus: string, newStatus: string): void {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition from ${currentStatus} to ${newStatus}`,
      "INVALID_STATUS_TRANSITION",
      { status: [`Allowed transitions from ${currentStatus}: ${allowed?.join(", ") || "none"}`] },
    );
  }
}

export async function createAdoptionApplication(
  userId: string,
  data: CreateAdoptionApplicationDTO,
) {
  const pet = await petsService.getPetById(data.petId);

  if (pet.status !== "ADOPTION_AVAILABLE") {
    throw new ValidationError("Pet is not available for adoption", "PET_NOT_AVAILABLE", {
      petId: [`Pet is currently ${pet.status}`],
    });
  }

  const application = await adoptionsRepo.createAdoptionApplication({
    clientId: userId,
    petId: data.petId,
    spaceDescription: data.housingType,
    incomeDescription: data.canAffordVetCare ? "Can afford vet care" : "Limited income",
    otherPetsDescription: data.otherPetsDescription || "",
    motivation: data.reasonForAdoption,
    evidenceUrls: data.evidenceUrls || [],
    status: "REQUESTED" as any,
  });

  logger.info(
    { applicationId: application.applicationId, petId: data.petId },
    "Adoption application created",
  );

  eventBus.emit("adoption.created", {
    applicationId: application.applicationId,
    clientId: userId,
    petId: data.petId,
  });

  return application;
}

export async function getAdoptionById(adoptionId: string) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);

  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }

  return adoption;
}

export async function updateAdoptionStatus(
  adoptionId: string,
  status: string,
  adminNotes?: string,
) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);

  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }

  validateTransition(adoption.status, status);

  const previousStatus = adoption.status;

  // Handle special transitions atomically
  if (status === "PROBATION") {
    return handleProbationTransition(adoption, adminNotes);
  }
  if (status === "COMPLETED") {
    return handleCompletedTransition(adoption, adminNotes);
  }
  if (status === "REJECTED" || status === "REVOKED") {
    return handleRejectionTransition(adoption, status, adminNotes);
  }

  // Simple status transitions (REQUESTED→UNDER_REVIEW, etc.)
  const updated = await adoptionsRepo.updateAdoptionFields(adoptionId, {
    status,
    ...(adminNotes && { adminNotes }),
  });

  logger.info({ adoptionId, newStatus: status }, "Adoption status updated");

  eventBus.emit("adoption.statusChanged", {
    adoptionId,
    previousStatus,
    newStatus: status,
  });

  return updated;
}

async function handleProbationTransition(
  adoption: { applicationId: string; petId: string; clientId: string; status: string },
  adminNotes?: string,
) {
  // Atomic: update adoption + set pet IN_PROCESS + reject other applications
  const updated = await adoptionsRepo.updateAdoptionFields(adoption.applicationId, {
    status: "PROBATION",
    decidedAt: new Date(),
    ...(adminNotes && { adminNotes }),
  });

  await petsRepo.updatePetStatusAndOwner(adoption.petId, "IN_PROCESS", null);
  await adoptionsRepo.rejectOtherPendingApplications(adoption.petId, adoption.applicationId);

  logger.info(
    { adoptionId: adoption.applicationId, petId: adoption.petId },
    "Adoption moved to PROBATION — pet set to IN_PROCESS, other applications rejected",
  );

  eventBus.emit("adoption.approved", {
    applicationId: adoption.applicationId,
    petId: adoption.petId,
    clientId: adoption.clientId,
  });

  eventBus.emit("adoption.statusChanged", {
    adoptionId: adoption.applicationId,
    previousStatus: adoption.status,
    newStatus: "PROBATION",
  });

  return updated;
}

async function handleCompletedTransition(
  adoption: { applicationId: string; petId: string; clientId: string; status: string },
  adminNotes?: string,
) {
  // Validate all mandatory followups are performed
  const completedMonths = await adoptionsRepo.getCompletedFollowupMonths(adoption.applicationId);
  const missingMonths = MANDATORY_FOLLOWUP_MONTHS.filter((m) => !completedMonths.includes(m));

  if (missingMonths.length > 0) {
    throw new ValidationError(
      "Cannot complete adoption: missing mandatory followups",
      "MISSING_FOLLOWUPS",
      { followups: [`Missing months: ${missingMonths.join(", ")}`] },
    );
  }

  // Atomic: update adoption + transfer pet ownership
  const updated = await adoptionsRepo.updateAdoptionFields(adoption.applicationId, {
    status: "COMPLETED",
    decidedAt: new Date(),
    ...(adminNotes && { adminNotes }),
  });

  await petsRepo.updatePetStatusAndOwner(adoption.petId, "OWNED", adoption.clientId);

  logger.info(
    { adoptionId: adoption.applicationId, petId: adoption.petId, clientId: adoption.clientId },
    "Adoption COMPLETED — pet ownership transferred",
  );

  eventBus.emit("adoption.completed", {
    applicationId: adoption.applicationId,
    petId: adoption.petId,
    clientId: adoption.clientId,
  });

  eventBus.emit("adoption.statusChanged", {
    adoptionId: adoption.applicationId,
    previousStatus: adoption.status,
    newStatus: "COMPLETED",
  });

  return updated;
}

async function handleRejectionTransition(
  adoption: { applicationId: string; petId: string; status: string },
  newStatus: string,
  adminNotes?: string,
) {
  const updated = await adoptionsRepo.updateAdoptionFields(adoption.applicationId, {
    status: newStatus,
    decidedAt: new Date(),
    ...(adminNotes && { adminNotes }),
  });

  // If pet was IN_PROCESS due to this adoption, revert to ADOPTION_AVAILABLE
  if (adoption.status === "PROBATION") {
    const pet = await petsRepo.findPetById(adoption.petId);
    if (pet && pet.status === "IN_PROCESS") {
      await petsRepo.updatePetStatusAndOwner(adoption.petId, "ADOPTION_AVAILABLE", null);
      logger.info({ petId: adoption.petId }, "Pet reverted to ADOPTION_AVAILABLE");
    }
  }

  logger.info({ adoptionId: adoption.applicationId, newStatus }, `Adoption ${newStatus}`);

  eventBus.emit("adoption.rejected", {
    applicationId: adoption.applicationId,
    petId: adoption.petId,
    reason: newStatus,
  });

  eventBus.emit("adoption.statusChanged", {
    adoptionId: adoption.applicationId,
    previousStatus: adoption.status,
    newStatus,
  });

  return updated;
}

export async function getMyAdoptions(userId: string) {
  return adoptionsRepo.findAdoptionsByUser(userId);
}

export async function getAllAdoptions() {
  return adoptionsRepo.findAllAdoptions();
}

export async function checkAdoptionAccess(
  adoptionId: string,
  userId: string,
  userRoles: string[],
): Promise<void> {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);

  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }

  // ADMIN can view any adoption
  if (userRoles.includes("ADMIN")) {
    return;
  }

  // VOLUNTEER with ADOPTION_COORD can view any adoption
  // Note: This will be validated by middleware requireVolunteerRole
  if (userRoles.includes("VOLUNTEER")) {
    return;
  }

  // Otherwise, user can only view their own adoptions
  if (adoption.clientId !== userId) {
    throw new ForbiddenError("You can only view your own adoption applications");
  }
}

// ===== INTERVIEWS =====

export async function scheduleInterview(
  adoptionId: string,
  interviewerId: string,
  data: CreateInterviewDTO,
) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);
  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }

  const interview = await adoptionsRepo.createInterview({
    entityType: "ADOPTION",
    entityId: adoptionId,
    interviewerId,
    scheduledAt: new Date(data.scheduledAt),
    modality: data.modality,
    durationMinutes: data.durationMinutes,
    locationDetails: data.locationDetails,
  });

  logger.info({ interviewId: interview.interviewId, adoptionId }, "Adoption interview scheduled");

  eventBus.emit("adoption.interviewScheduled", {
    interviewId: interview.interviewId,
    adoptionId,
  });

  return interview;
}

export async function getInterviewsByAdoption(adoptionId: string) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);
  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }
  return adoptionsRepo.findInterviewsByEntity("ADOPTION", adoptionId);
}

export async function updateInterview(interviewId: string, data: UpdateInterviewDTO) {
  const interview = await adoptionsRepo.findInterviewById(interviewId);
  if (!interview) {
    throw new NotFoundError("Interview not found", "INTERVIEW_NOT_FOUND");
  }

  const updateData: Record<string, unknown> = {};
  if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);
  if (data.modality) updateData.modality = data.modality;
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
  if (data.locationDetails !== undefined) updateData.locationDetails = data.locationDetails;
  if (data.result) updateData.result = data.result;
  if (data.observations !== undefined) updateData.observations = data.observations;
  if (data.occurredAt) updateData.occurredAt = new Date(data.occurredAt);

  const updated = await adoptionsRepo.updateInterview(interviewId, updateData as any);

  // Wire interview result to adoption status for ADOPTION interviews
  if (data.result && interview.entityType === "ADOPTION") {
    const adoption = await adoptionsRepo.findAdoptionById(interview.entityId);
    if (adoption && adoption.status === "INTERVIEW_SCHEDULED") {
      if (data.result === "NEGATIVE") {
        await updateAdoptionStatus(
          adoption.applicationId,
          "REJECTED",
          "Interview result: NEGATIVE",
        );
        logger.info(
          { adoptionId: adoption.applicationId },
          "Adoption auto-rejected due to negative interview",
        );
      } else if (data.result === "POSITIVE") {
        await updateAdoptionStatus(adoption.applicationId, "APPROVED");
        logger.info(
          { adoptionId: adoption.applicationId },
          "Adoption auto-advanced to APPROVED due to positive interview",
        );
      }
    }
  }

  return updated;
}

// ===== FOLLOWUPS =====

export async function createFollowup(adoptionId: string, adminId: string, data: CreateFollowupDTO) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);
  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }

  if (adoption.status !== "PROBATION" && adoption.status !== "COMPLETED") {
    throw new ValidationError(
      "Followups can only be created for adoptions in PROBATION or COMPLETED status",
      "INVALID_STATUS",
      { status: [`Current status: ${adoption.status}`] },
    );
  }

  const followup = await adoptionsRepo.createFollowup({
    applicationId: adoptionId,
    adminId,
    scheduledDate: data.scheduledDate,
    monthNumber: data.monthNumber,
    notes: data.notes,
  });

  logger.info({ followupId: followup.followupId, adoptionId }, "Adoption followup created");

  return followup;
}

export async function getFollowupsByAdoption(adoptionId: string) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);
  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }
  return adoptionsRepo.findFollowupsByApplication(adoptionId);
}

export async function updateFollowup(followupId: string, data: UpdateFollowupDTO) {
  const followup = await adoptionsRepo.findFollowupById(followupId);
  if (!followup) {
    throw new NotFoundError("Followup not found", "FOLLOWUP_NOT_FOUND");
  }

  const updateData: Record<string, unknown> = {};
  if (data.scheduledDate) updateData.scheduledDate = data.scheduledDate;
  if (data.notes) updateData.notes = data.notes;
  if (data.performedAt) updateData.performedAt = new Date(data.performedAt);

  const updated = await adoptionsRepo.updateFollowup(followupId, updateData as any);

  // Auto-detect completion: check if all mandatory followups are performed
  if (data.performedAt) {
    const adoption = await adoptionsRepo.findAdoptionById(followup.applicationId);
    if (adoption && adoption.status === "PROBATION") {
      const completedMonths = await adoptionsRepo.getCompletedFollowupMonths(
        followup.applicationId,
      );
      const allDone = MANDATORY_FOLLOWUP_MONTHS.every((m) => completedMonths.includes(m));

      if (allDone) {
        logger.info(
          { adoptionId: followup.applicationId },
          "All mandatory followups completed — auto-transitioning to COMPLETED",
        );
        await updateAdoptionStatus(
          followup.applicationId,
          "COMPLETED",
          "Auto-completed: all mandatory followups performed",
        );
      }
    }
  }

  return updated;
}
