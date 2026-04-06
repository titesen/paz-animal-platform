/**
 * @file Adoptions Service
 * @description Business logic for adoption applications
 */

import { logger } from "../../config/logger";
import { ForbiddenError, NotFoundError } from "../../common/types/errors";
import * as adoptionsRepo from "./repository";
import type { CreateAdoptionApplicationDTO } from "./types";

export async function createAdoptionApplication(
  userId: string,
  data: CreateAdoptionApplicationDTO,
) {
  // TODO: Validate pet exists and is available for adoption

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
