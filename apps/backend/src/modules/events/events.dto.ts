/**
 * @file Events Module - Data Transfer Objects (DTOs)
 * @description Zod schemas for event request validation
 */

import { z } from "zod";

// ===================
// COMMON SCHEMAS
// ===================

const eventModalitySchema = z.enum(["VIRTUAL", "IN_PERSON", "HYBRID"]);
const paymentOptionSchema = z.enum(["FREE", "ONLINE_PAYMENT", "ON_SITE_CASH", "IN_KIND_DONATION"]);
const paymentStatusSchema = z.enum(["NA", "PENDING", "PAID", "VERIFIED_ON_SITE"]);

export const eventIdParamSchema = z.object({
  eventId: z.string().uuid(),
});

export type EventIdParams = z.infer<typeof eventIdParamSchema>;

export const eventLanguageParamSchema = z.object({
  eventId: z.string().uuid(),
  language: z.string().min(2).max(5),
});

// ===================
// EVENTS SCHEMAS
// ===================

export const createEventSchema = z.object({
  eventDate: z.string().datetime(),
  modality: eventModalitySchema,
  virtualLink: z.string().url().optional(),
  isFree: z.boolean(),
  acceptsOnlinePayment: z.boolean().optional(),
  onlinePrice: z.number().nonnegative().optional(),
  acceptsOnSitePayment: z.boolean().optional(),
  onSitePrice: z.number().nonnegative().optional(),
  acceptsInKind: z.boolean().optional(),
  inKindDescription: z.string().max(500).optional(),
  translations: z
    .array(
      z.object({
        language: z.string().min(2).max(5),
        title: z.string().min(1).max(300),
        description: z.string().max(2000).optional(),
      }),
    )
    .min(1),
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  eventDate: z.string().datetime().optional(),
  modality: eventModalitySchema.optional(),
  virtualLink: z.string().url().optional(),
  isFree: z.boolean().optional(),
  acceptsOnlinePayment: z.boolean().optional(),
  onlinePrice: z.number().nonnegative().optional(),
  acceptsOnSitePayment: z.boolean().optional(),
  onSitePrice: z.number().nonnegative().optional(),
  acceptsInKind: z.boolean().optional(),
  inKindDescription: z.string().max(500).optional(),
});

export type UpdateEventDTO = z.infer<typeof updateEventSchema>;

export const updateEventTranslationSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional(),
});

export type UpdateEventTranslationDTO = z.infer<typeof updateEventTranslationSchema>;

// ===================
// REGISTRATION SCHEMAS
// ===================

export const registerForEventSchema = z.object({
  selectedPaymentOption: paymentOptionSchema,
});

export type RegisterForEventDTO = z.infer<typeof registerForEventSchema>;

export const updateRegistrationStatusSchema = z.object({
  paymentStatus: paymentStatusSchema,
});

export type UpdateRegistrationStatusDTO = z.infer<typeof updateRegistrationStatusSchema>;

// ===================
// ATTENDANCE SCHEMAS
// ===================

export const checkInSchema = z.object({
  userId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export type CheckInDTO = z.infer<typeof checkInSchema>;
