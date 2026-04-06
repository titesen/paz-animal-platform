/**
 * @file Finance Controller
 * @description HTTP handlers for donations, transactions, and webhooks
 */

import type { Request, Response } from "express";
import { logger } from "../../config/logger";
import type { AuthenticatedRequest } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as mercadopago from "../../lib/mercadopago";
import * as service from "./finance.service";
import type { CreateInKindDonationDTO, CreateMonetaryDonationDTO } from "./finance.dto";
import type { MercadoPagoWebhookPayload } from "./finance.types";

// ===================
// MONETARY DONATIONS
// ===================

/**
 * Create a monetary donation
 * POST /api/finance/donations
 * Public endpoint (can be authenticated or anonymous)
 */
export const createDonation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const data: CreateMonetaryDonationDTO = req.body;

  const result = await service.createMonetaryDonation(userId, data);

  res.status(201).json({
    status: "success",
    data: {
      donation: result.donation,
      paymentUrl: result.paymentUrl,
    },
  });
});

/**
 * Get user's donation history
 * GET /api/finance/donations/my-donations
 * Requires: Authenticated user
 */
export const getMyDonations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const donations = await service.getUserDonations(userId);

  res.json({
    status: "success",
    data: { donations },
  });
});

/**
 * Get all confirmed donations (public view)
 * GET /api/finance/donations/public
 * Public endpoint
 */
export const getAllDonations = asyncHandler(async (_req: Request, res: Response) => {
  const donations = await service.getAllConfirmedDonations();

  res.json({
    status: "success",
    data: { donations },
  });
});

// ===================
// IN-KIND DONATIONS
// ===================

/**
 * Register an in-kind donation
 * POST /api/finance/in-kind-donations
 * Requires: ADMIN or VOLUNTEER role
 */
export const createInKindDonation = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const receivedById = req.user!.userId;
    const data: CreateInKindDonationDTO = req.body;

    await service.createInKindDonation(receivedById, data);

    res.status(201).json({
      status: "success",
      message: "In-kind donation registered successfully",
    });
  },
);

/**
 * Get all in-kind donations
 * GET /api/finance/in-kind-donations
 * Requires: ADMIN role
 */
export const getAllInKindDonations = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const donations = await service.getAllInKindDonations();

    res.json({
      status: "success",
      data: { donations },
    });
  },
);

// ===================
// FINANCIAL REPORTS
// ===================

/**
 * Get financial summary
 * GET /api/finance/summary
 * Requires: ADMIN role
 */
export const getFinancialSummary = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const summary = await service.getFinancialSummary();

    res.json({
      status: "success",
      data: { summary },
    });
  },
);

// ===================
// WEBHOOKS
// ===================

/**
 * Mercado Pago webhook handler
 * POST /api/finance/webhooks/mercadopago
 * Public endpoint (validated by signature)
 */
export const handleMercadoPagoWebhook = asyncHandler(async (req: Request, res: Response) => {
  const payload: MercadoPagoWebhookPayload = req.body;
  const xSignature = req.headers["x-signature"] as string;
  const xRequestId = req.headers["x-request-id"] as string;

  logger.info(
    {
      type: payload.type,
      action: payload.action,
      dataId: payload.data?.id,
    },
    "Received Mercado Pago webhook",
  );

  // Validate webhook signature
  if (!xSignature || !xRequestId) {
    logger.warn("Webhook received without signature headers");
    res.status(400).json({ status: "error", message: "Missing signature headers" });
    return;
  }

  const isValid = mercadopago.validateWebhookSignature(payload.data?.id, xRequestId, xSignature);

  if (!isValid) {
    logger.warn("Webhook signature validation failed");
    res.status(403).json({ status: "error", message: "Invalid webhook signature" });
    return;
  }

  // Process the webhook
  await service.processMercadoPagoWebhook(payload);

  // Always respond 200 OK to Mercado Pago
  res.status(200).json({
    status: "success",
    message: "Webhook received",
  });
});
