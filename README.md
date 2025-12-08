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

## 📦 Scripts Disponibles

- `npm run dev` - Ejecuta backend y frontend en modo desarrollo
- `npm run build` - Compila todos los workspaces
- `npm run test` - Ejecuta tests de todos los workspaces
- `npm run lint` - Ejecuta linter en todos los workspaces
- `npm run db:up` - Inicia contenedores de PostgreSQL y pgAdmin
- `npm run db:down` - Detiene contenedores de base de datos

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
