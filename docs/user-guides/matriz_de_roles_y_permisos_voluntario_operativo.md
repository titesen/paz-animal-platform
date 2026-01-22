# 🤝 Matriz de Roles y Permisos: Voluntario Operativo

### 1. Resumen del Rol

- **Nombre del Rol:** Voluntario Operativo

- **Código de Sistema:** `ROLE_VOLUNTEER`

- **Descripción General:** Es el rol base para todo el staff operativo de la fundación. Todos los usuarios en este nivel comparten el mismo nivel de acceso básico, pero se diferencian por **Etiquetas de Especialización** (Tags).

- **Polifuncionalidad:** Un mismo usuario puede tener múltiples etiquetas (ej. ser *Content Manager* y *Paw Patrol* a la vez).

---

### 2. Clasificación de Especializaciones (Tags)

El sistema distingue dos tipos de voluntarios: los que tienen **Funcionalidad Activa** (herramientas digitales habilitadas hoy) y los que tienen **Rol Identificativo** (clasificación para gestión humana, sin herramientas web por ahora).

#### A. Especializaciones con Funcionalidad Activa (Web)

Estas etiquetas desbloquean menús y herramientas específicas en la plataforma.

| Especialización          | Responsabilidad         | Funcionalidad Habilitada en Plataforma                                                                                                           |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **📢 Content Manager**   | Gestión de Redes y Blog | **CMS & Medios:** Permiso para redactar noticias, subir fotos a la galería de mascotas y gestionar recursos de prensa.                           |
| **🎉 Eventos**           | Logística de Eventos    | **Agenda:** Permiso para crear/proponer eventos en el calendario y registrar la asistencia de otros voluntarios.                                 |
| **🦴 Coord. Adopciones** | Gestión de Trámites     | **Adopciones E2E:** Permiso para ver solicitudes, gestionar entrevistas, ver datos de contacto del adoptante y marcar mascotas como "Adoptadas". |

#### B. Especializaciones Identificativas (Campo)

Estas etiquetas **NO** habilitan funcionalidades extra en la web actualmente. Sirven exclusivamente para que el Administrador/Secretario pueda filtrar y organizar al personal.

| Especialización    | Tarea de Campo                                          | Estado en Plataforma                                                     |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| **🛠️ Paw Patrol** | Mantenimiento y reparación de infraestructura (cuchas). | **Solo Etiqueta.** (La ticketera de mantenimiento es una idea a futuro). |
| **🚗 Recorridos**  | Rutas de alimentación y limpieza en colonias.           | **Solo Etiqueta.** (El check-in por GPS es una idea a futuro).           |
| **🎨 Arte**        | Pintura y decoración de casitas.                        | **Solo Etiqueta.** (La galería de arte es una idea a futuro).            |
| **🎟️ Ventas**     | Atención en stands y venta de rifas.                    | **Solo Etiqueta.** Su recaudación es física y se rinde al Tesorero.      |
| **🏠 Tránsito**    | Cuidado temporal de animales en su hogar.               | **Solo Etiqueta.** Identifica disponibilidad de alojamiento.             |

---

### 3. Matriz de Permisos (Scope Detallado)

#### Funcionalidades Base (Comunes a TODOS los Voluntarios)

*Cualquier usuario con `ROLE_VOLUNTEER` tiene estos permisos:*

- **Perfil:** `READ`, `UPDATE` (Editar datos propios y foto).

- **Intranet/Novedades:** `READ` (Ver comunicados oficiales).

- **Directorio:** `READ` (Ver lista de compañeros y sus roles).

- **Mascotas:** `READ` (Ver catálogo interno con datos sensibles).

- **Sugerencias:** `CREATE` (Enviar buzón de mejora).

- **Finanzas:** **ACCESO DENEGADO** (Ceguera financiera total).

#### Funcionalidades Específicas (Por Etiqueta Activa)

**1. Si tiene tag `CONTENT_MANAGER`:**

- **Blog/Noticias:** `CREATE`, `UPDATE` (Borradores).

- **Galería Mascotas:** `CREATE`, `UPDATE` (Subir fotos/videos).

**2. Si tiene tag `EVENT_ORGANIZER`:**

- **Eventos:** `CREATE`, `UPDATE` (Proponer fechas, tomar lista).

**3. Si tiene tag `ADOPTION_COORD`:**

- **Solicitudes:** `READ`, `UPDATE` (Cambiar estado: Entrevista -> Aprobada).

- **Datos Adoptante:** `READ` (Ver teléfono/email para contactar).

- **Estado Mascota:** `UPDATE` (Cambiar a "Reservado" o "Adoptado").

---

### 4. Restricciones del Rol

- **Finanzas:** Ningún voluntario (ni siquiera el de Ventas o Eventos) puede ver balances, cuentas bancarias o el dashboard financiero.

- **Gestión de Usuarios:** No pueden crear ni borrar otros usuarios.

- **Configuración:** No tienen acceso al panel de administración global.