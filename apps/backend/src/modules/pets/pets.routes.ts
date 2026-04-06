/**
 * @file Pets Routes
 * @description Route definitions for pet endpoints
 */

import { Router } from "express";
import { z } from "zod";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import { publicLimiter } from "../../common/middlewares/rateLimiter";
import * as petsController from "./pets.controller";
import { createPetSchema, petIdSchema, petQuerySchema, updatePetSchema } from "./pets.types";

const router = Router();

/**
 * @route   GET /api/pets
 * @desc    Get all pets with pagination
 * @access  Public
 */
router.get("/", publicLimiter, validate(petQuerySchema, "query"), petsController.getAllPets);

/**
 * @route   GET /api/pets/:petId
 * @desc    Get pet by ID
 * @access  Public
 */
router.get("/:petId", publicLimiter, validate(petIdSchema, "params"), petsController.getPetById);

// ===================
// CLIENT PET MANAGEMENT
// ===================

/**
 * @route   GET /api/pets/my-pets
 * @desc    Get my registered pets
 * @access  Protected (CLIENT)
 */
router.get("/my-pets", authenticate, petsController.getMyPets);

/**
 * @route   POST /api/pets/my-pets
 * @desc    Register my own pet
 * @access  Protected (CLIENT)
 */
router.post("/my-pets", authenticate, validate(createPetSchema), petsController.createMyPet);

/**
 * @route   PATCH /api/pets/my-pets/:petId
 * @desc    Update my own pet
 * @access  Protected (CLIENT - owner only)
 */
router.patch(
  "/my-pets/:petId",
  authenticate,
  validate(petIdSchema, "params"),
  validate(updatePetSchema),
  petsController.updateMyPet,
);

// ===================
// LOST & FOUND ALERTS
// ===================

/**
 * @route   GET /api/pets/lost-alerts
 * @desc    Get all active lost pet alerts
 * @access  Public
 */
router.get("/lost-alerts", publicLimiter, petsController.getLostPetAlerts);

/**
 * @route   POST /api/pets/lost-alerts
 * @desc    Create lost pet alert for my pet
 * @access  Protected (CLIENT - owner only)
 */
router.post(
  "/lost-alerts",
  authenticate,
  validate(
    z.object({
      petId: z.string().uuid(),
      lastSeenZone: z.string().min(1).max(255),
      contactPhone: z.string().min(8).max(50),
      message: z.string().max(500).optional(),
    }),
  ),
  petsController.createLostPetAlert,
);

/**
 * @route   PATCH /api/pets/lost-alerts/:alertId/resolve
 * @desc    Mark lost pet as found
 * @access  Protected (CLIENT - owner only)
 */
router.patch(
  "/lost-alerts/:alertId/resolve",
  authenticate,
  validate(z.object({ alertId: z.string().uuid() }), "params"),
  petsController.resolveLostPetAlert,
);

// ===================
// ADMIN/VOLUNTEER PET MANAGEMENT
// ===================

/**
 * @route   POST /api/pets
 * @desc    Create a new pet (foundation pets)
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
