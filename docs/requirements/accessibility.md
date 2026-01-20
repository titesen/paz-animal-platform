# Accessibility

## 1. Propósito y Alcance

Este documento establece las directrices obligatorias para asegurar que la plataforma web de **Paz Animal** sea utilizable por la mayor cantidad de personas posible, independientemente de sus capacidades visuales, auditivas, motoras o cognitivas.

**Nuestra Promesa:** "Que ninguna barrera digital impida a una persona conectar con un animal que necesita hogar."

## **2\. Estándares de Accesibilidad (Compliance)**

Nos adherimos a las **Pautas de Accesibilidad al Contenido Web (WCAG) 2.1** en su nivel **AA**. Esto implica cumplir con los 4 principios fundamentales (POUR):

1. **Perceptible:** La información no puede ser invisible para los sentidos del usuario (ej. ceguera).
2. **Operable:** La interfaz no puede requerir interacciones que el usuario no pueda realizar (ej. requerir mouse).
3. **Comprensible:** La información y la operación de la interfaz deben ser claras.
4. **Robusto:** El contenido debe ser interpretado fielmente por una amplia variedad de agentes de usuario (navegadores y lectores de pantalla).

## 3. Diseño Inclusivo y Visual

## Contraste de Colores

Para garantizar la legibilidad, especialmente en exteriores (móvil bajo el sol) o para personas con visión reducida:

- **Texto Normal:** Relación de contraste mínima de **4.5:1** contra el fondo.
- **Texto Grande / Iconos:** Relación mínima de **3:1**.
- **Implementación Técnica:**
  - El verde primario \#029501 se usará sobre blanco (Ratio 5.1:1 ✅).
  - El texto gris nunca será más claro que slate-500.
  - **Prohibido:** Usar color como único medio de comunicación (ej. "Los campos en rojo están mal"). Siempre acompañar con texto o iconos.

## Tipografía y Espaciado

- **Fuente:** Se utilizan Inter y Outfit por su alta legibilidad y diferenciación clara de caracteres (ej. Il1).
- **Escalado:** La interfaz debe soportar un zoom del **200%** sin que se rompa el diseño ni aparezca scroll horizontal innecesario.
- **Unidades:** Usar rem en lugar de px en CSS para respetar la configuración de fuente base del navegador del usuario

## 4. Contenido Alternativo (Media)

Dado que somos una plataforma visual (fotos de mascotas), este punto es crítico.

## Imágenes (Mascotas y UI)

- **Imágenes Decorativas:** (Ej. patrones de fondo) Deben tener alt="" para que los lectores de pantalla las ignoren.
- **Fotos de Mascotas:**
  - **Obligatoriedad:** El campo alt_text es obligatorio en la Base de Datos (public.media).
  - **Formato:** "Perro mestizo negro jugando con una pelota roja".
  - **Solución Técnica:** En el CMS de carga, si el voluntario no escribe descripción, usaremos una API de IA (visión computacional) para sugerir una descripción automática editable.

## Video y Audio

- Todos los videos de historias de éxito deben tener **subtítulos cerrados (CC)**.
- No se permite la reproducción automática de audio (Autoplay) sin controles claros para detenerlo.

## 5. Navegación por Teclado y Foco

- **Indicador de Foco (Focus Ring):**
  - NUNCA eliminar el outline del CSS (outline: none) sin proveer un reemplazo visible.
  - **Estilo Paz Animal:** Usaremos un "anillo" verde y difuminado (ring-2 ring-primary ring-offset-2) provisto por Tailwind y Shadcn.
- **Orden Lógico:** El orden del foco debe seguir el flujo visual (izquierda a derecha, arriba a abajo).
- **Skip Links:** Implementar un enlace oculto "Saltar al contenido principal" al inicio del \<body\> para usuarios de teclado

## 6. Manejo de Formularios (Forms)

Los formularios de adopción y donación son complejos. Para evitar frustración:

- **Etiquetas (Labels):** Todo \<input\> debe tener un \<label\> asociado mediante htmlFor (React) o anidamiento. Los placeholder NO reemplazan a las etiquetas.
- **Mensajes de Error:**
  - Deben ser textuales e identificables.
  - Deben estar vinculados programáticamente al input usando aria-describedby="error-id".
  - _Ejemplo:_ "El DNI es obligatorio" (no solo poner el borde rojo).
- **Autocompletado:** Usar atributos autocomplete estándar (ej. autocomplete="email") para facilitar la carga a personas con dificultades motoras.

## 7. Compatibilidad con Tecnologías Asistivas

Aprovechamos la potencia de **Radix UI** (la base de Shadcn) para garantizar compatibilidad semántica.

- **ARIA (Accessible Rich Internet Applications):**
  - Usaremos roles ARIA solo cuando el HTML semántico no sea suficiente.
  - Ejemplo: Un botón hecho con \<div\> es un error. Usar \<button\>.
- **Modales y Drawers:** Deben atrapar el foco (Focus Trap) para que el usuario no navegue el fondo mientras el modal está abierto.
- **Notificaciones (Toasts):** Deben anunciarse a los lectores de pantalla usando role="status" o aria-live="polite"

## 8. Estrategia de Pruebas (QA)

La accesibilidad se verifica en cada fase del desarrollo (CI/CD).

## Pruebas Automatizadas (30%)

- **Linter:** eslint-plugin-jsx-a11y instalado en el repositorio para detectar errores en tiempo de codificación (ej. falta de alt).
- **CI Pipeline:** Ejecución de **Lighthouse CI** o **Axe Core** en los Pull Requests para bloquear código que baje el score de accesibilidad de 90\.

## Pruebas Manuales (70%)

- **Navegación por Teclado:** Intentar completar una adopción sin usar el mouse.
- **Lector de Pantalla:** Pruebas básicas con **NVDA** (Windows) o **VoiceOver** (Mac) en los flujos críticos.
- **Zoom:** Verificar la web al 200%.
