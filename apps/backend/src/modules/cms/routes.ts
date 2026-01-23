/**
 * @file CMS Routes
 * @description API routes for content management
 */

import { Router } from "express";
import { authenticate, requireVolunteerTag } from "../../middlewares/auth";
import * as cmsController from "./controller";

const router = Router();

// ===================
// NEWS ROUTES
// ===================

// Public routes
router.get("/news", cmsController.getAllPublishedNews);
router.get("/news/slug/:slug", cmsController.getNewsBySlug);
router.get("/news/:newsId", cmsController.getNewsById);

// Protected routes - Content managers can view all (including drafts)
router.get(
  "/news/all",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.getAllNews,
);

// Protected routes - Content managers can create/update/delete
router.post(
  "/news",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.createNews,
);

router.put(
  "/news/:newsId",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.updateNews,
);

router.put(
  "/news/:newsId/translations/:language",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.updateNewsTranslation,
);

router.delete(
  "/news/:newsId",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.deleteNews,
);

// ===================
// RESOURCES ROUTES
// ===================

// Public routes
router.get("/resources", cmsController.getAllPublishedResources);
router.get("/resources/:resourceId", cmsController.getResourceById);

// Protected routes - Content managers can view all (including drafts)
router.get(
  "/resources/all",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.getAllResources,
);

// Protected routes - Content managers can create/update/delete
router.post(
  "/resources",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.createResource,
);

router.put(
  "/resources/:resourceId",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.updateResource,
);

router.put(
  "/resources/:resourceId/translations/:language",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.updateResourceTranslation,
);

router.delete(
  "/resources/:resourceId",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.deleteResource,
);

// ===================
// SPONSORS ROUTES
// ===================

// Public routes
router.get("/sponsors", cmsController.getAllSponsors);
router.get("/sponsors/:sponsorId", cmsController.getSponsorById);

// Protected routes - Content managers can create/update/delete
router.post(
  "/sponsors",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.createSponsor,
);

router.put(
  "/sponsors/:sponsorId",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.updateSponsor,
);

router.delete(
  "/sponsors/:sponsorId",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.deleteSponsor,
);

// ===================
// UI FRAGMENTS ROUTES
// ===================

// Public routes - Frontend can fetch UI content
router.get("/fragments/:fragmentKey", cmsController.getFragmentByKey);
router.get("/fragments/section/:section", cmsController.getFragmentsBySection);

// Protected routes - Content managers can view all
router.get(
  "/fragments",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.getAllFragments,
);

// Protected routes - Content managers can update (hot-swap UI)
router.put(
  "/fragments/:fragmentKey",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.upsertFragment,
);

router.patch(
  "/fragments/:fragmentKey/content",
  authenticate,
  requireVolunteerTag("CONTENT_MANAGER"),
  cmsController.updateFragmentContent,
);

export default router;
