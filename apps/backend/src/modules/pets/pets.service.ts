/**
 * @file Pets Service
 * @description Business logic layer for pet operations
 */

import { logger } from "../../config/logger";
import { ConflictError, ForbiddenError, NotFoundError } from "../../common/errors";
import { calculateTotalPages, parsePagination } from "../../common/utils/formatter";
import * as petsRepo from "./pets.repository";
import type {
  ApplyVaccineDTO,
  CreateBreedDTO,
  CreatePetDTO,
  CreateSpeciesDTO,
  PetQueryParams,
  UpdateBreedDTO,
  UpdatePetDTO,
} from "./pets.dto";

/**
 * QR Code Smart Resolution
 * Returns different data based on pet status
 */
export async function resolveQrCode(qrCode: string) {
  const pet = await petsRepo.findPetByQrCode(qrCode);

  if (!pet) {
    throw new NotFoundError("Pet not found for this QR code", "QR_PET_NOT_FOUND");
  }

  if (pet.status === "DECEASED") {
    throw new NotFoundError("This pet profile is no longer available", "PET_DECEASED");
  }

  if (pet.status === "ADOPTION_AVAILABLE" || pet.status === "IN_PROCESS") {
    return {
      view: "adoption_profile" as const,
      pet: {
        petId: pet.petId,
        name: pet.name,
        status: pet.status,
        sex: pet.sex,
        breedId: pet.breedId,
        birthDateApprox: pet.birthDateApprox,
      },
    };
  }

  // OWNED or LOST — emergency contact view
  if (pet.status === "LOST") {
    const alert = await petsRepo.findActiveLostAlertForPet(pet.petId);
    return {
      view: "emergency_contact" as const,
      pet: { petId: pet.petId, name: pet.name, status: pet.status },
      contact: alert ? { phone: alert.contactPhone, message: alert.message } : null,
    };
  }

  // OWNED
  return {
    view: "emergency_contact" as const,
    pet: { petId: pet.petId, name: pet.name, status: pet.status },
    contact: null,
  };
}

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
export async function updatePetStatus(petId: string, status: string): Promise<void> {
  const pet = await petsRepo.findPetById(petId);

  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  // Validate status transition
  if (pet.status === "DECEASED" && status !== "DECEASED") {
    throw new ForbiddenError("Cannot change status of deceased pet", "INVALID_STATUS_TRANSITION");
  }

  await petsRepo.updatePetStatus(petId, status);

  logger.info({ petId, oldStatus: pet.status, newStatus: status }, "Pet status updated");
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

  logger.info({ petId: newPet.petId, name: newPet.name, ownerId: userId }, "Client pet registered");

  return newPet;
}

/**
 * Update CLIENT's own pet
 */
export async function updateMyPet(userId: string, petId: string, data: UpdatePetDTO) {
  const existingPet = await petsRepo.findPetById(petId);

  if (!existingPet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  // Validate ownership
  if (existingPet.ownerId !== userId) {
    throw new ForbiddenError("You can only update your own pets", "NOT_PET_OWNER");
  }

  const updateData = {
    ...data,
    birthDateApprox: data.birthDate,
  };

  const updatedPet = await petsRepo.updatePet(petId, updateData);

  logger.info({ petId, ownerId: userId, updates: Object.keys(data) }, "Client pet updated");

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
    throw new ForbiddenError("You can only create alerts for your own pets", "NOT_PET_OWNER");
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
    throw new ForbiddenError("You can only resolve alerts for your own pets", "NOT_PET_OWNER");
  }

  // Resolve alert
  await petsRepo.resolveLostPetAlert(alertId);

  // Update pet status back to OWNED
  await petsRepo.updatePetStatus(alert.petId, "OWNED");

  logger.info({ alertId, petId: alert.petId, ownerId: userId }, "Lost pet alert resolved");
}

// ===================
// SPECIES
// ===================

export async function getAllSpecies() {
  return petsRepo.findAllSpecies();
}

export async function createSpecies(data: CreateSpeciesDTO) {
  return petsRepo.createSpecies(data.name);
}

export async function updateSpecies(speciesId: number, data: CreateSpeciesDTO) {
  const species = await petsRepo.findSpeciesById(speciesId);
  if (!species) {
    throw new NotFoundError("Species not found", "SPECIES_NOT_FOUND");
  }
  return petsRepo.updateSpecies(speciesId, data.name);
}

export async function deleteSpecies(speciesId: number) {
  const species = await petsRepo.findSpeciesById(speciesId);
  if (!species) {
    throw new NotFoundError("Species not found", "SPECIES_NOT_FOUND");
  }

  const breedCount = await petsRepo.countBreedsForSpecies(speciesId);
  if (breedCount > 0) {
    throw new ConflictError("Cannot delete species with existing breeds", "SPECIES_HAS_BREEDS");
  }

  const petCount = await petsRepo.countPetsForSpecies(speciesId);
  if (petCount > 0) {
    throw new ConflictError("Cannot delete species with existing pets", "SPECIES_HAS_PETS");
  }

  await petsRepo.deleteSpecies(speciesId);
  logger.info({ speciesId }, "Species deleted");
}

// ===================
// BREEDS
// ===================

export async function getBreedsBySpecies(speciesId: number) {
  const species = await petsRepo.findSpeciesById(speciesId);
  if (!species) {
    throw new NotFoundError("Species not found", "SPECIES_NOT_FOUND");
  }
  return petsRepo.findBreedsBySpecies(speciesId);
}

export async function createBreed(data: CreateBreedDTO) {
  const species = await petsRepo.findSpeciesById(data.speciesId);
  if (!species) {
    throw new NotFoundError("Species not found", "SPECIES_NOT_FOUND");
  }
  return petsRepo.createBreed(data);
}

export async function updateBreed(breedId: number, data: UpdateBreedDTO) {
  const breed = await petsRepo.findBreedById(breedId);
  if (!breed) {
    throw new NotFoundError("Breed not found", "BREED_NOT_FOUND");
  }
  return petsRepo.updateBreed(breedId, data);
}

export async function deleteBreed(breedId: number) {
  const breed = await petsRepo.findBreedById(breedId);
  if (!breed) {
    throw new NotFoundError("Breed not found", "BREED_NOT_FOUND");
  }

  const petCount = await petsRepo.countPetsForBreed(breedId);
  if (petCount > 0) {
    throw new ConflictError("Cannot delete breed with existing pets", "BREED_HAS_PETS");
  }

  await petsRepo.deleteBreed(breedId);
  logger.info({ breedId }, "Breed deleted");
}

// ===================
// VACCINES CATALOG
// ===================

export async function getAllVaccines() {
  return petsRepo.findAllVaccines();
}

export async function createVaccine(data: { name: string }) {
  return petsRepo.createVaccine(data.name);
}

export async function updateVaccine(vaccineId: number, data: { name: string }) {
  const vaccine = await petsRepo.findVaccineById(vaccineId);
  if (!vaccine) {
    throw new NotFoundError("Vaccine not found", "VACCINE_NOT_FOUND");
  }
  return petsRepo.updateVaccine(vaccineId, data.name);
}

export async function deleteVaccine(vaccineId: number) {
  const vaccine = await petsRepo.findVaccineById(vaccineId);
  if (!vaccine) {
    throw new NotFoundError("Vaccine not found", "VACCINE_NOT_FOUND");
  }

  const usageCount = await petsRepo.countPetsForVaccine(vaccineId);
  if (usageCount > 0) {
    throw new ConflictError("Cannot delete vaccine in use", "VACCINE_IN_USE");
  }

  await petsRepo.deleteVaccine(vaccineId);
  logger.info({ vaccineId }, "Vaccine deleted");
}

// ===================
// PET VACCINE RECORDS
// ===================

export async function getPetVaccines(petId: string) {
  const pet = await petsRepo.findPetById(petId);
  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }
  return petsRepo.findPetVaccines(petId);
}

export async function applyVaccineToPet(petId: string, data: ApplyVaccineDTO) {
  const pet = await petsRepo.findPetById(petId);
  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  const vaccine = await petsRepo.findVaccineById(data.vaccineId);
  if (!vaccine) {
    throw new NotFoundError("Vaccine not found", "VACCINE_NOT_FOUND");
  }

  const appliedAt = data.appliedAt || new Date().toISOString().split("T")[0];

  return petsRepo.applyVaccineToPet({ petId, vaccineId: data.vaccineId, appliedAt });
}

export async function removePetVaccine(petId: string, vaccineId: number, appliedAt: string) {
  const pet = await petsRepo.findPetById(petId);
  if (!pet) {
    throw new NotFoundError("Pet not found", "PET_NOT_FOUND");
  }

  await petsRepo.removePetVaccine(petId, vaccineId, appliedAt);
  logger.info({ petId, vaccineId, appliedAt }, "Pet vaccine record removed");
}
