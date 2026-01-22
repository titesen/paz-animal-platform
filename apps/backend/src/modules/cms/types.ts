/** @file CMS Module - Types Placeholder */
import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(50000),
  publicationStatus: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
});

export type CreateNewsDTO = z.infer<typeof createNewsSchema>;
