/**
 * @file Media OpenAPI Registration
 * @description Registers media endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";

const mediaSchema = z
  .object({
    mediaId: z.string().uuid(),
    entityType: z.enum(["pets", "news", "events", "users"]),
    entityId: z.string().uuid(),
    url: z.string().url(),
    type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
    altText: z.string().nullable(),
    isMain: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .openapi("Media");

registry.registerPath({
  method: "post",
  path: "/api/media/upload",
  tags: ["Media"],
  summary: "Subir archivo",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.string().openapi({ format: "binary" }),
            entityType: z.enum(["pets", "news", "events", "users"]),
            entityId: z.string().uuid(),
            altText: z.string().max(255).optional(),
            isMain: z.boolean().default(false),
          }),
        },
      },
    },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ media: mediaSchema })), "Archivo subido"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
    429: errorResponses[429],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/media/{mediaId}",
  tags: ["Media"],
  summary: "Obtener media por ID",
  request: {
    params: z.object({ mediaId: z.string().uuid() }),
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ media: mediaSchema })), "Media encontrada"),
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/media/entity/{entityType}/{entityId}",
  tags: ["Media"],
  summary: "Obtener media de una entidad",
  request: {
    params: z.object({
      entityType: z.enum(["pets", "news", "events", "users"]),
      entityId: z.string().uuid(),
    }),
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ media: z.array(mediaSchema) })),
      "Lista de media de la entidad",
    ),
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/media/{mediaId}",
  tags: ["Media"],
  summary: "Actualizar metadata de media",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ mediaId: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            altText: z.string().max(255).optional(),
            isMain: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ media: mediaSchema })), "Media actualizada"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/media/{mediaId}",
  tags: ["Media"],
  summary: "Eliminar media",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ mediaId: z.string().uuid() }),
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Media eliminada"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});
