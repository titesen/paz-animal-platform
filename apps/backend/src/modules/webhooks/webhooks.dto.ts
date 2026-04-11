import { z } from "zod";

export const webhookIdSchema = z.object({
  webhookId: z.string().uuid(),
});

export const webhookQuerySchema = z.object({
  source: z.string().max(50).optional(),
  isProcessed: z
    .string()
    .regex(/^(true|false)$/)
    .optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});
