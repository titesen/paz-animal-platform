/**
 * @file Volunteers Module Types
 * @description DTOs and schemas for volunteer management
 */

import { z } from "zod";

// Volunteer application schemas
export const createVolunteerApplicationSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  docNumber: z.string().min(5).max(50),
  phone: z.string().min(8).max(20),
  birthDate: z.string().date(),
  instagramHandle: z.string().max(100).optional(),
  hasExperience: z.boolean().default(false),
  experienceDetails: z.string().max(2000).optional(),
  wasVolunteerBefore: z.boolean().default(false),
  motivation: z.string().min(50).max(2000),
  availability: z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
  }),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminNotes: z.string().max(1000).optional(),
});

export type CreateVolunteerApplicationDTO = z.infer<
  typeof createVolunteerApplicationSchema
>;

export type UpdateApplicationStatusDTO = z.infer<
  typeof updateApplicationStatusSchema
>;

// Volunteer management schemas
export const createVolunteerSchema = z.object({
  bio: z.string().max(500).optional(),
  availability: z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
  }),
});

export const updateVolunteerSchema = z.object({
  bio: z.string().max(500).optional(),
  availability: z
    .object({
      monday: z.boolean().optional(),
      tuesday: z.boolean().optional(),
      wednesday: z.boolean().optional(),
      thursday: z.boolean().optional(),
      friday: z.boolean().optional(),
      saturday: z.boolean().optional(),
      sunday: z.boolean().optional(),
    })
    .optional(),
});

export const assignTagSchema = z.object({
  roleId: z.number().int().positive(),
});

export type CreateVolunteerDTO = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerDTO = z.infer<typeof updateVolunteerSchema>;
export type AssignTagDTO = z.infer<typeof assignTagSchema>;

