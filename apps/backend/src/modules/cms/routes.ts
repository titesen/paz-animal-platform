/** @file CMS Routes - Placeholder */
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth";
import * as cmsController from "./controller";

const router = Router();
router.post(
  "/news",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  cmsController.createNews,
);

export default router;
