/**
 * @file Media Controller
 * @description HTTP handlers for file upload endpoints
 */

import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import * as service from "./service";
import { uploadFileSchema } from "./types";

/**
 * Upload a file
 * POST /api/media/upload
 */
export const uploadFile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        data: { file: ["No file uploaded"] },
      });
    }

    // Parse and validate request body
    const data = uploadFileSchema.parse(req.body);

    // Upload file and create media record
    const media = await service.uploadFile(req.file, data);

    res.status(201).json({
      status: "success",
      data: { media },
    });
  },
);

/**
 * Get media by ID
 * GET /api/media/:mediaId
 */
export const getMedia = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { mediaId } = req.params;

    const media = await service.getMediaById(mediaId);

    res.json({
      status: "success",
      data: { media },
    });
  },
);

/**
 * Get all media for an entity
 * GET /api/media/entity/:entityType/:entityId
 */
export const getEntityMedia = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { entityType, entityId } = req.params;

    const media = await service.getMediaByEntity(entityType, entityId);

    res.json({
      status: "success",
      data: { media },
    });
  },
);

/**
 * Update media metadata
 * PATCH /api/media/:mediaId
 */
export const updateMedia = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { mediaId } = req.params;
    const { altText, isMain } = req.body;

    const media = await service.updateMediaMetadata(mediaId, {
      altText,
      isMain,
    });

    res.json({
      status: "success",
      data: { media },
    });
  },
);

/**
 * Delete media
 * DELETE /api/media/:mediaId
 */
export const deleteMedia = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { mediaId } = req.params;

    await service.deleteMediaFile(mediaId);

    res.status(204).send();
  },
);
