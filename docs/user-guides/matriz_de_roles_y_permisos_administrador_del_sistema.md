# 🦅 Matriz de Roles y Permisos: Administrador del Sistema (Presidente)

### 1. Resumen del Rol

- **Nombre del Rol:** Presidente / Administrador del Sistema

- **Código/ID:** `ROLE_ADMIN`

- **Descripción General:** Es la máxima autoridad de la plataforma. Aunque ha delegado la operatividad diaria (finanzas, rrhh, adopciones), conserva una **"Visión Holística"** y privilegios de Superusuario para auditar, vetar decisiones, resolver conflictos y gestionar situaciones de crisis.

- **Jerarquía:** **Nivel 0 (Tope de Pirámide).** Tiene autoridad absoluta sobre `ROLE_TREASURER`, `ROLE_SECRETARY` y todo el staff de voluntarios.

---

### 2. Matriz de Funcionalidades (Scope)

El Admin tiene acceso total, pero su interacción principal cambia de "Hacer" a "Auditar/Corregir".

| Módulo / Sección | Funcionalidad           | Permiso        | Contexto de Uso (¿Cuándo lo usa?)                                                                                          |
| ---------------- | ----------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Gobernanza**   | Gestión de Altos Cargos | **C, R, U, D** | Es el **único** que puede nombrar o destituir al Tesorero y al Secretario.                                                 |
| **Finanzas**     | Auditoría y Corrección  | **C, R, U**    | Supervisa los balances del Tesorero. Puede corregir un ingreso mal cargado o realizar cargas de emergencia.                |
| **Adopciones**   | Supervisión de Trámites | **R, U, D**    | Puede ver todo el flujo. Tiene poder de **Veto** para cancelar una adopción aprobada por el Coordinador si detecta riesgo. |
| **Usuarios**     | Gestión de Crisis       | **U (Ban)**    | Puede bloquear inmediatamente a cualquier usuario (incluso voluntarios) ante conductas graves.                             |
| **Contenidos**   | Edición Global          | **C, R, U, D** | Puede editar o borrar cualquier noticia/post creado por el Content Manager sin pedir permiso.                              |
| **Sistema**      | Configuración Global    | **C, R, U**    | Acceso a variables de entorno, configuración de Mercado Pago y backups.                                                    |
| **Logs**         | Auditoría de Sistema    | **R**          | Acceso al historial de acciones de todos los voluntarios ("Quién borró qué").                                              |

---

### 3. La Doctrina de la "Visión Holística" (Reglas de Negocio)

Para garantizar que la delegación de tareas no implique pérdida de control, el sistema aplica las siguientes reglas para el Admin:

1. **Omnipotencia (Override Authority):**

  - El Admin puede modificar cualquier registro, incluso aquellos que están "bloqueados" para otros roles (ej. editar una transacción cerrada por el Tesorero).

  - *Nota:* Al hacerlo, el sistema genera una **Alerta de Auditoría Crítica** para dejar constancia del cambio forzado.

2. **Omnisciencia (Global Visibility):**

  - El Admin ignora las reglas de privacidad interna. Puede ver los datos de contacto de todos los adoptantes y el historial de acciones de todos los voluntarios.

3. **Indestructibilidad:**

  - El sistema impide que el Admin se borre a sí mismo o se quite el rol de `ROLE_ADMIN` (prevención de lockout).

---

### 4. Flujo de Navegación y Vistas (Dashboard Presidencial)

A diferencia del voluntario (que ve tareas pendientes), el Presidente ve **Métricas de Salud y Actividad**.

- **Landing Page (El "Centro de Comando"):**

- **Feed de Actividad Global:** Un ticker en tiempo real.

- *"Hace 5 min: Tesorero registró ingreso $50k."*

- *"Hace 10 min: Secretario dio de alta voluntario 'Ana'."*

- **KPIs Estratégicos:** Recaudación vs. Gastos del mes (Gráfico), % de Ocupación del Refugio.

- **Alertas Rojas:** "Caja con saldo negativo", "Denuncia de usuario recibida", "Servidor con alta latencia".

- **Menú Lateral Completo:**

1. 🦅 **Visión Global** (Dashboard)

2. 👥 **Equipo** (Gestión de Roles Jerárquicos)

3. 💰 **Finanzas** (Vista de Auditoría)

4. 🐶 **Adopciones** (Vista Supervisión)

5. ⚙️ **Configuración del Sistema**

6. 🛡️ **Logs de Seguridad**

---

### 5. Requerimientos Técnicos y de Seguridad

Dado el poder de este rol, la seguridad es paranoica.

- **Autenticación:**

  - **2FA (Doble Factor):** OBLIGATORIO. No puede desactivarlo.

  - **Login Alert:** Envío de email cada vez que se inicia sesión como Admin desde una IP nueva.

- **Sesión:**

  - **Time-to-live corto:** 15 minutos de inactividad cierran la sesión automáticamente (para evitar que deje la PC abierta en la fundación y alguien toque algo).

  - **Protección de Datos:**

  - Aunque puede ver todo, el sistema debe pedirle re-ingresar su contraseña antes de realizar acciones destructivas críticas (ej. "Borrar Base de Datos" o "Destituir Tesorero").