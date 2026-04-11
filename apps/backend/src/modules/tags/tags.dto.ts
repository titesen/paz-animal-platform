import { z } from "zod";

export const createTagSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers and hyphens"),
  name: z.record(z.string(), z.string().min(1)),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default("#00AA00"),
});
export type CreateTagDTO = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema.partial();
export type UpdateTagDTO = z.infer<typeof updateTagSchema>;

export const tagIdSchema = z.object({
  tagId: z.coerce.number().int().positive(),
});
export type TagIdParams = z.infer<typeof tagIdSchema>;

export const tagQuerySchema = z.object({
  entityType: z.string().optional(),
});
export type TagQueryParams = z.infer<typeof tagQuerySchema>;

export const assignTagSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});
export type AssignTagDTO = z.infer<typeof assignTagSchema>;

export const entityParamsSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});
export type EntityParams = z.infer<typeof entityParamsSchema>;
