# **Casos de Uso e Historias de Usuario**

## **1\. Definición de Actores (Personas)**

Antes de definir las historias, definimos quién las protagoniza:

* **🐶 Adoptante (Guest/User):** Persona que visita el sitio para buscar una mascota o aprender. Puede estar registrada o no.  
* **💸 Donante:** Persona que quiere ayudar económicamente o con insumos.  
* **🛡️ Administrador (Admin):** Staff de la fundación con acceso total al sistema.  
* **volunteer Voluntario:** Colaborador con permisos limitados (ej. puede ver solicitudes pero no borrar usuarios).

---

## **2\. Épica A: Catálogo y Búsqueda (Público)**

*El corazón de la plataforma: conectar miradas.*

### **US-A1: Filtrado de Mascotas**

Como Adoptante,

Quiero filtrar el listado de mascotas por especie (perro/gato), edad y tamaño,

Para encontrar rápidamente un compañero que se adapte a mi estilo de vida y espacio.

**Criterios de Aceptación:**

* \[ \] Debe existir un sidebar/modal con filtros de: Especie, Sexo, Edad (Cachorro/Adulto/Senior), Tamaño.  
* \[ \] Los resultados se actualizan en tiempo real o al dar click en "Aplicar".  
* \[ \] Si no hay resultados, mostrar un mensaje amigable ("No encontramos coincidencias, pero suscribite para avisarte").  
* \[ \] La URL debe cambiar para poder compartir la búsqueda (ej. ?species=dog\&size=medium).

### **US-A2: Ficha de Detalle de Mascota**

Como Adoptante,

Quiero ver el perfil completo de una mascota con sus fotos, historia y datos médicos,

Para enamorarme de ella y saber si soy apto para adoptarla.

**Criterios de Aceptación:**

* \[ \] Galería de fotos deslizable (Carousel) optimizada.  
* \[ \] Mostrar etiquetas claras: "Castrado", "Vacunado", "Requiere patio".  
* \[ \] Botón de acción flotante (CTA) "Quiero Adoptar" siempre visible en móviles.  
* \[ \] Sección de "Historia" (Rich Text).

---

## **3\. Épica B: Proceso de Adopción**

*Convertir la intención en acción.*

### **US-B1: Solicitud de Adopción**

Como Adoptante interesado,

Quiero completar un formulario con mis datos y condiciones de vivienda,

Para iniciar formalmente el trámite de adopción de una mascota específica.

**Criterios de Aceptación:**

* \[ \] El usuario debe estar logueado (Google/Email) para iniciar.  
* \[ \] El formulario valida campos obligatorios (Teléfono, Dirección, ¿Tiene otras mascotas?).  
* \[ \] Al enviar, el estado de la solicitud pasa a PENDING\_REVIEW.  
* \[ \] El usuario recibe un email de confirmación automático.

### **US-B2: Gestión de Solicitudes (Admin)**

Como Administrador,

Quiero ver un tablero con las solicitudes pendientes,

Para revisar los perfiles, contactar a los candidatos y aprobar o rechazar la adopción.

**Criterios de Aceptación:**

* \[ \] Vista tipo Tabla o Kanban con estados: Nueva, En Entrevista, Aprobada, Rechazada.  
* \[ \] Posibilidad de dejar notas internas sobre el candidato ("Llamar después de las 18hs").  
* \[ \] Botón para "Aprobar": Cambia el estado de la Mascota a RESERVED.

---

## **4\. Épica C: Donaciones y Finanzas**

*Sostener la misión.*

### **US-C1: Donación Monetaria Única**

Como Donante,

Quiero donar un monto específico a través de Mercado Pago,

Para ayudar a cubrir gastos veterinarios y de alimento.

**Criterios de Aceptación:**

* \[ \] El usuario puede elegir montos predefinidos ($1000, $5000) o ingresar uno propio.  
* \[ \] Al hacer click, redirige al Checkout de Mercado Pago (Preference).  
* \[ \] Al volver al sitio, ve una pantalla de agradecimiento personalizada.  
* \[ \] **Backend:** El Webhook de MP debe registrar la transacción en la BD automáticamente.

### **US-C2: Transparencia de Fondos**

Como Donante recurrente,

Quiero ver un contador o gráfico de "Objetivo Mensual",

Para saber cuánto falta para cubrir los gastos del refugio y motivarme a ayudar más.

**Criterios de Aceptación:**

* \[ \] Componente visual (Barra de progreso) en el Home.  
* \[ \] Los datos se alimentan de las transacciones reales aprobadas en el mes corriente.

---

## **5\. Épica D: Gestión de Contenido (Admin)**

*Mantener la plataforma viva.*

### **US-D1: Alta de Mascota (ABM)**

Como Voluntario,

Quiero crear un nuevo perfil de mascota subiendo sus datos y fotos,

Para que aparezca inmediatamente en el listado público.

**Criterios de Aceptación:**

* \[ \] Formulario seguro (Zod validation).  
* \[ \] Subida de imágenes "Drag & Drop".  
* \[ \] Las imágenes se comprimen y se suben a Cloudflare R2 antes de guardar el registro.  
* \[ \] Posibilidad de guardar como Borrador antes de publicar.

### **US-D2: Generación de Descripción con IA**

Como Voluntario con poco tiempo,

Quiero subir una foto y poner datos básicos (Nombre, Edad),

Para que el sistema genere una biografía emotiva automáticamente.

**Criterios de Aceptación:**

* \[ \] Botón "✨ Generar Bio con IA" en el formulario de alta.  
* \[ \] El texto generado es editable antes de guardar.  
* \[ \] El prompt interno debe especificar un tono "esperanzador y empático".

---

## **6\. Priorización (MVP)**

| Historia | Prioridad | Sprint Sugerido |
| :---- | :---- | :---- |
| **US-A1** (Filtrado) | 🔴 Alta | Sprint 1 |
| **US-D1** (Alta Mascotas) | 🔴 Alta | Sprint 1 |
| **US-C1** (Donación MP) | 🔴 Alta | Sprint 2 |
| **US-B1** (Solicitud) | 🟡 Media | Sprint 2 |
| **US-B2** (Gestión Solicitud) | 🟡 Media | Sprint 3 |
| **US-D2** (IA Bio) | 🟢 Baja | Sprint 4 (Nice to have) |

