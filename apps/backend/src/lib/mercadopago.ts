/**
 * @file Mercado Pago Integration Service
 * @description Wrapper for Mercado Pago API interactions
 */

import crypto from "node:crypto";

import { env } from "../config/env";
import type {
  MercadoPagoPaymentData,
  MercadoPagoPreferenceResponse,
} from "../modules/finance/finance.types";

const MP_BASE_URL = "https://api.mercadopago.com";

/**
 * Create a payment preference in Mercado Pago
 */
export async function createPaymentPreference(data: {
  title: string;
  description: string;
  amount: number;
  currency: string;
  externalReference: string;
  payerEmail?: string;
}): Promise<MercadoPagoPreferenceResponse> {
  const response = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: data.title,
          description: data.description,
          quantity: 1,
          currency_id: data.currency,
          unit_price: data.amount,
        },
      ],
      external_reference: data.externalReference,
      payer: data.payerEmail ? { email: data.payerEmail } : undefined,
      back_urls: {
        success: `${env.FRONTEND_URL}/donations/success`,
        failure: `${env.FRONTEND_URL}/donations/failure`,
        pending: `${env.FRONTEND_URL}/donations/pending`,
      },
      auto_return: "approved",
      notification_url: `${env.BACKEND_URL}/api/finance/webhooks/mercadopago`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago API Error: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as MercadoPagoPreferenceResponse;
}

/**
 * Get payment details from Mercado Pago
 */
export async function getPaymentData(paymentId: string): Promise<MercadoPagoPaymentData> {
  const response = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago API Error: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as MercadoPagoPaymentData;
}

/**
 * Validate Mercado Pago webhook signature using HMAC-SHA256.
 * @see https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
 *
 * The x-signature header format: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * The manifest is signed with the webhook secret key using HMAC-SHA256.
 *
 * @param dataId - The `data.id` from the webhook payload
 * @param xRequestId - The `x-request-id` header value
 * @param xSignature - The `x-signature` header value (contains ts=...,v1=...)
 * @returns true if signature is valid, false otherwise
 */
export function validateWebhookSignature(
  dataId: string,
  xRequestId: string,
  xSignature: string,
): boolean {
  if (!env.MP_WEBHOOK_SECRET) {
    return false;
  }

  // Parse x-signature header: "ts=<timestamp>,v1=<hash>"
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

  // Build the manifest string per MP docs
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Compute HMAC-SHA256
  const expectedHash = crypto
    .createHmac("sha256", env.MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(receivedHash, "hex"), Buffer.from(expectedHash, "hex"));
}
