/**
 * @file Finance Module - Data Transfer Objects (DTOs)
 * @description Zod schemas for financial and donation request validation
 */

import { z } from "zod";

// ===================
// MONETARY DONATION SCHEMAS
// ===================

export const createMonetaryDonationSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(3).max(3).optional(),
  isAnonymous: z.boolean().optional(),
  thankYouMessage: z.string().max(500).optional(),
});

export type CreateMonetaryDonationDTO = z.infer<typeof createMonetaryDonationSchema>;

// ===================
// IN-KIND DONATION SCHEMAS
// ===================

export const createInKindDonationSchema = z.object({
  description: z.string().min(1).max(1000),
  estimatedValue: z.number().nonnegative().optional(),
  manualDonorName: z.string().max(200).optional(),
  manualDonorContact: z.string().max(200).optional(),
});

export type CreateInKindDonationDTO = z.infer<typeof createInKindDonationSchema>;

// ===================
// ON-SITE COLLECTION SCHEMAS
// ===================

export const createOnSiteCollectionSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
  type: z.enum(["CASH_ON_SITE", "MATERIAL_SUPPLY", "FOOD_SUPPLY"]),
  description: z.string().min(1).max(2000),
  estimatedValue: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(3).optional(),
});

export type CreateOnSiteCollectionDTO = z.infer<typeof createOnSiteCollectionSchema>;

export const collectionIdSchema = z.object({
  collectionId: z.string().uuid(),
});

// ===================
// PAYMENT METHOD SCHEMAS
// ===================

export const createPaymentMethodSchema = z.object({
  provider: z
    .enum(["MERCADOPAGO", "STRIPE", "PAYPAL", "BANK_TRANSFER", "CASH_REGISTER"])
    .default("MERCADOPAGO"),
  externalToken: z.string().min(1).max(255),
  cardBrand: z.string().max(50).optional(),
  lastFour: z.string().length(4).optional(),
  description: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export type CreatePaymentMethodDTO = z.infer<typeof createPaymentMethodSchema>;

export const updatePaymentMethodSchema = z.object({
  description: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdatePaymentMethodDTO = z.infer<typeof updatePaymentMethodSchema>;

export const methodIdSchema = z.object({
  methodId: z.string().uuid(),
});
