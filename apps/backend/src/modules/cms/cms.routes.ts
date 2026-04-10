/**
 * @file CMS Routes
 * @description API routes for content management
 */

import { Router } from "express";
import { authenticate, requireVolunteerRole } from "../../common/middlewares/auth";
import { validate } from "../../common/middlewares/validate";
import * as cmsController from "./cms.controller";
import {
  createNewsSchema,
  createResourceSchema,
  createSponsorSchema,
  createUIFragmentSchema,
  newsIdParamSchema,
  resourceIdSchema,
  sponsorIdSchema,
  updateNewsSchema,
  updateNewsTranslationSchema,
  updateResourceSchema,
  updateResourceTranslationSchema,
  updateSponsorSchema,
  updateUIFragmentSchema,
} from "./cms.dto";

const router = Router();

// ===================
// NEWS ROUTES
// ===================

// Public routes
router.get("/news", cmsController.getAllPublishedNews);
router.get("/news/slug/:slug", cmsController.getNewsBySlug);
router.get("/news/:newsId", validate(newsIdParamSchema, "params"), cmsController.getNewsById);

// Protected routes - Content managers can view all (including drafts)
router.get(
  "/news/all",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  cmsController.getAllNews,
);

// Protected routes - Content managers can create/update/delete
router.post(
  "/news",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(createNewsSchema),
  cmsController.createNews,
);

router.put(
  "/news/:newsId",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(newsIdParamSchema, "params"),
  validate(updateNewsSchema),
  cmsController.updateNews,
);

router.put(
  "/news/:newsId/translations/:language",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(updateNewsTranslationSchema),
  cmsController.updateNewsTranslation,
);

router.delete(
  "/news/:newsId",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  cmsController.deleteNews,
);

// ===================
// RESOURCES ROUTES
// ===================

// Public routes
router.get("/resources", cmsController.getAllPublishedResources);
router.get(
  "/resources/:resourceId",
  validate(resourceIdSchema, "params"),
  cmsController.getResourceById,
);

// Protected routes - Content managers can view all (including drafts)
router.get(
  "/resources/all",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  cmsController.getAllResources,
);

// Protected routes - Content managers can create/update/delete
router.post(
  "/resources",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(createResourceSchema),
  cmsController.createResource,
);

router.put(
  "/resources/:resourceId",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(resourceIdSchema, "params"),
  validate(updateResourceSchema),
  cmsController.updateResource,
);

router.put(
  "/resources/:resourceId/translations/:language",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(updateResourceTranslationSchema),
  cmsController.updateResourceTranslation,
);

router.delete(
  "/resources/:resourceId",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  cmsController.deleteResource,
);

// ===================
// SPONSORS ROUTES
// ===================

// Public routes
router.get("/sponsors", cmsController.getAllSponsors);
router.get(
  "/sponsors/:sponsorId",
  validate(sponsorIdSchema, "params"),
  cmsController.getSponsorById,
);

// Protected routes - Content managers can create/update/delete
router.post(
  "/sponsors",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(createSponsorSchema),
  cmsController.createSponsor,
);

router.put(
  "/sponsors/:sponsorId",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(sponsorIdSchema, "params"),
  validate(updateSponsorSchema),
  cmsController.updateSponsor,
);

router.delete(
  "/sponsors/:sponsorId",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
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
  requireVolunteerRole("CONTENT_MANAGER"),
  cmsController.getAllFragments,
);

// Protected routes - Content managers can update (hot-swap UI)
router.put(
  "/fragments/:fragmentKey",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(createUIFragmentSchema),
  cmsController.upsertFragment,
);

router.patch(
  "/fragments/:fragmentKey/content",
  authenticate,
  requireVolunteerRole("CONTENT_MANAGER"),
  validate(updateUIFragmentSchema),
  cmsController.updateFragmentContent,
);

export default router;
