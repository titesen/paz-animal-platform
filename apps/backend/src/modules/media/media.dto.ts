/**
 * @file Media Module - Data Transfer Objects (DTOs)
 * @description Zod schemas for media upload validation
 */

import { z } from "zod";
import { ENTITY_TYPES } from "./media.types";

export const uploadFileSchema = z.object({
  entityType: z.enum(ENTITY_TYPES),
  entityId: z.string().uuid(),
  altText: z.string().max(255).optional(),
  isMain: z.boolean().default(false),
});

export type UploadFileDTO = z.infer<typeof uploadFileSchema>;
