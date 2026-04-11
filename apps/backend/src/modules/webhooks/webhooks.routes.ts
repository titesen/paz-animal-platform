import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./webhooks.controller";
import { webhookIdSchema, webhookQuerySchema } from "./webhooks.dto";

const router = Router();

/**
 * @route   POST /api/webhooks/incoming/:source
 * @desc    Receive an incoming webhook from an external service
 * @access  Public (external services call this)
 */
router.post("/incoming/:source", controller.receiveWebhook);

/**
 * @route   GET /api/webhooks
 * @desc    Get all webhooks with optional filters
 * @access  Protected (ADMIN)
 */
router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(webhookQuerySchema, "query"),
  controller.getWebhooks,
);

/**
 * @route   GET /api/webhooks/:webhookId
 * @desc    Get webhook by ID
 * @access  Protected (ADMIN)
 */
router.get(
  "/:webhookId",
  authenticate,
  requireRole("ADMIN"),
  validate(webhookIdSchema, "params"),
  controller.getWebhookById,
);

/**
 * @route   PATCH /api/webhooks/:webhookId/process
 * @desc    Mark webhook as processed
 * @access  Protected (ADMIN)
 */
router.patch(
  "/:webhookId/process",
  authenticate,
  requireRole("ADMIN"),
  validate(webhookIdSchema, "params"),
  controller.markProcessed,
);

export default router;
