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
│   └── env.ts               # Validación Zod de variables
├── db/                      # Capa de Persistencia
│   └── schema.ts            # Definición Drizzle
├── modules/                 # Dominios de Negocio
│   └── {domain-name}/       # (kebab-case)
│       ├── {domain}.controller.ts  # Manejo HTTP
│       ├── {domain}.service.ts     # Lógica de Negocio
│       ├── {domain}.repository.ts  # Consultas DB
│       ├── {domain}.routes.ts      # Router Express
│       └── {domain}.schema.ts      # Validación Zod (DTOs)
└── shared/                  # Código compartido
    ├── utils/               # Helpers puros
    └── middlewares/         # Middlewares globales

```

---

## 4. Estructura Detallada del Frontend (`apps/frontend`)

Seguimos el patrón **Feature-Based**.

```text
src/
├── components/
│   └── ui/                  # Componentes Base (Shadcn - Atomic Design)
│       ├── Button.tsx
│       └── Dialog.tsx
├── features/                # Módulos Funcionales
│   └── {feature-name}/      # (kebab-case)
│       ├── components/      # UI específica de la feature
│       ├── hooks/           # Lógica de estado (useFeature.ts)
│       ├── services/        # Llamadas API específicas
│       └── types/           # Tipos TypeScript locales
├── pages/                   # Rutas / Vistas
│   └── HomePage.tsx
└── lib/                     # Utilidades y Configuración
    └── utils.ts

```

---

## 5. Ubicación de Archivos Raíz y Configuración

Los archivos de configuración críticos deben residir estrictamente en la raíz del _workspace_ correspondiente.

- **Raíz del Monorepo:** `package.json`, `docker-compose.yml`, `.eslintrc.js`.
- **Raíz de Backend:** `apps/backend/package.json`, `apps/backend/tsconfig.json`.
- **Raíz de Frontend:** `apps/frontend/vite.config.ts`, `apps/frontend/tailwind.config.ts`.
