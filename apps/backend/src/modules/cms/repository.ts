/**
 * @file CMS Repository
 * @description Data access layer for news, resources, and content management
 */

import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type {
  News,
  NewsTranslation,
  PublicationStatus,
  Resource,
  ResourceTranslation,
  Sponsor,
  UIFragment,
} from "./types";

// ===================
// NEWS CRUD
// ===================

/**
 * Create a news article
 */
export async function createNews(data: {
  authorId: string;
  status: PublicationStatus;
  publishedAt?: Date;
}): Promise<News> {
  const [news] = await db.insert(schema.news).values(data).returning();

  return news;
}

/**
 * Create news translations
 */
export async function createNewsTranslations(
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
): Promise<NewsTranslation[]> {
  if (translations.length === 0) return [];

  return await db
    .insert(schema.newsTranslations)
    .values(translations as any)
    .returning();
}

/**
 * Find news by ID with translations
 */
export async function findNewsById(
  newsId: string,
): Promise<(News & { translations: NewsTranslation[] }) | null> {
  const newsItem = await db
    .select()
    .from(schema.news)
    .where(and(eq(schema.news.newsId, newsId), isNull(schema.news.deletedAt)))
    .limit(1);

  if (!newsItem[0]) return null;

  const translations = await db
    .select()
    .from(schema.newsTranslations)
    .where(eq(schema.newsTranslations.newsId, newsId));

  return {
    ...newsItem[0],
    translations,
  };
}

/**
 * Find news by slug
 */
export async function findNewsBySlug(
  slug: string,
  language: string,
): Promise<(News & { translations: NewsTranslation[] }) | null> {
  const translation = await db
    .select()
    .from(schema.newsTranslations)
    .where(
      and(
        eq(schema.newsTranslations.slug, slug),
        eq(schema.newsTranslations.language, language as "es" | "en" | "pt"),
      ),
    )
    .limit(1);

  if (!translation[0]) return null;

  return await findNewsById(translation[0].newsId);
}

/**
 * Get all published news
 */
export async function findAllPublishedNews(): Promise<
  (News & { translations: NewsTranslation[] })[]
> {
  const newsItems = await db
    .select()
    .from(schema.news)
    .where(
      and(eq(schema.news.status, "PUBLISHED"), isNull(schema.news.deletedAt)),
    )
    .orderBy(desc(schema.news.publishedAt));

  if (newsItems.length === 0) return [];

  const newsIds = newsItems.map((n) => n.newsId);
  const translations = await db
    .select()
    .from(schema.newsTranslations)
    .where(eq(schema.newsTranslations.newsId, newsIds[0])); // Simplified, would need IN clause

  return newsItems.map((newsItem) => ({
    ...newsItem,
    translations: translations.filter((t) => t.newsId === newsItem.newsId),
  }));
}

/**
 * Get all news (including drafts) for admin
 */
export async function findAllNews(): Promise<
  (News & { translations: NewsTranslation[] })[]
> {
  const newsItems = await db
    .select()
    .from(schema.news)
    .where(isNull(schema.news.deletedAt))
    .orderBy(desc(schema.news.publishedAt));

  if (newsItems.length === 0) return [];

  const allTranslations = await db.select().from(schema.newsTranslations);

  return newsItems.map((newsItem) => ({
    ...newsItem,
    translations: allTranslations.filter((t) => t.newsId === newsItem.newsId),
  }));
}

/**
 * Update news
 */
export async function updateNews(
  newsId: string,
  data: Partial<News>,
): Promise<News | null> {
  const [updated] = await db
    .update(schema.news)
    .set(data)
    .where(eq(schema.news.newsId, newsId))
    .returning();

  return updated || null;
}

/**
 * Update news translation
 */
export async function updateNewsTranslation(
  newsId: string,
  language: string,
  data: Partial<NewsTranslation>,
): Promise<NewsTranslation | null> {
  const [updated] = await db
    .update(schema.newsTranslations)
    .set(data as any)
    .where(
      and(
        eq(schema.newsTranslations.newsId, newsId),
        eq(schema.newsTranslations.language, language as "es" | "en" | "pt"),
      ),
    )
    .returning();

  return updated || null;
}

/**
 * Soft delete news
 */
export async function deleteNews(newsId: string): Promise<void> {
  await db
    .update(schema.news)
    .set({ deletedAt: new Date() })
    .where(eq(schema.news.newsId, newsId));
}

// ===================
// RESOURCES CRUD
// ===================

/**
 * Create a resource
 */
export async function createResource(data: {
  authorId: string;
  status: PublicationStatus;
  sortOrder?: number;
}): Promise<Resource> {
  const [resource] = await db.insert(schema.resources).values(data).returning();

  return resource;
}

/**
 * Create resource translations
 */
export async function createResourceTranslations(
  translations: {
    resourceId: string;
    language: string;
    title: string;
    content: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
  }[],
): Promise<ResourceTranslation[]> {
  if (translations.length === 0) return [];

  return await db
    .insert(schema.resourcesTranslations)
    .values(
      translations.map((t) => ({
        ...t,
        language: t.language as "es" | "en" | "pt",
      })),
    )
    .returning();
}

/**
 * Find resource by ID with translations
 */
export async function findResourceById(
  resourceId: string,
): Promise<(Resource & { translations: ResourceTranslation[] }) | null> {
  const resource = await db
    .select()
    .from(schema.resources)
    .where(
      and(
        eq(schema.resources.resourceId, resourceId),
        isNull(schema.resources.deletedAt),
      ),
    )
    .limit(1);

  if (!resource[0]) return null;

  const translations = await db
    .select()
    .from(schema.resourcesTranslations)
    .where(eq(schema.resourcesTranslations.resourceId, resourceId));

  return {
    ...resource[0],
    translations,
  };
}

/**
 * Get all published resources
 */
export async function findAllPublishedResources(): Promise<
  (Resource & { translations: ResourceTranslation[] })[]
> {
  const resources = await db
    .select()
    .from(schema.resources)
    .where(
      and(
        eq(schema.resources.status, "PUBLISHED"),
        isNull(schema.resources.deletedAt),
      ),
    )
    .orderBy(schema.resources.sortOrder);

  if (resources.length === 0) return [];

  const allTranslations = await db.select().from(schema.resourcesTranslations);

  return resources.map((resource) => ({
    ...resource,
    translations: allTranslations.filter(
      (t) => t.resourceId === resource.resourceId,
    ),
  }));
}

/**
 * Get all resources (including drafts) for admin
 */
export async function findAllResources(): Promise<
  (Resource & { translations: ResourceTranslation[] })[]
> {
  const resources = await db
    .select()
    .from(schema.resources)
    .where(isNull(schema.resources.deletedAt))
    .orderBy(schema.resources.sortOrder);

  if (resources.length === 0) return [];

  const allTranslations = await db.select().from(schema.resourcesTranslations);

  return resources.map((resource) => ({
    ...resource,
    translations: allTranslations.filter(
      (t) => t.resourceId === resource.resourceId,
    ),
  }));
}

/**
 * Update resource
 */
export async function updateResource(
  resourceId: string,
  data: Partial<Resource>,
): Promise<Resource | null> {
  const [updated] = await db
    .update(schema.resources)
    .set(data)
    .where(eq(schema.resources.resourceId, resourceId))
    .returning();

  return updated || null;
}

/**
 * Update resource translation
 */
export async function updateResourceTranslation(
  resourceId: string,
  language: string,
  data: Partial<ResourceTranslation>,
): Promise<ResourceTranslation | null> {
  const [updated] = await db
    .update(schema.resourcesTranslations)
    .set(data as any)
    .where(
      and(
        eq(schema.resourcesTranslations.resourceId, resourceId),
        eq(
          schema.resourcesTranslations.language,
          language as "es" | "en" | "pt",
        ),
      ),
    )
    .returning();

  return updated || null;
}

/**
 * Soft delete resource
 */
export async function deleteResource(resourceId: string): Promise<void> {
  await db
    .update(schema.resources)
    .set({ deletedAt: new Date() })
    .where(eq(schema.resources.resourceId, resourceId));
}

// ===================
// SPONSORS REPOSITORY
// ===================

/**
 * Get all sponsors (active, ordered by sortOrder)
 */
export async function findAllSponsors(): Promise<Sponsor[]> {
  const sponsors = await db
    .select()
    .from(schema.sponsors)
    .where(isNull(schema.sponsors.deletedAt))
    .orderBy(asc(schema.sponsors.sortOrder), asc(schema.sponsors.name));

  return sponsors as Sponsor[];
}

/**
 * Get sponsor by ID
 */
export async function findSponsorById(
  sponsorId: string,
): Promise<Sponsor | null> {
  const [sponsor] = await db
    .select()
    .from(schema.sponsors)
    .where(
      and(
        eq(schema.sponsors.sponsorId, sponsorId),
        isNull(schema.sponsors.deletedAt),
      ),
    )
    .limit(1);

  return (sponsor as Sponsor) || null;
}

/**
 * Create sponsor
 */
export async function createSponsor(data: {
  name: string;
  websiteUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  sortOrder?: number;
}): Promise<Sponsor> {
  const [sponsor] = await db
    .insert(schema.sponsors)
    .values({
      name: data.name,
      websiteUrl: data.websiteUrl || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();

  return sponsor as Sponsor;
}

/**
 * Update sponsor
 */
export async function updateSponsor(
  sponsorId: string,
  data: Partial<{
    name: string;
    websiteUrl: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    sortOrder: number;
  }>,
): Promise<Sponsor | null> {
  const [updated] = await db
    .update(schema.sponsors)
    .set(data)
    .where(
      and(
        eq(schema.sponsors.sponsorId, sponsorId),
        isNull(schema.sponsors.deletedAt),
      ),
    )
    .returning();

  return (updated as Sponsor) || null;
}

/**
 * Soft delete sponsor
 */
export async function deleteSponsor(sponsorId: string): Promise<void> {
  await db
    .update(schema.sponsors)
    .set({ deletedAt: new Date() })
    .where(eq(schema.sponsors.sponsorId, sponsorId));
}

// ===================
// UI FRAGMENTS REPOSITORY
// ===================

/**
 * Get fragment by key and language
 */
export async function findFragmentByKey(
  fragmentKey: string,
  language: string = "es",
): Promise<UIFragment | null> {
  const [fragment] = await db
    .select()
    .from(schema.uiFragments)
    .where(
      and(
        eq(schema.uiFragments.fragmentKey, fragmentKey),
        eq(schema.uiFragments.language, language as "es" | "en" | "pt"),
      ),
    )
    .limit(1);

  return (fragment as UIFragment) || null;
}

/**
 * Get all fragments for a specific section
 */
export async function findFragmentsBySection(
  section: string,
  language: string = "es",
): Promise<UIFragment[]> {
  const fragments = await db
    .select()
    .from(schema.uiFragments)
    .where(
      and(
        eq(schema.uiFragments.section, section as any),
        eq(schema.uiFragments.language, language as "es" | "en" | "pt"),
      ),
    );

  return fragments as UIFragment[];
}

/**
 * Get all fragments (for admin view)
 */
export async function findAllFragments(
  language?: string,
): Promise<UIFragment[]> {
  const query = db.select().from(schema.uiFragments);

  if (language) {
    query.where(
      eq(schema.uiFragments.language, language as "es" | "en" | "pt"),
    );
  }

  const fragments = await query;
  return fragments as UIFragment[];
}

/**
 * Create or update UI fragment (upsert)
 */
export async function upsertFragment(
  data: {
    fragmentKey: string;
    language?: string;
    description?: string;
    type: string;
    section: string;
    content: Record<string, any>;
  },
  updatedBy: string,
): Promise<UIFragment> {
  const language = data.language || "es";

  const [fragment] = await db
    .insert(schema.uiFragments)
    .values({
      fragmentKey: data.fragmentKey,
      language: language as "es" | "en" | "pt",
      description: data.description || null,
      type: data.type as any,
      section: data.section as any,
      content: data.content,
      lastUpdatedAt: new Date(),
      updatedBy: updatedBy,
    })
    .onConflictDoUpdate({
      target: [schema.uiFragments.fragmentKey, schema.uiFragments.language],
      set: {
        description: data.description || null,
        content: data.content,
        lastUpdatedAt: new Date(),
        updatedBy: updatedBy,
      },
    })
    .returning();

  return fragment as UIFragment;
}

/**
 * Update fragment content (hot-swap)
 */
export async function updateFragmentContent(
  fragmentKey: string,
  language: string,
  content: Record<string, any>,
  updatedBy: string,
): Promise<UIFragment | null> {
  const [updated] = await db
    .update(schema.uiFragments)
    .set({
      content,
      lastUpdatedAt: new Date(),
      updatedBy,
    })
    .where(
      and(
        eq(schema.uiFragments.fragmentKey, fragmentKey),
        eq(schema.uiFragments.language, language as "es" | "en" | "pt"),
      ),
    )
    .returning();

  return (updated as UIFragment) || null;
}
