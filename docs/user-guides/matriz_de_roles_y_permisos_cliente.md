# 👤 Matriz de Roles y Permisos: Cliente

### 1. Resumen del Rol

* **Nombre del Rol:** Cliente / Usuario Registrado
* **Código/ID:** `ROLE_CLIENT`
* **Descripción General:** Es el usuario estándar de la plataforma. Al registrarse, obtiene una identidad digital que le permite gestionar su propio legajo de mascotas, iniciar trámites con la fundación (como adopciones) y mantener un historial de sus interacciones (donaciones, eventos).
* **Jerarquía:** Nivel Base. No tiene autoridad sobre otros usuarios ni acceso a paneles administrativos.

### 2. Matriz de Funcionalidades (Scope)

**A. Gestión de Mascotas y Comunidad**

* **Mis Mascotas:** Permiso para registrar sus propios animales en la plataforma (subir fotos, datos).
* **Alertas de Extravío:** Puede cambiar el estado de su mascota a "PERDIDO" para generar una alerta pública en la sección de "Perdidos y Encontrados".
* **Reporte de Hallazgo:** Puede publicar una alerta si encuentra una mascota en la calle para intentar localizar a su dueño.
* **Contacto:** Permiso para contactar a otros usuarios exclusivamente a través de los formularios de hallazgos (sistema de mensajería seguro).

**B. Interacción con la Fundación**

* **Adopciones:** Permiso para iniciar una solicitud de adopción (completar formulario) y realizar el seguimiento del estado del trámite (ver si fue Aprobada/Rechazada).
* **Donaciones:** Puede realizar donaciones monetarias (Mercado Pago) y tiene acceso exclusivo a su **Historial de Donaciones** para ver recibos pasados.
* **Eventos:** Puede inscribirse en actividades (Caminatas, Ferias) asegurando su cupo con su usuario.
* **Perfil:** Gestión total de sus datos personales (cambio de contraseña, dirección, teléfono).

### 3. Restricciones y Reglas

* **Privacidad (Ownership):** El cliente solo puede editar o eliminar los datos que le pertenecen (sus mascotas, su perfil). Si intenta modificar la mascota de otro usuario, el sistema bloqueará la acción.
* **Ceguera Administrativa:** No tiene acceso a ningún módulo de gestión (Finanzas, Listado de Voluntarios, CMS).
* **Bloqueo:** Si el usuario es sancionado por un Administrador (Banned), pierde inmediatamente el acceso a su cuenta y funcionalidades.

### 4. Diferencia con Usuario No Registrado (Invitado)

* **Donaciones:** El invitado puede donar, pero no generará un historial visible en el futuro. El Cliente sí.
* **Eventos:** El invitado puede ver la agenda, pero para inscribirse el sistema le exigirá crear una cuenta de Cliente.
* **Mascotas:** El invitado no puede registrar mascotas ni publicar alertas de pérdida; estas funciones son exclusivas del Cliente para asegurar la veracidad de los datos.