/**
 * @file Mercado Pago Integration Client
 * @description Client for Mercado Pago payment gateway
 */

import crypto from "node:crypto";

import { env } from "../../config/env";
import { logger } from "../../config/logger";
import type { MercadoPagoPreference } from "../../common/types";
import { ServiceUnavailableError } from "../../common/types/errors";

/**
 * Create a payment preference in Mercado Pago
 * @param data - Preference data
 * @returns Preference with init_point URL
 */
export async function createPaymentPreference(data: {
  title: string;
  amount: number;
  currencyId: string;
  externalReference: string;
}): Promise<MercadoPagoPreference> {
  // TODO: Implement actual Mercado Pago SDK integration
  // For now, return a placeholder

  logger.info({ data }, "Creating Mercado Pago payment preference");

  throw new ServiceUnavailableError(
    "Mercado Pago integration not yet implemented",
    "MP_NOT_IMPLEMENTED",
  );

  // Example implementation:
  // const mercadopago = require('mercadopago');
  // mercadopago.configure({ access_token: env.MP_ACCESS_TOKEN });
  //
  // const preference = await mercadopago.preferences.create({
  //   items: [{ title: data.title, unit_price: data.amount, quantity: 1 }],
  //   external_reference: data.externalReference,
  //   notification_url: `${env.API_URL}/webhooks/mercadopago`,
  // });
  //
  // return {
  //   id: preference.body.id,
  //   init_point: preference.body.init_point,
  //   sandbox_init_point: preference.body.sandbox_init_point,
  // };
}

/**
 * Verify Mercado Pago webhook signature
 * @param payload - Webhook payload
 * @param signature - X-Signature header value
 * @returns True if valid signature
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * TODO: MUST IMPLEMENT BEFORE PRODUCTION
 * This stub always returns true which allows fake payment notifications!
 * Implement proper HMAC-SHA256 signature verification using MP secret.
 * See: https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
 */
/**
 * Verify Mercado Pago webhook signature using HMAC-SHA256.
 * @see https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
 */
export function verifyWebhookSignature(
  dataId: string,
  xRequestId: string,
  xSignature: string,
): boolean {
  if (!env.MP_WEBHOOK_SECRET) {
    logger.warn("MP_WEBHOOK_SECRET not configured — rejecting webhook");
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );

  const ts = parts["ts"];
  const receivedHash = parts["v1"];

  if (!ts || !receivedHash) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expectedHash = crypto
    .createHmac("sha256", env.MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(receivedHash, "hex"), Buffer.from(expectedHash, "hex"));
}
