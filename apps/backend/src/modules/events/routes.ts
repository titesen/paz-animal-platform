/** @file Events Routes - Placeholder */
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth";
import * as eventsController from "./controller";

const router = Router();
router.post(
  "/",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  eventsController.createEvent,
);

export default router;
