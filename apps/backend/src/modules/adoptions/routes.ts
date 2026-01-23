/**
 * @file Adoptions Routes
 * @description Route definitions for adoption endpoints
 */

import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares";
import {
  authenticate,
  requireRole,
  requireVolunteerRole,
} from "../../middlewares/auth";
import * as adoptionsController from "./controller";
import { adoptionIdSchema, createAdoptionApplicationSchema } from "./types";

const router = Router();

/**
 * @route   POST /api/adoptions
 * @desc    Create adoption application
 * @access  Protected (CLIENT)
 */
router.post(
  "/",
  authenticate,
  validate(createAdoptionApplicationSchema),
  adoptionsController.createAdoptionApplication,
);

/**
 * @route   GET /api/adoptions/my
 * @desc    Get my adoption applications
 * @access  Protected
 */
router.get("/my", authenticate, adoptionsController.getMyAdoptions);

/**
 * @route   GET /api/adoptions/:adoptionId
 * @desc    Get adoption application by ID
 * @access  Protected (Owner, ADMIN, ADOPTION_COORD)
 */
router.get(
  "/:adoptionId",
  authenticate,
  validate(adoptionIdSchema, "params"),
  adoptionsController.getAdoptionById,
);

/**
 * @route   GET /api/adoptions
 * @desc    Get all adoption applications (for coordinators)
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  adoptionsController.getAllAdoptions,
);

/**
 * @route   PATCH /api/adoptions/:adoptionId/status
 * @desc    Update adoption status
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.patch(
  "/:adoptionId/status",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(adoptionIdSchema, "params"),
  validate(z.object({ status: z.string() })),
  adoptionsController.updateAdoptionStatus,
);

export default router;
