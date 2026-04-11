/**
 * @file Pets Controller
 * @description HTTP request handlers for pet endpoints
 */

import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as petsService from "./pets.service";

/**
 * GET /api/pets
 * Get all pets with pagination
 */
export const getAllPets = asyncHandler(async (req, res: Response) => {
  const queryParams = req.query;

  const result = await petsService.getAllPets(queryParams as any);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * GET /api/pets/:petId
 * Get pet by ID
 */
export const getPetById = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;

  const result = await petsService.getPetById(petId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/pets
 * Create a new pet
 */
export const createPet = asyncHandler(async (req, res: Response) => {
  const data = req.body;

  const result = await petsService.createPet(data);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(201).json(response);
});

/**
 * PATCH /api/pets/:petId
 * Update pet
 */
export const updatePet = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;
  const data = req.body;

  const result = await petsService.updatePet(petId, data);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * DELETE /api/pets/:petId
 * Delete pet (soft delete)
 */
export const deletePet = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;

  await petsService.deletePet(petId);

  const response: JSendSuccess = {
    status: "success",
    data: { message: "Pet deleted successfully" },
  };

  res.status(200).json(response);
});

/**
 * PATCH /api/pets/:petId/status
 * Update pet status
 */
export const updatePetStatus = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;
  const { status } = req.body;

  await petsService.updatePetStatus(petId, status);

  const response: JSendSuccess = {
    status: "success",
    data: { message: "Pet status updated successfully" },
  };

  res.status(200).json(response);
});

/**
 * GET /api/pets/my-pets
 * Get my registered pets
 */
export const getMyPets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;

  const result = await petsService.getMyPets(userId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/pets/my-pets
 * Register my own pet
 */
export const createMyPet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const data = req.body;

  const result = await petsService.createMyPet(userId, data);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(201).json(response);
});

/**
 * PATCH /api/pets/my-pets/:petId
 * Update my own pet
 */
export const updateMyPet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const { petId } = req.params;
  const data = req.body;

  const result = await petsService.updateMyPet(userId, petId, data);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * GET /api/pets/lost-alerts
 * Get all active lost pet alerts
 */
export const getLostPetAlerts = asyncHandler(async (_req, res: Response) => {
  const result = await petsService.getLostPetAlerts();

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/pets/lost-alerts
 * Create lost pet alert
 */
export const createLostPetAlert = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const data = req.body;

  const result = await petsService.createLostPetAlert(userId, data);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(201).json(response);
});

/**
 * PATCH /api/pets/lost-alerts/:alertId/resolve
 * Resolve lost pet alert
 */
export const resolveLostPetAlert = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.userId;
    const { alertId } = req.params;

    await petsService.resolveLostPetAlert(userId, alertId);

    const response: JSendSuccess = {
      status: "success",
      data: { message: "Lost pet alert resolved successfully" },
    };

    res.status(200).json(response);
  },
);

// ===================
// SPECIES
// ===================

export const getAllSpecies = asyncHandler(async (_req, res: Response) => {
  const result = await petsService.getAllSpecies();
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createSpecies = asyncHandler(async (req, res: Response) => {
  const result = await petsService.createSpecies(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const updateSpecies = asyncHandler(async (req, res: Response) => {
  const speciesId = Number(req.params.speciesId);
  const result = await petsService.updateSpecies(speciesId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const deleteSpecies = asyncHandler(async (req, res: Response) => {
  const speciesId = Number(req.params.speciesId);
  await petsService.deleteSpecies(speciesId);
  const response: JSendSuccess = { status: "success", data: { message: "Species deleted" } };
  res.status(200).json(response);
});

// ===================
// BREEDS
// ===================

export const getBreedsBySpecies = asyncHandler(async (req, res: Response) => {
  const speciesId = Number(req.params.speciesId);
  const result = await petsService.getBreedsBySpecies(speciesId);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createBreed = asyncHandler(async (req, res: Response) => {
  const result = await petsService.createBreed(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const updateBreed = asyncHandler(async (req, res: Response) => {
  const breedId = Number(req.params.breedId);
  const result = await petsService.updateBreed(breedId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const deleteBreed = asyncHandler(async (req, res: Response) => {
  const breedId = Number(req.params.breedId);
  await petsService.deleteBreed(breedId);
  const response: JSendSuccess = { status: "success", data: { message: "Breed deleted" } };
  res.status(200).json(response);
});

// ===================
// VACCINES CATALOG
// ===================

export const getAllVaccines = asyncHandler(async (_req, res: Response) => {
  const result = await petsService.getAllVaccines();
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createVaccine = asyncHandler(async (req, res: Response) => {
  const result = await petsService.createVaccine(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const updateVaccine = asyncHandler(async (req, res: Response) => {
  const vaccineId = Number(req.params.vaccineId);
  const result = await petsService.updateVaccine(vaccineId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const deleteVaccine = asyncHandler(async (req, res: Response) => {
  const vaccineId = Number(req.params.vaccineId);
  await petsService.deleteVaccine(vaccineId);
  const response: JSendSuccess = { status: "success", data: { message: "Vaccine deleted" } };
  res.status(200).json(response);
});

// ===================
// PET VACCINES
// ===================

export const getPetVaccines = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;
  const result = await petsService.getPetVaccines(petId);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const applyVaccineToPet = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;
  const result = await petsService.applyVaccineToPet(petId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const removePetVaccine = asyncHandler(async (req, res: Response) => {
  const { petId } = req.params;
  const vaccineId = Number(req.params.vaccineId);
  const { appliedAt } = req.params;
  await petsService.removePetVaccine(petId, vaccineId, appliedAt);
  const response: JSendSuccess = { status: "success", data: { message: "Vaccine record removed" } };
  res.status(200).json(response);
});
