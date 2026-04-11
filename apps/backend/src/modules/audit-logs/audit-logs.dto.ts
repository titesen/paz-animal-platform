import { z } from "zod";

export const auditLogQuerySchema = z.object({
  action: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export type AuditLogQueryDTO = z.infer<typeof auditLogQuerySchema>;
