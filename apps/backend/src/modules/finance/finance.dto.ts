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
