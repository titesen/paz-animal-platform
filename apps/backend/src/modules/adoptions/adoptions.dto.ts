/**
 * @file Adoptions Module - Types
 * @description DTOs for adoption application endpoints
 */

import { z } from "zod";

export const createAdoptionApplicationSchema = z.object({
  petId: z.string().uuid(),
  housingType: z.enum(["HOUSE", "APARTMENT", "RURAL"]),
  hasYard: z.boolean(),
  hasOtherPets: z.boolean(),
  otherPetsDescription: z.string().max(500).optional(),
  hasChildren: z.boolean(),
  childrenAges: z.string().max(100).optional(),
  reasonForAdoption: z.string().min(10).max(2000),
  canAffordVetCare: z.boolean(),
  willingToFollowUp: z.boolean(),
});

export type CreateAdoptionApplicationDTO = z.infer<typeof createAdoptionApplicationSchema>;

export const adoptionIdSchema = z.object({
  adoptionId: z.string().uuid(),
});

export type AdoptionIdParams = z.infer<typeof adoptionIdSchema>;

// ===== INTERVIEW SCHEMAS =====

export const createInterviewSchema = z.object({
  scheduledAt: z.string().datetime(),
  modality: z.enum(["IN_PERSON", "VIRTUAL", "PHONE"]),
  durationMinutes: z.number().int().min(10).max(180).optional(),
  locationDetails: z.string().max(255).optional(),
});

export type CreateInterviewDTO = z.infer<typeof createInterviewSchema>;

export const updateInterviewSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  modality: z.enum(["IN_PERSON", "VIRTUAL", "PHONE"]).optional(),
  durationMinutes: z.number().int().min(10).max(180).optional(),
  locationDetails: z.string().max(255).optional(),
  result: z.enum(["PENDING", "POSITIVE", "NEGATIVE", "ABSENT", "RESCHEDULED"]).optional(),
  observations: z.string().max(2000).optional(),
  occurredAt: z.string().datetime().optional(),
});

export type UpdateInterviewDTO = z.infer<typeof updateInterviewSchema>;

export const interviewIdSchema = z.object({
  interviewId: z.string().uuid(),
});

// ===== FOLLOWUP SCHEMAS =====

export const createFollowupSchema = z.object({
  scheduledDate: z.string().date(),
  monthNumber: z.number().int().min(1).max(6),
  notes: z.string().min(1).max(2000),
});

export type CreateFollowupDTO = z.infer<typeof createFollowupSchema>;

export const updateFollowupSchema = z.object({
  scheduledDate: z.string().date().optional(),
  notes: z.string().min(1).max(2000).optional(),
  performedAt: z.string().datetime().optional(),
});

export type UpdateFollowupDTO = z.infer<typeof updateFollowupSchema>;

export const followupIdSchema = z.object({
  followupId: z.string().uuid(),
});
