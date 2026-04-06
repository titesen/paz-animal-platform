/**
 * @file CMS Controller
 * @description HTTP handlers for content management (news, resources, sponsors, UI fragments)
 */

import type { Response } from "express";
import type { AuthenticatedRequest } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as service from "./service";
import type {
  CreateNewsDTO,
  CreateResourceDTO,
  CreateSponsorDTO,
  CreateUIFragmentDTO,
  UISection,
  UpdateNewsDTO,
  UpdateNewsTranslationDTO,
  UpdateResourceDTO,
  UpdateResourceTranslationDTO,
  UpdateSponsorDTO,
} from "./types";

// ===================
// NEWS HANDLERS
// ===================

/**
 * GET /api/cms/news
 * Get all published news (public)
 */
export const getAllPublishedNews = asyncHandler(async (_req, res: Response) => {
  const news = await service.getAllPublishedNews();
  res.json({
    status: "success",
    data: { news },
  });
});

/**
 * GET /api/cms/news/all
 * Get all news including drafts (admin/content managers)
 */
export const getAllNews = asyncHandler(async (_req, res: Response) => {
  const news = await service.getAllNews();
  res.json({
    status: "success",
    data: { news },
  });
});

/**
 * GET /api/cms/news/:newsId
 * Get news by ID
 */
export const getNewsById = asyncHandler(async (req, res: Response) => {
  const { newsId } = req.params;
  const news = await service.getNewsById(newsId);
  res.json({
    status: "success",
    data: { news },
  });
});

/**
 * GET /api/cms/news/slug/:slug
 * Get news by slug
 */
export const getNewsBySlug = asyncHandler(async (req, res: Response) => {
  const { slug } = req.params;
  const { lang = "es" } = req.query;
  const news = await service.getNewsBySlug(slug, lang as string);
  res.json({
    status: "success",
    data: { news },
  });
});

/**
 * POST /api/cms/news
 * Create news article
 */
export const createNews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const authorId = req.user.userId;
  const data = req.body as CreateNewsDTO;
  const news = await service.createNews(authorId, data);
  res.status(201).json({
    status: "success",
    data: { news },
  });
});

/**
 * PUT /api/cms/news/:newsId
 * Update news article
 */
export const updateNews = asyncHandler(async (req, res: Response) => {
  const { newsId } = req.params;
  const data = req.body as UpdateNewsDTO;
  const news = await service.updateNews(newsId, data);
  res.json({
    status: "success",
    data: { news },
  });
});

/**
 * PUT /api/cms/news/:newsId/translations/:language
 * Update news translation
 */
export const updateNewsTranslation = asyncHandler(async (req, res: Response) => {
  const { newsId, language } = req.params;
  const data = req.body as UpdateNewsTranslationDTO;
  await service.updateNewsTranslation(newsId, language, data);
  res.json({
    status: "success",
    message: "Translation updated successfully",
  });
});

/**
 * DELETE /api/cms/news/:newsId
 * Delete news article
 */
export const deleteNews = asyncHandler(async (req, res: Response) => {
  const { newsId } = req.params;
  await service.deleteNews(newsId);
  res.json({
    status: "success",
    message: "News article deleted successfully",
  });
});

// ===================
// RESOURCES HANDLERS
// ===================

/**
 * GET /api/cms/resources
 * Get all published resources (public)
 */
export const getAllPublishedResources = asyncHandler(async (_req, res: Response) => {
  const resources = await service.getAllPublishedResources();
  res.json({
    status: "success",
    data: { resources },
  });
});

/**
 * GET /api/cms/resources/all
 * Get all resources including drafts (admin/content managers)
 */
export const getAllResources = asyncHandler(async (_req, res: Response) => {
  const resources = await service.getAllResources();
  res.json({
    status: "success",
    data: { resources },
  });
});

/**
 * GET /api/cms/resources/:resourceId
 * Get resource by ID
 */
export const getResourceById = asyncHandler(async (req, res: Response) => {
  const { resourceId } = req.params;
  const resource = await service.getResourceById(resourceId);
  res.json({
    status: "success",
    data: { resource },
  });
});

/**
 * POST /api/cms/resources
 * Create resource
 */
export const createResource = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const authorId = req.user.userId;
  const data = req.body as CreateResourceDTO;
  const resource = await service.createResource(authorId, data);
  res.status(201).json({
    status: "success",
    data: { resource },
  });
});

/**
 * PUT /api/cms/resources/:resourceId
 * Update resource
 */
export const updateResource = asyncHandler(async (req, res: Response) => {
  const { resourceId } = req.params;
  const data = req.body as UpdateResourceDTO;
  const resource = await service.updateResource(resourceId, data);
  res.json({
    status: "success",
    data: { resource },
  });
});

/**
 * PUT /api/cms/resources/:resourceId/translations/:language
 * Update resource translation
 */
export const updateResourceTranslation = asyncHandler(async (req, res: Response) => {
  const { resourceId, language } = req.params;
  const data = req.body as UpdateResourceTranslationDTO;
  await service.updateResourceTranslation(resourceId, language, data);
  res.json({
    status: "success",
    message: "Translation updated successfully",
  });
});

/**
 * DELETE /api/cms/resources/:resourceId
 * Delete resource
 */
export const deleteResource = asyncHandler(async (req, res: Response) => {
  const { resourceId } = req.params;
  await service.deleteResource(resourceId);
  res.json({
    status: "success",
    message: "Resource deleted successfully",
  });
});

// ===================
// SPONSORS HANDLERS
// ===================

/**
 * GET /api/cms/sponsors
 * Get all sponsors (public)
 */
export const getAllSponsors = asyncHandler(async (_req, res: Response) => {
  const sponsors = await service.getAllSponsors();
  res.json({
    status: "success",
    data: { sponsors },
  });
});

/**
 * GET /api/cms/sponsors/:sponsorId
 * Get sponsor by ID
 */
export const getSponsorById = asyncHandler(async (req, res: Response) => {
  const { sponsorId } = req.params;
  const sponsor = await service.getSponsorById(sponsorId);
  res.json({
    status: "success",
    data: { sponsor },
  });
});

/**
 * POST /api/cms/sponsors
 * Create sponsor
 */
export const createSponsor = asyncHandler(async (req, res: Response) => {
  const data = req.body as CreateSponsorDTO;
  const sponsor = await service.createSponsor(data);
  res.status(201).json({
    status: "success",
    data: { sponsor },
  });
});

/**
 * PUT /api/cms/sponsors/:sponsorId
 * Update sponsor
 */
export const updateSponsor = asyncHandler(async (req, res: Response) => {
  const { sponsorId } = req.params;
  const data = req.body as UpdateSponsorDTO;
  const sponsor = await service.updateSponsor(sponsorId, data);
  res.json({
    status: "success",
    data: { sponsor },
  });
});

/**
 * DELETE /api/cms/sponsors/:sponsorId
 * Delete sponsor
 */
export const deleteSponsor = asyncHandler(async (req, res: Response) => {
  const { sponsorId } = req.params;
  await service.deleteSponsor(sponsorId);
  res.json({
    status: "success",
    message: "Sponsor deleted successfully",
  });
});

// ===================
// UI FRAGMENTS HANDLERS
// ===================

/**
 * GET /api/cms/fragments/:fragmentKey
 * Get fragment by key
 */
export const getFragmentByKey = asyncHandler(async (req, res: Response) => {
  const { fragmentKey } = req.params;
  const { lang = "es" } = req.query;
  const fragment = await service.getFragmentByKey(fragmentKey, lang as string);
  res.json({
    status: "success",
    data: { fragment },
  });
});

/**
 * GET /api/cms/fragments/section/:section
 * Get fragments by section
 */
export const getFragmentsBySection = asyncHandler(async (req, res: Response) => {
  const { section } = req.params;
  const { lang = "es" } = req.query;
  const fragments = await service.getFragmentsBySection(section as UISection, lang as string);
  res.json({
    status: "success",
    data: { fragments },
  });
});

/**
 * GET /api/cms/fragments
 * Get all fragments (admin view)
 */
export const getAllFragments = asyncHandler(async (req, res: Response) => {
  const { lang } = req.query;
  const fragments = await service.getAllFragments(lang as string | undefined);
  res.json({
    status: "success",
    data: { fragments },
  });
});

/**
 * PUT /api/cms/fragments/:fragmentKey
 * Create or update fragment
 */
export const upsertFragment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const data = req.body as CreateUIFragmentDTO;
  const fragment = await service.upsertFragment(data, userId);
  res.json({
    status: "success",
    data: { fragment },
  });
});

/**
 * PATCH /api/cms/fragments/:fragmentKey/content
 * Update fragment content only (hot-swap)
 */
export const updateFragmentContent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.userId;
    const { fragmentKey } = req.params;
    const { lang = "es", content } = req.body;
    const fragment = await service.updateFragmentContent(fragmentKey, lang, content, userId);
    res.json({
      status: "success",
      data: { fragment },
    });
  },
);
