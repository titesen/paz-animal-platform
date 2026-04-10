/**
 * @file OpenAPI Response Helpers
 * @description Reusable JSend response schemas and error response constants for OpenAPI documentation.
 */

import { z } from "zod";
import { registry } from "./openapi-registry";

export const jsendErrorSchema = registry.register(
  "JSendError",
  z.object({
    status: z.literal("error"),
    message: z.string().openapi({ example: "Error description" }),
    code: z.string().optional().openapi({ example: "UNAUTHORIZED" }),
  }),
);

export const jsendFailSchema = registry.register(
  "JSendFail",
  z.object({
    status: z.literal("fail"),
    data: z.object({
      errors: z.array(
        z.object({
          field: z.string().openapi({ example: "email" }),
          message: z.string().openapi({ example: "Email inválido" }),
        }),
      ),
    }),
  }),
);

export function jsendSuccess(dataSchema: z.ZodTypeAny) {
  return z.object({
    status: z.literal("success"),
    data: dataSchema,
  });
}

export function jsonContent(schema: z.ZodTypeAny, description: string) {
  return {
    description,
    content: {
      "application/json": { schema },
    },
  };
}

export const errorResponses = {
  400: jsonContent(jsendFailSchema, "Datos de entrada inválidos"),
  401: jsonContent(jsendErrorSchema, "Token de autenticación inválido o expirado"),
  403: jsonContent(jsendErrorSchema, "No tienes permisos para acceder a este recurso"),
  404: jsonContent(jsendErrorSchema, "Recurso no encontrado"),
  429: jsonContent(jsendErrorSchema, "Demasiadas solicitudes"),
} as const;
