# Design System Document (DSD)

# 1\. Visión Estratégica

### **Propósito**

Resolver la fragmentación visual y acelerar el desarrollo de la plataforma "Paz Animal", proporcionando una fuente única de verdad para desarrolladores y diseñadores.

### **Principios de Diseño**

1. **Orgánico y Tecnológico:** Combinamos la suavidad de la naturaleza (bordes redondeados, verdes vibrantes) con la precisión del software moderno (glassmorphism, micro-interacciones).  
2. **Accesibilidad Primero:** No es una opción. El contraste, el tamaño de fuente y los estados de foco están integrados en el núcleo.  
3. **Contenido como Protagonista:** La UI debe ser invisible. Las fotos de los animales son lo que importa; el diseño solo las enmarca.

---

# 2\. Fundamentos Visuales (Design Tokens)

### **🎨 Paleta de Colores**

Nuestra paleta usa la escala **Slate** para neutros y un sistema semántico para acciones.

| Token | Rol | Color (Light) | Color (Dark) | Uso |
| :---- | :---- | :---- | :---- | :---- |
| **Primary** | Identidad | \#029501 (Paz Green) | \#22C55E (Green 500\) | Botones principales, Links activos, Bordes de foco. |
| **Secondary** | Soporte | \#E6F4E6 (Mint 50\) | \#1E293B (Slate 800\) | Fondos de tarjetas, Badges suaves. |
| **Accent** | Llamada a Acción | \#FF9F1C (Warm Amber) | \#F59E0B (Amber 500\) | Botones de "Donar", Alertas importantes. |
| **Destructive** | Error/Peligro | \#EF4444 (Red 500\) | \#7F1D1D (Red 900\) | Borrar datos, Cancelar adopción. |
| **Background** | Canvas | \#FFFFFF (White) | \#020617 (Slate 950\) | Fondo general de la página. |
| **Surface** | Contenedores | \#F8FAFC (Slate 50\) | \#0F172A (Slate 900\) | Modales, Cards, Sidebars. |

### **✒️ Tipografía**

Combinación de **Geometric Sans** (Títulos) con **Humanist Sans** (Lectura).

* **Display (Títulos):** Outfit o Plus Jakarta Sans.  
  * Pesos: Bold (700), SemiBold (600).  
  * Carácter: Redondeado, amigable, moderno.  
* **Body (Cuerpo):** Inter.  
  * Pesos: Regular (400), Medium (500).  
  * Carácter: Altamente legible, neutro.

### **📐 Espaciado y Radio**

* **Grid Base:** 4px (0.25rem). Todos los márgenes y paddings son múltiplos de 4 (ej. p-4 \= 16px).  
* **Border Radius:**  
  * **Botones/Inputs:** rounded-lg (0.5rem).  
  * **Tarjetas:** rounded-xl (0.75rem).  
  * **Contenedores Grandes:** rounded-2xl (1rem).  
  * *Nota:* Nunca usar bordes rectos (0px) a menos que sea una tabla densa.

---

# 3\. Catálogo de Componentes

Utilizamos una arquitectura atómica pragmática basada en **Shadcn/UI**.

### **Átomos (UI Kit Básico)**

* **Button:** Variantes default (Verde), destructive (Rojo), outline (Borde verde), ghost (Transparente), link. Soporte para isLoading (Spinner).  
* **Input / Textarea:** Con soporte para estados error (borde rojo) y focus (anillo verde).  
* **Badge:** Chips para estados (Adopción, Urgente). Variantes solid y outline.  
* **Avatar:** Círculo para usuarios, Cuadrado redondeado para mascotas. Fallback con iniciales.  
* **Skeleton:** Bloques grises pulsantes para estados de carga.

### **Moléculas (Componentes Compuestos)**

* **PetCard:** Imagen (cover) \+ Nombre \+ Badge de Estado \+ Botón Icono "Like".  
* **Toast:** Notificaciones flotantes (Éxito, Error, Info).  
* **Dialog (Modal):** Ventanas emergentes para confirmaciones o formularios rápidos.  
* **Drawer:** Menú lateral deslizante para filtros en móvil.

### **Organismos (Complejos)**

* **Masonry Grid:** Grilla asimétrica para galería de fotos de mascotas.  
* **Bento Grid:** Layout de dashboard o home (Cajas de distintos tamaños encajadas).  
* **DonationForm:** Wizard de pasos (Monto \-\> Datos \-\> Pago) con validación en tiempo real.

---

# 4\. Patrones de UX e Interacción

### **🎭 Tono y Voz (Microcopy)**

* **Error:** No culpar al usuario.  
  * ❌ "Has introducido mal el email."  
  * ✅ "No reconocemos ese formato de email. ¿Podrías revisarlo?"  
* **Éxito:** Celebrar las pequeñas victorias.  
  * ✅ "¡Genial\! Tu solicitud de adopción fue enviada."

### **✨ Micro-interacciones**

* **Hover:** Elevación suave (translate-y-1) y aumento de sombra (shadow-lg) en tarjetas clicables.  
* **Click:** Efecto de "presión" (scale-95) en botones.  
* **Transiciones:** Siempre suaves (duration-300 ease-in-out). Nunca cambios bruscos de estado.

### **🌑 Modo Oscuro**

* No usar negro puro (\#000000). Usar Slate 950.  
* Reducir la saturación de los colores de acento si vibran demasiado sobre fondo oscuro.  
* Las sombras se invierten: en lugar de sombra negra, usamos "resplandor" suave o bordes más claros (border-slate-800).

---

# 5\. Gobernanza y Mantenimiento

### **Control de Cambios**

Cualquier cambio en los tokens de diseño (ej. cambiar el verde principal) debe:

1. Discutirse en un Issue de GitHub.  
2. Actualizar la configuración de tailwind.config.ts.  
3. Documentarse en el CHANGELOG.md.

### **Recursos**

* **Iconos:** Librería Lucide React (Trazo 2px, redondeados).  
* **Ilustraciones:** Undraw o SVGs personalizados con el color primario.