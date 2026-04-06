/**
 * @file Media Routes
 * @description Routes for file upload and media management
 */

import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole, uploadLimiter } from "../../common/middlewares";
import * as controller from "./controller";

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
  controller.uploadFile,
);

/**
 * Get media by ID
 * GET /api/media/:mediaId
 * Auth: Optional
 */
router.get("/:mediaId", controller.getMedia);

/**
 * Get all media for an entity
 * GET /api/media/entity/:entityType/:entityId
 * Auth: Optional
 */
router.get("/entity/:entityType/:entityId", controller.getEntityMedia);

/**
 * Update media metadata
 * PATCH /api/media/:mediaId
 * Auth: Required (VOLUNTEER or ADMIN)
 */
router.patch("/:mediaId", authenticate, requireRole("VOLUNTEER", "ADMIN"), controller.updateMedia);

/**
 * Delete media
 * DELETE /api/media/:mediaId
 * Auth: Required (ADMIN only)
 */
router.delete("/:mediaId", authenticate, requireRole("ADMIN"), controller.deleteMedia);

export default router;
