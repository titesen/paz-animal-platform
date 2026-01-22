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
  const { page, limit, offset } = parsePagination(
    queryParams.page,
    queryParams.limit,
  );

  const filters = {
    page,
    limit,
    status: queryParams.status,
    speciesId: queryParams.speciesId
      ? parseInt(queryParams.speciesId)
      : undefined,
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
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
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
    birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
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
