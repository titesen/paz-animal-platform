# Protocolo de Inteligencia Artificial Responsable (RAI)

## **1\. Declaración de Propósito**

En **Paz Animal**, utilizamos la Inteligencia Artificial como una herramienta de amplificación para la empatía humana, nunca como un reemplazo del juicio moral. Nuestro objetivo es acelerar las adopciones y mejorar la logística de donaciones, asegurando que cada decisión algorítmica sea justa, explicable y segura.

---

## **2\. Inventario de Sistemas IA**

Actualmente, reconocemos los siguientes sistemas bajo este protocolo:

1. **Generador de Descripciones (GenAI):** Uso de Vision-LLMs para crear borradores de biografías de mascotas a partir de fotos.  
2. **Algoritmo de Compatibilidad (Matching):** Sistema de recomendación que sugiere mascotas a adoptantes basado en estilo de vida.  
3. **Detección de Anomalías:** Análisis de patrones en transacciones para prevenir fraude en donaciones.

---

## **3\. Principios de Actuación**

### **🛡️ 1\. Mitigación de Sesgos (Bias Mitigation)**

Los datos históricos de adopciones pueden contener sesgos humanos (ej. "los perros negros se adoptan menos").

* **Regla:** El algoritmo de *Matching* NO debe penalizar a mascotas por características fenotípicas (color, raza) a menos que sean requisitos explícitos del usuario (ej. alergia).  
* **Acción:** Auditamos periódicamente las tasas de recomendación por raza y color para asegurar equidad estadística.

### **🧠 2\. Explicabilidad (XAI \- Explainable AI)**

El usuario tiene derecho a entender por qué la IA sugiere lo que sugiere.

* **Caja de Cristal:** Si el sistema recomienda a "Rex" para un usuario, la interfaz debe mostrar: *"Te recomendamos a Rex porque buscás un perro activo y tenés patio grande."*  
* **Prohibición:** No utilizaremos modelos "Deep Learning" opacos para decisiones críticas (como rechazar una adopción) sin una capa de interpretabilidad.

### **🛑 3\. Supervisión Humana (Human-in-the-Loop)**

La IA propone, el humano dispone.

* **Contenido:** Las descripciones de mascotas generadas por IA deben ser marcadas como `Borrador` y requieren aprobación manual de un voluntario antes de publicarse.  
* **Adopciones:** Ninguna solicitud de adopción puede ser rechazada automáticamente por la IA. Solo puede ser "flagged" (marcada) para revisión prioritaria de un humano.

### **📢 4\. Transparencia de Interacción**

* **Etiquetado:** Todo contenido generado sintéticamente (ej. una imagen ilustrativa o un texto de bienvenida) debe tener un indicador visual: ✨ *Generado con asistencia de IA*.  
* **Chatbots:** Si implementamos un asistente virtual, este debe presentarse inequívocamente como un bot desde el primer mensaje: *"Soy el asistente virtual de Paz Animal"*.

---

## **4\. Robustez y Seguridad**

### **Protección de Datos en Prompts**

* **Anonimización:** Al enviar datos a APIs externas (ej. OpenAI, Anthropic), nunca incluimos PII (Información Personal Identificable) real.  
  * ❌ *Mal Prompt:* "Escribe una bio para el perro que adoptó Juan Pérez, DNI 123..."  
  * ✅ *Buen Prompt:* "Escribe una bio para un perro adoptado por una familia joven en zona urbana..."

### **Alucinaciones**

* Dado que los LLMs pueden inventar datos, se prohíbe usar IA para generar información médica o veterinaria (ej. diagnósticos o dosis de vacunas) sin validación estricta de un veterinario matriculado.

---

## **5\. Gobernanza y Auditoría**

* **Responsable:** El Tech Lead (Facundo González) actúa como el *AI Ethics Officer* temporal.  
* **Mecanismo de Queja:** Los usuarios pueden reportar "comportamiento extraño de la IA" a través del formulario de contacto, y estos reportes se tratan con prioridad de *Bug Crítico*.