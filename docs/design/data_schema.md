# Data Schema & Model Specification

## 1. Topología de Base de Datos

El sistema utiliza una arquitectura **Multi-Schema** para separar la seguridad de la lógica de negocio, garantizando modularidad y protección de datos sensibles.

### 🔐 Esquema `auth` (Identidad y Acceso)

Este esquema gestiona la autenticación y autorización de usuarios.

| Tabla             | Descripción                                                                        | Relaciones Clave             |
| ----------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| **`users`**       | Identidad central (Admin, Cliente, Voluntario). Soporta OAuth (Google) y Password. | 1:N con `users_roles`.       |
| **`roles`**       | Catálogo fijo: `ADMIN`, `CLIENT`, `VOLUNTEER`.                                     | 1:N con `users_roles`.       |
| **`users_roles`** | Tabla pivote para asignar múltiples roles a un usuario.                            | Relaciona `users` ↔ `roles`. |

### 🌍 Esquema `public` (Negocio Core)

#### 🐾 Módulo de Mascotas (Pets)

| Tabla                 | Descripción                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| **`pets`**            | Registro maestro de animales. Maneja estado (`ADOPTION_AVAILABLE`, `OWNED`, `LOST`). |
| **`species`**         | Catálogo (Perro, Gato).                                                              |
| **`breeds`**          | Razas vinculadas a especies.                                                         |
| **`pets_vaccines`**   | Historial clínico (M:N con `vaccines_catalog`).                                      |
| **`lost_pet_alerts`** | Alertas activas de mascotas perdidas (1:1 con `pets`).                               |

#### 🏠 Módulo de Adopciones

| Tabla                       | Descripción                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- |
| **`adoption_applications`** | Solicitudes de adopción. Vincula `users` (cliente) con `pets`.                  |
| **`interviews`**            | Registro de entrevistas (**Polimórfico**: sirve para adopciones y voluntarios). |
| **`adoption_followups`**    | Seguimientos obligatorios post-adopción.                                        |

#### 💰 Módulo de Finanzas (Transparencia)

| Tabla                     | Descripción                                            |
| ------------------------- | ------------------------------------------------------ |
| **`transactions`**        | **Ledger Inmutable**. Pagos procesados (Mercado Pago). |
| **`monetary_donations`**  | Intenciones de donación (puede ser anónima).           |
| **`in_kind_donations`**   | Donaciones de insumos físicos (valor estimado).        |
| **`on_site_collections`** | Recaudación en efectivo/física en eventos.             |

#### 📰 CMS & Interacción

| Tabla          | Descripción                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------- |
| **`media`**    | **Polimórfica**. Archivos adjuntos para cualquier entidad (Fotos de perros, Avatar usuario). |
| **`news`**     | Noticias y novedades.                                                                        |
| **`events`**   | Eventos solidarios.                                                                          |
| **`comments`** | **Polimórfica**. Comentarios en noticias, eventos, etc.                                      |

---

## 2. Enumerados (Enums)

Valores estrictos permitidos en el sistema para garantizar la integridad referencial.

#### Estado de Mascota (`pet_status`)

- `ADOPTION_AVAILABLE` (En adopción)
- `ADOPTION_PROCESS` (En trámite/prueba)
- `OWNED` (Con dueño/Adoptado)
- `LOST` (Perdido)
- `DECEASED` (Fallecido)

#### Sexo (`pet_sex`)

- `MALE`
- `FEMALE`
- `UNKNOWN`

#### Estado de Adopción (`adoption_status`)

- `REQUESTED` (Solicitada)
- `INTERVIEW` (Entrevista pendiente)
- `APPROVED` (Aprobada)
- `REJECTED` (Rechazada)
- `WITHDRAWN` (Cancelada por usuario)

#### Origen de Webhook (`webhook_source`)

- `MERCADOPAGO`
- `STRIPE` (Futuro)

---

## 3. Relaciones Polimórficas (Estructura Lógica)

El sistema utiliza un patrón polimórfico para reducir la cantidad de tablas de unión repetitivas.

- **Campos Clave:** `entity_type` (VARCHAR) y `entity_id` (UUID).

**Entidades que implementan Polimorfismo:**

- **`media`**: Fotos asociadas a `PET`, `USER`, `NEWS`, `EVENT`.
- **`addresses`**: Direcciones físicas de `USER`, `EVENT`, `SPONSOR`.
- **`comments`**: Comentarios en `NEWS`, `EVENT`, `PET`.
- **`interviews`**: Entrevistas para `ADOPTION_APPLICATION`, `VOLUNTEER_APPLICATION`.

---

## 4. Estándares de Datos (API JSON)

Todas las respuestas de la API siguen el formato estandarizado **JSend**.

### ✅ Respuesta Exitosa (Success)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Mascota recuperada con éxito",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Firulais",
    "status": "ADOPTION_AVAILABLE",
    "images": [
      {
        "url": "https://cdn.pazanimal.org/pets/firulais-1.webp",
        "isMain": true
      }
    ]
  },
  "timestamp": "2025-10-08T10:00:00Z"
}
```

### ❌ Respuesta de Error (Fail/Error)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "La mascota solicitada no existe o fue eliminada.",
  "error": {
    "code": "PET_NOT_FOUND",
    "details": null
  },
  "data": null,
  "timestamp": "2025-10-08T10:05:00Z"
}
```

---

## 5. Datos de Semilla (Seeding)

Para el desarrollo local, el sistema se inicializa automáticamente con la siguiente información base:

- **Roles:** `ADMIN`, `CLIENT`, `VOLUNTEER`.
- **Especies:** Perro, Gato.
- **Razas:** Top 50 razas más comunes + "Mestizo".
- **Usuario Admin Default:** `admin@pazanimal.org` (La contraseña se configura en el archivo `.env`).

> **Nota Técnica:** Para ver la definición SQL exacta y los scripts de migración, consulta:
> `apps/backend/src/db/schema.ts` o `database/init.sql`.
