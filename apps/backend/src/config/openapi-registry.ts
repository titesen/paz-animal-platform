/**
 * @file OpenAPI Registry
 * @description Central registry for OpenAPI schema and path definitions.
 * Extends Zod with .openapi() support and registers shared security schemes.
 */

import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description:
    "Token de acceso JWT obtenido tras login exitoso. Duración: 15 minutos. Header: Authorization: Bearer <access_token>",
});

registry.registerComponent("securitySchemes", "RefreshToken", {
  type: "apiKey",
  in: "cookie",
  name: "__paz_refresh_token",
  description: "Token de renovación almacenado en cookie HTTP-Only. Duración: 7 días.",
});
