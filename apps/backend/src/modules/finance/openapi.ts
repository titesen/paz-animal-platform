/**
 * @file Finance OpenAPI Registration
 * @description Registers finance/donation endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";

// --- Zod schemas for Finance ---

const transactionStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
  "PROCESSING",
]);

const donationSchema = z
  .object({
    donationId: z.string().uuid(),
    userId: z.string().uuid().nullable(),
    targetAmount: z.string(),
    currency: z.string(),
    isAnonymous: z.boolean().nullable(),
    isConfirmed: z.boolean().nullable(),
    createdAt: z.string().datetime(),
    transaction: z
      .object({
        transactionId: z.string().uuid(),
        status: transactionStatusSchema,
        provider: z.string(),
        externalTransactionId: z.string().nullable(),
      })
      .optional(),
  })
  .openapi("MonetaryDonation");

const inKindDonationSchema = z
  .object({
    donationId: z.string().uuid(),
    userId: z.string().uuid().nullable(),
    manualDonorName: z.string().nullable(),
    manualDonorContact: z.string().nullable(),
    description: z.string(),
    estimatedValue: z.string().nullable(),
    receivedById: z.string().uuid(),
    receivedAt: z.string().datetime(),
  })
  .openapi("InKindDonation");

const financialSummarySchema = z
  .object({
    totalDonations: z.number(),
    totalAmount: z.string(),
    pendingAmount: z.string(),
    approvedAmount: z.string(),
    currency: z.string(),
  })
  .openapi("FinancialSummary");

const createMonetaryDonationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("ARS").optional(),
  isAnonymous: z.boolean().optional(),
  thankYouMessage: z.string().max(500).optional(),
});

const createInKindDonationSchema = z.object({
  description: z.string().min(1),
  estimatedValue: z.number().positive().optional(),
  manualDonorName: z.string().optional(),
  manualDonorContact: z.string().optional(),
});

// === Public routes ===

registry.registerPath({
  method: "get",
  path: "/api/finance/donations/public",
  tags: ["Donations"],
  summary: "Obtener donaciones confirmadas (vista pública)",
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ donations: z.array(donationSchema) })),
      "Lista de donaciones públicas",
    ),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/finance/webhooks/mercadopago",
  tags: ["Donations"],
  summary: "Webhook de Mercado Pago",
  description: "Endpoint público validado por firma del proveedor",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            type: z.string(),
            action: z.string(),
            data: z.object({ id: z.string() }),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "Webhook procesado" },
  },
});

// === Authenticated (optional auth) ===

registry.registerPath({
  method: "post",
  path: "/api/finance/donations",
  tags: ["Donations"],
  summary: "Crear donación monetaria",
  description: "Puede ser autenticado o anónimo",
  request: {
    body: {
      content: {
        "application/json": { schema: createMonetaryDonationSchema },
      },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(
        z.object({
          donation: donationSchema,
          paymentUrl: z.string().url().optional(),
        }),
      ),
      "Donación creada",
    ),
    400: errorResponses[400],
  },
});

// === Authenticated (required) ===

registry.registerPath({
  method: "get",
  path: "/api/finance/donations/my-donations",
  tags: ["Donations"],
  summary: "Obtener mis donaciones",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ donations: z.array(donationSchema) })),
      "Mis donaciones",
    ),
    401: errorResponses[401],
  },
});

// === Admin/Volunteer routes ===

registry.registerPath({
  method: "post",
  path: "/api/finance/in-kind-donations",
  tags: ["Donations"],
  summary: "Registrar donación en especie",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createInKindDonationSchema },
      },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ donation: inKindDonationSchema })),
      "Donación en especie registrada",
    ),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/finance/in-kind-donations",
  tags: ["Donations"],
  summary: "Obtener todas las donaciones en especie (admin)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ donations: z.array(inKindDonationSchema) })),
      "Lista de donaciones en especie",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

// === Admin only ===

registry.registerPath({
  method: "get",
  path: "/api/finance/summary",
  tags: ["Donations"],
  summary: "Obtener resumen financiero",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ summary: financialSummarySchema })),
      "Resumen financiero",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});
