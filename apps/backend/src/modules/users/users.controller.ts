import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as usersService from "./users.service";

export const listUsers = asyncHandler(async (req, res: Response) => {
  const result = await usersService.listUsers(req.query as Record<string, string>);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const getUserById = asyncHandler(async (req, res: Response) => {
  const { userId } = req.params;

  const result = await usersService.getUserById(userId);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const updateUser = asyncHandler(async (req, res: Response) => {
  const { userId } = req.params;

  const result = await usersService.updateUser(userId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const updateUserRoles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const adminUserId = req.user.userId;
  const { userId } = req.params;

  const result = await usersService.updateUserRoles(adminUserId, userId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const banUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const adminUserId = req.user.userId;
  const { userId } = req.params;

  await usersService.banUser(adminUserId, userId);

  const response: JSendSuccess = { status: "success", data: { message: "User banned" } };
  res.status(200).json(response);
});

export const unbanUser = asyncHandler(async (req, res: Response) => {
  const { userId } = req.params;

  await usersService.unbanUser(userId);

  const response: JSendSuccess = { status: "success", data: { message: "User unbanned" } };
  res.status(200).json(response);
});
