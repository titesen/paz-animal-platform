/**
 * @file Events Controller
 * @description HTTP handlers for events, registrations, and attendance
 */

import type { Response } from "express";
import type { AuthenticatedRequest } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as service from "./service";
import type {
  CheckInDTO,
  CreateEventDTO,
  RegisterForEventDTO,
  UpdateEventDTO,
  UpdateEventTranslationDTO,
} from "./types";

// ===================
// EVENTS MANAGEMENT
// ===================

/**
 * Create a new event
 * POST /api/events
 * Requires: EVENT_ORGANIZER tag
 */
export const createEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: CreateEventDTO = req.body;

  const event = await service.createEvent(userId, data);

  res.status(201).json({
    status: "success",
    data: { event },
  });
});

/**
 * Get all upcoming events
 * GET /api/events
 * Public endpoint
 */
export const getAllEvents = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const events = await service.getAllUpcomingEvents();

  res.json({
    status: "success",
    data: { events },
  });
});

/**
 * Get event by ID
 * GET /api/events/:eventId
 * Public endpoint
 */
export const getEventById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params;

  const event = await service.getEventById(eventId);

  res.json({
    status: "success",
    data: { event },
  });
});

/**
 * Update event
 * PATCH /api/events/:eventId
 * Requires: EVENT_ORGANIZER tag
 */
export const updateEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params;
  const data: UpdateEventDTO = req.body;

  const event = await service.updateEvent(eventId, data);

  res.json({
    status: "success",
    data: { event },
  });
});

/**
 * Update event translation
 * PATCH /api/events/:eventId/translations/:language
 * Requires: EVENT_ORGANIZER tag
 */
export const updateEventTranslation = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { eventId, language } = req.params;
    const data: UpdateEventTranslationDTO = req.body;

    await service.updateEventTranslation(eventId, language, data);

    res.json({
      status: "success",
      message: "Translation updated successfully",
    });
  },
);

/**
 * Delete event
 * DELETE /api/events/:eventId
 * Requires: EVENT_ORGANIZER tag
 */
export const deleteEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params;

  await service.deleteEvent(eventId);

  res.json({
    status: "success",
    message: "Event deleted successfully",
  });
});

// ===================
// REGISTRATIONS
// ===================

/**
 * Register for event
 * POST /api/events/:eventId/register
 * Requires: Authenticated user
 */
export const registerForEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { eventId } = req.params;
  const data: RegisterForEventDTO = req.body;

  await service.registerForEvent(userId, eventId, data);

  res.status(201).json({
    status: "success",
    message: "Successfully registered for event",
  });
});

/**
 * Get my registrations
 * GET /api/events/my-registrations
 * Requires: Authenticated user
 */
export const getMyRegistrations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const registrations = await service.getMyRegistrations(userId);

  res.json({
    status: "success",
    data: { registrations },
  });
});

/**
 * Cancel registration
 * DELETE /api/events/:eventId/register
 * Requires: Authenticated user
 */
export const cancelRegistration = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { eventId } = req.params;

  await service.cancelRegistration(userId, eventId);

  res.json({
    status: "success",
    message: "Registration cancelled successfully",
  });
});

/**
 * Get event registrations
 * GET /api/events/:eventId/registrations
 * Requires: EVENT_ORGANIZER tag
 */
export const getEventRegistrations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { eventId } = req.params;

    const registrations = await service.getEventRegistrations(eventId);

    res.json({
      status: "success",
      data: { registrations },
    });
  },
);

// ===================
// ATTENDANCE
// ===================

/**
 * Check in user for event
 * POST /api/events/:eventId/check-in
 * Requires: EVENT_ORGANIZER tag
 */
export const checkInUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const checkedInBy = req.user!.userId;
  const { eventId } = req.params;
  const data: CheckInDTO = req.body;

  await service.checkInUser(eventId, checkedInBy, data);

  res.status(201).json({
    status: "success",
    message: "User checked in successfully",
  });
});

/**
 * Get event attendances
 * GET /api/events/:eventId/attendances
 * Requires: EVENT_ORGANIZER tag
 */
export const getEventAttendances = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { eventId } = req.params;

    const attendances = await service.getEventAttendances(eventId);

    res.json({
      status: "success",
      data: { attendances },
    });
  },
);
