import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as commentsService from "./comments.service";

export const createComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await commentsService.createComment(req.user.userId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const getCommentsByEntity = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { entityType, entityId } = req.params;
    const result = await commentsService.getCommentsByEntity(entityType, entityId);

    const response: JSendSuccess = { status: "success", data: result };
    res.status(200).json(response);
  },
);

export const updateComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const result = await commentsService.updateComment(
    commentId,
    req.user.userId,
    req.user.roles,
    req.body,
  );

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  await commentsService.deleteComment(commentId, req.user.userId, req.user.roles);

  res.status(204).send();
});

export const moderateComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const result = await commentsService.moderateComment(commentId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});
