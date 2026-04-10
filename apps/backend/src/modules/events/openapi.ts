/**
 * @file Events OpenAPI Registration
 * @description Registers event endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";

// --- Zod schemas for Events ---

const eventModalitySchema = z.enum(["VIRTUAL", "IN_PERSON", "HYBRID"]);
const paymentOptionSchema = z.enum(["FREE", "ONLINE_PAYMENT", "ON_SITE_CASH", "IN_KIND_DONATION"]);
const paymentStatusSchema = z.enum(["NA", "PENDING", "PAID", "VERIFIED_ON_SITE"]);

const eventTranslationSchema = z.object({
  language: z.string(),
  title: z.string(),
  description: z.string().nullable(),
});

const eventSchema = z
  .object({
    eventId: z.string().uuid(),
    creatorId: z.string().uuid(),
    eventDate: z.string().datetime(),
    modality: eventModalitySchema,
    isFree: z.boolean(),
    virtualLink: z.string().nullable(),
    acceptsOnlinePayment: z.boolean(),
    onlinePrice: z.string().nullable(),
    acceptsOnSitePayment: z.boolean(),
    onSitePrice: z.string().nullable(),
    acceptsInKind: z.boolean(),
    inKindDescription: z.string().nullable(),
    translations: z.array(eventTranslationSchema),
  })
  .openapi("Event");

const eventRegistrationSchema = z
  .object({
    userId: z.string().uuid(),
    eventId: z.string().uuid(),
    registeredAt: z.string().datetime().nullable(),
    selectedPaymentOption: paymentOptionSchema,
    paymentStatus: paymentStatusSchema,
  })
  .openapi("EventRegistration");

const attendanceSchema = z
  .object({
    attendanceId: z.string().uuid(),
    userId: z.string().uuid(),
    entityType: z.string(),
    entityId: z.string().uuid(),
    checkInTime: z.string().datetime(),
    notes: z.string().nullable(),
  })
  .openapi("Attendance");

const createEventSchema = z.object({
  eventDate: z.string().datetime(),
  modality: eventModalitySchema,
  virtualLink: z.string().url().optional(),
  isFree: z.boolean(),
  acceptsOnlinePayment: z.boolean().optional(),
  onlinePrice: z.number().positive().optional(),
  acceptsOnSitePayment: z.boolean().optional(),
  onSitePrice: z.number().positive().optional(),
  acceptsInKind: z.boolean().optional(),
  inKindDescription: z.string().optional(),
  translations: z.array(
    z.object({
      language: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
    }),
  ),
});

const updateEventSchema = z.object({
  eventDate: z.string().datetime().optional(),
  modality: eventModalitySchema.optional(),
  virtualLink: z.string().url().optional(),
  isFree: z.boolean().optional(),
  acceptsOnlinePayment: z.boolean().optional(),
  onlinePrice: z.number().positive().optional(),
  acceptsOnSitePayment: z.boolean().optional(),
  onSitePrice: z.number().positive().optional(),
  acceptsInKind: z.boolean().optional(),
  inKindDescription: z.string().optional(),
});

const eventIdParams = z.object({ eventId: z.string().uuid() });

// === Public routes ===

registry.registerPath({
  method: "get",
  path: "/api/events",
  tags: ["Events"],
  summary: "Obtener todos los eventos",
  description: "Retorna todos los eventos activos (no eliminados)",
  responses: {
    200: jsonContent(jsendSuccess(z.object({ events: z.array(eventSchema) })), "Lista de eventos"),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}",
  tags: ["Events"],
  summary: "Obtener evento por ID",
  request: { params: eventIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ event: eventSchema })), "Evento encontrado"),
    404: errorResponses[404],
  },
});

// === Authenticated routes ===

registry.registerPath({
  method: "get",
  path: "/api/events/my-registrations",
  tags: ["Events"],
  summary: "Obtener mis registros de eventos",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ registrations: z.array(eventRegistrationSchema) })),
      "Mis registros",
    ),
    401: errorResponses[401],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/events/{eventId}/register",
  tags: ["Events"],
  summary: "Registrarse en un evento",
  security: [{ BearerAuth: [] }],
  request: {
    params: eventIdParams,
    body: {
      content: {
        "application/json": {
          schema: z.object({ selectedPaymentOption: paymentOptionSchema }),
        },
      },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ registration: eventRegistrationSchema })),
      "Registro exitoso",
    ),
    400: errorResponses[400],
    401: errorResponses[401],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/events/{eventId}/register",
  tags: ["Events"],
  summary: "Cancelar registro en evento",
  security: [{ BearerAuth: [] }],
  request: { params: eventIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Registro cancelado"),
    401: errorResponses[401],
    404: errorResponses[404],
  },
});

// === EVENT_ORGANIZER routes ===

registry.registerPath({
  method: "post",
  path: "/api/events",
  tags: ["Events"],
  summary: "Crear evento",
  description: "Requiere rol EVENT_ORGANIZER",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createEventSchema } } },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ event: eventSchema })), "Evento creado exitosamente"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/events/{eventId}",
  tags: ["Events"],
  summary: "Actualizar evento",
  security: [{ BearerAuth: [] }],
  request: {
    params: eventIdParams,
    body: { content: { "application/json": { schema: updateEventSchema } } },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ event: eventSchema })), "Evento actualizado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/events/{eventId}/translations/{language}",
  tags: ["Events"],
  summary: "Actualizar traducción de evento",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      eventId: z.string().uuid(),
      language: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Traducción actualizada"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/events/{eventId}",
  tags: ["Events"],
  summary: "Eliminar evento (soft delete)",
  security: [{ BearerAuth: [] }],
  request: { params: eventIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Evento eliminado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}/registrations",
  tags: ["Events"],
  summary: "Obtener registros de un evento",
  description: "Requiere rol EVENT_ORGANIZER",
  security: [{ BearerAuth: [] }],
  request: { params: eventIdParams },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ registrations: z.array(eventRegistrationSchema) })),
      "Lista de registros",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/events/{eventId}/check-in",
  tags: ["Events"],
  summary: "Registrar asistencia (check-in)",
  security: [{ BearerAuth: [] }],
  request: {
    params: eventIdParams,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            userId: z.string().uuid(),
            notes: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ attendance: attendanceSchema })),
      "Asistencia registrada",
    ),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}/attendances",
  tags: ["Events"],
  summary: "Obtener asistencias de un evento",
  description: "Requiere rol EVENT_ORGANIZER",
  security: [{ BearerAuth: [] }],
  request: { params: eventIdParams },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ attendances: z.array(attendanceSchema) })),
      "Lista de asistencias",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});
