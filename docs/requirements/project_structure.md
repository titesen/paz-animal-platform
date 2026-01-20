# Estructura del Proyecto y Organización de Código

## 1. Visión General de Directorios (Top Level)

La raíz del repositorio organiza el código en aplicaciones desplegables (apps/) y librerías de soporte compartidas (packages/).

````
/paz-animal-monorepo
├── .github/              \# Workflows de CI/CD (Actions)
├── .husky/               \# Git Hooks (Pre-commit linting)
├── apps/                 \# Aplicaciones Ejecutables
│   ├── backend/          \# API REST (Node.js \+ Express)
│   └── frontend/         \# SPA (React \+ Vite)
├── packages/             \# Librerías Internas Compartidas
│   ├── shared-types/     \# Contratos e Interfaces (DTOs)
│   └── eslint-config/    \# Reglas de Linter compartidas
├── database/             \# Infraestructura de Datos
│   └── init.sql          \# Script V23 de inicialización
├── docker-compose.yml    \# Orquestación local
└── package.json          \# Root Config (Workspaces)```

---

## 2. Estructura del Backend (apps/backend)

Seguimos una **Arquitectura de Capas Verticales (Módulos)**. En lugar de agrupar por tipo técnico (todos los controladores juntos), agrupamos por **Dominio de Negocio**.

````

apps/backend/src/
├── config/ \# Configuración global (Env vars, Logger)
├── db/ \# Acceso a Datos
│ ├── schema.ts \# Definición Drizzle (Tablas)
│ └── index.ts \# Conexión Pool
├── middlewares/ \# Lógica transversal (Auth, ErrorHandler)
└── modules/ \# ⭐️ El Corazón del Negocio
├── pets/ \# Módulo de Mascotas
│ ├── pets.controller.ts \# HTTP (Request/Response)
│ ├── pets.service.ts \# Lógica de Negocio Pura
│ ├── pets.repository.ts \# Queries SQL (Drizzle)
│ ├── pets.routes.ts \# Definición de Endpoints
│ └── pets.schema.ts \# Validación Zod
├── auth/ \# Módulo de Autenticación
└── donations/ \# Módulo de Donaciones```

### **Principios de Separación (Backend)**

1. **Controller:** Solo traduce HTTP. No sabe de SQL. Valida input.
2. **Service:** Contiene las reglas ("Si la mascota es cachorro, no se puede adoptar sin entrevista").
3. **Repository:** Solo sabe hablar con la Base de Datos. Devuelve objetos de dominio.

---

## 3. Estructura del Frontend (apps/frontend)

Utilizamos una estructura **"Screaming Architecture"** orientada a **Features**. Si mirás la carpeta, debés saber qué hace la app.

````
apps/frontend/src/
├── assets/               \# Imágenes estáticas, fuentes
├── components/           \# Bloques de construcción visuales
│   ├── ui/               \# Átomos reutilizables (Button, Input, Card) \-\> Shadcn
│   └── sections/         \# Organismos grandes (Hero, Footer)
├── features/             \# ⭐️ Lógica de Estado y Negocio UI
│   ├── adoption/         \# Todo lo relacionado a adoptar
│   │   ├── components/   \# Componentes específicos de adopción
│   │   ├── hooks/        \# Lógica (useAdoptionForm)
│   │   └── services/     \# Llamadas a API (adoptionApi.ts)
│   └── donations/        \# Lógica de donaciones
├── hooks/                \# Hooks globales (useDarkMode, useAuth)
├── layouts/              \# Plantillas de página (MainLayout, AuthLayout)
├── lib/                  \# Utilidades puras (formatDate, currency)
├── pages/                \# Vistas (Rutas) que componen features
└── styles/               \# CSS Global y variables Tailwind```
### **Principios de Separación (Frontend)**

1. **Componentes UI (components/ui):** Son tontos. Reciben props y muestran datos. No hacen fetch.
2. **Páginas (pages/):** Solo orquestan. Llaman a los features y deciden el layout.
3. **Features (features/):** Contienen la complejidad. Si borrás la carpeta features/donations, desaparece toda la funcionalidad de donar, pero el resto de la app sigue viva.

---

## 4. Convenciones de Nomenclatura

Para mantener el orden mental, seguimos estas reglas estrictas:

### **Archivos**

* **General:** kebab-case (minúsculas con guiones).
  * ✅ user-profile.ts
  * ❌ UserProfile.ts
* **Componentes React:** PascalCase.
  * ✅ PrimaryButton.tsx
  * ❌ primary-button.tsx
* **Hooks:** camelCase con prefijo use.
  * ✅ useWindowSize.ts

### **Código**

* **Clases/Tipos:** PascalCase (PetInterface).
* **Variables/Funciones:** camelCase (getPetById).
* **Constantes:** UPPER\_SNAKE\_CASE (MAX\_RETRY\_COUNT).
* **Base de Datos:** snake\_case (tal cual Postgres).

---

## 5. Ubicación de Archivos Clave

| Archivo | Ubicación | Propósito |
| :---- | :---- | :---- |
| env.ts | apps/backend/src/config/ | Validación de variables de entorno con Zod. |
| index.css | apps/frontend/src/styles/ | Estilos globales y directivas de Tailwind. |
| routes.tsx | apps/frontend/src/ | Definición de rutas de React Router. |
| schema.ts | apps/backend/src/db/ | Fuente de verdad del esquema de base de datos. |

````
