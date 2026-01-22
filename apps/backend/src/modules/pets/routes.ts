/**
 * @file Pets Routes
 * @description Route definitions for pet endpoints
 */

import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares";
import { authenticate, requireRole } from "../../middlewares/auth";
import { publicLimiter } from "../../middlewares/rateLimiter";
import * as petsController from "./controller";
import {
  createPetSchema,
  petIdSchema,
  petQuerySchema,
  updatePetSchema,
} from "./types";

const router = Router();

/**
 * @route   GET /api/pets
 * @desc    Get all pets with pagination
 * @access  Public
 */
router.get(
  "/",
  publicLimiter,
  validate(petQuerySchema, "query"),
  petsController.getAllPets,
);

/**
 * @route   GET /api/pets/:petId
 * @desc    Get pet by ID
 * @access  Public
 */
router.get(
  "/:petId",
  publicLimiter,
  validate(petIdSchema, "params"),
  petsController.getPetById,
);

/**
 * @route   POST /api/pets
 * @desc    Create a new pet
 * @access  Protected (ADMIN, VOLUNTEER)
 */
router.post(
  "/",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  validate(createPetSchema),
  petsController.createPet,
);

/**
 * @route   PATCH /api/pets/:petId
 * @desc    Update pet
 * @access  Protected (ADMIN, VOLUNTEER)
 */
router.patch(
  "/:petId",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  validate(petIdSchema, "params"),
  validate(updatePetSchema),
  petsController.updatePet,
);

/**
 * @route   DELETE /api/pets/:petId
 * @desc    Delete pet (soft delete)
 * @access  Protected (ADMIN only)
 */
router.delete(
  "/:petId",
  authenticate,
  requireRole("ADMIN"),
  validate(petIdSchema, "params"),
  petsController.deletePet,
);

/**
 * @route   PATCH /api/pets/:petId/status
 * @desc    Update pet status
 * @access  Protected (ADMIN, VOLUNTEER)
 */
router.patch(
  "/:petId/status",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  validate(petIdSchema, "params"),
  validate(z.object({ status: z.string() })),
  petsController.updatePetStatus,
);

export default router;
