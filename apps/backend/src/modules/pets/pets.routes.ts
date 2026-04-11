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
import {
  applyVaccineSchema,
  breedIdSchema,
  createBreedSchema,
  createPetSchema,
  createSpeciesSchema,
  createVaccineSchema,
  petIdSchema,
  petQuerySchema,
  speciesIdSchema,
  updateBreedSchema,
  updatePetSchema,
  vaccineIdSchema,
} from "./pets.dto";

const router = Router();

/**
 * @route   GET /api/pets/qr/:qrCode
 * @desc    Smart QR code resolution
 * @access  Public
 */
router.get("/qr/:qrCode", publicLimiter, petsController.resolveQrCode);

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

// ===================
// SPECIES
// ===================

router.get("/species", publicLimiter, petsController.getAllSpecies);

router.post(
  "/species",
  authenticate,
  requireRole("ADMIN"),
  validate(createSpeciesSchema),
  petsController.createSpecies,
);

router.patch(
  "/species/:speciesId",
  authenticate,
  requireRole("ADMIN"),
  validate(speciesIdSchema, "params"),
  validate(createSpeciesSchema),
  petsController.updateSpecies,
);

router.delete(
  "/species/:speciesId",
  authenticate,
  requireRole("ADMIN"),
  validate(speciesIdSchema, "params"),
  petsController.deleteSpecies,
);

// ===================
// BREEDS
// ===================

router.get(
  "/species/:speciesId/breeds",
  publicLimiter,
  validate(speciesIdSchema, "params"),
  petsController.getBreedsBySpecies,
);

router.post(
  "/breeds",
  authenticate,
  requireRole("ADMIN"),
  validate(createBreedSchema),
  petsController.createBreed,
);

router.patch(
  "/breeds/:breedId",
  authenticate,
  requireRole("ADMIN"),
  validate(breedIdSchema, "params"),
  validate(updateBreedSchema),
  petsController.updateBreed,
);

router.delete(
  "/breeds/:breedId",
  authenticate,
  requireRole("ADMIN"),
  validate(breedIdSchema, "params"),
  petsController.deleteBreed,
);

// ===================
// VACCINES CATALOG
// ===================

router.get("/vaccines", publicLimiter, petsController.getAllVaccines);

router.post(
  "/vaccines",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  validate(createVaccineSchema),
  petsController.createVaccine,
);

router.patch(
  "/vaccines/:vaccineId",
  authenticate,
  requireRole("ADMIN"),
  validate(vaccineIdSchema, "params"),
  validate(createVaccineSchema),
  petsController.updateVaccine,
);

router.delete(
  "/vaccines/:vaccineId",
  authenticate,
  requireRole("ADMIN"),
  validate(vaccineIdSchema, "params"),
  petsController.deleteVaccine,
);

// ===================
// PET VACCINES
// ===================

router.get(
  "/:petId/vaccines",
  publicLimiter,
  validate(petIdSchema, "params"),
  petsController.getPetVaccines,
);

router.post(
  "/:petId/vaccines",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  validate(petIdSchema, "params"),
  validate(applyVaccineSchema),
  petsController.applyVaccineToPet,
);

router.delete(
  "/:petId/vaccines/:vaccineId/:appliedAt",
  authenticate,
  requireRole("ADMIN"),
  validate(petIdSchema, "params"),
  petsController.removePetVaccine,
);

export default router;
