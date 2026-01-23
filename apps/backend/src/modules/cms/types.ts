/**
 * @file CMS Module Types
 * @description Type definitions and DTOs for content management (news, resources)
 */

export type PublicationStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

// Database entity types
export interface News {
  newsId: string;
  authorId: string;
  status: PublicationStatus;
  publishedAt: Date | null;
  deletedAt: Date | null;
}

export interface NewsTranslation {
  newsId: string;
  language: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface Resource {
  resourceId: string;
  authorId: string;
  status: PublicationStatus;
  createdAt: Date;
  lastUpdatedAt: Date | null;
  sortOrder: number | null;
  deletedAt: Date | null;
}

export interface ResourceTranslation {
  resourceId: string;
  language: string;
  title: string;
  content: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

// DTOs for creating content
export interface CreateNewsDTO {
  status?: PublicationStatus;
  publishedAt?: string;
  translations: {
    language: string;
    title: string;
    excerpt?: string;
    content: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
}

export interface UpdateNewsDTO {
  status?: PublicationStatus;
  publishedAt?: string;
}

export interface UpdateNewsTranslationDTO {
  title?: string;
  excerpt?: string;
  content?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface CreateResourceDTO {
  status?: PublicationStatus;
  sortOrder?: number;
  translations: {
    language: string;
    title: string;
    content: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
}

export interface UpdateResourceDTO {
  status?: PublicationStatus;
  sortOrder?: number;
}

export interface UpdateResourceTranslationDTO {
  title?: string;
  content?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Response types
export interface NewsWithTranslations extends News {
  translations: NewsTranslation[];
  author?: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface ResourceWithTranslations extends Resource {
  translations: ResourceTranslation[];
  author?: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

// Validation constants
export const PUBLICATION_STATUS_VALUES: PublicationStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
];
