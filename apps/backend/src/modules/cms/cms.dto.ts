/**
 * @file CMS Module - Data Transfer Objects (DTOs)
 * @description Input DTOs for content management operations
 */

import type { LanguageCode, PublicationStatus, UIComponentType, UISection } from "./cms.types";

// ===================
// NEWS DTOs
// ===================

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

// ===================
// RESOURCES DTOs
// ===================

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

// ===================
// SPONSORS DTOs
// ===================

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
// UI FRAGMENTS DTOs
// ===================

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
