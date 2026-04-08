/**
 * @file Volunteers OpenAPI Registration
 * @description Registers volunteer endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";
import {
  assignTagSchema,
  createVolunteerApplicationSchema,
  updateApplicationStatusSchema,
  updateVolunteerSchema,
} from "./types";

const applicationSchema = z
  .object({
    applicationId: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
    createdAt: z.string().datetime(),
  })
  .openapi("VolunteerApplication");

const volunteerSchema = z
  .object({
    volunteerId: z.string().uuid(),
    userId: z.string().uuid(),
    bio: z.string().nullable(),
    availability: z.record(z.string(), z.boolean()),
    roles: z.array(z.object({ roleId: z.number(), name: z.string() })),
  })
  .openapi("Volunteer");

const volunteerRoleSchema = z
  .object({
    roleId: z.number(),
    name: z.string(),
    description: z.string().nullable(),
  })
  .openapi("VolunteerRole");

// === Applications ===

registry.registerPath({
  method: "post",
  path: "/api/volunteers/applications",
  tags: ["Volunteers"],
  summary: "Crear solicitud de voluntariado",
  request: {
    body: {
      content: {
        "application/json": { schema: createVolunteerApplicationSchema },
      },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ application: applicationSchema })),
      "Solicitud creada",
    ),
    400: errorResponses[400],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/volunteers/applications",
  tags: ["Volunteers"],
  summary: "Obtener todas las solicitudes (admin)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ applications: z.array(applicationSchema) })),
      "Lista de solicitudes",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/volunteers/applications/{applicationId}",
  tags: ["Volunteers"],
  summary: "Obtener solicitud por ID",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ applicationId: z.string().uuid() }),
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ application: applicationSchema })),
      "Solicitud encontrada",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/volunteers/applications/{applicationId}/status",
  tags: ["Volunteers"],
  summary: "Actualizar estado de solicitud (aprobar/rechazar)",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ applicationId: z.string().uuid() }),
    body: {
      content: {
        "application/json": { schema: updateApplicationStatusSchema },
      },
    },
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ application: applicationSchema })),
      "Estado actualizado",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/volunteers/applications/{applicationId}/promote",
  tags: ["Volunteers"],
  summary: "Promover solicitud a voluntario activo",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ applicationId: z.string().uuid() }),
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ volunteer: volunteerSchema })),
      "Voluntario promovido",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

// === Roles ===

registry.registerPath({
  method: "get",
  path: "/api/volunteers/roles",
  tags: ["Volunteers"],
  summary: "Obtener roles de voluntarios",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ roles: z.array(volunteerRoleSchema) })),
      "Lista de roles",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

// === Volunteer Management ===

registry.registerPath({
  method: "get",
  path: "/api/volunteers/me",
  tags: ["Volunteers"],
  summary: "Obtener mi perfil de voluntario",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ volunteer: volunteerSchema })),
      "Perfil del voluntario",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/volunteers",
  tags: ["Volunteers"],
  summary: "Obtener todos los voluntarios",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ volunteers: z.array(volunteerSchema) })),
      "Lista de voluntarios",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/volunteers/{volunteerId}",
  tags: ["Volunteers"],
  summary: "Obtener voluntario por ID",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ volunteerId: z.string().uuid() }),
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ volunteer: volunteerSchema })),
      "Voluntario encontrado",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/volunteers/{volunteerId}",
  tags: ["Volunteers"],
  summary: "Actualizar voluntario",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ volunteerId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: updateVolunteerSchema } },
    },
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ volunteer: volunteerSchema })),
      "Voluntario actualizado",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/volunteers/{volunteerId}",
  tags: ["Volunteers"],
  summary: "Eliminar voluntario",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ volunteerId: z.string().uuid() }),
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Voluntario eliminado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

// === Tags ===

registry.registerPath({
  method: "post",
  path: "/api/volunteers/{volunteerId}/tags",
  tags: ["Volunteers"],
  summary: "Asignar rol a voluntario",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ volunteerId: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: assignTagSchema } },
    },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Rol asignado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/volunteers/{volunteerId}/tags/{roleId}",
  tags: ["Volunteers"],
  summary: "Remover rol de voluntario",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      volunteerId: z.string().uuid(),
      roleId: z.string(),
    }),
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Rol removido"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});
