import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findLike(userId: string, entityType: string, entityId: string) {
  const [result] = await db
    .select()
    .from(schema.likes)
    .where(
      and(
        eq(schema.likes.userId, userId),
        eq(schema.likes.entityType, entityType),
        eq(schema.likes.entityId, entityId),
      ),
    )
    .limit(1);
  return result || null;
}

export async function createLike(userId: string, entityType: string, entityId: string) {
  const [result] = await db
    .insert(schema.likes)
    .values({ userId, entityType, entityId })
    .returning();
  return result;
}

export async function deleteLike(userId: string, entityType: string, entityId: string) {
  const result = await db
    .delete(schema.likes)
    .where(
      and(
        eq(schema.likes.userId, userId),
        eq(schema.likes.entityType, entityType),
        eq(schema.likes.entityId, entityId),
      ),
    )
    .returning();
  return result.length > 0;
}

export async function countLikesByEntity(entityType: string, entityId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.likes)
    .where(and(eq(schema.likes.entityType, entityType), eq(schema.likes.entityId, entityId)));
  return result.count;
}

export async function hasUserLiked(userId: string, entityType: string, entityId: string) {
  const like = await findLike(userId, entityType, entityId);
  return like !== null;
}
