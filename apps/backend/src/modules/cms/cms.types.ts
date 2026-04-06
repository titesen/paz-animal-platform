/**
 * @file CMS Module - Domain Types
 * @description Entity interfaces, type aliases, and constants for content management
 */

export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ===================
// NEWS ENTITIES
// ===================

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

export interface NewsWithTranslations extends News {
  translations: NewsTranslation[];
  author?: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

// ===================
// RESOURCES ENTITIES
// ===================

export interface Resource {
  resourceId: string;
  authorId: string;
  status: PublicationStatus;
  createdAt: Date | null;
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

export interface ResourceWithTranslations extends Resource {
  translations: ResourceTranslation[];
  author?: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

// ===================
// SPONSORS ENTITIES
// ===================

export interface Sponsor {
  sponsorId: string;
  name: string;
  websiteUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  sortOrder: number;
  createdAt: Date;
  deletedAt: Date | null;
}

// ===================
// UI FRAGMENTS TYPES
// ===================

export type UIComponentType =
  | "TEXT"
  | "RICH_TEXT"
  | "IMAGE_URL"
  | "CAROUSEL_LIST"
  | "CONFIG"
  | "LINK";

export type UISection =
  | "GLOBAL"
  | "HOME"
  | "FOOTER"
  | "NAVBAR"
  | "ADOPTIONS"
  | "VOLUNTEERS"
  | "DONATIONS"
  | "CONTACT"
  | "ABOUT_US";

export type LanguageCode = "es" | "en" | "pt";

export interface UIFragment {
  fragmentKey: string;
  language: LanguageCode;
  description: string | null;
  type: UIComponentType;
  section: UISection;
  content: Record<string, any>;
  lastUpdatedAt: Date;
  updatedBy: string | null;
}

// ===================
// CONSTANTS
// ===================

export const PUBLICATION_STATUS_VALUES: PublicationStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export const LANGUAGE_CODE_VALUES: LanguageCode[] = ["es", "en", "pt"];
