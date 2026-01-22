/**
 * @file Adoptions Routes
 * @description Route definitions for adoption endpoints
 */

import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares";
import { authenticate, requireRole } from "../../middlewares/auth";
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
 * @access  Protected
 */
router.get(
  "/:adoptionId",
  authenticate,
  validate(adoptionIdSchema, "params"),
  adoptionsController.getAdoptionById,
);

/**
 * @route   PATCH /api/adoptions/:adoptionId/status
 * @desc    Update adoption status
 * @access  Protected (ADMIN, VOLUNTEER)
 */
router.patch(
  "/:adoptionId/status",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  validate(adoptionIdSchema, "params"),
  validate(z.object({ status: z.string() })),
  adoptionsController.updateAdoptionStatus,
);

export default router;
