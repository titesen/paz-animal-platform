import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function createComment(data: {
  authorId: string;
  entityType: string;
  entityId: string;
  content: string;
  parentCommentId?: string | null;
}) {
  const [result] = await db.insert(schema.comments).values(data).returning();
  return result;
}

export async function findCommentsByEntity(entityType: string, entityId: string) {
  return db
    .select()
    .from(schema.comments)
    .where(
      and(
        eq(schema.comments.entityType, entityType),
        eq(schema.comments.entityId, entityId),
        isNull(schema.comments.deletedAt),
      ),
    )
    .orderBy(schema.comments.createdAt);
}

export async function findCommentById(commentId: string) {
  const [result] = await db
    .select()
    .from(schema.comments)
    .where(eq(schema.comments.commentId, commentId))
    .limit(1);
  return result || null;
}

export async function updateComment(commentId: string, content: string) {
  const [result] = await db
    .update(schema.comments)
    .set({ content, lastUpdatedAt: new Date() })
    .where(eq(schema.comments.commentId, commentId))
    .returning();
  return result || null;
}

export async function softDeleteComment(commentId: string) {
  const [result] = await db
    .update(schema.comments)
    .set({ deletedAt: new Date() })
    .where(eq(schema.comments.commentId, commentId))
    .returning();
  return result || null;
}

export async function moderateComment(
  commentId: string,
  moderationStatus:
    | "PUBLISHED"
    | "FLAGGED"
    | "HIDDEN_BY_SYSTEM"
    | "REMOVED_BY_ADMIN"
    | "APPROVED_BY_ADMIN",
) {
  const [result] = await db
    .update(schema.comments)
    .set({ moderationStatus })
    .where(eq(schema.comments.commentId, commentId))
    .returning();
  return result || null;
}
