/**
 * @file Pets Module - Data Transfer Objects (DTOs)
 * @description Zod schemas for pet-related request/response validation
 */

import { z } from "zod";

/**
 * Create Pet Request Schema
 */
export const createPetSchema = z.object({
  name: z.string().min(1).max(100),
  speciesId: z.number().int().positive(),
  breedId: z.number().int().positive(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
  birthDate: z.string().datetime().optional(),
  approximateAge: z.number().int().min(0).optional(),
  color: z.string().max(50).optional(),
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(), // Numeric string
  isCastrated: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  medicalHistory: z.string().max(5000).optional(),
  specialNeeds: z.string().max(1000).optional(),
  status: z
    .enum([
      "ADOPTION_AVAILABLE",
      "PENDING",
      "ADOPTED",
      "FOSTER",
      "MEDICAL_TREATMENT",
      "UNAVAILABLE",
      "DECEASED",
      "OWNED",
    ])
    .default("ADOPTION_AVAILABLE"),
});

export type CreatePetDTO = z.infer<typeof createPetSchema>;

/**
 * Update Pet Request Schema
 */
export const updatePetSchema = createPetSchema.partial();

export type UpdatePetDTO = z.infer<typeof updatePetSchema>;

/**
 * Pet ID Params Schema
 */
export const petIdSchema = z.object({
  petId: z.string().uuid(),
});

export type PetIdParams = z.infer<typeof petIdSchema>;

/**
 * Pet Query Params Schema
 */
export const petQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z
    .enum([
      "ADOPTION_AVAILABLE",
      "PENDING",
      "ADOPTED",
      "FOSTER",
      "MEDICAL_TREATMENT",
      "UNAVAILABLE",
      "DECEASED",
      "OWNED",
    ])
    .optional(),
  speciesId: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  sortBy: z
    .enum(["createdAt", "name", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PetQueryParams = z.infer<typeof petQuerySchema>;
