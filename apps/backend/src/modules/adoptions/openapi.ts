/**
 * @file Adoptions OpenAPI Registration
 * @description Registers adoption endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";
import { adoptionIdSchema, createAdoptionApplicationSchema } from "./types";

const adoptionSchema = z
  .object({
    adoptionId: z.string().uuid(),
    userId: z.string().uuid(),
    petId: z.string().uuid(),
    status: z.string(),
    housingType: z.enum(["HOUSE", "APARTMENT", "RURAL"]),
    hasYard: z.boolean(),
    hasOtherPets: z.boolean(),
    hasChildren: z.boolean(),
    reasonForAdoption: z.string(),
    createdAt: z.string().datetime(),
  })
  .openapi("AdoptionApplication");

registry.registerPath({
  method: "post",
  path: "/api/adoptions",
  tags: ["Adoptions"],
  summary: "Crear solicitud de adopción",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createAdoptionApplicationSchema },
      },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ adoption: adoptionSchema })),
      "Solicitud creada exitosamente",
    ),
    400: errorResponses[400],
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/adoptions/my",
  tags: ["Adoptions"],
  summary: "Obtener mis solicitudes de adopción",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ adoptions: z.array(adoptionSchema) })),
      "Lista de mis solicitudes",
    ),
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/adoptions/{adoptionId}",
  tags: ["Adoptions"],
  summary: "Obtener solicitud de adopción por ID",
  security: [{ BearerAuth: [] }],
  request: { params: adoptionIdSchema },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ adoption: adoptionSchema })), "Solicitud encontrada"),
    401: errorResponses[401],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/adoptions",
  tags: ["Adoptions"],
  summary: "Obtener todas las solicitudes (admin)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ adoptions: z.array(adoptionSchema) })),
      "Lista de todas las solicitudes",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/adoptions/{adoptionId}/status",
  tags: ["Adoptions"],
  summary: "Actualizar estado de solicitud",
  security: [{ BearerAuth: [] }],
  request: {
    params: adoptionIdSchema,
    body: {
      content: {
        "application/json": {
          schema: z.object({ status: z.string() }),
        },
      },
    },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ adoption: adoptionSchema })), "Estado actualizado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});
