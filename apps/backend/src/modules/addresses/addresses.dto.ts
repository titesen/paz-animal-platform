import { z } from "zod";

export const createAddressSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
  cityId: z.number().int().positive(),
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(20),
  unit: z.string().max(50).optional().nullable(),
  zipCode: z.string().min(1).max(10),
  alias: z.string().max(100).optional().default("Main"),
  coordinates: z.tuple([z.number(), z.number()]).optional().nullable(),
});

export type CreateAddressDTO = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema
  .omit({ entityType: true, entityId: true })
  .partial();
export type UpdateAddressDTO = z.infer<typeof updateAddressSchema>;

export const addressIdSchema = z.object({
  addressId: z.string().uuid(),
});
export type AddressIdParams = z.infer<typeof addressIdSchema>;

export const entityParamsSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});
export type EntityParams = z.infer<typeof entityParamsSchema>;
