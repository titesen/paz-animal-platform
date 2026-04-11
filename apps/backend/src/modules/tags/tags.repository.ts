import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findAllTags() {
  return db.select().from(schema.tags).orderBy(asc(schema.tags.slug));
}

export async function findTagById(tagId: number) {
  const result = await db.select().from(schema.tags).where(eq(schema.tags.tagId, tagId)).limit(1);
  return result[0] || null;
}

export async function createTag(data: { slug: string; name: unknown; colorHex?: string }) {
  const result = await db.insert(schema.tags).values(data).returning();
  return result[0];
}

export async function updateTag(
  tagId: number,
  data: Partial<{ slug: string; name: unknown; colorHex: string }>,
) {
  const result = await db
    .update(schema.tags)
    .set(data)
    .where(eq(schema.tags.tagId, tagId))
    .returning();
  return result[0] || null;
}

export async function deleteTag(tagId: number) {
  await db.delete(schema.tags).where(eq(schema.tags.tagId, tagId));
}

export async function assignTag(tagId: number, entityType: string, entityId: string) {
  const result = await db
    .insert(schema.taggables)
    .values({ tagId, entityType, entityId })
    .onConflictDoNothing()
    .returning();
  return result[0];
}

export async function removeTag(tagId: number, entityType: string, entityId: string) {
  await db
    .delete(schema.taggables)
    .where(
      and(
        eq(schema.taggables.tagId, tagId),
        eq(schema.taggables.entityType, entityType),
        eq(schema.taggables.entityId, entityId),
      ),
    );
}

export async function findTagsForEntity(entityType: string, entityId: string) {
  return db
    .select({
      tagId: schema.tags.tagId,
      slug: schema.tags.slug,
      name: schema.tags.name,
      colorHex: schema.tags.colorHex,
    })
    .from(schema.taggables)
    .innerJoin(schema.tags, eq(schema.taggables.tagId, schema.tags.tagId))
    .where(
      and(eq(schema.taggables.entityType, entityType), eq(schema.taggables.entityId, entityId)),
    )
    .orderBy(asc(schema.tags.slug));
}
