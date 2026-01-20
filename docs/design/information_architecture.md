# Arquitectura de Información (IA)

# 1\. Estructura Organizacional

El sistema se divide en dos universos paralelos con modelos mentales distintos:

## A. Portal Público (Orientado a Tareas)

Diseñado para la exploración emocional y la conversión rápida (Adoptar/Donar).

* **Modelo:** Jerarquía amplia y poco profunda (Broad & Shallow).  
* **Prioridad:** Encontrar mascota \-\> Conectar \-\> Accionar.

## B. Panel Administrativo (Orientado a Objetos)

Diseñado para la gestión eficiente de recursos y datos.

* **Modelo:** Estructura Matricial (Dashboard central con módulos interconectados).  
* **Prioridad:** CRUD, Validación, Auditoría.

---

# 2\. Mapa del Sitio (Sitemap)

### **🌍 Vista Pública**

Plaintext

Home (Landing)  
├── Adoptar (Catálogo)  
│   ├── Filtros (Perro/Gato, Edad, Tamaño)  
│   └── Ficha de Mascota (Detalle)  
│       └── Solicitar Adopción (Formulario)  
├── Donar (Hub Financiero)  
│   ├── Donación Única (Mercado Pago)  
│   ├── Suscripción Mensual  
│   └── Donar Insumos (Logística)  
├── Voluntariado  
│   ├── Información y Requisitos  
│   └── Formulario de Postulación  
├── Blog / Novedades  
│   └── Artículo (Detalle)  
├── Eventos  
├── Nosotros (Institucional)  
└── Mi Perfil (Usuario Logueado)  
    ├── Mis Adopciones (Seguimiento)  
    ├── Mis Donaciones (Historial)  
    └── Configuración

### **🔐 Vista Admin / Voluntario (Dashboard)**

Plaintext

Dashboard (Resumen de Métricas)  
├── Gestión de Mascotas  
│   ├── Inventario (Tabla)  
│   ├── Altas y Bajas  
│   └── Historial Médico (Vacunas)  
├── Gestión de Adopciones  
│   ├── Kanban de Solicitudes (Nuevas \-\> Entrevista \-\> Aprobadas)  
│   └── Seguimientos Post-Adopción  
├── Finanzas  
│   ├── Transacciones (Mercado Pago Logs)  
│   └── Caja Chica (Efectivo Eventos)  
├── Usuarios y Roles  
│   ├── Staff  
│   └── Voluntarios (Turnos y Asignación)  
├── CMS (Contenidos)  
│   ├── Noticias  
│   └── Eventos  
└── Configuración del Sistema

---

# 3\. Sistemas de Navegación

### **Navegación Global (Header)**

Visible en todas las páginas públicas.

* **Izquierda:** Logo (Home).  
* **Centro:** Adoptar, Donar, Voluntariado, Blog.  
* **Derecha:** Ingresar / Registrarse (o Avatar de Usuario).  
* **CTA Principal:** Botón Donar (Color Acento).

### **Navegación Local (Admin Sidebar)**

Persistente a la izquierda en el Dashboard.

* Iconos \+ Etiquetas claras (Mascotas, Adopciones, Finanzas).  
* Estado activo resaltado con el color primario (\#029501).

### **Navegación Suplementaria**

* **Breadcrumbs (Migas de pan):** Vital para navegación profunda.  
  * *Ejemplo:* Inicio \> Adoptar \> Perros \> Firulais.  
* **Footer:** Enlaces legales, Redes Sociales, Contacto Rápido, Sitemap HTML.

---

# 4\. Sistemas de Búsqueda y Filtrado

La búsqueda es crítica en la sección de Adopciones. Utilizamos un sistema de **Búsqueda Facetada**.

### **Facetas de Filtrado (Mascotas)**

El usuario no "busca" escribiendo, sino filtrando:

1. **Especie:** Perro / Gato (Radio Button).  
2. **Edad:** Cachorro / Adulto / Senior (Checkbox).  
3. **Sexo:** Macho / Hembra.  
4. **Tamaño:** Chico / Mediano / Grande.  
5. **Estado Especial:** "Urgente", "Con necesidades especiales".

### **Búsqueda Global (Admin)**

Barra de búsqueda en el header del Dashboard ("Omnibox").

* **Alcance:** Indexa Mascotas (Nombre, Chip), Usuarios (Email, DNI), Solicitudes (ID).  
* **Comportamiento:** Autocomplete con salto directo a la entidad.

---

# 5\. Sistemas de Etiquetado (Labeling)

Utilizamos un lenguaje empático para el público y técnico para el admin.

| Concepto | Etiqueta Pública (Empática) | Etiqueta Admin (Técnica) |
| :---- | :---- | :---- |
| **User: Client** | "Adoptante" / "Donante" | Client User |
| **Pet: Stock** | "Nuestros Amigos" | Pet Inventory |
| **Pet: Dead** | "En nuestra memoria" 🌈 | Status: DECEASED |
| **Money: Give** | "Transformar Vidas" | Monetary Donation |
| **Auth: Login** | "Ingresar" | Sign In |
| **Action: Buy** | N/A (No vendemos) | N/A |

---

# 6\. Taxonomía y Metadatos

### **Vocabulario Controlado (Enums)**

Para asegurar la consistencia de los datos, nos adherimos estrictamente a los Enums definidos en la Base de Datos V23.

* **Estado de Mascota:** Disponible, En Proceso, Adoptado, Perdido.  
* **Roles de Usuario:** Admin, Voluntario, Cliente.

### **Etiquetas (Tags)**

Sistema flexible para agrupar contenido transversalmente.

* *Ejemplo:* Una noticia sobre "Campaña de Invierno" y un perro que necesita "Abrigo" pueden compartir el tag \#Invierno.

