# **Technical Design Document (TDD) \- Backend**

## **1\. Introducción**

Visión General

El backend de Paz Animal es una **API RESTful Monolítica Modular** construida sobre Node.js. Actúa como la fuente de verdad centralizada para la gestión de adopciones, inventario de mascotas y procesamiento de donaciones. No es un microservicio, pero está estructurado internamente para permitir esa evolución si fuera necesario en el futuro.

Contexto

La fundación necesita digitalizar sus procesos manuales (Excel/Papel). El sistema debe garantizar la integridad de los datos (no perder donaciones, no duplicar adopciones) y exponer una interfaz rápida para el Frontend público.

Glosario

- **DTO (Data Transfer Object):** Objeto Zod que define qué datos entran/salen de la API.
- **V23:** Versión actual del esquema de base de datos Multi-Tenant.
- **R2:** Cloudflare R2 (Object Storage compatible con S3).
- **Polimórfico:** Relación de base de datos donde una tabla (ej. media) puede pertenecer a varias entidades (pets, news).

---

## **2\. Objetivos y No-Objetivos**

Objetivos del Diseño

1. **Integridad de Datos (Prioridad 1):** Uso de **PostgreSQL** con Constraints estrictas y transacciones ACID. Una adopción no puede quedar "a medias".
2. **Type-Safety Total:** Desde la DB (Drizzle) hasta el Controller (Zod), el flujo de datos debe estar tipado en TypeScript para evitar errores en tiempo de ejecución (undefined is not a function).
3. **Rendimiento:** Latencia de endpoints de lectura (GET /pets) \< 200ms (P95).

No-Objetivos

- **Microservicios:** En esta fase, la complejidad de orquestación supera los beneficios.
- **WebSockets en tiempo real:** Las notificaciones serán asíncronas (Email) o Polling en esta versión.

---

3\. Arquitectura del Sistema

Diagrama de Capas (Container Level)

````mermaid
graph TD
    Client\[Frontend / Postman\] \--\>|JSON/HTTP| API\_Gateway\[Express Router\]

    subgraph "Backend Core (Node.js)"
        API\_Gateway \--\>|Zod Validation| Controller\[Controller Layer\]
        Controller \--\>|DTO| Service\[Service Layer (Business Logic)\]
        Service \--\>|Entity| Repo\[Repository Layer (Drizzle)\]
    end

    Repo \--\>|SQL| DB\[(PostgreSQL V23)\]
    Service \--\>|Upload| R2\[Cloudflare R2\]
    Service \--\>|Queue| Bull\[Redis/BullMQ\]```
Patrones Arquitectónicos

* **Estilo:** Monolito Modular (Modular Monolith).
* **Diseño:** Arquitectura de 3 Capas (Controller \- Service \- Repository)11.
  * *Ventaja:* Desacopla la lógica de negocio del framework web (Express) y de la base de datos.

Tecnologías Clave

* **Runtime:** Node.js 20+ (LTS).
* **Framework:** Express 4 (Estándar de industria, fácil de migrar).
* **ORM:** **Drizzle ORM**. Elegido por sobre Prisma por su bajo *overhead* y control SQL directo.
* **Validación:** **Zod**.

---

4\. Diseño Detallado

Modelo de Datos (Database Design)

Utilizamos un esquema **Multi-Schema** en Postgres:

* auth: users, roles, permissions, sessions.
* public: pets, adoptions, donations, media.
* **Migraciones:** Gestionadas vía drizzle-kit migrate. Nunca se modifica la DB a mano.

Diseño de API (Estándar JSend)

Todas las respuestas siguen este formato JSON estricto:

**Éxito:**

```json
{
  "status": "success",
  "data": { "pet": { "id": 1, "name": "Firulais" } }
}
```

**Error:**

```json
{
  "status": "error",
  "message": "La mascota ya ha sido adoptada.",
  "code": "PET_ALREADY_ADOPTED"
}
```

Lógica de Negocio: Flujo de Donación

1. **Frontend:** Envía intención de donación (amount, email).
2. **Controller:** Valida input con Zod.
3. **Service:**
   * Llama a API Mercado Pago \-\> createPreference.
   * Registra transacción en DB estado PENDING.
4. **Webhook Controller:**
   * Recibe notificación de MP.
   * Valida firma de seguridad.
   * **Service:** Actualiza transacción a APPROVED y dispara email de agradecimiento (vía BullMQ).

Autenticación y Seguridad

* **AuthN:** JWT (Access Token 15min \+ Refresh Token 7 días).
* **AuthZ:** Middleware RBAC.
* TypeScript

router.post('/pets', requireRole('ADMIN'), createPet);

*
*

---

5\. Consideraciones de Implementación

Manejo de Errores

* Uso de una clase AppError personalizada que extiende Error.
* **Global Exception Filter:** Un middleware al final de app.js captura cualquier error no manejado, lo loguea en JSON y devuelve un 500 genérico al usuario (para no exponer Stack Traces).

Observabilidad

* **Logging:** Librería pino. Formato JSON estructurado.
  * Niveles: info (producción), debug (desarrollo).
* **Health Check:** Endpoint /health para monitoreo de uptime (Railway).

Estrategia de Pruebas

* **Unitarias:** Vitest. Foco en Services y utilidades puras.
* **Integración:** Supertest. Foco en Controllers. Se levanta una DB de prueba en Docker, se ejecuta el endpoint y se verifica que el dato persista.

---

6\. Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
| :---- | :---- | :---- |
| **Cuello de botella en DB** | La DB se satura por muchas lecturas públicas. | Implementar caché en memoria (Redis) para endpoints GET /pets23. |
| **Fallo en Webhook MP** | Se cobra pero no se registra la donación. | El Webhook debe ser idempotente y responder 200 solo tras guardar en DB. Logs críticos en Sentry. |
| **Complejidad de Tipos** | Drizzle \+ Zod \+ TS puede ser verborrágico. | Usar drizzle-zod para generar esquemas automáticamente desde la DB. |

---

7\. Plan de Implementación

1. **Semana 1:** Setup de Monorepo, Docker, Drizzle y Auth Module.
2. **Semana 2:** Módulo de Mascotas (CRUD) e integración con R2 (Imágenes).
3. **Semana 3:** Módulo de Adopciones y Donaciones (Mercado Pago).
4. **Semana 4:** Testing de integración y despliegue a Staging.

````
