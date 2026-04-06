/**
 * @file Media Routes
 * @description Routes for file upload and media management
 */

import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole, uploadLimiter } from "../../common/middlewares";
import { validate } from "../../common/middlewares/validate";
import * as controller from "./media.controller";
import {
  entityParamSchema,
  mediaIdParamSchema,
  updateMediaSchema,
  uploadFileSchema,
} from "./media.dto";

const router = Router();

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (enforced per-type in service)
    files: 1, // One file at a time
  },
});

/**
 * Upload a file
 * POST /api/media/upload
 * Auth: Required (VOLUNTEER or ADMIN)
 * Rate limit: Upload limiter (10 requests/hour)
 */
router.post(
  "/upload",
  uploadLimiter,
  authenticate,
  requireRole("VOLUNTEER", "ADMIN"),
  upload.single("file"),
  validate(uploadFileSchema),
  controller.uploadFile,
);

/**
 * Get media by ID
 * GET /api/media/:mediaId
 * Auth: Optional
 */
router.get("/:mediaId", validate(mediaIdParamSchema, "params"), controller.getMedia);

/**
 * Get all media for an entity
 * GET /api/media/entity/:entityType/:entityId
 * Auth: Optional
 */
router.get(
  "/entity/:entityType/:entityId",
  validate(entityParamSchema, "params"),
  controller.getEntityMedia,
);

/**
 * Update media metadata
 * PATCH /api/media/:mediaId
 * Auth: Required (VOLUNTEER or ADMIN)
 */
router.patch(
  "/:mediaId",
  authenticate,
  requireRole("VOLUNTEER", "ADMIN"),
  validate(mediaIdParamSchema, "params"),
  validate(updateMediaSchema),
  controller.updateMedia,
);

/**
 * Delete media
 * DELETE /api/media/:mediaId
 * Auth: Required (ADMIN only)
 */
router.delete(
  "/:mediaId",
  authenticate,
  requireRole("ADMIN"),
  validate(mediaIdParamSchema, "params"),
  controller.deleteMedia,
);

export default router;
