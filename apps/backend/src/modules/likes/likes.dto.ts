import { z } from "zod";

export const toggleLikeSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});

export type ToggleLikeDTO = z.infer<typeof toggleLikeSchema>;

export const entityParamsSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});
