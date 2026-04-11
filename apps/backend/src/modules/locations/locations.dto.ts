import { z } from "zod";

export const createProvinceSchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateProvinceDTO = z.infer<typeof createProvinceSchema>;

export const provinceIdSchema = z.object({
  provinceId: z.coerce.number().int().positive(),
});
export type ProvinceIdParams = z.infer<typeof provinceIdSchema>;

export const createCitySchema = z.object({
  name: z.string().min(1).max(100),
  provinceId: z.number().int().positive(),
});
export type CreateCityDTO = z.infer<typeof createCitySchema>;

export const cityIdSchema = z.object({
  cityId: z.coerce.number().int().positive(),
});
export type CityIdParams = z.infer<typeof cityIdSchema>;
