/**
 * @file Pets Service
 * @description Business logic layer for pet operations
 */

import { logger } from "../../config/logger";
import { ForbiddenError, NotFoundError } from "../../types/errors";
import { calculateTotalPages, parsePagination } from "../../utils/formatter";
import * as petsRepo from "./repository";
import type { CreatePetDTO, PetQueryParams, UpdatePetDTO } from "./types";

/**
 * Get all pets with pagination
 */
export async function getAllPets(queryParams: PetQueryParams) {
  const { page, limit } = parsePagination(queryParams.page, queryParams.limit);

  const filters = {
    page,
    limit,
    status: queryParams.status,
    sex: queryParams.sex,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  };

  const { pets, total } = await petsRepo.findPets(filters);

  return {
    items: pets,
    pagination: {
      page,
      limit,
      total,
      totalPages: calculateTotalPages(total, limit),
    },
  };
}

/**
 * Get pet by ID
 */
export async function getPetById(petId: string) {
  const pet = await petsRepo.findPetById(petId);

  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  return pet;
}

/**
 * Create a new pet
 */
export async function createPet(data: CreatePetDTO) {
  const newPet = await petsRepo.createPet({
    ...data,
    birthDateApprox: data.birthDate,
  });

  logger.info({ petId: newPet.petId, name: newPet.name }, "Pet created");

  return newPet;
}

/**
 * Update pet
 */
export async function updatePet(petId: string, data: UpdatePetDTO) {
  const existingPet = await petsRepo.findPetById(petId);

  if (!existingPet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  const updateData = {
    ...data,
    birthDateApprox: data.birthDate,
  };

  const updatedPet = await petsRepo.updatePet(petId, updateData);

  logger.info({ petId, updates: Object.keys(data) }, "Pet updated");

  return updatedPet;
}

/**
 * Delete pet
 */
export async function deletePet(petId: string): Promise<void> {
  const pet = await petsRepo.findPetById(petId);

  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  await petsRepo.softDeletePet(petId);

  logger.info({ petId }, "Pet deleted");
}

/**
 * Update pet status
 */
export async function updatePetStatus(
  petId: string,
  status: string,
): Promise<void> {
  const pet = await petsRepo.findPetById(petId);

  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  // Validate status transition
  if (pet.status === "DECEASED" && status !== "DECEASED") {
    throw new ForbiddenError(
      "Cannot change status of deceased pet",
      "INVALID_STATUS_TRANSITION",
    );
  }

  await petsRepo.updatePetStatus(petId, status);

  logger.info(
    { petId, oldStatus: pet.status, newStatus: status },
    "Pet status updated",
  );
}

/**
 * Get CLIENT's own pets
 */
export async function getMyPets(userId: string) {
  return petsRepo.findPetsByOwner(userId);
}

/**
 * Create pet for CLIENT (registered as owned by user)
 */
export async function createMyPet(userId: string, data: CreatePetDTO) {
  // CLIENT pets must have OWNED or LOST status
  const status = data.status === "LOST" ? "LOST" : "OWNED";

  const newPet = await petsRepo.createPet({
    ...data,
    birthDateApprox: data.birthDate,
    status,
    ownerId: userId,
  });

  logger.info(
    { petId: newPet.petId, name: newPet.name, ownerId: userId },
    "Client pet registered",
  );

  return newPet;
}

/**
 * Update CLIENT's own pet
 */
export async function updateMyPet(
  userId: string,
  petId: string,
  data: UpdatePetDTO,
) {
  const existingPet = await petsRepo.findPetById(petId);

  if (!existingPet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  // Validate ownership
  if (existingPet.ownerId !== userId) {
    throw new ForbiddenError(
      "You can only update your own pets",
      "NOT_PET_OWNER",
    );
  }

  const updateData = {
    ...data,
    birthDateApprox: data.birthDate,
  };

  const updatedPet = await petsRepo.updatePet(petId, updateData);

  logger.info(
    { petId, ownerId: userId, updates: Object.keys(data) },
    "Client pet updated",
  );

  return updatedPet;
}

/**
 * Get all active lost pet alerts
 */
export async function getLostPetAlerts() {
  return petsRepo.findActiveLostPetAlerts();
}

/**
 * Create lost pet alert (CLIENT must own the pet)
 */
export async function createLostPetAlert(
  userId: string,
  data: {
    petId: string;
    lastSeenZone: string;
    contactPhone: string;
    message?: string;
  },
) {
  const pet = await petsRepo.findPetById(data.petId);

  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  // Validate ownership
  if (pet.ownerId !== userId) {
    throw new ForbiddenError(
      "You can only create alerts for your own pets",
      "NOT_PET_OWNER",
    );
  }

  // Update pet status to LOST
  await petsRepo.updatePetStatus(data.petId, "LOST");

  // Create alert
  const alert = await petsRepo.createLostPetAlert({
    petId: data.petId,
    lastSeenZone: data.lastSeenZone,
    contactPhone: data.contactPhone,
    message: data.message,
    isActive: true,
  });

  logger.info(
    { alertId: alert.alertId, petId: data.petId, ownerId: userId },
    "Lost pet alert created",
  );

  return alert;
}

/**
 * Resolve lost pet alert (mark as found)
 */
export async function resolveLostPetAlert(userId: string, alertId: string) {
  const alert = await petsRepo.findLostPetAlertById(alertId);

  if (!alert) {
    throw new NotFoundError("Lost pet alert not found", "ALERT_NOT_FOUND");
  }

  // Get pet to verify ownership
  const pet = await petsRepo.findPetById(alert.petId);

  if (!pet || pet.ownerId !== userId) {
    throw new ForbiddenError(
      "You can only resolve alerts for your own pets",
      "NOT_PET_OWNER",
    );
  }

  // Resolve alert
  await petsRepo.resolveLostPetAlert(alertId);

  // Update pet status back to OWNED
  await petsRepo.updatePetStatus(alert.petId, "OWNED");

  logger.info(
    { alertId, petId: alert.petId, ownerId: userId },
    "Lost pet alert resolved",
  );
}
