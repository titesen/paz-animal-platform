# System Architecture

## **1\. Visión General**

El sistema está diseñado como una plataforma web unificada que sirve dos propósitos distintos: un portal público de alta concurrencia para adoptantes/donantes y un panel de administración robusto para la gestión interna de la fundación.

La arquitectura prioriza la **simplicidad operativa** (fácil de desplegar), la **integridad de datos** (PostgreSQL estricto) y la **experiencia de usuario** (SPA reactiva).

---

## **2\. Diagrama de Alto Nivel (C4 Context)**

````mermaid
graph TD
    UserPublic\[Usuario Público\] \--\>|HTTPS| CDN\[Cloudflare / Edge\]
    UserAdmin\[Administrador/Voluntario\] \--\>|HTTPS| CDN

    subgraph "Paz Animal Cloud (Railway)"
        CDN \--\>|Serves Static| Frontend\[Frontend SPA (React)\]
        Frontend \--\>|JSON/REST| Backend\[Backend API (Node.js)\]

        Backend \--\>|Query/ORM| DB\[(PostgreSQL V23)\]
        Backend \--\>|Read/Write| Storage\[Object Storage (R2)\]
    end

    subgraph "Integraciones Externas"
        Backend \--\>|OAuth| Google\[Google Identity\]
        Backend \--\>|Payments| MP\[Mercado Pago\]
    end```
---

## **3\. Componentes Clave**

### **A. Frontend (Single Page Application)**

* **Tecnología:** React \+ Vite \+ TypeScript.
* **Responsabilidad:** Renderizado de UI, gestión de estado del cliente, validación preliminar de formularios.
* **Patrón:** Feature-Sliced Design (simplificado).
* **Comunicación:** Consume la API REST del backend mediante fetch (gestionado por TanStack Query).

### **B. Backend (API RESTful)**

* **Tecnología:** Node.js \+ Express.
* **Responsabilidad:** Lógica de negocio, orquestación de servicios, autenticación, validación estricta de datos (Zod).
* **Patrón:** Arquitectura de 3 Capas (Controller \- Service \- Repository).
* **Estado:** Stateless (sin estado). La sesión se maneja vía JWT.

### **C. Capa de Datos (Persistencia)**

* **Tecnología:** PostgreSQL 15+.
* **ORM:** Drizzle ORM.
* **Estructura:** Multi-Schema.
  * auth: Tablas de usuarios, roles y permisos.
  * public: Tablas de negocio (mascotas, adopciones, transacciones).
* **Almacenamiento de Archivos:** Cloudflare R2 (Compatible S3) para imágenes de mascotas y documentos. No guardamos binarios en la BD.

---

## **4\. Flujos de Datos Críticos**

### **🐾 Flujo de Adopción**

1. **Inicio:** Usuario completa formulario en Frontend.
2. **Envío:** JSON payload viaja a POST /api/adoptions.
3. **Validación:** Backend (Zod) verifica formatos. Middleware verifica Auth (si aplica).
4. **Negocio:** Servicio verifica si la mascota sigue en estado AVAILABLE.
5. **Persistencia:** Se crea registro en adoption\_applications y interviews.
6. **Notificación:** (Futuro) Se dispara email al coordinador de voluntarios.

### **💰 Flujo de Donación**

1. **Intención:** Usuario elige monto en Frontend.
2. **Preferencia:** Backend genera una "Preferencia de Pago" en Mercado Pago.
3. **Pago:** Usuario paga en pasarela externa.
4. **Webhook:** Mercado Pago notifica a POST /api/webhooks/mercadopago.
5. **Conciliación:** Backend verifica firma, busca el usuario y registra la transacción en el Ledger inmutable (transactions).

---

## **5\. Decisiones Técnicas Fundamentales**

| Decisión | Elección | Justificación |
| :---- | :---- | :---- |
| **Monorepo** | npm workspaces | Permite compartir tipos (shared-types) entre Back y Front, asegurando que si cambia la DB, el Front se entere. |
| **Base de Datos** | Relacional (SQL) | La integridad referencial es crítica. Una adopción *debe* estar vinculada a una mascota real. NoSQL es riesgoso aquí. |
| **ORM** | Drizzle | Más ligero y rápido que Prisma. Genera SQL predecible y aprovecha la potencia de SQL nativo. |
| **Rendering** | Client-Side (CSR) | Menor costo de servidor. La experiencia de app nativa es mejor para formularios complejos (adopción). |

---

## **6\. Escalabilidad y Evolución**

### **Fase 1: Escalado Vertical (Actual)**

* Si el servidor se satura, aumentamos RAM/CPU en Railway.
* La base de datos maneja todo el tráfico transaccional.

### **Fase 2: Escalado Horizontal (Futuro)**

* El Backend es *stateless*, por lo que podemos levantar 5 réplicas del contenedor API detrás de un balanceador de carga sin cambiar código.
* Implementación de **Redis** para cachear respuestas de lectura frecuentes (ej. catálogo de mascotas).
````
