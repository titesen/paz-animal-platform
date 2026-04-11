import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["EMAIL", "SYSTEM"]),
  subject: z.string().max(255).optional(),
  body: z.string().min(1).max(5000),
});

export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;

export const notificationIdSchema = z.object({
  notificationId: z.string().uuid(),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

export type MarkReadDTO = z.infer<typeof markReadSchema>;
