# CHANGELOG

## [0.3.0] - 2026-04-07

**Hito:** Documentación alineada con el estado real del proyecto.

### Corregido

- **Documentación:** Reconciliación completa de 9 documentos de especificación con el estado real del código:
  - `project_structure.md` — Estructura actualizada: eliminado `packages/`, renombrado `shared/` → `common/`, `.schema.ts` → `.dto.ts`, `db/schema.ts` → `db/schema/` (directorio), 8 módulos documentados.
  - `structure_organization_and_naming_conventions.md` — Mismas correcciones de estructura y convenciones.
  - `data_schema.md` — Enums corregidos: `ADOPTION_PROCESS` → `IN_PROCESS`, adoption_status de 5 a 8 valores, agregada tabla `volunteers_volunteer_roles`.
  - `diccionario_de_datos_paz_animal.md` — Tabla `volunteers` actualizada (relación M:N via junction table), agregada entidad `volunteers_volunteer_roles`.
  - `software_design_patterns.md` — Agregados patrones: Observer/EventBus (backend), Graceful Shutdown. Actualizada ruta de middleware (`main.ts` → `app.ts`).
  - `technical_design_document_tdd_backend.md` — 8 módulos documentados con convención de archivos completa, error classes detalladas, Event Bus y graceful shutdown en observabilidad.
  - `technical_design_document_tdd_frontend.md` — Estructura actualizada a componentes/secciones (sin `features/`, `layouts/`), rutas marcadas con estado de implementación.
  - `technologies_and_dependencies.md` — Shadcn/UI marcado como pendiente, Pino confirmado (eliminado Winston como opción).
  - `CHANGELOG.md` — Agregadas versiones v0.2.0 y v0.3.0 con todo el trabajo de refactoring.

## [0.2.0] - 2026-04-07

**Hito:** Refactoring Arquitectónico — Arquitectura de Capas y Patrones de Diseño.

### Añadido

- **Arquitectura de Capas (SKL-PRO-001):**
  - Consolidación de concerns transversales en `common/` (middlewares, errors, types, utils).
  - Renombrado de archivos de módulo al patrón `{module}.{layer}.ts`.
  - Separación de DTOs (Zod) de tipos de dominio en archivos `{module}.dto.ts`.
  - Contratos de interfaz de repositorio (`{module}.repository.interface.ts`) en cada módulo.
  - Comunicación inter-módulo forzada a través del service layer.
  - Validación Zod delegada al middleware `validate()` en rutas (controllers thin).
  - Clases de error movidas a `common/errors/`.
- **Patrones de Diseño:**
  - **Graceful Shutdown:** Manejo de SIGTERM/SIGINT en `server.ts` — drena pool DB, desconecta Redis, timeout 30s.
  - **Observer/Event Bus:** `DomainEventBus` tipado con 6 eventos de dominio (user.registered, adoption.created, adoption.statusChanged, donation.created, donation.inKindCreated, volunteer.promoted).
  - **Pagination Constants:** Constantes compartidas en `common/constants/pagination.ts`, eliminando duplicación DRY.

### Corregido

- Fix bugs críticos: `inArray`, webhook HMAC, file orphans, paginación.

## [0.1.0] - 2025-12-08

**Hito:** Inicio Oficial de la Codificación (Kick-off de Desarrollo).

### Añadido

- **Arquitectura:** Inicialización del repositorio y configuración de **Monorepo** (Workspaces).
- **Backend:**
  - Instalación de Node.js + Express.
  - Configuración base de **Drizzle ORM** y conexión a base de datos.
  - Definición de variables de entorno tipadas con Zod.
  - 8 módulos de negocio: auth, pets, adoptions, finance, cms, events, volunteers, media.
  - Integraciones: Cloudflare R2, Email, Google OAuth, Mercado Pago.
- **Frontend:**
  - Inicialización de proyecto React + Vite.
  - Instalación de Tailwind CSS.
  - Estructura de carpetas components/ui, components/sections y pages.
- **Base de Datos:**
  - Script init.sql (V23) definitivo con soporte para esquemas auth y public.
  - Configuración de Docker Compose para entorno local.
- **Calidad:**
  - Setup de ESLint, Prettier y Husky (Pre-commit hooks).

## [0.0.1] - 2025-04-01

**Hito:** Fase de Diseño y Concepción.

### Añadido

- Definición de Requisitos del Sistema (SRS).
- Diseño de Identidad Visual (Paleta de colores #029501, Tipografía Outfit/Inter).
- Prototipado de UX/UI (Figma/Mockups) para flujos de Adopción y Donación.
- Diseño del Modelo de Entidad-Relación (DER) preliminar.
