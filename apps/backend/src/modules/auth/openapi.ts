/**
 * @file Auth OpenAPI Registration
 * @description Registers auth endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";
import { googleOAuthSchema, loginSchema, registerSchema } from "./types";

const userSchema = z
  .object({
    userId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string()),
  })
  .openapi("AuthUser");

const authClientResponse = jsendSuccess(
  z.object({
    user: userSchema,
    tokens: z.object({ accessToken: z.string() }),
  }),
);

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Registrar nuevo usuario",
  request: {
    body: { content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    201: jsonContent(authClientResponse, "Usuario registrado exitosamente"),
    400: errorResponses[400],
    429: errorResponses[429],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Iniciar sesión con email y contraseña",
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: jsonContent(authClientResponse, "Login exitoso"),
    400: errorResponses[400],
    401: errorResponses[401],
    429: errorResponses[429],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: ["Auth"],
  summary: "Renovar access token",
  description: "Usa el refresh token de la cookie httpOnly para generar un nuevo access token",
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ tokens: z.object({ accessToken: z.string() }) })),
      "Token renovado exitosamente",
    ),
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/google",
  tags: ["Auth"],
  summary: "Login con Google OAuth",
  request: {
    body: { content: { "application/json": { schema: googleOAuthSchema } } },
  },
  responses: {
    200: jsonContent(authClientResponse, "Login con Google exitoso"),
    400: errorResponses[400],
    401: errorResponses[401],
    429: errorResponses[429],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Obtener perfil del usuario actual",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(jsendSuccess(z.object({ user: userSchema })), "Perfil del usuario"),
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Auth"],
  summary: "Cerrar sesión",
  description: "Invalida el access token y limpia la cookie de refresh token",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ message: z.string() })),
      "Sesión cerrada exitosamente",
    ),
    401: errorResponses[401],
  },
});
