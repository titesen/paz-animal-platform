/**
 * @file Finance Routes
 * @description Route definitions for donations, transactions, and webhooks
 */

import { Router } from "express";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./finance.controller";

const router = Router();

// ===================
// PUBLIC ROUTES
// ===================

/**
 * Get all confirmed donations (public view)
 * GET /api/finance/donations/public
 */
router.get("/donations/public", controller.getAllDonations);

/**
 * Mercado Pago webhook
 * POST /api/finance/webhooks/mercadopago
 * Public endpoint (validated by signature)
 */
router.post("/webhooks/mercadopago", controller.handleMercadoPagoWebhook);

// ===================
// AUTHENTICATED ROUTES (optional auth - can be anonymous)
// ===================

/**
 * Create monetary donation
 * POST /api/finance/donations
 * Can be authenticated or anonymous
 */
router.post("/donations", controller.createDonation);

// ===================
// AUTHENTICATED ROUTES (required auth)
// ===================

/**
 * Get my donations
 * GET /api/finance/donations/my-donations
 */
router.get("/donations/my-donations", authenticate, controller.getMyDonations);

// ===================
// ADMIN/VOLUNTEER ROUTES
// ===================

/**
 * Register in-kind donation
 * POST /api/finance/in-kind-donations
 * Requires: ADMIN or VOLUNTEER role
 */
router.post(
  "/in-kind-donations",
  authenticate,
  requireRole("ADMIN", "VOLUNTEER"),
  controller.createInKindDonation,
);

/**
 * Get all in-kind donations
 * GET /api/finance/in-kind-donations
 * Requires: ADMIN role
 */
router.get(
  "/in-kind-donations",
  authenticate,
  requireRole("ADMIN"),
  controller.getAllInKindDonations,
);

// ===================
// ADMIN ONLY ROUTES
// ===================

/**
 * Get financial summary
 * GET /api/finance/summary
 * Requires: ADMIN role
 */
router.get("/summary", authenticate, requireRole("ADMIN"), controller.getFinancialSummary);

export default router;
