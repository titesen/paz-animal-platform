# Estrategia de Auditoría y Control de Sistemas

### 1. Filosofía de Auditoría

El sistema debe ser capaz de reconstruir la historia de cualquier registro crítico bajo el principio de desconfianza cero: _verificamos, no confiamos ciegamente_.

> **Principio Rector:** "Si no está en el log o en la base de datos, no sucedió."

---

### 2. Registro de Eventos (Logging)

Definimos estrictamente qué se registra para permitir el análisis forense sin saturar el almacenamiento ni comprometer la privacidad.

#### 📝 Qué registrar (Eventos Críticos)

- **Seguridad:** Logins (exitosos y fallidos), cambios de contraseña, elevación de privilegios (de Cliente a Admin).
- **Financiero:** Creación de intenciones de pago, recepción de webhooks (Mercado Pago), transiciones de estado (`PENDING` -> `APPROVED`).
- **Negocio (Mascotas):** Cambios de estado en el inventario de vidas (ej. de `DISPONIBLE` a `ADOPTADO`).
- **Errores:** Excepciones no controladas (500 Internal Server Error) incluyendo _Stack Trace_ (**solo** en logs internos).

#### 🚫 Qué NO registrar (Privacidad & Ruido)

- **PII (Información Personal Identificable):** Contraseñas en texto plano, tokens de sesión completos, números de tarjeta de crédito (PCI DSS).
- **Ruido:** Peticiones `GET` a recursos estáticos (imágenes, CSS) o _Health Checks_ de infraestructura.

#### 💾 Formato y Almacenamiento

- **Formato:** JSON Estructurado (NDJSON) para facilitar el parseo automático.
- **Retención:** 30 días en caliente (Railway Logs), archivado en frío (R2) para cumplimiento legal a largo plazo.

**Ejemplo de Log:**

```json
{
  "level": "info",
  "time": "2026-01-20T10:00:00Z",
  "actor": "user_123",
  "action": "pet_update",
  "resource_id": "pet_555",
  "changes": {
    "status_old": "AVAILABLE",
    "status_new": "ADOPTED"
  }
}
```

---

### 3. Trazabilidad y "Soft Deletes"

Para cumplir con los requisitos de auditoría, **prohibimos la eliminación física** de datos en tablas maestras.

#### Estrategia de Borrado Lógico

En lugar de ejecutar `DELETE`, actualizamos el estado del registro.

```sql
-- NO hacemos esto: DELETE FROM users WHERE id=1;

-- SÍ hacemos esto:
UPDATE users
SET deleted_at = NOW(), is_active = FALSE
WHERE id=1;

```

**Beneficios:**

1. Permite recuperar datos borrados por error humano.
2. Mantiene la **integridad referencial** (ej. las donaciones históricas de un usuario "borrado" no quedan huérfanas).

#### Columnas de Auditoría (Schema Standard)

Todas las tablas críticas deben incluir:

- `created_at`: Fecha de creación (**Inmutable**).
- `updated_at`: Fecha de última modificación (Automático).
- `deleted_at`: Fecha de baja (Nulo por defecto).
- `created_by`: ID del usuario que originó el registro.

---

### 4. Controles de Acceso y Atribución

Para auditar correctamente, la identificación debe ser inequívoca.

- **Identidad Única:** No existen usuarios genéricos (como `admin` o `invitado`). Cada acción se vincula a un `user_id` nominal (ej. "Facundo González").
- **Contexto de Ejecución:** En cada _request_, el sistema registra:
- Dirección IP de origen.
- `User-Agent` (Dispositivo/Navegador).
- _Timestamp_ preciso (UTC).

---

### 5. No Repudio e Integridad de Datos

Garantizamos que un usuario no pueda negar haber realizado una acción crítica una vez completada.

#### Acciones Contractuales (Adopción)

Cuando un usuario "firma" digitalmente la adopción:

1. Se guarda un **Snapshot** del estado exacto del contrato en ese milisegundo.
2. Se registra la IP de aceptación.
3. Se envía un correo de confirmación que sirve como prueba externa inmutable.

#### Integridad Financiera (Ledger Inmutable)

La tabla `transactions` opera bajo lógica **Append-Only** (Solo Escritura) para los importes.

- **Regla:** Si una donación se registró erróneamente ($100 en vez de $1000), **NUNCA se edita la fila original**.
- **Corrección:** Se inserta una nueva transacción de anulación/reembolso y luego otra con el valor correcto. Esto deja un rastro contable perfecto y auditable.

---

### 6. Cumplimiento Normativo (Compliance)

Preparación para auditorías legales y Ley de Protección de Datos Personales (Habeas Data).

#### Derecho de Acceso y Supresión

- **Exportación:** Implementación de un mecanismo capaz de generar un archivo (ZIP/JSON) con "Todo lo que la plataforma sabe de mí" ante la solicitud del usuario.
- **Anonimización:** Si un usuario exige ser borrado ("Derecho al olvido"):
- Sus datos personales (Nombre, DNI, Email) se sobrescriben con `ANONYMIZED_USER`.
- Sus IDs internos y el historial de transacciones se mantienen intactos para asegurar que la caja de la fundación cuadre, disociando la identidad del dato financiero.
