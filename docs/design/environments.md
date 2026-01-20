# Environments Definition & Configuration

# 1\. Definición de Entornos

Manejamos tres entornos estrictamente separados para garantizar la estabilidad del ciclo de vida del software.

| Entorno | Código Fuente (Rama) | URL Base | Propósito |
| :---- | :---- | :---- | :---- |
| **Local (DEV)** | feature/\* o local | http://localhost:5173 | Desarrollo activo, experimentación y pruebas unitarias. |
| **Staging (QA)** | develop | https://stage.pazanimal.org | Pruebas de integración, UAT (User Acceptance Testing) y validación visual. |
| **Producción (PROD)** | main | https://pazanimal.org | Entorno en vivo para usuarios finales. **Sagrado.** |

---

# 2\. Configuraciones y Variables (.env)

Las variables de entorno cambian drásticamente según donde estemos.

Nota: Los secretos nunca se commitean. Se gestionan vía Railway Dashboard o .env.local.

### **Matriz de Configuración Crítica**

| Variable | Entorno Local | Entorno Staging | Entorno Producción |
| :---- | :---- | :---- | :---- |
| NODE\_ENV | development | staging | production |
| DATABASE\_URL | postgresql://user:pass@localhost:5432/paz\_db | postgresql://railway-internal.../stage\_db | postgresql://railway-internal.../prod\_db |
| API\_URL | http://localhost:3000/api | https://api-stage.pazanimal.org | https://api.pazanimal.org |
| STORAGE\_BUCKET | paz-animal-dev | paz-animal-stage | paz-animal-prod |
| MERCADOPAGO\_KEY | TEST-123... (Sandbox) | TEST-456... (Sandbox) | APP\_USR-789... (Live) |

---

# 3\. Estrategia de Datos y Bases de Datos

### **🛠️ Local (Docker)**

* **Motor:** Contenedor Docker postgres:15-alpine.  
* **Datos:** Se generan automáticamente al iniciar usando npm run db:seed.  
* **Persistencia:** Volátil. Se puede destruir (docker-compose down \-v) y recrear sin miedo.

### **🧪 Staging (Railway)**

* **Motor:** Instancia PostgreSQL gestionada (Plan Developer).  
* **Datos:**  
  * **Origen:** Datos sintéticos masivos (FakerJS) para pruebas de carga.  
  * **Política:** Se resetea semanalmente o antes de un deploy mayor.  
  * **Privacidad:** NO contiene datos reales de usuarios.

### **🚀 Producción (Railway)**

* **Motor:** Instancia PostgreSQL gestionada (Plan Pro/High Availability).  
* **Datos:** Información real de la fundación.  
* **Política:** Backups automáticos cada 24hs (Retención 30 días).  
* **Migraciones:** Solo se aplican cambios no destructivos (ADD COLUMN).

---

# 4\. Gestión de Secretos y Seguridad

* **Desarrollo:** Archivo .env local (no versionado).  
* **CI/CD (GitHub):** Usamos **GitHub Secrets** para inyectar credenciales durante los tests (DATABASE\_URL\_TEST, SNYK\_TOKEN).  
* **Runtime (Nube):** Usamos el **Gestor de Variables de Railway**.  
  * *Acceso:* Solo el Tech Lead (Facu) tiene acceso a ver los valores de Producción.

---

# 5\. Flujo de Promoción (Deployment Pipeline)

El código viaja a través de los entornos siguiendo reglas estrictas:

1. **Dev \-\> Staging:**  
   * Al hacer Merge de una feature a la rama develop.  
   * Dispara despliegue automático a Staging.  
   * *Check:* El equipo verifica que la nueva feature funcione en la URL de staging.  
2. **Staging \-\> Producción:**  
   * Al hacer Merge de develop a main (Pull Request).  
   * **Requisito:** Todos los tests de CI deben pasar (Verde).  
   * Dispara despliegue automático a Producción.

---

# 6\. Monitoreo y Observabilidad

Cada entorno tiene niveles distintos de "vigilancia".

* **Local:** Logs en consola (stdout).  
* **Staging:** Logs de Railway (historial 7 días). Alertas de caída básicas.  
* **Producción:**  
  * **Logs:** Persistencia de logs crítica.  
  * **Uptime:** Monitor de estado (Pingdom/UptimeRobot) comprobando cada 5 min.  
  * **Alertas:** Notificación inmediata a Discord/Email si la API responde 500 o si la DB se cae.