/**
 * @file Adoptions Controller
 * @description HTTP handlers for adoption endpoints
 */

import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../types";
import { asyncHandler } from "../../utils";
import * as adoptionsService from "./service";

export const createAdoptionApplication = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.userId;
    const data = req.body;

    const result = await adoptionsService.createAdoptionApplication(
      userId,
      data,
    );

    const response: JSendSuccess = {
      status: "success",
      data: result,
    };

    res.status(201).json(response);
  },
);

export const getAdoptionById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
  },
);

export const getMyAdoptions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.userId;

    const result = await adoptionsService.getMyAdoptions(userId);

    const response: JSendSuccess = {
      status: "success",
      data: result,
    };

    res.status(200).json(response);
  },
);

export const getAllAdoptions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await adoptionsService.getAllAdoptions();

    const response: JSendSuccess = {
      status: "success",
      data: result,
    };

    res.status(200).json(response);
  },
);

export const updateAdoptionStatus = asyncHandler(async (req, res: Response) => {
  const { adoptionId } = req.params;
  const { status } = req.body;

  const result = await adoptionsService.updateAdoptionStatus(
    adoptionId,
    status,
  );

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});
