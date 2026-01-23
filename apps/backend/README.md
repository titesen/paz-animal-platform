# Backend API - Fundación Paz Animal

API RESTful para la gestión completa del ecosistema digital de Fundación Paz Animal, Corrientes, Argentina.

## 📋 Características

- **Autenticación robusta**: JWT (Access + Refresh), OAuth 2.0 (Google), 2FA
- **RBAC completo**: Roles (ADMIN, CLIENT, VOLUNTEER) + Tags (EVENT_ORGANIZER, CONTENT_MANAGER, etc.)
- **8 módulos funcionales**: Auth, Pets, Adoptions, Volunteers, Events, Finance, CMS, Media
- **Integración de pagos**: Mercado Pago con webhooks
- **CMS multilenguaje**: Soporte para español, inglés y portugués
- **Hot-swap UI**: Fragmentos de UI configurables sin deployments
- **Object Storage**: Cloudflare R2 para archivos multimedia
- **Documentación completa**: Swagger/OpenAPI 3.0

## 🏗️ Arquitectura

**Patrón**: Monolito Modular con separación en 3 capas

```
Controller → Service → Repository
    ↓          ↓          ↓
  HTTP    Business     Database
 Handler    Logic      Access
```

### Estructura de directorios

```
apps/backend/
├── src/
│   ├── modules/              # Módulos funcionales
│   │   ├── auth/            # Autenticación y autorización
│   │   ├── pets/            # Gestión de mascotas
│   │   ├── adoptions/       # Flujo de adopciones
│   │   ├── volunteers/      # Sistema de voluntarios
│   │   ├── events/          # Calendario de eventos
│   │   ├── finance/         # Donaciones y transacciones
│   │   ├── cms/             # Content Management System
│   │   └── media/           # Upload de archivos
│   ├── config/              # Configuración (env, logger, swagger)
│   ├── db/                  # Drizzle ORM setup y schemas
│   ├── middlewares/         # Auth, RBAC, error handlers
│   ├── types/               # TypeScript types compartidos
│   ├── utils/               # Utilidades (asyncHandler, etc.)
│   ├── app.ts               # Express app setup
│   └── server.ts            # Entry point
├── .env.example             # Template de variables de entorno
├── package.json
└── tsconfig.json
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# Básicos
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://app_paz_animal:dev_password@localhost:5432/paz_animal_local

# JWT (cambiar en producción)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars-long

# Admin inicial
ADMIN_DEFAULT_EMAIL=admin@pazanimal.org
ADMIN_DEFAULT_PASSWORD=Admin123!ChangeMe

# OAuth (opcional para desarrollo)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare R2 (opcional)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=paz-animal-media

# Mercado Pago (opcional)
MP_ACCESS_TOKEN=APP_USR-your-token
```

### 3. Levantar base de datos

Desde la raíz del proyecto:

```bash
npm run db:up
```

### 4. Ejecutar migraciones

```bash
npm run db:push
```

### 5. Seed datos iniciales (opcional)

```bash
npm run db:seed
```

### 6. Iniciar en desarrollo

```bash
npm run dev
```

El servidor estará disponible en: http://localhost:3000

## 📚 Documentación de la API

### Swagger UI (Interactivo)

```
http://localhost:3000/api-docs
```

Interfaz interactiva donde puedes:

- Ver todos los endpoints
- Probar requests directamente
- Ver esquemas de datos
- Autenticarte con JWT

### Especificación OpenAPI JSON

```
http://localhost:3000/api-docs.json
```

Puedes importar este archivo en:

- Postman
- Insomnia
- Generadores de SDK (openapi-generator)

### Endpoints de salud

```bash
# Health check completo (incluye DB)
GET http://localhost:3000/health

# Versión de la API
GET http://localhost:3000/version
```

## 🔐 Autenticación

La API usa **JWT con Access + Refresh Tokens**.

### 1. Registrarse

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Respuesta:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "role": "CLIENT"
    }
  }
}
```

El **Refresh Token** se retorna en una **cookie HTTP-Only** por seguridad.

### 3. Usar el token

En todas las rutas protegidas, incluir el header:

```
Authorization: Bearer <access_token>
```

### 4. Renovar token

Cuando el access token expire (15 minutos), usar:

```bash
POST /api/auth/refresh
# El refresh token se envía automáticamente vía cookie
```

## 🗂️ Módulos Principales

### 1. Auth (Autenticación)

- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/google` - Iniciar OAuth con Google
- `POST /api/auth/2fa/enable` - Activar 2FA (TOTP)
- `POST /api/auth/2fa/verify` - Verificar código 2FA

### 2. Pets (Mascotas)

- `GET /api/pets` - Listar mascotas (público)
- `GET /api/pets/:petId` - Ver detalle de mascota
- `POST /api/pets` - Crear mascota (ADMIN/VOLUNTEER)
- `PUT /api/pets/:petId` - Actualizar mascota
- `DELETE /api/pets/:petId` - Eliminar mascota (soft delete)

### 3. Adoptions (Adopciones)

- `POST /api/adoptions` - Solicitar adopción
- `GET /api/adoptions/my-applications` - Mis solicitudes
- `PATCH /api/adoptions/:applicationId/status` - Cambiar estado (ADMIN)
- `GET /api/adoptions/:applicationId` - Ver detalles

### 4. Volunteers (Voluntarios)

- `POST /api/volunteers/apply` - Postularse como voluntario
- `GET /api/volunteers/applications` - Ver aplicaciones (ADMIN)
- `PATCH /api/volunteers/:userId/approve` - Aprobar voluntario
- `POST /api/volunteers/:userId/tags` - Asignar tags

### 5. Events (Eventos)

- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento (EVENT_ORGANIZER)
- `POST /api/events/:eventId/register` - Registrarse en evento
- `POST /api/events/:eventId/attendance` - Check-in asistencia
- `GET /api/events/:eventId/registrations` - Ver registros

### 6. Finance (Finanzas)

- `POST /api/finance/donations/monetary` - Crear donación monetaria
- `POST /api/finance/donations/in-kind` - Registrar donación en especie
- `GET /api/finance/donations/monetary` - Listar donaciones (ADMIN)
- `GET /api/finance/transactions` - Ver transacciones (ADMIN)
- `GET /api/finance/summary` - Resumen financiero
- `POST /api/finance/webhooks/mercadopago` - Webhook de Mercado Pago

### 7. CMS (Content Management)

- `GET /api/cms/news` - Ver noticias publicadas
- `POST /api/cms/news` - Crear noticia (CONTENT_MANAGER)
- `GET /api/cms/resources` - Ver recursos educativos
- `GET /api/cms/sponsors` - Ver sponsors
- `GET /api/cms/fragments/:key` - Obtener fragmento de UI
- `PUT /api/cms/fragments/:key` - Actualizar fragmento (hot-swap)

### 8. Media (Archivos)

- `POST /api/media/upload` - Subir archivo a Cloudflare R2
- `DELETE /api/media/:key` - Eliminar archivo

## 🔒 Control de Acceso (RBAC)

### Roles

- **ADMIN**: Acceso completo al sistema
- **VOLUNTEER**: Operaciones de gestión según tags
- **CLIENT**: Usuario estándar (adopciones, eventos)

### Tags de Voluntarios

- `EVENT_ORGANIZER`: Crear y gestionar eventos
- `CONTENT_MANAGER`: Administrar contenido CMS
- `INTERVIEWER`: Realizar entrevistas de adopción
- `SOCIAL_MEDIA`: Gestionar redes sociales
- `PHOTOGRAPHER`: Permisos de fotografía

Los tags se asignan dinámicamente a usuarios con rol VOLUNTEER.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con cobertura
npm run test:coverage
```

## 🗄️ Base de Datos

### Drizzle ORM Scripts

```bash
# Generar migraciones desde schema
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Push schema directo a DB (desarrollo)
npm run db:push

# Abrir Drizzle Studio (GUI)
npm run db:studio

# Seed datos de prueba
npm run db:seed
```

### Estructura de Schemas

- **auth schema**: users, sessions, refresh_tokens
- **public schema**: pets, adoptions, events, donations, news, etc.

Separación de schemas permite permisos granulares a nivel PostgreSQL.

## 📊 Logging

Usa **Pino** para logging estructurado en JSON.

Niveles de log:

- `trace`: Detalles extremos
- `debug`: Información de depuración
- `info`: Eventos normales
- `warn`: Advertencias
- `error`: Errores recuperables
- `fatal`: Errores críticos

Ejemplo de log:

```json
{
  "level": "info",
  "time": 1706745600000,
  "pid": 12345,
  "hostname": "server-01",
  "msg": "Server started on port 3000",
  "environment": "development"
}
```

## 🛡️ Seguridad

- ✅ **Helmet.js**: Headers HTTP seguros
- ✅ **CORS**: Configuración estricta
- ✅ **Rate Limiting**: Protección contra DDoS
- ✅ **bcrypt**: Hashing de contraseñas (12 rounds)
- ✅ **JWT**: Tokens firmados con HS256
- ✅ **HTTP-Only Cookies**: Refresh tokens seguros
- ✅ **Input Validation**: Zod en todos los endpoints
- ✅ **SQL Injection Protection**: Drizzle ORM con prepared statements

## 🚀 Deployment

### Variables de entorno críticas

En producción, **DEBES** configurar:

```env
NODE_ENV=production
JWT_SECRET=<mínimo-32-caracteres-aleatorios>
JWT_REFRESH_SECRET=<mínimo-32-caracteres-aleatorios>
ADMIN_DEFAULT_PASSWORD=<contraseña-fuerte>
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Build para producción

```bash
npm run build
npm start
```

El build genera código JavaScript optimizado en `dist/`.

## 📝 Convenciones de Código

### Estilo

- **Indentación**: 2 espacios
- **Comillas**: Dobles para strings
- **Punto y coma**: Requerido
- **Naming**: camelCase para variables, PascalCase para tipos

### Estructura de Módulos

Cada módulo sigue:

```
module/
├── types.ts         # Interfaces y DTOs
├── repository.ts    # Acceso a datos (Drizzle)
├── service.ts       # Lógica de negocio
├── controller.ts    # Handlers HTTP
├── routes.ts        # Definición de rutas
├── swagger.schemas.ts  # Schemas OpenAPI
└── swagger.routes.ts   # Rutas documentadas
```

## 🤝 Contribuir

1. Crear branch desde `main`
2. Implementar feature/fix
3. Escribir tests
4. Actualizar documentación Swagger
5. Crear Pull Request

## 📄 Licencia

Privado - Fundación Paz Animal © 2025

## 📞 Soporte

Para dudas o problemas:

- Email: dev@pazanimal.org
- Documentación completa: Ver carpeta `/docs`
