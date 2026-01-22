/** @file Events Repository - Placeholder */
import { eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findEventById(eventId: string) {
  const result = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.eventId, eventId))
    .limit(1);
  return result[0] || null;
}
