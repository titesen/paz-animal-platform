import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./comments.controller";
import {
  commentIdSchema,
  createCommentSchema,
  entityParamsSchema,
  moderateCommentSchema,
  updateCommentSchema,
} from "./comments.dto";

const router = Router();

/**
 * @route   POST /api/comments
 * @desc    Create a comment on any entity
 * @access  Protected
 */
router.post("/", authenticate, validate(createCommentSchema), controller.createComment);

/**
 * @route   GET /api/comments/entity/:entityType/:entityId
 * @desc    Get all comments for an entity
 * @access  Public
 */
router.get(
  "/entity/:entityType/:entityId",
  validate(entityParamsSchema, "params"),
  controller.getCommentsByEntity,
);

/**
 * @route   PATCH /api/comments/:commentId
 * @desc    Update a comment (owner or ADMIN)
 * @access  Protected
 */
router.patch(
  "/:commentId",
  authenticate,
  validate(commentIdSchema, "params"),
  validate(updateCommentSchema),
  controller.updateComment,
);

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Soft-delete a comment (owner or ADMIN)
 * @access  Protected
 */
router.delete(
  "/:commentId",
  authenticate,
  validate(commentIdSchema, "params"),
  controller.deleteComment,
);

/**
 * @route   PATCH /api/comments/:commentId/moderate
 * @desc    Moderate a comment (ADMIN only)
 * @access  Protected (ADMIN)
 */
router.patch(
  "/:commentId/moderate",
  authenticate,
  requireRole("ADMIN"),
  validate(commentIdSchema, "params"),
  validate(moderateCommentSchema),
  controller.moderateComment,
);

export default router;
