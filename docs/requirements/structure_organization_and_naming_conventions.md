# Estructura, Organización y Convenciones de Nomenclatura

## 1. Filosofía de Organización

### Principio de Co-ubicación (Colocation)

Nos alejamos de la organización por "tipo técnico" (ej. tener una carpeta gigante `controllers/`) y abrazamos la organización por **Dominio Funcional**.

> **Regla:** Todo lo necesario para que una _feature_ funcione debe estar junto.

- **Ejemplo:** El controlador, el servicio, las rutas y los tests del módulo "Mascotas" viven agrupados en `modules/pets/`.

### Idioma del Código

Todo el código, comentarios técnicos, nombres de archivos y commits deben estar en **Inglés**.

- ✅ `getPets`, `auth.service.ts`
- ❌ `obtenerMascotas`, `servicio-auth.ts`

_(Excepción: Textos visibles para el usuario en el Frontend, conocidos como UI Strings)._

---

## 2. Convenciones de Nomenclatura (Naming)

### 📂 Carpetas (Directories)

Usamos **kebab-case** (minúsculas separadas por guiones) para todas las carpetas.

- ✅ `src/user-profile`
- ❌ `src/UserProfile`, `src/userProfile`

### 📄 Archivos (Files)

La convención depende del tipo de contenido:

| Tipo de Archivo         | Convención                | Ejemplo                                 |
| ----------------------- | ------------------------- | --------------------------------------- |
| **Componentes React**   | PascalCase                | `PetCard.tsx`, `PrimaryButton.tsx`      |
| **Clases / Modelos**    | PascalCase                | `User.ts`, `HttpError.ts`               |
| **Hooks**               | camelCase (prefijo `use`) | `useAuth.ts`, `useWindowSize.ts`        |
| **Lógica / Utilidades** | kebab-case                | `date-format.ts`, `api-client.ts`       |
| **Backend Modules**     | kebab-case + `.type`      | `pets.controller.ts`, `pets.service.ts` |
| **Configuración**       | kebab-case                | `tailwind.config.ts`, `package.json`    |

### 💻 Código (Variables y Funciones)

- **Variables y Funciones:** `camelCase` (ej. `const isActive`, `function getById`).
- **Booleanos:** Prefijos `is`, `has`, `can`, `should` (ej. `canEdit`, `isLoading`).
- **Constantes:** `UPPER_SNAKE_CASE` (ej. `MAX_FILE_SIZE`, `DEFAULT_PAGE_LIMIT`).
- **Interfaces/Tipos:** `PascalCase` (ej. `PetInterface`, `UserRole`).

---

## 3. Estructura Detallada del Backend (`apps/backend`)

Seguimos el patrón de **Módulos de Dominio**.

```text
src/
├── config/                  # Configuración global
│   ├── env.ts               # Validación Zod de variables
│   ├── logger.ts            # Configuración de Pino
│   ├── redis.ts             # Configuración de ioredis
│   └── swagger.config.ts    # Configuración de Swagger/OpenAPI
├── db/                      # Capa de Persistencia
│   ├── schema/              # Definiciones Drizzle (directorio por dominio)
│   │   ├── enums.ts         # Enumerados de PostgreSQL
│   │   └── ...              # auth.ts, pets.ts, adoptions.ts, etc.
│   ├── migrations/          # Migraciones (drizzle-kit)
│   └── seeds/               # Datos iniciales de desarrollo
├── modules/                 # Dominios de Negocio (8 módulos)
│   └── {domain-name}/       # (kebab-case)
│       ├── {domain}.controller.ts          # Manejo HTTP
│       ├── {domain}.service.ts             # Lógica de Negocio
│       ├── {domain}.repository.ts          # Consultas DB
│       ├── {domain}.repository.interface.ts # Contrato del repositorio (DIP)
│       ├── {domain}.routes.ts              # Router Express + validate()
│       ├── {domain}.dto.ts                 # Validación Zod (DTOs)
│       ├── {domain}.types.ts               # Tipos de dominio (opcional)
│       ├── {domain}.swagger.routes.ts      # Documentación Swagger (opcional)
│       ├── {domain}.swagger.schemas.ts     # Esquemas Swagger (opcional)
│       └── index.ts                        # Barrel export
├── common/                  # Código compartido transversal
│   ├── constants/           # Constantes del sistema (paginación, etc.)
│   ├── errors/              # Clases de error personalizadas (AppError, etc.)
│   ├── events/              # Event Bus de dominio (Observer pattern)
│   ├── middlewares/         # Middlewares globales (auth, errorHandler, validate, rateLimiter)
│   ├── types/               # Tipos compartidos
│   └── utils/               # Helpers puros (asyncHandler, formatter, jwt, password, response)
├── integrations/            # Clientes de servicios externos
│   ├── cloudflare-r2/       # Object Storage (S3-compatible)
│   ├── email/               # Servicio de email
│   ├── google-oauth/        # OAuth con Google
│   └── mercadopago/         # Pasarela de pagos
├── app.ts                   # Configuración de Express
└── server.ts                # Bootstrap + graceful shutdown
```

---

## 4. Estructura Detallada del Frontend (`apps/frontend`)

Seguimos un patrón basado en **Componentes y Secciones**.

```text
src/
├── components/
│   ├── ui/                  # Componentes reutilizables (Button, Header, Footer)
│   └── sections/            # Secciones de negocio (Hero, FeaturedPets, DonationModule, etc.)
├── hooks/                   # Hooks globales (useDarkMode)
├── pages/                   # Rutas / Vistas
│   └── AboutPage.tsx
├── lib/                     # Utilidades y Configuración
│   └── utils.ts
├── styles/                  # CSS Global y directivas de Tailwind
├── types/                   # Tipos TypeScript compartidos
├── App.tsx                  # Router, Providers y rutas inline
└── main.tsx                 # Punto de entrada
```

---

## 5. Ubicación de Archivos Raíz y Configuración

Los archivos de configuración críticos deben residir estrictamente en la raíz del _workspace_ correspondiente.

- **Raíz del Monorepo:** `package.json`, `docker-compose.yml`, `.eslintrc.js`.
- **Raíz de Backend:** `apps/backend/package.json`, `apps/backend/tsconfig.json`.
- **Raíz de Frontend:** `apps/frontend/vite.config.ts`, `apps/frontend/tailwind.config.ts`.
