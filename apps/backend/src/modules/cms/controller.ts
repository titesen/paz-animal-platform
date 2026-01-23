/**
 * @file CMS Controller
 * @description HTTP handlers for content management (news, resources)
 */

import type { Response } from "express";
import type { AuthRequest } from "../../types/auth";
import { asyncHandler } from "../../utils";
import * as service from "./service";
import type {
  CreateNewsDTO,
  CreateResourceDTO,
  UpdateNewsDTO,
  UpdateNewsTranslationDTO,
  UpdateResourceDTO,
  UpdateResourceTranslationDTO,
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
export const createNews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authorId = req.userId!;
    const data = req.body as CreateNewsDTO;
    const news = await service.createNews(authorId, data);
    res.status(201).json({
      status: "success",
      data: { news },
    });
  },
);

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
export const updateNewsTranslation = asyncHandler(
  async (req, res: Response) => {
    const { newsId, language } = req.params;
    const data = req.body as UpdateNewsTranslationDTO;
    await service.updateNewsTranslation(newsId, language, data);
    res.json({
      status: "success",
      message: "Translation updated successfully",
    });
  },
);

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
export const getAllPublishedResources = asyncHandler(
  async (_req, res: Response) => {
    const resources = await service.getAllPublishedResources();
    res.json({
      status: "success",
      data: { resources },
    });
  },
);

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
export const createResource = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authorId = req.userId!;
    const data = req.body as CreateResourceDTO;
    const resource = await service.createResource(authorId, data);
    res.status(201).json({
      status: "success",
      data: { resource },
    });
  },
);

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
export const updateResourceTranslation = asyncHandler(
  async (req, res: Response) => {
    const { resourceId, language } = req.params;
    const data = req.body as UpdateResourceTranslationDTO;
    await service.updateResourceTranslation(resourceId, language, data);
    res.json({
      status: "success",
      message: "Translation updated successfully",
    });
  },
);

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
