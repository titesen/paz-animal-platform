## System Architecture

### 1. Visión General

El sistema está diseñado como una plataforma web unificada que cumple dos propósitos distintos: un **portal público** de alta concurrencia para adoptantes/donantes y un **panel de administración** robusto para la gestión interna de la fundación.

La arquitectura prioriza tres pilares fundamentales:

- **Simplicidad operativa:** Fácil de desplegar y mantener.
- **Integridad de datos:** Uso de PostgreSQL estricto.
- **Experiencia de usuario:** SPA reactiva y fluida.

---

### 2. Diagrama de Alto Nivel (C4 Context)

A continuación, el código fuente para generar el diagrama de flujo en herramientas compatibles con Mermaid (como GitHub o editores de Markdown).

```mermaid
graph TD
    UserPublic[Usuario Público] -->|HTTPS| CDN[Cloudflare / Edge]
    UserAdmin[Administrador/Voluntario] -->|HTTPS| CDN

    subgraph "Paz Animal Cloud (Railway)"
        CDN -->|Serves Static| Frontend[Frontend SPA (React)]
        Frontend -->|JSON/REST| Backend[Backend API (Node.js)]

        Backend -->|Query/ORM| DB[(PostgreSQL V23)]
        Backend -->|Read/Write| Storage[Object Storage (R2)]
    end

    subgraph "Integraciones Externas"
        Backend -->|OAuth| Google[Google Identity]
        Backend -->|Payments| MP[Mercado Pago]
    end

```

---

### 3. Componentes Clave

#### A. Frontend (Single Page Application)

- **Tecnología:** React + Vite + TypeScript.
- **Responsabilidad:** Renderizado de UI, gestión de estado del cliente, validación preliminar de formularios.
- **Patrón:** Feature-Sliced Design (simplificado).
- **Comunicación:** Consume la API REST del backend mediante `fetch` (gestionado por TanStack Query).

#### B. Backend (API RESTful)

- **Tecnología:** Node.js + Express.
- **Responsabilidad:** Lógica de negocio, orquestación de servicios, autenticación, validación estricta de datos (Zod).
- **Patrón:** Arquitectura de 3 Capas (Controller - Service - Repository).
- **Estado:** _Stateless_ (sin estado). La sesión se maneja vía JWT.

#### C. Capa de Datos (Persistencia)

- **Tecnología:** PostgreSQL 15+.
- **ORM:** Drizzle ORM.
- **Estructura:** Multi-Schema.
- `auth`: Tablas de usuarios, roles y permisos.
- `public`: Tablas de negocio (mascotas, adopciones, transacciones).

- **Almacenamiento de Archivos:** Cloudflare R2 (Compatible con S3) para imágenes de mascotas y documentos. _Nota: No guardamos binarios en la BD._

---

### 4. Flujos de Datos Críticos

#### 🐾 Flujo de Adopción

1. **Inicio:** El usuario completa el formulario en el Frontend.
2. **Envío:** El payload JSON viaja a `POST /api/adoptions`.
3. **Validación:** El Backend (Zod) verifica formatos. Un middleware verifica la Auth (si aplica).
4. **Negocio:** El servicio verifica si la mascota sigue en estado `AVAILABLE`.
5. **Persistencia:** Se crea un registro en `adoption_applications` e `interviews`.
6. **Notificación:** (Futuro) Se dispara un email al coordinador de voluntarios.

#### 💰 Flujo de Donación

1. **Intención:** El usuario elige el monto en el Frontend.
2. **Preferencia:** El Backend genera una "Preferencia de Pago" en Mercado Pago.
3. **Pago:** El usuario paga en la pasarela externa.
4. **Webhook:** Mercado Pago notifica a `POST /api/webhooks/mercadopago`.
5. **Conciliación:** El Backend verifica la firma, busca al usuario y registra la transacción en el Ledger inmutable (`transactions`).

---

### 5. Decisiones Técnicas Fundamentales

| Decisión          | Elección          | Justificación                                                                                                                   |
| ----------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**      | npm workspaces    | Permite compartir tipos (`shared-types`) entre Back y Front, asegurando que si cambia la DB, el Front se entere inmediatamente. |
| **Base de Datos** | Relacional (SQL)  | La integridad referencial es crítica. Una adopción debe estar vinculada a una mascota real. NoSQL es riesgoso en este contexto. |
| **ORM**           | Drizzle           | Más ligero y rápido que Prisma. Genera SQL predecible y aprovecha la potencia de SQL nativo.                                    |
| **Rendering**     | Client-Side (CSR) | Menor costo de servidor. La experiencia de app nativa es mejor para formularios complejos (como el de adopción).                |

---

### 6. Escalabilidad y Evolución

**Fase 1: Escalado Vertical (Actual)**

- Si el servidor se satura, aumentamos RAM/CPU en Railway.
- La base de datos maneja todo el tráfico transaccional.

**Fase 2: Escalado Horizontal (Futuro)**

- El Backend es _stateless_, por lo que podemos levantar múltiples réplicas (ej. 5) del contenedor API detrás de un balanceador de carga sin cambiar el código.
- Implementación de **Redis** para cachear respuestas de lectura frecuentes (ej. catálogo de mascotas).
