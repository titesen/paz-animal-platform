/**
 * @file Events Module - Types Placeholder
 */

import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  modality: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"]),
  location: z.string().max(500).optional(),
  maxCapacity: z.number().int().positive().optional(),
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;
