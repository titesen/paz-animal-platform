import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate } from "../../common/middlewares/auth";
import * as controller from "./likes.controller";
import { entityParamsSchema, toggleLikeSchema } from "./likes.dto";

const router = Router();

/**
 * @route   POST /api/likes
 * @desc    Toggle like on an entity (like/unlike)
 * @access  Protected
 */
router.post("/", authenticate, validate(toggleLikeSchema), controller.toggleLike);

/**
 * @route   GET /api/likes/entity/:entityType/:entityId
 * @desc    Get like count and user's like status for an entity
 * @access  Public (authenticated users see their own like status)
 */
router.get(
  "/entity/:entityType/:entityId",
  validate(entityParamsSchema, "params"),
  controller.getLikeStatus,
);

export default router;
