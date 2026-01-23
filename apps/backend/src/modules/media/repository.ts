/**
 * @file Media Repository
 * @description Data access layer for media table
 */

import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { media } from "../../db/schema";

/**
 * Create a new media record
 */
export async function createMedia(data: {
  storageUrl: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  entityType: string;
  entityId: string;
  altText?: string;
  isMain?: boolean;
}) {
  const [result] = await db
    .insert(media)
    .values({
      storageUrl: data.storageUrl,
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      altText: data.altText,
      isMain: data.isMain || false,
    })
    .returning();

  return result;
}

/**
 * Find media by ID
 */
export async function findMediaById(mediaId: string) {
  const [result] = await db
    .select()
    .from(media)
    .where(eq(media.mediaId, mediaId))
    .limit(1);

  return result || null;
}

/**
 * Find all media for a specific entity
 */
export async function findMediaByEntity(entityType: string, entityId: string) {
  return db
    .select()
    .from(media)
    .where(and(eq(media.entityType, entityType), eq(media.entityId, entityId)))
    .orderBy(media.uploadedAt);
}

/**
 * Find main media for an entity
 */
export async function findMainMedia(entityType: string, entityId: string) {
  const [result] = await db
    .select()
    .from(media)
    .where(
      and(
        eq(media.entityType, entityType),
        eq(media.entityId, entityId),
        eq(media.isMain, true),
      ),
    )
    .limit(1);

  return result || null;
}

/**
 * Set a media as main for an entity (unsets previous main)
 */
export async function setMainMedia(
  mediaId: string,
  entityType: string,
  entityId: string,
) {
  // First, unset all other main media for this entity
  await db
    .update(media)
    .set({ isMain: false })
    .where(and(eq(media.entityType, entityType), eq(media.entityId, entityId)));

  // Then set the new main media
  const [result] = await db
    .update(media)
    .set({ isMain: true })
    .where(eq(media.mediaId, mediaId))
    .returning();

  return result;
}

/**
 * Delete media by ID
 */
export async function deleteMedia(mediaId: string) {
  const [result] = await db
    .delete(media)
    .where(eq(media.mediaId, mediaId))
    .returning();

  return result || null;
}

/**
 * Update media metadata
 */
export async function updateMedia(
  mediaId: string,
  data: { altText?: string; isMain?: boolean },
) {
  const [result] = await db
    .update(media)
    .set(data)
    .where(eq(media.mediaId, mediaId))
    .returning();

  return result || null;
}
