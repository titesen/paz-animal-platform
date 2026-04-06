/**
 * @file Volunteers Controller
 * @description HTTP handlers for volunteer management
 */

import type { Response } from "express";
import type { AuthenticatedRequest } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as service from "./service";
import {
  assignTagSchema,
  createVolunteerApplicationSchema,
  createVolunteerSchema,
  updateApplicationStatusSchema,
  updateVolunteerSchema,
} from "./types";

// ===== VOLUNTEER APPLICATIONS =====

/**
 * Create a new volunteer application
 * POST /api/volunteers/applications
 */
export const createVolunteerApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = createVolunteerApplicationSchema.parse(req.body);
    const application = await service.createVolunteerApplication(data);

    res.status(201).json({
      status: "success",
      data: { application },
    });
  },
);

/**
 * Get all volunteer applications
 * GET /api/volunteers/applications
 */
export const getAllApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, limit, offset } = req.query;

  const applications = await service.getAllApplications({
    status: status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
  });

  res.json({
    status: "success",
    data: { applications },
  });
});

/**
 * Get application by ID
 * GET /api/volunteers/applications/:applicationId
 */
export const getApplicationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.params;
  const application = await service.getApplicationById(applicationId);

  res.json({
    status: "success",
    data: { application },
  });
});

/**
 * Update application status (approve/reject)
 * PATCH /api/volunteers/applications/:applicationId/status
 */
export const updateApplicationStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { applicationId } = req.params;
    const data = updateApplicationStatusSchema.parse(req.body);

    const application = await service.updateApplicationStatus(applicationId, data);

    res.json({
      status: "success",
      data: { application },
    });
  },
);

/**
 * Promote application to active volunteer
 * POST /api/volunteers/applications/:applicationId/promote
 */
export const promoteToVolunteer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.params;
  const data = createVolunteerSchema.parse(req.body);

  const volunteer = await service.promoteToVolunteer(applicationId, data);

  res.status(201).json({
    status: "success",
    data: { volunteer },
  });
});

// ===== VOLUNTEER MANAGEMENT =====

/**
 * Get all active volunteers
 * GET /api/volunteers
 */
export const getAllVolunteers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const volunteers = await service.getAllVolunteers();

  res.json({
    status: "success",
    data: { volunteers },
  });
});

/**
 * Get volunteer by ID
 * GET /api/volunteers/:volunteerId
 */
export const getVolunteerById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { volunteerId } = req.params;
  const volunteer = await service.getVolunteerById(volunteerId);

  res.json({
    status: "success",
    data: { volunteer },
  });
});

/**
 * Get current volunteer profile (authenticated)
 * GET /api/volunteers/me
 */
export const getMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const volunteer = await service.getVolunteerByUserId(req.user!.userId);

  res.json({
    status: "success",
    data: { volunteer },
  });
});

/**
 * Update volunteer information
 * PATCH /api/volunteers/:volunteerId
 */
export const updateVolunteer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { volunteerId } = req.params;
  const data = updateVolunteerSchema.parse(req.body);

  const volunteer = await service.updateVolunteer(volunteerId, data);

  res.json({
    status: "success",
    data: { volunteer },
  });
});

/**
 * Delete volunteer
 * DELETE /api/volunteers/:volunteerId
 */
export const deleteVolunteer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await service.deleteVolunteer(req.params.volunteerId);

  res.status(204).send();
});

// ===== TAG MANAGEMENT =====

/**
 * Assign tag/role to volunteer
 * POST /api/volunteers/:volunteerId/tags
 */
export const assignTag = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { volunteerId } = req.params;
  const data = assignTagSchema.parse(req.body);

  const result = await service.assignTag(volunteerId, data);

  res.status(201).json({
    status: "success",
    data: { assignment: result },
  });
});

/**
 * Remove tag/role from volunteer
 * DELETE /api/volunteers/:volunteerId/tags/:roleId
 */
export const removeTag = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { volunteerId, roleId } = req.params;

  await service.removeTag(volunteerId, parseInt(roleId));

  res.status(204).send();
});

/**
 * Get all available volunteer roles
 * GET /api/volunteers/roles
 */
export const getAllRoles = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const roles = await service.getAllRoles();

  res.json({
    status: "success",
    data: { roles },
  });
});
