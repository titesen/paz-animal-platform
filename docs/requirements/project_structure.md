# Estructura del Proyecto y Organización de Código

## 1. Visión General de Directorios (Top Level)

La raíz del repositorio organiza el código en aplicaciones desplegables (`apps/`).

```text
/paz-animal-platform
├── .github/              # Workflows de CI/CD (Actions)
├── .husky/               # Git Hooks (Pre-commit linting)
├── apps/                 # Aplicaciones Ejecutables
│   ├── backend/          # API REST (Node.js + Express)
│   └── frontend/         # SPA (React + Vite)
├── database/             # Infraestructura de Datos
│   └── init.sql          # Script V23 de inicialización
├── docs/                 # Documentación del proyecto
├── docker-compose.yml    # Orquestación local
└── package.json          # Root Config (Workspaces)
```

---

## 2. Estructura del Backend (`apps/backend`)

Seguimos una **Arquitectura de Capas Verticales (Módulos)**. En lugar de agrupar por tipo técnico (todos los controladores juntos), agrupamos por **Dominio de Negocio**.

```text
apps/backend/src/
├── config/                     # Configuración global
│   ├── env.ts                  # Validación Zod de variables de entorno
│   ├── logger.ts               # Configuración de Pino
│   ├── redis.ts                # Configuración de ioredis
│   └── swagger.config.ts       # Configuración de Swagger/OpenAPI
├── db/                         # Acceso a Datos
│   ├── index.ts                # Conexión Pool (Singleton)
│   ├── schema/                 # Definiciones Drizzle (por dominio)
│   │   ├── enums.ts            # Enumerados de PostgreSQL
│   │   ├── auth.ts             # Tablas de identidad y acceso
│   │   ├── pets.ts             # Tablas de mascotas
│   │   ├── adoptions.ts        # Tablas de adopciones
│   │   ├── finance.ts          # Tablas de finanzas
│   │   ├── cms.ts              # Tablas de CMS
│   │   ├── events.ts           # Tablas de eventos
│   │   ├── volunteers.ts       # Tablas de voluntarios
│   │   ├── interactions.ts     # Tablas polimórficas (comments, likes, reports)
│   │   ├── transversal.ts      # Tablas polimórficas (media, addresses)
│   │   ├── audit.ts            # Tablas de auditoría y operaciones
│   │   ├── master.ts           # Catálogos maestros (countries, currencies, etc.)
│   │   └── index.ts            # Barrel export
│   ├── migrations/             # Migraciones generadas por drizzle-kit
│   └── seeds/                  # Datos iniciales de desarrollo
├── common/                     # Código compartido transversal
│   ├── constants/              # Constantes del sistema (paginación, etc.)
│   ├── errors/                 # Clases de error personalizadas (AppError, etc.)
│   ├── events/                 # Event Bus de dominio (Observer pattern)
│   ├── middlewares/            # Middlewares globales (auth, errorHandler, validate, rateLimiter)
│   ├── types/                  # Tipos compartidos
│   └── utils/                  # Helpers puros (asyncHandler, formatter, jwt, password, response)
├── integrations/               # Clientes de servicios externos
│   ├── cloudflare-r2/          # Object Storage (S3-compatible)
│   ├── email/                  # Servicio de email
│   ├── google-oauth/           # OAuth con Google
│   └── mercadopago/            # Pasarela de pagos
├── lib/                        # Lógica de integración de alto nivel
│   └── mercadopago.ts          # Funciones de Mercado Pago (preferences, payments)
├── app.ts                      # Configuración de Express (middlewares, rutas)
├── server.ts                   # Bootstrap del servidor (listen, graceful shutdown)
└── modules/                    # ⭐️ El Corazón del Negocio (8 módulos)
    ├── adoptions/              # Módulo de Adopciones
    ├── auth/                   # Módulo de Autenticación
    ├── cms/                    # Módulo de CMS (Noticias, Recursos)
    ├── events/                 # Módulo de Eventos
    ├── finance/                # Módulo de Finanzas (Donaciones, Transacciones)
    ├── media/                  # Módulo de Archivos Multimedia
    ├── pets/                   # Módulo de Mascotas
    └── volunteers/             # Módulo de Voluntarios
```

Cada módulo sigue una estructura homogénea:

```text
modules/{domain}/
├── {domain}.controller.ts          # Manejo HTTP (Request/Response)
├── {domain}.service.ts             # Lógica de Negocio Pura
├── {domain}.repository.ts          # Queries SQL (Drizzle)
├── {domain}.repository.interface.ts # Contrato del repositorio (DIP)
├── {domain}.routes.ts              # Definición de Endpoints + validate()
├── {domain}.dto.ts                 # Validación Zod (DTOs de entrada/salida)
├── {domain}.types.ts               # Tipos de dominio (opcional)
├── {domain}.swagger.routes.ts      # Documentación Swagger de rutas (opcional)
├── {domain}.swagger.schemas.ts     # Esquemas Swagger (opcional)
└── index.ts                        # Barrel export
```

### Principios de Separación (Backend)

- **Controller:** Solo traduce HTTP. No sabe de SQL. Delega validación al middleware `validate()`.
- **Service:** Contiene las reglas ("Si la mascota es cachorro, no se puede adoptar sin entrevista").
- **Repository:** Solo sabe hablar con la Base de Datos. Devuelve objetos de dominio. Implementa una interfaz (`repository.interface.ts`).

---

## 3. Estructura del Frontend (`apps/frontend`)

Utilizamos una estructura basada en **Componentes y Secciones**, con separación entre UI genérica y secciones de negocio.

```text
apps/frontend/src/
├── components/           # Bloques de construcción visuales
│   ├── ui/               # Componentes reutilizables (Button, Header, Footer)
│   └── sections/         # Secciones de negocio (Hero, FeaturedPets, DonationModule, Events, etc.)
├── hooks/                # Hooks globales (useDarkMode)
├── lib/                  # Utilidades puras (utils.ts)
├── pages/                # Vistas / Rutas (AboutPage)
├── styles/               # CSS Global y directivas de Tailwind
├── types/                # Tipos TypeScript compartidos
├── App.tsx               # Configuración de Router y Providers (rutas definidas inline)
└── main.tsx              # Punto de entrada
```

### Principios de Separación (Frontend)

- **Componentes UI (`components/ui`):** Son tontos. Reciben props y muestran datos. No hacen fetch.
- **Secciones (`components/sections`):** Componen la interfaz de las páginas principales (Hero, FeaturedPets, DonationModule, etc.).
- **Páginas (`pages/`):** Solo orquestan. Componen secciones y deciden el layout.

> **Nota:** Las rutas se definen inline en `App.tsx` usando React Router. Actualmente implementadas: `/` (Home) y `/nosotros` (About). Las rutas `/adoptar`, `/donar`, `/eventos`, `/admin/*` y `/mi-perfil` están planificadas pero aún no implementadas.

---

## 4. Convenciones de Nomenclatura

Para mantener el orden mental, seguimos estas reglas estrictas:

### Archivos

- **General:** `kebab-case` (minúsculas con guiones).
- ✅ `user-profile.ts`
- ❌ `UserProfile.ts`

- **Componentes React:** `PascalCase`.
- ✅ `PrimaryButton.tsx`
- ❌ `primary-button.tsx`

- **Hooks:** `camelCase` con prefijo `use`.
- ✅ `useWindowSize.ts`

### Código

- **Clases/Tipos:** `PascalCase` (`PetInterface`).
- **Variables/Funciones:** `camelCase` (`getPetById`).
- **Constantes:** `UPPER_SNAKE_CASE` (`MAX_RETRY_COUNT`).
- **Base de Datos:** `snake_case` (tal cual Postgres).

---

## 5. Ubicación de Archivos Clave

| Archivo           | Ubicación                          | Propósito                                              |
| ----------------- | ---------------------------------- | ------------------------------------------------------ |
| **env.ts**        | `apps/backend/src/config/`         | Validación de variables de entorno con Zod.            |
| **index.css**     | `apps/frontend/src/styles/`        | Estilos globales y directivas de Tailwind.             |
| **App.tsx**       | `apps/frontend/src/`               | Configuración de Router, Providers y rutas inline.     |
| **schema/**       | `apps/backend/src/db/`             | Directorio con definiciones Drizzle por dominio.       |
| **eventBus.ts**   | `apps/backend/src/common/events/`  | Event Bus de dominio tipado (Observer pattern).        |
| **pagination.ts** | `apps/backend/src/common/constants/` | Constantes compartidas de paginación.                |
