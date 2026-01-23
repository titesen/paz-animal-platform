/**
 * @file CMS Service
 * @description Business logic for content management (news, resources)
 */

import { NotFoundError, ValidationError } from "../../types/errors";
import * as repository from "./repository";
import type {
  CreateNewsDTO,
  UpdateNewsDTO,
  UpdateNewsTranslationDTO,
  CreateResourceDTO,
  UpdateResourceDTO,
  UpdateResourceTranslationDTO,
  NewsWithTranslations,
  ResourceWithTranslations,
} from "./types";

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
    throw new ValidationError(
      "At least one translation is required",
      "MISSING_TRANSLATIONS",
    );
  }

  const status = data.status || "DRAFT";
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

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
export async function getAllPublishedNews(): Promise<NewsWithTranslations[]> {
  return await repository.findAllPublishedNews();
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
  if (data.metaDescription !== undefined)
    updateData.metaDescription = data.metaDescription;

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
    throw new ValidationError(
      "At least one translation is required",
      "MISSING_TRANSLATIONS",
    );
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
export async function getAllPublishedResources(): Promise<
  ResourceWithTranslations[]
> {
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
export async function getResourceById(
  resourceId: string,
): Promise<ResourceWithTranslations> {
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
  if (data.metaDescription !== undefined)
    updateData.metaDescription = data.metaDescription;

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
