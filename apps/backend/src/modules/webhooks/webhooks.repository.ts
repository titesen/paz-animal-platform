import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function createWebhook(data: { source: string; payload: unknown }) {
  const [result] = await db.insert(schema.incomingWebhooks).values(data).returning();
  return result;
}

export async function findWebhooks(filters?: {
  source?: string;
  isProcessed?: boolean;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters?.source) {
    conditions.push(eq(schema.incomingWebhooks.source, filters.source));
  }
  if (filters?.isProcessed !== undefined) {
    conditions.push(eq(schema.incomingWebhooks.isProcessed, filters.isProcessed));
  }

  return db
    .select()
    .from(schema.incomingWebhooks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(schema.incomingWebhooks.receivedAt)
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
}

export async function findWebhookById(webhookId: string) {
  const [result] = await db
    .select()
    .from(schema.incomingWebhooks)
    .where(eq(schema.incomingWebhooks.webhookId, webhookId))
    .limit(1);
  return result || null;
}

export async function markWebhookProcessed(webhookId: string, error?: string) {
  const [result] = await db
    .update(schema.incomingWebhooks)
    .set({
      isProcessed: true,
      processingError: error || null,
    })
    .where(eq(schema.incomingWebhooks.webhookId, webhookId))
    .returning();
  return result || null;
}
