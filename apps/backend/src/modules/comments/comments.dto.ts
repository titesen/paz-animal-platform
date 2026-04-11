import { z } from "zod";

export const createCommentSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  parentCommentId: z.string().uuid().optional().nullable(),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export type UpdateCommentDTO = z.infer<typeof updateCommentSchema>;

export const moderateCommentSchema = z.object({
  moderationStatus: z.enum([
    "PUBLISHED",
    "FLAGGED",
    "HIDDEN_BY_SYSTEM",
    "REMOVED_BY_ADMIN",
    "APPROVED_BY_ADMIN",
  ]),
});

export type ModerateCommentDTO = z.infer<typeof moderateCommentSchema>;

export const commentIdSchema = z.object({
  commentId: z.string().uuid(),
});

export const entityParamsSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});
