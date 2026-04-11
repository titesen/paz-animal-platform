/**
 * @file Adoptions Routes
 * @description Route definitions for adoption endpoints
 */

import { Router } from "express";
import { z } from "zod";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole, requireVolunteerRole } from "../../common/middlewares/auth";
import * as adoptionsController from "./adoptions.controller";
import {
  adoptionIdSchema,
  createAdoptionApplicationSchema,
  createFollowupSchema,
  createInterviewSchema,
  followupIdSchema,
  interviewIdSchema,
  updateFollowupSchema,
  updateInterviewSchema,
} from "./adoptions.dto";

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
router.get("/", authenticate, requireRole("ADMIN"), adoptionsController.getAllAdoptions);

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

// ===== INTERVIEWS =====

/**
 * @route   POST /api/adoptions/:adoptionId/interviews
 * @desc    Schedule an interview for an adoption application
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.post(
  "/:adoptionId/interviews",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(adoptionIdSchema, "params"),
  validate(createInterviewSchema),
  adoptionsController.scheduleInterview,
);

/**
 * @route   GET /api/adoptions/:adoptionId/interviews
 * @desc    Get all interviews for an adoption application
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.get(
  "/:adoptionId/interviews",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(adoptionIdSchema, "params"),
  adoptionsController.getInterviews,
);

/**
 * @route   PATCH /api/adoptions/interviews/:interviewId
 * @desc    Update an interview (result, reschedule, observations)
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.patch(
  "/interviews/:interviewId",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(interviewIdSchema, "params"),
  validate(updateInterviewSchema),
  adoptionsController.updateInterview,
);

// ===== FOLLOWUPS =====

/**
 * @route   POST /api/adoptions/:adoptionId/followups
 * @desc    Create a followup for an adoption (month 1–6)
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.post(
  "/:adoptionId/followups",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(adoptionIdSchema, "params"),
  validate(createFollowupSchema),
  adoptionsController.createFollowup,
);

/**
 * @route   GET /api/adoptions/:adoptionId/followups
 * @desc    Get all followups for an adoption
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.get(
  "/:adoptionId/followups",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(adoptionIdSchema, "params"),
  adoptionsController.getFollowups,
);

/**
 * @route   PATCH /api/adoptions/followups/:followupId
 * @desc    Update a followup
 * @access  Protected (ADMIN, ADOPTION_COORD)
 */
router.patch(
  "/followups/:followupId",
  authenticate,
  requireVolunteerRole("ADOPTION_COORD"),
  validate(followupIdSchema, "params"),
  validate(updateFollowupSchema),
  adoptionsController.updateFollowup,
);

export default router;
