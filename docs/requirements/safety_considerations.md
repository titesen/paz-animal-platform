# Consideraciones y Protocolos de Seguridad

## 1. Principios de "Seguridad por Diseño"

1. **Confianza Cero (Zero Trust):**
   - No confiamos en el Frontend. Todo dato que entra a la API es tratado como potencialmente malicioso hasta que se valida.
   - No confiamos en la red interna. La base de datos requiere autenticación fuerte incluso dentro de la red privada de Railway.
2. **Defensa en Profundidad:**
   - Si falla el Firewall, tenemos validación de Zod.
   - Si falla Zod, tenemos consultas parametrizadas de Drizzle.
   - Si falla Drizzle, tenemos roles de base de datos restrictivos.

---

## 2. Autenticación y Autorización (IAM)

### **Autenticación (AuthN)**

- **Mecanismo:** JSON Web Tokens (JWT) firmados con algoritmo HS256 (o RS256).
- **Contraseñas:**
  - NUNCA se guardan en texto plano.
  - Usamos **bcrypt** (o argon2) con un _salt_ único por usuario.
- **OAuth:** Delegamos la autenticación a Google para reducir la superficie de ataque de credenciales.

### **Autorización (AuthZ)**

- **Modelo:** RBAC (Role-Based Access Control) estricto.
- **Implementación:** Middleware requireRole(\['ADMIN', 'VOLUNTEER'\]) en cada endpoint protegido.
- **Seguridad de Objetos (IDOR):**
  - Validamos que el usuario X solo pueda editar su propio perfil, no el del usuario Y (Resource Ownership Check).

---

## 3. Validación de Entradas (Input Validation)

Nuestra primera línea de defensa contra inyecciones y datos corruptos.

- **Herramienta:** **Zod**.
- **Política:** Strict Schema Validation. Si el JSON trae un campo extra no permitido, la solicitud se rechaza (Strip/Error).
- **Sanitización:**
  - Los strings se limpian de espacios (.trim()).
  - Los emails se normalizan a minúsculas.

---

## 4. Prevención de Vulnerabilidades (OWASP Top 10)

### **💉 Inyección SQL (SQLi)**

- **Mitigación:** Uso exclusivo de **Drizzle ORM**.
- **Regla:** Prohibido concatenar strings en consultas SQL ("SELECT \* FROM users WHERE name \= " \+ input). Drizzle usa consultas parametrizadas automáticamente.

### **📜 Cross-Site Scripting (XSS)**

- **Mitigación:** **React** escapa automáticamente el contenido renderizado.
- **Headers:** Implementación de **Helmet** en Express para configurar Content-Security-Policy (CSP) y prevenir la carga de scripts no autorizados.

### **🔓 Cross-Site Request Forgery (CSRF)**

- **Mitigación:**
  - Uso de cookies SameSite=Strict y Secure (HTTPS only).
  - Validación del header Origin en solicitudes mutantes (POST, PUT, DELETE).

---

## 5. Manejo de Secretos y Configuración

- **Repositorio:** NUNCA se suben archivos .env a GitHub.
- **Validación:** El archivo src/config/env.ts valida que todas las variables críticas (DATABASE_URL, JWT_SECRET) existan al iniciar la app. Si falta una, el servidor se niega a arrancar (Fail Fast).
- **Rotación:** Plan de rotación trimestral de claves JWT y credenciales de base de datos.

---

## 6. Protección de Infraestructura

- **Rate Limiting:** Implementación de express-rate-limit para evitar ataques de fuerza bruta (ej. 5 intentos de login por minuto) y DDoS básicos.
- **HTTPS:** Obligatorio. Todo tráfico HTTP se redirige a HTTPS. HSTS habilitado.
- **Logs:**
  - Se registran intentos de acceso fallidos.
  - **Data Scrubbing:** Un middleware intercepta los logs para ofuscar automáticamente campos sensibles (password, token, credit_card) antes de guardarlos.

---

## 7. Privacidad y Cumplimiento Legal

- **Datos Sensibles (PII):** DNI, Teléfono y Dirección se consideran datos privados. Solo son accesibles por roles ADMIN o el propio usuario.
- **Derecho de Supresión:** Implementamos "Soft Delete" (deleted_at) para mantener integridad referencial, pero anonimizamos los datos personales visibles si el usuario solicita la baja.
