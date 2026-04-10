/**
 * @file Media Module - Domain Types
 * @description Constants and type definitions for media management
 */

// Supported media types
export const MEDIA_TYPES = ["IMAGE", "VIDEO", "DOCUMENT"] as const;

// Supported entity types for polymorphic relationship
export const ENTITY_TYPES = ["pets", "news", "events", "users"] as const;

// Allowed file extensions and MIME types
export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"];

export const ALLOWED_DOCUMENT_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALL_ALLOWED_MIMES = [
  ...ALLOWED_IMAGE_MIMES,
  ...ALLOWED_VIDEO_MIMES,
  ...ALLOWED_DOCUMENT_MIMES,
];

// File size limits (in bytes)
export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
};
