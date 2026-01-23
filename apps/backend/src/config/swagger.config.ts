import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Paz Animal Platform API",
    version: "1.0.0",
    description: `
API RESTful para la Fundación Paz Animal - Corrientes, Argentina.

Esta API gestiona el ecosistema digital completo de la fundación, incluyendo:
- Gestión de adopciones y mascotas
- Sistema de autenticación con RBAC (Admin, Client, Volunteer)
- Procesamiento de donaciones vía Mercado Pago
- CMS para contenido editorial
- Gestión de eventos y voluntarios

**Arquitectura**: Monolito Modular con separación en 3 capas (Controller-Service-Repository)  
**Base de Datos**: PostgreSQL 15+ con Drizzle ORM  
**Seguridad**: JWT (Access + Refresh), bcrypt, Helmet, CORS, Rate Limiting
    `.trim(),
    contact: {
      name: "Fundación Paz Animal",
      email: "info@pazanimal.org",
      url: "https://pazanimal.org",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: env.NODE_ENV === "production" 
        ? "https://api.pazanimal.org" 
        : `http://localhost:${env.PORT}`,
      description:
        env.NODE_ENV === "production"
          ? "Production Server (Railway)"
          : "Development Server (Local)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: `
Token de acceso JWT obtenido tras login exitoso.

**Duración**: 15 minutos  
**Header**: \`Authorization: Bearer <access_token>\`

Para obtener un token, use el endpoint \`POST /api/auth/login\` o \`POST /api/auth/register\`.
        `.trim(),
      },
      RefreshToken: {
        type: "apiKey",
        in: "cookie",
        name: "refresh_token",
        description: `
Token de renovación almacenado en cookie HTTP-Only.

**Duración**: 7 días  
**Uso**: Permite obtener un nuevo access_token sin re-autenticar mediante \`POST /api/auth/refresh\`.
        `.trim(),
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Token de autenticación inválido o expirado",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "error" },
                message: { type: "string", example: "Token inválido o expirado" },
                code: { type: "string", example: "UNAUTHORIZED" },
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: "No tienes permisos para acceder a este recurso",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "error" },
                message: { type: "string", example: "Acceso denegado. Se requiere rol ADMIN" },
                code: { type: "string", example: "FORBIDDEN" },
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Datos de entrada inválidos",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "fail" },
                data: {
                  type: "object",
                  properties: {
                    errors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          field: { type: "string", example: "email" },
                          message: { type: "string", example: "Email inválido" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: "Recurso no encontrado",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "error" },
                message: { type: "string", example: "El recurso solicitado no existe" },
                code: { type: "string", example: "NOT_FOUND" },
              },
            },
          },
        },
      },
      RateLimitError: {
        description: "Demasiadas solicitudes - límite de tasa excedido",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", example: "error" },
                message: { 
                  type: "string", 
                  example: "Demasiadas solicitudes. Intenta nuevamente en 15 minutos" 
                },
                code: { type: "string", example: "RATE_LIMIT_EXCEEDED" },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Auth",
      description: "Autenticación y gestión de sesiones (Register, Login, OAuth, 2FA)",
    },
    {
      name: "Pets",
      description: "Gestión del catálogo de mascotas (CRUD, búsqueda, estados)",
    },
    {
      name: "Adoptions",
      description: "Flujo completo de adopciones (Solicitudes, entrevistas, aprobaciones)",
    },
    {
      name: "Volunteers",
      description: "Gestión de voluntarios y asignaciones de roles/tags",
    },
    {
      name: "Events",
      description: "Calendario de eventos (Ferias, caminatas, talleres)",
    },
    {
      name: "Donations",
      description: "Procesamiento de donaciones (Monetarias, materiales, Mercado Pago)",
    },
    {
      name: "CMS",
      description: "Gestión de contenido editorial (Noticias, recursos, páginas)",
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    "./src/modules/**/*.routes.ts",
    "./src/modules/**/*.controller.ts",
    "./src/types/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
