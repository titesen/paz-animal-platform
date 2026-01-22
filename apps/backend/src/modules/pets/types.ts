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
  breedId: z.number().int().positive(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
  birthDate: z.string().datetime().optional(),
  status: z
    .enum(["ADOPTION_AVAILABLE", "IN_PROCESS", "OWNED", "LOST", "DECEASED"])
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
    .enum(["ADOPTION_AVAILABLE", "IN_PROCESS", "OWNED", "LOST", "DECEASED"])
    .optional(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  sortBy: z.enum(["createdAt", "name"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PetQueryParams = z.infer<typeof petQuerySchema>;
