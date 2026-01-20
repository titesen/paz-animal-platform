# **Reglas y Estándares de Ingeniería (Project Standards)**

## **1\. Principios Fundamentales (The Paz Way)**

1. **Pragmatismo sobre Dogma:** Preferimos código simple y legible a abstracciones complejas innecesarias. No sobre-ingenierizamos.  
2. **Type-Safety Total:** **TypeScript** no es una sugerencia, es la ley. Prohibido usar any explícito o implícito. Si es difícil de tipar, probablemente el diseño esté mal.  
3. **Co-ubicación (Co-location):** Las cosas que cambian juntas, deben vivir juntas. Los estilos, tests y lógica de un componente deben estar en la misma carpeta (src/features/pets/...).  
4. **Defensa en Profundidad:** Nunca confíes en el input del usuario. Validamos todo con **Zod** en el borde (API Controller / React Form).

---

## **2\. Guías de Estilo de Código**

Utilizamos **ESLint** y **Prettier** configurados automáticamente.

### **Nomenclatura (Naming Conventions)**

* **Variables y Funciones:** camelCase  
  * ✅ const petName \= ...  
  * ✅ function calculateAge() ...  
* **Componentes React y Clases:** PascalCase  
  * ✅ PetCard.tsx  
  * ✅ PetsService  
* **Constantes y Enums:** UPPER\_SNAKE\_CASE  
  * ✅ MAX\_UPLOAD\_SIZE\_MB  
  * ✅ UserRole.ADMIN  
* **Archivos:** kebab-case (excepto Componentes React).  
  * ✅ user-profile.routes.ts  
  * ✅ PetCard.tsx

### **Reglas Específicas**

* **Early Return:** Evita el anidamiento profundo de if/else. Retorna temprano.  
* **Booleanos:** Deben sonar a preguntas (isActive, hasOwner, canEdit).  
* **Funciones Puras:** Prioriza funciones que no muten datos externos siempre que sea posible.

---

## **3\. Arquitectura y Patrones**

### **Backend (Node.js \+ Drizzle)**

Implementamos una **Arquitectura de 3 Capas Simplificada**:

1. **Controller (\*.controller.ts):** Solo maneja HTTP (Request/Response). Valida input con Zod y llama al Servicio. **Nunca tiene lógica de negocio.**  
2. **Service (\*.service.ts):** Contiene la Lógica de Negocio pura. Es agnóstico a HTTP.  
3. **Repository (\*.repository.ts):** Capa de acceso a datos (Drizzle). Aquí viven los db.select()....

### **Frontend (React \+ Shadcn)**

1. **Server State vs Client State:**  
   * Usamos **TanStack Query** para todo lo que venga de la API (server state).  
   * Usamos useState o useReducer solo para estado efímero de UI (modales abiertos, inputs).  
2. **Componentes Tontos vs Listos:**  
   * Separamos componentes de presentación (reciben props, renderizan UI) de los componentes contenedores (hacen fetch de datos).

---

## **4\. Estrategia de Manejo de Errores**

### **Backend**

* **Centralización:** Usamos un Middleware de Error Global.  
* **Excepciones Operacionales:** Lanzamos errores tipados (AppError) con códigos HTTP y mensajes seguros.  
* **No Fugas:** Nunca devolvemos el *Stack Trace* al cliente en Producción.

### **Frontend**

* **Error Boundaries:** Envolvemos los módulos principales para que un error en un widget no rompa toda la página.  
* **Feedback Visual:** Mostramos Toasts (mensajes flotantes) para errores transitorios y páginas de "Algo salió mal" para errores críticos.

---

## **5\. Documentación de Código**

El código debe ser auto-explicativo ("Self-documenting code").

* **¿Cuándo comentar?**  
  * ❌ Para explicar *qué* hace el código (eso debe leerse en el código).  
  * ✅ Para explicar *por qué* se tomó una decisión extraña o compleja (Contexto de Negocio).  
* **JSDoc:** Usar JSDoc solo para funciones utilitarias compartidas o librerías internas (packages/).

---

## **6\. Testing (Pruebas)**

"Si no está testeado, está roto."

1. **Backend:** Priorizamos **Tests de Integración** (supertest). Queremos saber si el endpoint responde bien y guarda en la BD, más que testear una función aislada.  
2. **Frontend:** Priorizamos la interacción del usuario. "El usuario hace clic en 'Adoptar' y ve el mensaje de éxito".

---

## **7\. Principios de Seguridad**

1. **OWASP Top 10:** Tenemos presentes las vulnerabilidades comunes (Inyección SQL, XSS). Drizzle y React nos protegen de la mayoría por defecto, pero no bajamos la guardia.  
2. **Secretos:** Jamás se commitea un archivo .env o una credencial real.  
3. **Autorización:** Verificar permisos en **cada** request que modifique datos, no solo en el Frontend.

