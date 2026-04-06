/**
 * @file Volunteers Routes
 * @description Routes for volunteer management and applications
 */

import { Router } from "express";
import { authenticate, requireRole } from "../../common/middlewares";
import * as controller from "./controller";

const router = Router();

// ===== VOLUNTEER APPLICATIONS =====

/**
 * Create volunteer application
 * POST /api/volunteers/applications
 * Auth: Public (anyone can apply)
 */
router.post("/applications", controller.createVolunteerApplication);

/**
 * Get all applications
 * GET /api/volunteers/applications
 * Auth: ADMIN only
 */
router.get("/applications", authenticate, requireRole("ADMIN"), controller.getAllApplications);

/**
 * Get application by ID
 * GET /api/volunteers/applications/:applicationId
 * Auth: ADMIN only
 */
router.get(
  "/applications/:applicationId",
  authenticate,
  requireRole("ADMIN"),
  controller.getApplicationById,
);

/**
 * Update application status (approve/reject)
 * PATCH /api/volunteers/applications/:applicationId/status
 * Auth: ADMIN only
 */
router.patch(
  "/applications/:applicationId/status",
  authenticate,
  requireRole("ADMIN"),
  controller.updateApplicationStatus,
);

/**
 * Promote application to active volunteer
 * POST /api/volunteers/applications/:applicationId/promote
 * Auth: ADMIN only
 */
router.post(
  "/applications/:applicationId/promote",
  authenticate,
  requireRole("ADMIN"),
  controller.promoteToVolunteer,
);

// ===== VOLUNTEER ROLES =====

/**
 * Get all volunteer roles
 * GET /api/volunteers/roles
 * Auth: ADMIN or VOLUNTEER
 */
router.get("/roles", authenticate, requireRole("ADMIN", "VOLUNTEER"), controller.getAllRoles);

// ===== VOLUNTEER MANAGEMENT =====

/**
 * Get current volunteer profile
 * GET /api/volunteers/me
 * Auth: VOLUNTEER or ADMIN
 */
router.get("/me", authenticate, requireRole("VOLUNTEER", "ADMIN"), controller.getMyProfile);

/**
 * Get all volunteers
 * GET /api/volunteers
 * Auth: ADMIN or VOLUNTEER
 */
router.get("/", authenticate, requireRole("ADMIN", "VOLUNTEER"), controller.getAllVolunteers);

/**
 * Get volunteer by ID
 * GET /api/volunteers/:volunteerId
 * Auth: ADMIN or VOLUNTEER
 */
router.get(
  "/:volunteerId",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  controller.getVolunteerById,
);

/**
 * Update volunteer
 * PATCH /api/volunteers/:volunteerId
 * Auth: ADMIN only
 */
router.patch("/:volunteerId", authenticate, requireRole("ADMIN"), controller.updateVolunteer);

/**
 * Delete volunteer
 * DELETE /api/volunteers/:volunteerId
 * Auth: ADMIN only
 */
router.delete("/:volunteerId", authenticate, requireRole("ADMIN"), controller.deleteVolunteer);

// ===== TAG MANAGEMENT =====

/**
 * Assign tag/role to volunteer
 * POST /api/volunteers/:volunteerId/tags
 * Auth: ADMIN only
 */
router.post("/:volunteerId/tags", authenticate, requireRole("ADMIN"), controller.assignTag);

/**
 * Remove tag/role from volunteer
 * DELETE /api/volunteers/:volunteerId/tags/:roleId
 * Auth: ADMIN only
 */
router.delete(
  "/:volunteerId/tags/:roleId",
  authenticate,
  requireRole("ADMIN"),
  controller.removeTag,
);

export default router;
