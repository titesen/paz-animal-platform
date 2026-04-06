/**
 * @file CMS Module - Data Transfer Objects (DTOs)
 * @description Zod schemas for content management request validation
 */

import { z } from "zod";

// ===================
// COMMON SCHEMAS
// ===================

const publicationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const uuidParamSchema = z.object({
  newsId: z.string().uuid(),
});

const resourceIdParamSchema = z.object({
  resourceId: z.string().uuid(),
});

const sponsorIdParamSchema = z.object({
  sponsorId: z.string().uuid(),
});

const languageParamSchema = z.object({
  language: z.string().min(2).max(5),
});

const paginationQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
});

// ===================
// NEWS SCHEMAS
// ===================

export const createNewsSchema = z.object({
  status: publicationStatusSchema.optional(),
  publishedAt: z.string().datetime().optional(),
  translations: z
    .array(
      z.object({
        language: z.string().min(2).max(5),
        title: z.string().min(1).max(300),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(1),
        slug: z.string().max(300).optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(500).optional(),
      }),
    )
    .min(1),
});

export type CreateNewsDTO = z.infer<typeof createNewsSchema>;

export const updateNewsSchema = z.object({
  status: publicationStatusSchema.optional(),
  publishedAt: z.string().datetime().optional(),
});

export type UpdateNewsDTO = z.infer<typeof updateNewsSchema>;

export const updateNewsTranslationSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().max(300).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
});

export type UpdateNewsTranslationDTO = z.infer<typeof updateNewsTranslationSchema>;

// ===================
// RESOURCES SCHEMAS
// ===================

export const createResourceSchema = z.object({
  status: publicationStatusSchema.optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  translations: z
    .array(
      z.object({
        language: z.string().min(2).max(5),
        title: z.string().min(1).max(300),
        content: z.string().min(1),
        slug: z.string().max(300).optional(),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(500).optional(),
      }),
    )
    .min(1),
});

export type CreateResourceDTO = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = z.object({
  status: publicationStatusSchema.optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type UpdateResourceDTO = z.infer<typeof updateResourceSchema>;

export const updateResourceTranslationSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().max(300).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
});

export type UpdateResourceTranslationDTO = z.infer<typeof updateResourceTranslationSchema>;

// ===================
// SPONSORS SCHEMAS
// ===================

export const createSponsorSchema = z.object({
  name: z.string().min(1).max(200),
  websiteUrl: z.string().url().optional(),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type CreateSponsorDTO = z.infer<typeof createSponsorSchema>;

export const updateSponsorSchema = createSponsorSchema.partial();

export type UpdateSponsorDTO = z.infer<typeof updateSponsorSchema>;

// ===================
// UI FRAGMENTS SCHEMAS
// ===================

const uiComponentTypeSchema = z.enum([
  "TEXT",
  "RICH_TEXT",
  "IMAGE_URL",
  "CAROUSEL_LIST",
  "CONFIG",
  "LINK",
]);

const uiSectionSchema = z.enum([
  "GLOBAL",
  "HOME",
  "FOOTER",
  "NAVBAR",
  "ADOPTIONS",
  "VOLUNTEERS",
  "DONATIONS",
  "CONTACT",
  "ABOUT_US",
]);

const languageCodeSchema = z.enum(["es", "en", "pt"]);

export const createUIFragmentSchema = z.object({
  fragmentKey: z.string().min(1).max(100),
  language: languageCodeSchema.optional(),
  description: z.string().max(500).optional(),
  type: uiComponentTypeSchema,
  section: uiSectionSchema,
  content: z.record(z.string(), z.unknown()),
});

export type CreateUIFragmentDTO = z.infer<typeof createUIFragmentSchema>;

export const updateUIFragmentSchema = z.object({
  description: z.string().max(500).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateUIFragmentDTO = z.infer<typeof updateUIFragmentSchema>;

// ===================
// PARAM/QUERY SCHEMAS
// ===================

export const newsIdParamSchema = uuidParamSchema;
export type NewsIdParams = z.infer<typeof newsIdParamSchema>;

export const resourceIdSchema = resourceIdParamSchema;
export type ResourceIdParams = z.infer<typeof resourceIdSchema>;

export const sponsorIdSchema = sponsorIdParamSchema;
export type SponsorIdParams = z.infer<typeof sponsorIdSchema>;

export const languageSchema = languageParamSchema;

export const paginationSchema = paginationQuerySchema;
export type PaginationQuery = z.infer<typeof paginationSchema>;
