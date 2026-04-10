/**
 * @file Events Routes
 * @description Route definitions for events, registrations, and attendance
 */

import { Router } from "express";
import { authenticate, requireVolunteerRole } from "../../common/middlewares/auth";
import { validate } from "../../common/middlewares/validate";
import * as controller from "./events.controller";
import {
  checkInSchema,
  createEventSchema,
  eventIdParamSchema,
  eventLanguageParamSchema,
  registerForEventSchema,
  updateEventSchema,
  updateEventTranslationSchema,
} from "./events.dto";

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
router.get("/:eventId", validate(eventIdParamSchema, "params"), controller.getEventById);

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
router.post(
  "/:eventId/register",
  authenticate,
  validate(eventIdParamSchema, "params"),
  validate(registerForEventSchema),
  controller.registerForEvent,
);

/**
 * Cancel registration
 * DELETE /api/events/:eventId/register
 */
router.delete(
  "/:eventId/register",
  authenticate,
  validate(eventIdParamSchema, "params"),
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
  validate(createEventSchema),
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
  validate(eventIdParamSchema, "params"),
  validate(updateEventSchema),
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
  validate(eventLanguageParamSchema, "params"),
  validate(updateEventTranslationSchema),
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
  validate(eventIdParamSchema, "params"),
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
  validate(eventIdParamSchema, "params"),
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
  validate(eventIdParamSchema, "params"),
  validate(checkInSchema),
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
  validate(eventIdParamSchema, "params"),
  controller.getEventAttendances,
);

export default router;
