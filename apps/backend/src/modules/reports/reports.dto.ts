import { z } from "zod";

export const createReportSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
  reason: z.enum(["SPAM", "OFFENSIVE", "FALSE_INFORMATION", "OTHER"]),
  description: z.string().max(2000).optional(),
});

export type CreateReportDTO = z.infer<typeof createReportSchema>;

export const reportIdSchema = z.object({
  reportId: z.string().uuid(),
});

export const resolveReportSchema = z.object({
  isResolved: z.boolean(),
});

export type ResolveReportDTO = z.infer<typeof resolveReportSchema>;
