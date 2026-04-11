import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as notificationsService from "./notifications.service";

export const createNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationsService.createNotification(req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const getMyNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationsService.getMyNotifications(req.user.userId);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationsService.markAsRead(req.user.userId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const getAllNotifications = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const result = await notificationsService.getAllNotifications();

    const response: JSendSuccess = { status: "success", data: result };
    res.status(200).json(response);
  },
);
