/**
 * @file CMS Module Types
 * @description Type definitions and DTOs for content management (news, resources)
 */

export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

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

// ===================
// SPONSORS TYPES
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

export interface CreateSponsorDTO {
  name: string;
  websiteUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  sortOrder?: number;
}

export interface UpdateSponsorDTO {
  name?: string;
  websiteUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  sortOrder?: number;
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
  content: Record<string, any>; // JSONB field
  lastUpdatedAt: Date;
  updatedBy: string | null;
}

export interface CreateUIFragmentDTO {
  fragmentKey: string;
  language?: LanguageCode;
  description?: string;
  type: UIComponentType;
  section: UISection;
  content: Record<string, any>;
}

export interface UpdateUIFragmentDTO {
  description?: string;
  content?: Record<string, any>;
}

// Validation constants
export const PUBLICATION_STATUS_VALUES: PublicationStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export const LANGUAGE_CODE_VALUES: LanguageCode[] = ["es", "en", "pt"];
