/**
 * @file CMS Service
 * @description Business logic for content management (news, resources, sponsors, UI fragments)
 */

import { NotFoundError, ValidationError } from "../../common/types/errors";
import * as repository from "./cms.repository";
import type {
  CreateNewsDTO,
  CreateResourceDTO,
  CreateSponsorDTO,
  CreateUIFragmentDTO,
  UpdateNewsDTO,
  UpdateNewsTranslationDTO,
  UpdateResourceDTO,
  UpdateResourceTranslationDTO,
  UpdateSponsorDTO,
} from "./cms.dto";
import type {
  NewsWithTranslations,
  ResourceWithTranslations,
  Sponsor,
  UIFragment,
  UISection,
} from "./cms.types";

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ===================
// NEWS MANAGEMENT
// ===================

/**
 * Create a news article with translations
 */
export async function createNews(
  authorId: string,
  data: CreateNewsDTO,
): Promise<NewsWithTranslations> {
  // Validate translations
  if (!data.translations || data.translations.length === 0) {
    throw new ValidationError("At least one translation is required", "MISSING_TRANSLATIONS");
  }

  const status = data.status || "DRAFT";
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : undefined;

  // Create news
  const news = await repository.createNews({
    authorId,
    status,
    publishedAt,
  });

  // Create translations with auto-generated slugs if not provided
  const translations = await repository.createNewsTranslations(
    data.translations.map((t) => ({
      newsId: news.newsId,
      language: t.language,
      title: t.title,
      excerpt: t.excerpt,
      content: t.content,
      slug: t.slug || generateSlug(t.title),
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
    })),
  );

  return {
    ...news,
    translations,
  };
}

/**
 * Get all published news (public view)
 */
export async function getAllPublishedNews(
  page = 1,
  limit = 20,
): Promise<{ items: NewsWithTranslations[]; total: number }> {
  return await repository.findAllPublishedNews(page, limit);
}

/**
 * Get all news including drafts (admin view)
 */
export async function getAllNews(): Promise<NewsWithTranslations[]> {
  return await repository.findAllNews();
}

/**
 * Get news by ID
 */
export async function getNewsById(newsId: string): Promise<NewsWithTranslations> {
  const news = await repository.findNewsById(newsId);
  if (!news) {
    throw new NotFoundError("News article not found");
  }

  return news;
}

/**
 * Get news by slug
 */
export async function getNewsBySlug(
  slug: string,
  language: string = "es",
): Promise<NewsWithTranslations> {
  const news = await repository.findNewsBySlug(slug, language);
  if (!news) {
    throw new NotFoundError("News article not found");
  }

  return news;
}

/**
 * Update news
 */
export async function updateNews(
  newsId: string,
  data: UpdateNewsDTO,
): Promise<NewsWithTranslations> {
  const news = await repository.findNewsById(newsId);
  if (!news) {
    throw new NotFoundError("News article not found");
  }

  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.publishedAt) updateData.publishedAt = new Date(data.publishedAt);

  await repository.updateNews(newsId, updateData);

  return (await repository.findNewsById(newsId))!;
}

/**
 * Update news translation
 */
export async function updateNewsTranslation(
  newsId: string,
  language: string,
  data: UpdateNewsTranslationDTO,
): Promise<void> {
  const news = await repository.findNewsById(newsId);
  if (!news) {
    throw new NotFoundError("News article not found");
  }

  const translation = news.translations.find((t) => t.language === language);
  if (!translation) {
    throw new NotFoundError("Translation not found");
  }

  const updateData: any = {};
  if (data.title) {
    updateData.title = data.title;
    updateData.slug = data.slug || generateSlug(data.title);
  }
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.content) updateData.content = data.content;
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

  await repository.updateNewsTranslation(newsId, language, updateData);
}

/**
 * Delete news
 */
export async function deleteNews(newsId: string): Promise<void> {
  const news = await repository.findNewsById(newsId);
  if (!news) {
    throw new NotFoundError("News article not found");
  }

  await repository.deleteNews(newsId);
}

// ===================
// RESOURCES MANAGEMENT
// ===================

/**
 * Create a resource with translations
 */
export async function createResource(
  authorId: string,
  data: CreateResourceDTO,
): Promise<ResourceWithTranslations> {
  // Validate translations
  if (!data.translations || data.translations.length === 0) {
    throw new ValidationError("At least one translation is required", "MISSING_TRANSLATIONS");
  }

  const status = data.status || "DRAFT";
  const sortOrder = data.sortOrder || 0;

  // Create resource
  const resource = await repository.createResource({
    authorId,
    status,
    sortOrder,
  });

  // Create translations with auto-generated slugs if not provided
  const translations = await repository.createResourceTranslations(
    data.translations.map((t) => ({
      resourceId: resource.resourceId,
      language: t.language,
      title: t.title,
      content: t.content,
      slug: t.slug || generateSlug(t.title),
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
    })),
  );

  return {
    ...resource,
    translations,
  };
}

/**
 * Get all published resources (public view)
 */
export async function getAllPublishedResources(): Promise<ResourceWithTranslations[]> {
  return await repository.findAllPublishedResources();
}

/**
 * Get all resources including drafts (admin view)
 */
export async function getAllResources(): Promise<ResourceWithTranslations[]> {
  return await repository.findAllResources();
}

/**
 * Get resource by ID
 */
export async function getResourceById(resourceId: string): Promise<ResourceWithTranslations> {
  const resource = await repository.findResourceById(resourceId);
  if (!resource) {
    throw new NotFoundError("Resource not found");
  }

  return resource;
}

/**
 * Update resource
 */
export async function updateResource(
  resourceId: string,
  data: UpdateResourceDTO,
): Promise<ResourceWithTranslations> {
  const resource = await repository.findResourceById(resourceId);
  if (!resource) {
    throw new NotFoundError("Resource not found");
  }

  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  await repository.updateResource(resourceId, updateData);

  return (await repository.findResourceById(resourceId))!;
}

/**
 * Update resource translation
 */
export async function updateResourceTranslation(
  resourceId: string,
  language: string,
  data: UpdateResourceTranslationDTO,
): Promise<void> {
  const resource = await repository.findResourceById(resourceId);
  if (!resource) {
    throw new NotFoundError("Resource not found");
  }

  const translation = resource.translations.find((t) => t.language === language);
  if (!translation) {
    throw new NotFoundError("Translation not found");
  }

  const updateData: any = {};
  if (data.title) {
    updateData.title = data.title;
    updateData.slug = data.slug || generateSlug(data.title);
  }
  if (data.content) updateData.content = data.content;
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

  await repository.updateResourceTranslation(resourceId, language, updateData);
}

/**
 * Delete resource
 */
export async function deleteResource(resourceId: string): Promise<void> {
  const resource = await repository.findResourceById(resourceId);
  if (!resource) {
    throw new NotFoundError("Resource not found");
  }

  await repository.deleteResource(resourceId);
}

// ===================
// SPONSORS MANAGEMENT
// ===================

/**
 * Get all sponsors (public view)
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  return await repository.findAllSponsors();
}

/**
 * Get sponsor by ID
 */
export async function getSponsorById(sponsorId: string): Promise<Sponsor> {
  const sponsor = await repository.findSponsorById(sponsorId);
  if (!sponsor) {
    throw new NotFoundError("Sponsor not found");
  }

  return sponsor;
}

/**
 * Create sponsor
 */
export async function createSponsor(data: CreateSponsorDTO): Promise<Sponsor> {
  // Validate URL if provided
  if (data.websiteUrl && !isValidUrl(data.websiteUrl)) {
    throw new ValidationError("Invalid website URL", "INVALID_URL");
  }

  return await repository.createSponsor({
    name: data.name,
    websiteUrl: data.websiteUrl,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    sortOrder: data.sortOrder ?? 0,
  });
}

/**
 * Update sponsor
 */
export async function updateSponsor(sponsorId: string, data: UpdateSponsorDTO): Promise<Sponsor> {
  const sponsor = await repository.findSponsorById(sponsorId);
  if (!sponsor) {
    throw new NotFoundError("Sponsor not found");
  }

  // Validate URL if provided
  if (data.websiteUrl && !isValidUrl(data.websiteUrl)) {
    throw new ValidationError("Invalid website URL", "INVALID_URL");
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  await repository.updateSponsor(sponsorId, updateData);

  return (await repository.findSponsorById(sponsorId))!;
}

/**
 * Delete sponsor
 */
export async function deleteSponsor(sponsorId: string): Promise<void> {
  const sponsor = await repository.findSponsorById(sponsorId);
  if (!sponsor) {
    throw new NotFoundError("Sponsor not found");
  }

  await repository.deleteSponsor(sponsorId);
}

// ===================
// UI FRAGMENTS MANAGEMENT
// ===================

/**
 * Get fragment by key and language
 */
export async function getFragmentByKey(
  fragmentKey: string,
  language: string = "es",
): Promise<UIFragment> {
  const fragment = await repository.findFragmentByKey(fragmentKey, language);
  if (!fragment) {
    throw new NotFoundError("UI Fragment not found");
  }

  return fragment;
}

/**
 * Get fragments by section
 */
export async function getFragmentsBySection(
  section: UISection,
  language: string = "es",
): Promise<UIFragment[]> {
  return await repository.findFragmentsBySection(section, language);
}

/**
 * Get all fragments (admin view)
 */
export async function getAllFragments(language?: string): Promise<UIFragment[]> {
  return await repository.findAllFragments(language);
}

/**
 * Create or update fragment (hot-swap)
 */
export async function upsertFragment(
  data: CreateUIFragmentDTO,
  userId: string,
): Promise<UIFragment> {
  return await repository.upsertFragment(
    {
      fragmentKey: data.fragmentKey,
      language: data.language || "es",
      description: data.description,
      type: data.type,
      section: data.section,
      content: data.content,
    },
    userId,
  );
}

/**
 * Update fragment content only (hot-swap)
 */
export async function updateFragmentContent(
  fragmentKey: string,
  language: string,
  content: Record<string, any>,
  userId: string,
): Promise<UIFragment> {
  const fragment = await repository.updateFragmentContent(fragmentKey, language, content, userId);

  if (!fragment) {
    throw new NotFoundError("UI Fragment not found");
  }

  return fragment;
}

// ===================
// UTILITIES
// ===================

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
