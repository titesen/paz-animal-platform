# Deployment strategy

## 1. Arquitectura de Infraestructura

El sistema está diseñado para ser "Cloud Native" pero agnóstico al proveedor. Para la fase 1, utilizaremos servicios gestionados para minimizar el mantenimiento de DevOps.

### **🏗️ Componentes**

1. **Backend (Node.js API):**
   - Se despliega como un contenedor Docker (construido desde el Monorepo).
   - Escalado horizontal automático según carga de CPU/RAM.
2. **Frontend (React SPA):**
   - Se sirve como archivos estáticos (Nginx) o mediante un servidor ligero de Node para SSR (si aplica).
   - Cacheado por CDN global.
3. **Base de Datos (PostgreSQL V23):**
   - Instancia gestionada (Managed PostgreSQL).
   - Backups automáticos diarios.
4. **Almacenamiento (Object Storage):**
   - **Cloudflare R2** (Compatible con S3).
   - Aloja imágenes de mascotas, avatares y documentos.
   - _Ventaja:_ Sin costos de egreso (bandwidth).

---

## 2. Entornos (Environments)

Manejamos tres entornos estrictos para garantizar la estabilidad.

| Entorno        | Rama Git   | URL                 | Propósito                           | Base de Datos                |
| :------------- | :--------- | :------------------ | :---------------------------------- | :--------------------------- |
| **Local**      | feature/\* | localhost:5173      | Desarrollo diario.                  | Docker Local (paz_animal_db) |
| **Staging**    | develop    | stage.pazanimal.org | Pruebas de integración y QA visual. | DB Staging (Datos semilla)   |
| **Producción** | main       | pazanimal.org       | Uso real por usuarios y donantes.   | DB Producción (Datos reales) |

---

## 3. Pipeline de CI/CD (Automatización)

Utilizamos **GitHub Actions** para orquestar el ciclo de vida del software.

## 🧪 Fase 1: Integración Continua (CI)

_Trigger:_ Pull Request hacia main.

1. **Linting:** Verifica estilo de código (npm run lint).
2. **Type Check:** Verifica errores de TypeScript.
3. **Testing:** Ejecuta Vitest (Unitarios) y Supertest (Integración API).
4. Audit: Escaneo de vulnerabilidades (npm audit).
   Resultado: Si falla, se bloquea el Merge.

## 🚚 Fase 2: Entrega Continua (CD)

_Trigger:_ Merge aprobado a main.

1. **Build:** Construcción de artefactos de producción (npm run build).
2. **Containerize:** Generación de imagen Docker optimizada.
3. **Deploy:** Push a Railway.
4. **Post-Deploy:** Notificación a Discord/Slack ("Despliegue Exitoso").

---

## 4. Estrategia de Base de Datos (Migraciones)

Este es el punto más crítico. Las migraciones de esquema NO se ejecutan manualmente.

Comando de Producción:

El comando de inicio del contenedor Backend debe ser:

Bash

npm run db:migrate && node dist/server.js

- Esto asegura que **antes** de que la API empiece a recibir tráfico, la base de datos ya tenga las nuevas tablas/columnas.
- Usamos drizzle-kit migrate para este proceso seguro.

---

## 5. Gestión de Secretos (Variables de Entorno)

Nunca subimos archivos .env al repositorio.

Las variables se configuran en el panel de control de Railway/Cloudflare.

**Variables Críticas Requeridas:**

- DATABASE_URL (Connection String Postgres)
- JWT_SECRET (Firma de tokens)
- R2_ACCESS_KEY_ID & R2_SECRET_ACCESS_KEY (Storage)
- MERCADOPAGO_ACCESS_TOKEN (Pasarela de pagos)
- NODE_ENV (Debe ser production)

---

## 6. Procedimiento de Rollback (Emergencia)

Si un despliegue rompe la producción:

1. **No entres en pánico.**
2. Ir al Dashboard de Railway.
3. Seleccionar el despliegue anterior (el que estaba verde).
4. Clic en **"Rollback"** o **"Redeploy"**.
5. El sistema volverá a la versión estable en \< 1 minuto.
6. _Nota:_ Si hubo una migración de base de datos destructiva, se requerirá intervención manual SQL. Por eso, **evitamos migraciones destructivas** (siempre ADD COLUMN, nunca DROP COLUMN inmediato).

---

## 7. Scripts de Despliegue

Comandos útiles definidos en package.json:

JSON

"scripts": {
"build": "turbo run build",
"start": "node apps/backend/dist/main.js",
"db:migrate": "drizzle-kit migrate",
"docker:build": "docker build \-t paz-animal-monorepo ."
}
