/**
 * @file Adoptions Service
 * @description Business logic for adoption applications
 */

import { logger } from "../../config/logger";
import { eventBus } from "../../common/events";
import { ForbiddenError, NotFoundError, ValidationError } from "../../common/errors";
import * as petsService from "../pets/pets.service";
import * as adoptionsRepo from "./adoptions.repository";
import type {
  CreateAdoptionApplicationDTO,
  CreateFollowupDTO,
  CreateInterviewDTO,
  UpdateFollowupDTO,
  UpdateInterviewDTO,
} from "./adoptions.dto";

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

export async function updateAdoptionStatus(adoptionId: string, status: string) {
  const adoption = await adoptionsRepo.findAdoptionById(adoptionId);

  if (!adoption) {
    throw new NotFoundError("Adoption application not found", "ADOPTION_NOT_FOUND");
  }

  const updated = await adoptionsRepo.updateAdoptionStatus(adoptionId, status);

  logger.info({ adoptionId, newStatus: status }, "Adoption status updated");

  eventBus.emit("adoption.statusChanged", {
    adoptionId,
    previousStatus: adoption.status,
    newStatus: status,
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

  return adoptionsRepo.updateInterview(interviewId, updateData as any);
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

  return adoptionsRepo.updateFollowup(followupId, updateData as any);
}
