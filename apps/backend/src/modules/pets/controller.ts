/**
 * @file Pets Controller
 * @description HTTP request handlers for pet endpoints
 */

import type { Response } from "express";
import type { JSendSuccess } from "../../types";
import { asyncHandler } from "../../utils";
import * as petsService from "./service";

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
