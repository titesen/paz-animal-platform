# **Estrategia de Auditoría y Control de Sistemas**

## **1\. Filosofía de Auditoría**

El sistema debe ser capaz de reconstruir la historia de cualquier registro crítico. No confiamos ciegamente; verificamos.

Principio Rector: "Si no está en el log o en la base de datos, no sucedió."

---

## **2\. Registro de Eventos (Logging)**

Definimos qué se registra para permitir el análisis forense sin saturar el almacenamiento2.

### **📝 Qué registrar (Eventos Críticos)**

1. **Seguridad:** Logins exitosos y fallidos, cambios de contraseña, cambios de roles (de Cliente a Admin).  
2. **Financiero:** Creación de intenciones de pago, webhooks de Mercado Pago recibidos, cambios de estado en transacciones (PENDING \-\> APPROVED).  
3. **Negocio (Mascotas):** Cambio de estado de una mascota (ej. de DISPONIBLE a ADOPTADO).  
4. **Errores:** Excepciones no controladas (500 Internal Server Error) con Stack Trace (solo en logs privados, nunca al cliente).

### **🚫 Qué NO registrar (Privacidad & Ruido)**

* **PII (Información Personal Identificable):** Contraseñas en texto plano, tokens de sesión completos, números de tarjeta de crédito (PCI DSS).  
* **Ruido:** Peticiones GET a recursos estáticos (imágenes, CSS) o Health Checks del balanceador de carga.

### **💾 Formato y Almacenamiento**

* **Formato:** JSON Estructurado (NDJSON).  
* JSON

{"level":"info","time":"2026-01-20T10:00:00Z","actor":"user\_123","action":"pet\_update","resource\_id":"pet\_555","changes":{"status\_old":"AVAILABLE","status\_new":"ADOPTED"}}

*   
*   
* **Retención:** 30 días en caliente (Railway Logs), archivado frío en R2 si es necesario por legal.

---

## **3\. Trazabilidad y "Soft Deletes"**

Para cumplir con el requisito de trazabilidad3, prohibimos la eliminación física de datos.

### **Estrategia de Borrado Lógico**

En lugar de DELETE FROM users WHERE id=1, hacemos:

SQL

UPDATE users SET deleted\_at \= NOW(), is\_active \= FALSE WHERE id\=1;

Esto permite:

1. Recuperar datos borrados por error.  
2. Mantener la integridad referencial (las donaciones de un usuario borrado siguen existiendo).

### **Columnas de Auditoría (Drizzle Schema)**

Todas las tablas críticas deben incluir:

* created\_at: Fecha de creación (Inmutable).  
* updated\_at: Fecha de última modificación (Automático).  
* deleted\_at: Fecha de baja (Nulo por defecto).  
* created\_by: ID del usuario que creó el registro (si aplica).

---

## **4\. Controles de Acceso y Atribución**

Para auditar, primero debemos autenticar inequívocamente4.

* **Identidad Única:** No existen usuarios genéricos como admin o invitado. Cada acción debe estar vinculada a un user\_id específico (ej. "Facundo González").  
* **Contexto de Ejecución:** En cada request, el sistema registra:  
  * IP de origen.  
  * User-Agent (Navegador/Dispositivo).  
  * Timestamp preciso (UTC).

---

## **5\. No Repudio e Integridad de Datos**

Garantizamos que un usuario no pueda negar haber realizado una acción crítica5.

### **Acciones Contractuales (Adopción)**

Cuando un usuario "Firma" digitalmente la adopción:

1. Se guarda el estado exacto del contrato en ese momento (Snapshot).  
2. Se registra la IP desde donde aceptó los términos.  
3. Se envía un correo de confirmación inmutable como prueba externa.

### **Integridad Financiera (Ledger Inmutable)**

La tabla transactions es **Solo Escritura (Append-Only)** para los importes.

* Si una donación se registró mal ($100 en vez de $1000), **NO se edita**.  
* Se anula la anterior (Reembolso/Cancelación) y se crea una nueva transacción correcta. Esto deja un rastro contable perfecto.

---

## **6\. Cumplimiento Normativo (Compliance)**

Preparación para auditorías legales y Ley 25.3266666.

\+1

### **Derecho de Acceso y Supresión (Habeas Data)**

* **Exportación:** El sistema debe tener un script/endpoint capaz de generar un ZIP con "Todo lo que Paz Animal sabe de mí" si un usuario lo solicita.  
* **Anonimización:** Si un usuario exige ser borrado, sus datos personales (Nombre, DNI) se sobrescriben con ANONYMIZED\_USER, pero sus IDs y transacciones se mantienen para cuadrar la caja.

