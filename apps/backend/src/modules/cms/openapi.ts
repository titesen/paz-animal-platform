/**
 * @file CMS OpenAPI Registration
 * @description Registers CMS endpoint definitions in the OpenAPI registry.
 */

import { z } from "zod";
import { registry } from "../../config/openapi-registry";
import { errorResponses, jsonContent, jsendSuccess } from "../../config/openapi-responses";

// --- Zod schemas for CMS ---

const languageCodeSchema = z.enum(["es", "en", "pt"]);
const publicationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const uiComponentTypeSchema = z.enum([
  "TEXT",
  "RICH_TEXT",
  "IMAGE_URL",
  "CAROUSEL_LIST",
  "CONFIG",
  "LINK",
]);
const uiSectionSchema = z.enum([
  "GLOBAL",
  "HOME",
  "FOOTER",
  "NAVBAR",
  "ADOPTIONS",
  "VOLUNTEERS",
  "DONATIONS",
  "CONTACT",
  "ABOUT_US",
]);

// --- Response schemas ---

const newsTranslationSchema = z.object({
  language: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  slug: z.string(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
});

const newsSchema = z
  .object({
    newsId: z.string().uuid(),
    authorId: z.string().uuid(),
    status: publicationStatusSchema,
    publishedAt: z.string().datetime().nullable(),
    translations: z.array(newsTranslationSchema),
  })
  .openapi("News");

const resourceTranslationSchema = z.object({
  language: z.string(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
});

const resourceSchema = z
  .object({
    resourceId: z.string().uuid(),
    authorId: z.string().uuid(),
    status: publicationStatusSchema,
    sortOrder: z.number().nullable(),
    translations: z.array(resourceTranslationSchema),
  })
  .openapi("Resource");

const sponsorSchema = z
  .object({
    sponsorId: z.string().uuid(),
    name: z.string(),
    websiteUrl: z.string().nullable(),
    contactName: z.string().nullable(),
    contactEmail: z.string().nullable(),
    contactPhone: z.string().nullable(),
    sortOrder: z.number(),
    createdAt: z.string().datetime(),
  })
  .openapi("Sponsor");

const uiFragmentSchema = z
  .object({
    fragmentKey: z.string(),
    language: languageCodeSchema,
    description: z.string().nullable(),
    type: uiComponentTypeSchema,
    section: uiSectionSchema,
    content: z.record(z.string(), z.unknown()),
    lastUpdatedAt: z.string().datetime(),
    updatedBy: z.string().nullable(),
  })
  .openapi("UIFragment");

// --- Request schemas ---

const createNewsSchema = z.object({
  status: publicationStatusSchema.optional(),
  publishedAt: z.string().datetime().optional(),
  translations: z.array(
    z.object({
      language: languageCodeSchema,
      title: z.string().min(1),
      excerpt: z.string().optional(),
      content: z.string().min(1),
      slug: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }),
  ),
});

const updateNewsSchema = z.object({
  status: publicationStatusSchema.optional(),
  publishedAt: z.string().datetime().optional(),
});

const updateTranslationSchema = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const createResourceSchema = z.object({
  status: publicationStatusSchema.optional(),
  sortOrder: z.number().optional(),
  translations: z.array(
    z.object({
      language: languageCodeSchema,
      title: z.string().min(1),
      content: z.string().min(1),
      slug: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }),
  ),
});

const updateResourceSchema = z.object({
  status: publicationStatusSchema.optional(),
  sortOrder: z.number().optional(),
});

const createSponsorSchema = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  sortOrder: z.number().optional(),
});

const updateSponsorSchema = createSponsorSchema.partial();

const createUIFragmentSchema = z.object({
  fragmentKey: z.string().min(1),
  language: languageCodeSchema.optional(),
  description: z.string().optional(),
  type: uiComponentTypeSchema,
  section: uiSectionSchema,
  content: z.record(z.string(), z.unknown()),
});

// Params
const newsIdParams = z.object({ newsId: z.string().uuid() });
const resourceIdParams = z.object({ resourceId: z.string().uuid() });
const sponsorIdParams = z.object({ sponsorId: z.string().uuid() });

// =====================
// NEWS ROUTES
// =====================

registry.registerPath({
  method: "get",
  path: "/api/cms/news",
  tags: ["CMS"],
  summary: "Obtener noticias publicadas",
  description: "Retorna todas las noticias con estado PUBLISHED (público)",
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ news: z.array(newsSchema) })),
      "Lista de noticias publicadas",
    ),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/news/all",
  tags: ["CMS"],
  summary: "Obtener todas las noticias (admin)",
  description: "Retorna todas las noticias incluyendo borradores y archivadas",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ news: z.array(newsSchema) })),
      "Lista completa de noticias",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/news/slug/{slug}",
  tags: ["CMS"],
  summary: "Obtener noticia por slug",
  request: {
    params: z.object({ slug: z.string() }),
    query: z.object({ lang: languageCodeSchema.optional() }),
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ news: newsSchema })), "Noticia encontrada"),
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/news/{newsId}",
  tags: ["CMS"],
  summary: "Obtener noticia por ID",
  request: { params: newsIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ news: newsSchema })), "Noticia encontrada"),
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/cms/news",
  tags: ["CMS"],
  summary: "Crear noticia",
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createNewsSchema } } },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ news: newsSchema })), "Noticia creada exitosamente"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "put",
  path: "/api/cms/news/{newsId}",
  tags: ["CMS"],
  summary: "Actualizar noticia",
  security: [{ BearerAuth: [] }],
  request: {
    params: newsIdParams,
    body: { content: { "application/json": { schema: updateNewsSchema } } },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ news: newsSchema })), "Noticia actualizada"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "put",
  path: "/api/cms/news/{newsId}/translations/{language}",
  tags: ["CMS"],
  summary: "Actualizar traducción de noticia",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      newsId: z.string().uuid(),
      language: languageCodeSchema,
    }),
    body: {
      content: { "application/json": { schema: updateTranslationSchema } },
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
  path: "/api/cms/news/{newsId}",
  tags: ["CMS"],
  summary: "Eliminar noticia (soft delete)",
  security: [{ BearerAuth: [] }],
  request: { params: newsIdParams },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ message: z.string() })),
      "Noticia eliminada exitosamente",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

// =====================
// RESOURCES ROUTES
// =====================

registry.registerPath({
  method: "get",
  path: "/api/cms/resources",
  tags: ["CMS"],
  summary: "Obtener recursos publicados",
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ resources: z.array(resourceSchema) })),
      "Lista de recursos publicados",
    ),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/resources/all",
  tags: ["CMS"],
  summary: "Obtener todos los recursos (admin)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ resources: z.array(resourceSchema) })),
      "Lista completa de recursos",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/resources/{resourceId}",
  tags: ["CMS"],
  summary: "Obtener recurso por ID",
  request: { params: resourceIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ resource: resourceSchema })), "Recurso encontrado"),
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/cms/resources",
  tags: ["CMS"],
  summary: "Crear recurso educativo",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createResourceSchema } },
    },
  },
  responses: {
    201: jsonContent(
      jsendSuccess(z.object({ resource: resourceSchema })),
      "Recurso creado exitosamente",
    ),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "put",
  path: "/api/cms/resources/{resourceId}",
  tags: ["CMS"],
  summary: "Actualizar recurso",
  security: [{ BearerAuth: [] }],
  request: {
    params: resourceIdParams,
    body: {
      content: { "application/json": { schema: updateResourceSchema } },
    },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ resource: resourceSchema })), "Recurso actualizado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "put",
  path: "/api/cms/resources/{resourceId}/translations/{language}",
  tags: ["CMS"],
  summary: "Actualizar traducción de recurso",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      resourceId: z.string().uuid(),
      language: languageCodeSchema,
    }),
    body: {
      content: { "application/json": { schema: updateTranslationSchema } },
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
  path: "/api/cms/resources/{resourceId}",
  tags: ["CMS"],
  summary: "Eliminar recurso (soft delete)",
  security: [{ BearerAuth: [] }],
  request: { params: resourceIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Recurso eliminado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

// =====================
// SPONSORS ROUTES
// =====================

registry.registerPath({
  method: "get",
  path: "/api/cms/sponsors",
  tags: ["CMS"],
  summary: "Obtener sponsors activos",
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ sponsors: z.array(sponsorSchema) })),
      "Lista de sponsors",
    ),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/sponsors/{sponsorId}",
  tags: ["CMS"],
  summary: "Obtener sponsor por ID",
  request: { params: sponsorIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ sponsor: sponsorSchema })), "Sponsor encontrado"),
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "post",
  path: "/api/cms/sponsors",
  tags: ["CMS"],
  summary: "Crear sponsor",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createSponsorSchema } },
    },
  },
  responses: {
    201: jsonContent(jsendSuccess(z.object({ sponsor: sponsorSchema })), "Sponsor creado"),
    400: errorResponses[400],
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "put",
  path: "/api/cms/sponsors/{sponsorId}",
  tags: ["CMS"],
  summary: "Actualizar sponsor",
  security: [{ BearerAuth: [] }],
  request: {
    params: sponsorIdParams,
    body: {
      content: { "application/json": { schema: updateSponsorSchema } },
    },
  },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ sponsor: sponsorSchema })), "Sponsor actualizado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/cms/sponsors/{sponsorId}",
  tags: ["CMS"],
  summary: "Eliminar sponsor (soft delete)",
  security: [{ BearerAuth: [] }],
  request: { params: sponsorIdParams },
  responses: {
    200: jsonContent(jsendSuccess(z.object({ message: z.string() })), "Sponsor eliminado"),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});

// =====================
// UI FRAGMENTS ROUTES
// =====================

registry.registerPath({
  method: "get",
  path: "/api/cms/fragments/{fragmentKey}",
  tags: ["CMS"],
  summary: "Obtener fragmento de UI por clave",
  request: {
    params: z.object({ fragmentKey: z.string() }),
    query: z.object({ lang: languageCodeSchema.optional() }),
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ fragment: uiFragmentSchema })),
      "Fragmento encontrado",
    ),
    404: errorResponses[404],
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/fragments/section/{section}",
  tags: ["CMS"],
  summary: "Obtener fragmentos por sección",
  request: {
    params: z.object({ section: uiSectionSchema }),
    query: z.object({ lang: languageCodeSchema.optional() }),
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ fragments: z.array(uiFragmentSchema) })),
      "Fragmentos de la sección",
    ),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/cms/fragments",
  tags: ["CMS"],
  summary: "Obtener todos los fragmentos (admin)",
  security: [{ BearerAuth: [] }],
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ fragments: z.array(uiFragmentSchema) })),
      "Lista completa de fragmentos",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "put",
  path: "/api/cms/fragments/{fragmentKey}",
  tags: ["CMS"],
  summary: "Upsert fragmento de UI",
  description: "Crea o actualiza un fragmento de UI (hot-swap)",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ fragmentKey: z.string() }),
    body: {
      content: { "application/json": { schema: createUIFragmentSchema } },
    },
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ fragment: uiFragmentSchema })),
      "Fragmento actualizado/creado",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/cms/fragments/{fragmentKey}/content",
  tags: ["CMS"],
  summary: "Actualizar contenido de fragmento (hot-swap)",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ fragmentKey: z.string() }),
    query: z.object({ lang: languageCodeSchema }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ content: z.record(z.string(), z.unknown()) }),
        },
      },
    },
  },
  responses: {
    200: jsonContent(
      jsendSuccess(z.object({ fragment: uiFragmentSchema })),
      "Contenido actualizado",
    ),
    401: errorResponses[401],
    403: errorResponses[403],
    404: errorResponses[404],
  },
});
