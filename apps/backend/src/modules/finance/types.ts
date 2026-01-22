/** @file Finance Module - Types Placeholder */
import { z } from "zod";

export const createDonationSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currencyId: z.number().int().positive(),
  isRecurring: z.boolean().optional(),
});

export type CreateDonationDTO = z.infer<typeof createDonationSchema>;
