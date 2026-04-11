/**
 * @file Adoptions Controller
 * @description HTTP handlers for adoption endpoints
 */

import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as adoptionsService from "./adoptions.service";

export const createAdoptionApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.userId;
    const data = req.body;

    const result = await adoptionsService.createAdoptionApplication(userId, data);

    const response: JSendSuccess = {
      status: "success",
      data: result,
    };

    res.status(201).json(response);
  },
);

export const getAdoptionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { adoptionId } = req.params;
  const userId = req.user.userId;
  const userRoles = req.user.roles;

  // Validate access before returning data
  await adoptionsService.checkAdoptionAccess(adoptionId, userId, userRoles);

  const result = await adoptionsService.getAdoptionById(adoptionId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

export const getMyAdoptions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;

  const result = await adoptionsService.getMyAdoptions(userId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

export const getAllAdoptions = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const result = await adoptionsService.getAllAdoptions();

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

export const updateAdoptionStatus = asyncHandler(async (req, res: Response) => {
  const { adoptionId } = req.params;
  const { status, adminNotes } = req.body;

  const result = await adoptionsService.updateAdoptionStatus(adoptionId, status, adminNotes);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

// ===== INTERVIEWS =====

export const scheduleInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { adoptionId } = req.params;
  const interviewerId = req.user.userId;

  const result = await adoptionsService.scheduleInterview(adoptionId, interviewerId, req.body);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(201).json(response);
});

export const getInterviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { adoptionId } = req.params;

  const result = await adoptionsService.getInterviewsByAdoption(adoptionId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

export const updateInterview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { interviewId } = req.params;

  const result = await adoptionsService.updateInterview(interviewId, req.body);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

// ===== FOLLOWUPS =====

export const createFollowup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { adoptionId } = req.params;
  const adminId = req.user.userId;

  const result = await adoptionsService.createFollowup(adoptionId, adminId, req.body);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(201).json(response);
});

export const getFollowups = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { adoptionId } = req.params;

  const result = await adoptionsService.getFollowupsByAdoption(adoptionId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

export const updateFollowup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { followupId } = req.params;

  const result = await adoptionsService.updateFollowup(followupId, req.body);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});
