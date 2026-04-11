import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function createNotification(data: {
  userId: string;
  type: "EMAIL" | "SYSTEM";
  subject?: string;
  body: string;
}) {
  const [result] = await db.insert(schema.notifications).values(data).returning();
  return result;
}

export async function findNotificationsByUser(userId: string) {
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(schema.notifications.createdAt);
}

export async function findNotificationById(notificationId: string) {
  const [result] = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.notificationId, notificationId))
    .limit(1);
  return result || null;
}

export async function markNotificationsRead(notificationIds: string[], userId: string) {
  return db
    .update(schema.notifications)
    .set({ status: "SENT" as const, sentAt: new Date() })
    .where(
      and(
        inArray(schema.notifications.notificationId, notificationIds),
        eq(schema.notifications.userId, userId),
      ),
    )
    .returning();
}

export async function findAllNotifications() {
  return db.select().from(schema.notifications).orderBy(schema.notifications.createdAt);
}
