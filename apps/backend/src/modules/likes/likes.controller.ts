import type { Request, Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as likesService from "./likes.service";

export const toggleLike = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await likesService.toggleLike(req.user.userId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const getLikeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.params;
  const userId = (req as AuthenticatedRequest).user?.userId;

  const result = await likesService.getLikeStatus(entityType, entityId, userId);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});
