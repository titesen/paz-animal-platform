/**
 * @file Media Service
 * @description Business logic for file uploads and media management
 */

import fs from "node:fs/promises";
import path from "node:path";
import { ValidationError } from "../../types/errors";
import * as repository from "./repository";
import {
  ALL_ALLOWED_MIMES,
  ALLOWED_DOCUMENT_MIMES,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  MAX_FILE_SIZE,
  type UploadFileDTO,
} from "./types";

// Upload directory (relative to project root)
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Ensure upload directories exist
 */
export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "images"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "videos"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "documents"), { recursive: true });
}

/**
 * Determine media type from MIME type
 */
function getMediaType(mimetype: string): "IMAGE" | "VIDEO" | "DOCUMENT" {
  if (ALLOWED_IMAGE_MIMES.includes(mimetype)) return "IMAGE";
  if (ALLOWED_VIDEO_MIMES.includes(mimetype)) return "VIDEO";
  if (ALLOWED_DOCUMENT_MIMES.includes(mimetype)) return "DOCUMENT";

  throw new ValidationError("Invalid file type", "INVALID_FILE_TYPE", {
    mimetype: ["Unsupported file type"],
  });
}

/**
 * Validate uploaded file
 */
function validateFile(file: Express.Multer.File) {
  // Check MIME type
  if (!ALL_ALLOWED_MIMES.includes(file.mimetype)) {
    throw new ValidationError("Invalid file type", "INVALID_FILE_TYPE", {
      mimetype: [`File type ${file.mimetype} is not allowed`],
    });
  }

  // Check file size
  const mediaType = getMediaType(file.mimetype);
  const maxSize = MAX_FILE_SIZE[mediaType];

  if (file.size > maxSize) {
    throw new ValidationError("File too large", "FILE_TOO_LARGE", {
      size: [
        `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`,
      ],
    });
  }

  return mediaType;
}

/**
 * Upload a file and create media record
 */
export async function uploadFile(
  file: Express.Multer.File,
  data: UploadFileDTO,
) {
  // Validate file
  const mediaType = validateFile(file);

  // Ensure upload directory exists
  await ensureUploadDir();

  // Generate unique filename
  const ext = path.extname(file.originalname);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filename = `${data.entityType}_${data.entityId}_${timestamp}_${randomSuffix}${ext}`;

  // Determine subdirectory based on media type
  const subdir = mediaType.toLowerCase() + "s"; // images, videos, documents
  const relativePath = path.join(subdir, filename);
  const absolutePath = path.join(UPLOAD_DIR, relativePath);

  // Save file to disk
  await fs.writeFile(absolutePath, file.buffer);

  // Create media record in database
  const media = await repository.createMedia({
    storageUrl: `/uploads/${relativePath.replace(/\\/g, "/")}`, // Normalize path for URLs
    type: mediaType,
    entityType: data.entityType,
    entityId: data.entityId,
    altText: data.altText,
    isMain: data.isMain,
  });

  // If this is set as main, ensure no other media is marked as main
  if (data.isMain) {
    await repository.setMainMedia(
      media.mediaId,
      data.entityType,
      data.entityId,
    );
  }

  return media;
}

/**
 * Get media by ID
 */
export async function getMediaById(mediaId: string) {
  const media = await repository.findMediaById(mediaId);

  if (!media) {
    throw new ValidationError("Media not found", "MEDIA_NOT_FOUND", {
      mediaId: ["No media found with this ID"],
    });
  }

  return media;
}

/**
 * Get all media for an entity
 */
export async function getMediaByEntity(entityType: string, entityId: string) {
  return repository.findMediaByEntity(entityType, entityId);
}

/**
 * Delete media file and record
 */
export async function deleteMediaFile(mediaId: string) {
  const media = await repository.findMediaById(mediaId);

  if (!media) {
    throw new ValidationError("Media not found", "MEDIA_NOT_FOUND", {
      mediaId: ["No media found with this ID"],
    });
  }

  // Delete file from disk
  const filePath = path.join(process.cwd(), media.storageUrl);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, continue with DB deletion
    console.warn(`Failed to delete file: ${filePath}`, error);
  }

  // Delete database record
  return repository.deleteMedia(mediaId);
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(
  mediaId: string,
  data: { altText?: string; isMain?: boolean },
) {
  const media = await repository.findMediaById(mediaId);

  if (!media) {
    throw new ValidationError("Media not found", "MEDIA_NOT_FOUND", {
      mediaId: ["No media found with this ID"],
    });
  }

  // If setting as main, ensure no other media is marked as main
  if (data.isMain) {
    await repository.setMainMedia(mediaId, media.entityType, media.entityId);
  }

  return repository.updateMedia(mediaId, data);
}
