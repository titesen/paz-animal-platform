# Paz Animal Platform

Plataforma de gestión para Paz Animal - Monorepo con Backend (Express + TypeScript) y Frontend (React + Vite).

## 🏗️ Estructura del Proyecto

```
paz-animal-platform/
├── apps/
│   ├── backend/          # API REST con Express
│   └── frontend/         # SPA con React + Vite
├── packages/
│   ├── config/           # Configuraciones compartidas
│   └── shared-types/     # Tipos TypeScript compartidos
├── database/             # Scripts SQL de inicialización
└── docker-compose.yml    # PostgreSQL + pgAdmin
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Editar apps/backend/.env con tus valores
```

### 3. Levantar base de datos

```bash
npm run db:up
```

Acceder a pgAdmin: http://localhost:5050

- Email: `admin@pazanimal.org`
- Password: `root`

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Health Check: http://localhost:3000/health
- **API Documentation (Swagger)**: http://localhost:3000/api-docs

## 📦 Scripts Disponibles

- `npm run dev` - Ejecuta backend y frontend en modo desarrollo
- `npm run build` - Compila todos los workspaces
- `npm run test` - Ejecuta tests de todos los workspaces
- `npm run lint` - Ejecuta linter en todos los workspaces
- `npm run db:up` - Inicia contenedores de PostgreSQL y pgAdmin
- `npm run db:down` - Detiene contenedores de base de datos

## 📚 Documentación de la API

El backend incluye documentación completa de la API usando **Swagger/OpenAPI 3.0**.

### Acceder a la documentación interactiva

Una vez iniciado el servidor backend:

```
http://localhost:3000/api-docs
```

La interfaz Swagger UI permite:

- ✅ Explorar todos los endpoints disponibles
- ✅ Ver esquemas de request/response
- ✅ Probar endpoints directamente desde el navegador
- ✅ Autenticarse con JWT para probar rutas protegidas
- ✅ Ver ejemplos de uso para cada endpoint

### Exportar especificación OpenAPI

La especificación OpenAPI en formato JSON está disponible en:

```
http://localhost:3000/api-docs.json
```

Puedes importar este archivo en herramientas como Postman, Insomnia, o generar clientes SDK automáticamente.

### Módulos documentados

- **Auth** - Autenticación y gestión de sesiones (Register, Login, OAuth, 2FA)
- **Pets** - Gestión del catálogo de mascotas
- **Adoptions** - Flujo completo de adopciones
- **Volunteers** - Gestión de voluntarios y asignaciones
- **Events** - Calendario de eventos (ferias, caminatas, talleres)
- **Donations** - Procesamiento de donaciones (Mercado Pago)
- **CMS** - Gestión de contenido editorial (News, Resources, Sponsors, UI Fragments)
- **Media** - Upload de archivos a Cloudflare R2

## 🛠️ Stack Tecnológico

### Backend

- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod (validación)

### Frontend

- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router
- TanStack Query
- React Hook Form + Zod

### DevOps

- Docker Compose
- Husky (Git hooks)
- NPM Workspaces

## 📝 Estado del Proyecto

✅ Scaffolding completo
✅ Configuración de base de datos
✅ Arquitectura monorepo
🔄 Implementación de módulos en progreso

## 👨‍💻 Desarrollo

El proyecto utiliza una arquitectura monorepo con NPM Workspaces. Cada aplicación y paquete puede tener sus propias dependencias y scripts.

Para trabajar en un workspace específico:

```bash
# Ejecutar comando en backend
npm run dev -w apps/backend

# Ejecutar comando en frontend
npm run dev -w apps/frontend
```

## 📄 Licencia

Privado - Paz Animal © 2025
