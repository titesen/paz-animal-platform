# Estrategia de Monitoreo y Observabilidad

## 1. Objetivos de la Estrategia

Garantizar la disponibilidad del 99.9% y permitir que el equipo de desarrollo detecte y resuelva incidencias **antes** de que los usuarios las reporten.

**Las 3 Preguntas Clave:**

1. ¿El sistema está caído? (Disponibilidad)
2. ¿El sistema es lento? (Rendimiento)
3. ¿El sistema está roto? (Errores funcionales)

---

## 2. Stack de Herramientas (Toolchain)

Para mantener la operación ligera y gratuita (inicialmente), utilizaremos:

| Capa                 | Herramienta                       | Propósito                                   | Costo     |
| :------------------- | :-------------------------------- | :------------------------------------------ | :-------- |
| **Infraestructura**  | **Railway Metrics**               | CPU, RAM, Disco y Network del contenedor.   | Incluido  |
| **Errores (App)**    | **Sentry**                        | Captura de excepciones en Node.js y React.  | Free Tier |
| **Logs**             | **Railway Logs**                  | Salida estándar (stdout) centralizada.      | Incluido  |
| **Uptime (Externo)** | **UptimeRobot**                   | Pings externos cada 5 min a la URL pública. | Free Tier |
| **Frontend Vitals**  | **Vercel Analytics** o **Sentry** | Core Web Vitals (LCP, FID, CLS).            | Free Tier |

---

## 3. Métricas Clave (KPIs)

Nos enfocamos en las "Cuatro Señales Doradas" (Golden Signals) de Google SRE:

🟡 Latencia (Rendimiento)

- **Target Backend:** P95 \< 500ms para endpoints críticos (GET /pets).
- **Target Frontend:** LCP (Largest Contentful Paint) \< 2.5s.
- **Alerta:** Si latencia promedio \> 1s por 5 minutos.

🔴 Tasa de Errores (Correctitud)

- **Definición:** Respuestas HTTP 5xx (Server Error).
- **Exclusión:** No contamos 4xx (Errores de usuario) como fallos del sistema, pero los monitoreamos para UX.
- **Alerta:** \> 1% de requests fallidos en 5 minutos.

🔵 Tráfico (Saturación)

- **Medición:** Requests por Segundo (RPS).
- **Uso de Recursos:** % de Memoria RAM utilizada (Critical en Node.js).
- **Alerta:** RAM \> 85% (Riesgo de OOM Kill).

---

## 4. Estrategia de Logging

Los logs son para entender el "por qué". No usaremos console.log dispersos.

Estandarización (JSON Estructurado)

Usaremos la librería **pino** en el Backend para generar logs en formato JSON. Esto permite que Railway o herramientas futuras los indexen y busquen fácilmente.

**Formato Ejemplo:**

JSON

{
"level": "info",
"time": 1696773210,
"pid": 123,
"hostname": "railway-container-x",
"module": "payments",
"action": "create_preference",
"data": { "userId": "uuid...", "amount": 1500 },
"msg": "Preferencia de pago creada"
}

Niveles de Log

- **ERROR:** El sistema falló y requiere atención (ej. DB desconectada). \-\> **Notifica a Sentry.**
- **WARN:** Algo inesperado pero el sistema sigue (ej. Login fallido reiterado).
- **INFO:** Eventos de negocio clave (ej. "Mascota adoptada").
- **DEBUG:** Deshabilitado en Producción (demasiado ruido).

### **Privacidad y Scrubbing**

**Regla de Oro:** NUNCA loguear Información Personal Identificable (PII) cruda.

- Emails, Contraseñas, Tokens de Tarjeta \-\> Deben ser ofuscados (\*\*\*) antes de escribirse en el log.

---

## 5. Sistema de Alertas y Escalada

¿Quién se despierta a las 3 AM?

Definición de Umbrales

1. **Crítico (P1):** Sitio completamente inaccesible o flujo de donación roto.
   - _Trigger:_ UptimeRobot "Down" o Sentry "Spike protection".
   - _Canal:_ Email Urgente \+ Notificación App Móvil.
2. **Advertencia (P2):** Latencia alta o aumento de errores no críticos.
   - _Trigger:_ RAM \> 80%.
   - _Canal:_ Canal de Discord \#dev-alerts (Bot).
3. **Info (P3):** Despliegue exitoso o nuevo registro de usuario.
   - _Canal:_ Canal de Discord \#activity-log.

Matriz de Responsabilidad

- **Nivel 1 (Automático):** Reinicio automático del contenedor (Railway).
- **Nivel 2 (Humano):** Facundo González (Tech Lead).
- **Tiempo de Respuesta Objetivo:** \< 30 minutos para P1.

---

6\. Auditoría y Mejora Continua

- **Revisión Semanal:** Chequear en Sentry los "Top 5 Issues" y crear tickets para resolverlos.
- **Limpieza de Logs:** Railway retiene logs por 7 días. Si se requiere más (legal), configurar exportación a S3/R2.

---

**Implementación Inmediata:**

1. Instalar winston o pino en apps/backend.
2. Crear cuenta en Sentry y conectar apps/frontend y apps/backend.
3. Configurar monitor HTTP en UptimeRobot apuntando a pazanimal.org.
