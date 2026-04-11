import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import { publicLimiter } from "../../common/middlewares/rateLimiter";
import * as tagsController from "./tags.controller";
import {
  assignTagSchema,
  createTagSchema,
  entityParamsSchema,
  tagIdSchema,
  updateTagSchema,
} from "./tags.dto";

const router = Router();

router.get("/", publicLimiter, tagsController.getAllTags);

router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createTagSchema),
  tagsController.createTag,
);

router.patch(
  "/:tagId",
  authenticate,
  requireRole("ADMIN"),
  validate(tagIdSchema, "params"),
  validate(updateTagSchema),
  tagsController.updateTag,
);

router.delete(
  "/:tagId",
  authenticate,
  requireRole("ADMIN"),
  validate(tagIdSchema, "params"),
  tagsController.deleteTag,
);

router.post(
  "/:tagId/assign",
  authenticate,
  requireRole("ADMIN"),
  validate(tagIdSchema, "params"),
  validate(assignTagSchema),
  tagsController.assignTag,
);

router.delete(
  "/:tagId/assign",
  authenticate,
  requireRole("ADMIN"),
  validate(tagIdSchema, "params"),
  validate(assignTagSchema),
  tagsController.removeTag,
);

router.get(
  "/entity/:entityType/:entityId",
  publicLimiter,
  validate(entityParamsSchema, "params"),
  tagsController.getTagsForEntity,
);

export default router;
