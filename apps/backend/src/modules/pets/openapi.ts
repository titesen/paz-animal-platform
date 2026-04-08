/**
 * @file Pets OpenAPI Registration
 * @description Registers pet endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";
import { createPetSchema, petIdSchema, petQuerySchema, updatePetSchema } from "./types";

const petSchema = z
  .object({
    petId: z.string().uuid(),
    name: z.string(),
    breedId: z.number(),
    sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
    birthDate: z.string().nullable(),
    status: z.enum(["ADOPTION_AVAILABLE", "IN_PROCESS", "OWNED", "LOST", "DECEASED"]),
    createdAt: z.string().datetime(),
  })
  .openapi("Pet");

const lostPetAlertSchema = z
  .object({
    alertId: z.string().uuid(),
    petId: z.string().uuid(),
    lastSeenZone: z.string(),
    contactPhone: z.string(),
    message: z.string().nullable(),
    resolvedAt: z.string().datetime().nullable(),
  })
  .openapi("LostPetAlert");

// === Public routes ===

registry.registerPath({
  method: "get",
  path: "/api/pets",
  tags: ["Pets"],
  summary: "Obtener mascotas con paginación",
  request: { query: petQuerySchema },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ pets: z.array(petSchema) })), "Lista de mascotas"),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/pets/{petId}",
  tags: ["Pets"],
  summary: "Obtener mascota por ID",
  request: { params: petIdSchema },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ pet: petSchema })), "Mascota encontrada"),
    404: errorResponses[404],
  },
});

// === Client routes ===

registry.registerPath({
  method: "get",
  path: "/api/pets/my-pets",
  tags: ["Pets"],
  summary: "Obtener mis mascotas registradas",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(jsendSuccess(z.object({ pets: z.array(petSchema) })), "Lista de mis mascotas"),
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/pets/my-pets",
  tags: ["Pets"],
  summary: "Registrar mi mascota",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createPetSchema } } },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ pet: petSchema })), "Mascota registrada"),
    400: errorResponses[400],
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/pets/my-pets/{petId}",
  tags: ["Pets"],
  summary: "Actualizar mi mascota",
  security: [{ BearerAuth: [] }],
  request: {
    params: petIdSchema,
    body: { content: { "application/json": { schema: updatePetSchema } } },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ pet: petSchema })), "Mascota actualizada"),
    400: errorResponses[400],
    401: errorResponses[401],
    404: errorResponses[404],
  },
});

// === Lost & Found ===

registry.registerPath({
  method: "get",
  path: "/api/pets/lost-alerts",
  tags: ["Pets"],
  summary: "Obtener alertas de mascotas perdidas",
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ alerts: z.array(lostPetAlertSchema) })),
      "Alertas activas",
    ),
  },
});

registry.registerPath({
  method: "post",
  path: "/api/pets/lost-alerts",
  tags: ["Pets"],
  summary: "Crear alerta de mascota perdida",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            petId: z.string().uuid(),
            lastSeenZone: z.string().min(1).max(255),
            contactPhone: z.string().min(8).max(50),
            message: z.string().max(500).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ alert: lostPetAlertSchema })), "Alerta creada"),
    400: errorResponses[400],
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/pets/lost-alerts/{alertId}/resolve",
  tags: ["Pets"],
  summary: "Marcar mascota como encontrada",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ alertId: z.string().uuid() }),
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ alert: lostPetAlertSchema })), "Alerta resuelta"),
    401: errorResponses[401],
    404: errorResponses[404],
  },
});

// === Admin/Volunteer routes ===

registry.registerPath({
  method: "post",
  path: "/api/pets",
  tags: ["Pets"],
  summary: "Crear mascota (fundación)",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createPetSchema } } },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ pet: petSchema })), "Mascota creada"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/pets/{petId}",
  tags: ["Pets"],
  summary: "Actualizar mascota",
  security: [{ BearerAuth: [] }],
  request: {
    params: petIdSchema,
    body: { content: { "application/json": { schema: updatePetSchema } } },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ pet: petSchema })), "Mascota actualizada"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/pets/{petId}",
  tags: ["Pets"],
  summary: "Eliminar mascota (soft delete)",
  security: [{ BearerAuth: [] }],
  request: { params: petIdSchema },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Mascota eliminada"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/pets/{petId}/status",
  tags: ["Pets"],
  summary: "Actualizar estado de mascota",
  security: [{ BearerAuth: [] }],
  request: {
    params: petIdSchema,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.enum(["ADOPTION_AVAILABLE", "IN_PROCESS", "OWNED", "LOST", "DECEASED"]),
          }),
        },
      },
    },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ pet: petSchema })), "Estado actualizado"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});
