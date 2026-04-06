/**
 * @file Media Repository Interface
 * @description Contract for the media data access layer
 */

import type { media } from "../../db/schema";

type Media = typeof media.$inferSelect;

export interface IMediaRepository {
  createMedia(data: {
    storageUrl: string;
    type: "IMAGE" | "VIDEO" | "DOCUMENT";
    entityType: string;
    entityId: string;
    altText?: string;
    isMain?: boolean;
  }): Promise<Media>;
  findMediaById(mediaId: string): Promise<Media | null>;
  findMediaByEntity(entityType: string, entityId: string): Promise<Media[]>;
  findMainMedia(entityType: string, entityId: string): Promise<Media | null>;
  setMainMedia(mediaId: string, entityType: string, entityId: string): Promise<Media>;
  deleteMedia(mediaId: string): Promise<Media | null>;
  updateMedia(mediaId: string, data: { altText?: string; isMain?: boolean }): Promise<Media | null>;
}
