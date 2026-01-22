/**
 * @file Volunteers Module - Placeholder
 * @description Types for volunteer management (to be implemented)
 */

import { z } from "zod";

export const createVolunteerApplicationSchema = z.object({
  motivationLetter: z.string().min(50).max(2000),
  availabilityDays: z.array(z.string()).min(1),
  skills: z.string().max(500).optional(),
});

export type CreateVolunteerApplicationDTO = z.infer<
  typeof createVolunteerApplicationSchema
>;
