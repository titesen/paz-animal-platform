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

export type CreateAdoptionApplicationDTO = z.infer<
  typeof createAdoptionApplicationSchema
>;

export const adoptionIdSchema = z.object({
  adoptionId: z.string().uuid(),
});

export type AdoptionIdParams = z.infer<typeof adoptionIdSchema>;
