/**
 * @file CMS Repository Interface
 * @description Contract for the CMS data access layer
 */

import type {
  News,
  NewsTranslation,
  PublicationStatus,
  Resource,
  ResourceTranslation,
  Sponsor,
  UIFragment,
} from "./cms.types";

export interface ICmsRepository {
  // News
  createNews(data: {
    authorId: string;
    status: PublicationStatus;
    publishedAt?: Date;
  }): Promise<News>;
  createNewsTranslations(
    translations: {
      newsId: string;
      language: string;
      title: string;
      excerpt?: string;
      content: string;
      slug: string;
      metaTitle?: string;
      metaDescription?: string;
    }[],
  ): Promise<NewsTranslation[]>;
  findNewsById(newsId: string): Promise<(News & { translations: NewsTranslation[] }) | null>;
  findNewsBySlug(
    slug: string,
    language: string,
  ): Promise<(News & { translations: NewsTranslation[] }) | null>;
  findAllPublishedNews(
    page?: number,
    limit?: number,
  ): Promise<{ items: (News & { translations: NewsTranslation[] })[]; total: number }>;
  findAllNews(): Promise<(News & { translations: NewsTranslation[] })[]>;
  updateNews(newsId: string, data: Partial<News>): Promise<News | null>;
  updateNewsTranslation(
    newsId: string,
    language: string,
    data: Partial<NewsTranslation>,
  ): Promise<NewsTranslation | null>;
  deleteNews(newsId: string): Promise<void>;

  // Resources
  createResource(data: {
    authorId: string;
    status: PublicationStatus;
    sortOrder?: number;
  }): Promise<Resource>;
  createResourceTranslations(
    translations: {
      resourceId: string;
      language: string;
      title: string;
      content: string;
      slug: string;
      metaTitle?: string;
      metaDescription?: string;
    }[],
  ): Promise<ResourceTranslation[]>;
  findResourceById(
    resourceId: string,
  ): Promise<(Resource & { translations: ResourceTranslation[] }) | null>;
  findAllPublishedResources(): Promise<(Resource & { translations: ResourceTranslation[] })[]>;
  findAllResources(): Promise<(Resource & { translations: ResourceTranslation[] })[]>;
  updateResource(resourceId: string, data: Partial<Resource>): Promise<Resource | null>;
  updateResourceTranslation(
    resourceId: string,
    language: string,
    data: Partial<ResourceTranslation>,
  ): Promise<ResourceTranslation | null>;
  deleteResource(resourceId: string): Promise<void>;

  // Sponsors
  findAllSponsors(): Promise<Sponsor[]>;
  findSponsorById(sponsorId: string): Promise<Sponsor | null>;
  createSponsor(data: {
    name: string;
    websiteUrl?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    sortOrder?: number;
  }): Promise<Sponsor>;
  updateSponsor(
    sponsorId: string,
    data: Partial<{
      name: string;
      websiteUrl: string | null;
      contactName: string | null;
      contactEmail: string | null;
      contactPhone: string | null;
      sortOrder: number;
    }>,
  ): Promise<Sponsor | null>;
  deleteSponsor(sponsorId: string): Promise<void>;

  // UI Fragments
  findFragmentByKey(fragmentKey: string, language?: string): Promise<UIFragment | null>;
  findFragmentsBySection(section: string, language?: string): Promise<UIFragment[]>;
  findAllFragments(language?: string): Promise<UIFragment[]>;
  upsertFragment(
    data: {
      fragmentKey: string;
      language?: string;
      description?: string;
      type: string;
      section: string;
      content: Record<string, unknown>;
    },
    updatedBy: string,
  ): Promise<UIFragment>;
  updateFragmentContent(
    fragmentKey: string,
    language: string,
    content: Record<string, unknown>,
    updatedBy: string,
  ): Promise<UIFragment | null>;
}
