/**
 * @file OpenAPI Document Generator
 * @description Imports all module OpenAPI registrations and generates the full OpenAPI 3.0 document.
 */

import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { env } from "./env";
import { registry } from "./openapi-registry";

// Import response schemas (registers JSendError, JSendFail components)
import "./openapi-responses";

// Import module registrations (side-effect imports trigger registerPath calls)
import "../modules/auth/openapi";
import "../modules/pets/openapi";
import "../modules/adoptions/openapi";
import "../modules/volunteers/openapi";
import "../modules/media/openapi";
import "../modules/events/openapi";
import "../modules/finance/openapi";
import "../modules/cms/openapi";

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Paz Animal Platform API",
      version: "1.0.0",
      description: [
        "API RESTful para la Fundación Paz Animal - Corrientes, Argentina.",
        "",
        "Esta API gestiona el ecosistema digital completo de la fundación, incluyendo:",
        "- Gestión de adopciones y mascotas",
        "- Sistema de autenticación con RBAC (Admin, Client, Volunteer)",
        "- Procesamiento de donaciones vía Mercado Pago",
        "- CMS para contenido editorial",
        "- Gestión de eventos y voluntarios",
        "",
        "**Arquitectura**: Monolito Modular con separación en 3 capas (Controller-Service-Repository)",
        "**Base de Datos**: PostgreSQL 15+ con Drizzle ORM",
        "**Seguridad**: JWT (Access + Refresh), bcrypt, Helmet, CORS, Rate Limiting",
      ].join("\n"),
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
        url:
          env.NODE_ENV === "production"
            ? "https://api.pazanimal.org"
            : `http://localhost:${env.PORT}`,
        description:
          env.NODE_ENV === "production"
            ? "Production Server (Railway)"
            : "Development Server (Local)",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Autenticación y gestión de sesiones (Register, Login, OAuth)",
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
      {
        name: "Media",
        description: "Upload y gestión de archivos (Cloudflare R2)",
      },
    ],
  });
}
