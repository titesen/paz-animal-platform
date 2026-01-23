/**
 * @file Events Routes
 * @description Route definitions for events, registrations, and attendance
 */

import { Router } from "express";
import { authenticate, requireVolunteerRole } from "../../middlewares/auth";
import * as controller from "./controller";

const router = Router();

// ===================
// PUBLIC ROUTES
// ===================

/**
 * Get all upcoming events
 * GET /api/events
 */
router.get("/", controller.getAllEvents);

/**
 * Get event by ID
 * GET /api/events/:eventId
 */
router.get("/:eventId", controller.getEventById);

// ===================
// AUTHENTICATED ROUTES
// ===================

/**
 * Get my registrations
 * GET /api/events/my-registrations
 */
router.get("/my-registrations", authenticate, controller.getMyRegistrations);

/**
 * Register for event
 * POST /api/events/:eventId/register
 */
router.post("/:eventId/register", authenticate, controller.registerForEvent);

/**
 * Cancel registration
 * DELETE /api/events/:eventId/register
 */
router.delete(
  "/:eventId/register",
  authenticate,
  controller.cancelRegistration,
);

// ===================
// EVENT_ORGANIZER ROUTES
// ===================

/**
 * Create event
 * POST /api/events
 * Requires: EVENT_ORGANIZER role
 */
router.post(
  "/",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.createEvent,
);

/**
 * Update event
 * PATCH /api/events/:eventId
 * Requires: EVENT_ORGANIZER role
 */
router.patch(
  "/:eventId",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.updateEvent,
);

/**
 * Update event translation
 * PATCH /api/events/:eventId/translations/:language
 * Requires: EVENT_ORGANIZER role
 */
router.patch(
  "/:eventId/translations/:language",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.updateEventTranslation,
);

/**
 * Delete event
 * DELETE /api/events/:eventId
 * Requires: EVENT_ORGANIZER role
 */
router.delete(
  "/:eventId",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.deleteEvent,
);

/**
 * Get event registrations
 * GET /api/events/:eventId/registrations
 * Requires: EVENT_ORGANIZER role
 */
router.get(
  "/:eventId/registrations",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.getEventRegistrations,
);

/**
 * Check in user for event
 * POST /api/events/:eventId/check-in
 * Requires: EVENT_ORGANIZER role
 */
router.post(
  "/:eventId/check-in",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.checkInUser,
);

/**
 * Get event attendances
 * GET /api/events/:eventId/attendances
 * Requires: EVENT_ORGANIZER role
 */
router.get(
  "/:eventId/attendances",
  authenticate,
  requireVolunteerRole("EVENT_ORGANIZER"),
  controller.getEventAttendances,
);

export default router;
