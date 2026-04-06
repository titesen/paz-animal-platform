/**
 * @file Mercado Pago Integration Service
 * @description Wrapper for Mercado Pago API interactions
 */

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
 * Validate webhook signature (if configured)
 * Note: Mercado Pago uses x-signature header for webhook validation
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * TODO: MUST IMPLEMENT BEFORE PRODUCTION
 * This is a placeholder that doesn't perform real cryptographic validation.
 * Implement HMAC-SHA256 verification using Mercado Pago webhook secret.
 */
export function validateWebhookSignature(_payload: string, signature: string): boolean {
  // For now, return true if signature exists
  // ⚠️ In production, implement proper HMAC validation to prevent fake payment notifications
  return !!signature;
}
