

# **Tecnologías y Dependencias**

## **1\. Lenguajes de Programación**

* **TypeScript (v5+):** Lenguaje principal para todo el Monorepo (Backend y Frontend).  
  * *Política:* strict: true. No se permite el uso de any explícito ni implícito.  
* **SQL (PostgreSQL Dialect):** Para consultas complejas o migraciones manuales que el ORM no cubra.  
* **HTML5 / CSS3:** Generado y abstraído principalmente por JSX y Tailwind.

---

## **2\. Frameworks y Librerías Core**

### **🖥️ Frontend (apps/frontend)**

* **Runtime/Build:** **Vite** (Última versión estable). Reemplaza a Webpack.  
* **Framework UI:** **React (v18+)**.  
  * *Paradigma:* Hooks y Componentes Funcionales exclusivamente. (Prohibido Class Components).  
* **Estilos:** **Tailwind CSS (v3+)**.  
  * *Utilidad:* clsx y tailwind-merge para clases condicionales.  
* **Componentes:** **Shadcn/UI** (basado en Radix Primitives).  
* **Gestión de Estado Servidor:** **TanStack Query (v5)**. (Reemplaza a useEffects manuales para fetch).  
* **Formularios:** **React Hook Form** \+ **Zod Resolver**.  
* **Enrutamiento:** **React Router DOM (v7+)**.

### **⚙️ Backend (apps/backend)**

* **Runtime:** **Node.js (v20 LTS)** o superior (Hydrogen).  
* **Framework Web:** **Express (v5)**.  
  * *Seguridad:* helmet, cors, express-rate-limit.  
* **Validación:** **Zod (v4)**. Fuente de verdad para validación de inputs y variables de entorno.  
* **Colas / Jobs:** **BullMQ** (requiere Redis).  
* **Logging:** **Pino** o **Winston** (Salida JSON estructurada).

---

## **3\. Capa de Datos (Data Layer)**

* **Base de Datos Relacional:** **PostgreSQL (v15+)**.  
* **ORM:** **Drizzle ORM**.  
  * *Driver:* postgres.js o node-postgres (pg).  
  * *Migraciones:* drizzle-kit.  
* **Caché / Colas:** **Redis (v7)**.  
* **Almacenamiento de Archivos:** **Cloudflare R2** (API compatible con AWS S3 SDK).

---

## **4\. Herramientas de Desarrollo y DevOps**

* **Gestor de Paquetes:** **npm (v10+)** con soporte de **Workspaces**.  
* **Linter & Formatter:**  
  * **ESLint:** Configuración estricta (eslint-config-prettier, plugin:@typescript-eslint/recommended).  
  * **Prettier:** Configuración opinada para evitar discusiones de estilo en PRs.  
* **Git Hooks:** **Husky** \+ **lint-staged**. (Ejecuta linter antes de cada commit).  
* **Contenedores:** **Docker** y **Docker Compose** (para entorno local de DB y Redis).  
* **CI/CD:** **GitHub Actions**.

---

## **5\. Preferencias de Ingeniería (The "Paz Way")**

### **✅ Preferencias Explícitas**

1. **Inmutabilidad:** Preferimos const sobre let. Nunca usamos var.  
2. **Composición:** En React, preferimos componentes pequeños compuestos (\<Card\>\<CardTitle\>...) sobre componentes gigantes configurados por props (\<Card title="..." /\>).  
3. **Fail Fast:** Validamos las variables de entorno al iniciar la app. Si falta DATABASE\_URL, la app explota inmediatamente (y nos avisa), no a la mitad de una operación.  
4. **Utility-First CSS:** No escribimos archivos .css o .scss separados a menos que sea para animaciones globales muy específicas. Todo estilo va en clases de Tailwind.

### **❌ Tecnologías Prohibidas / Deprecadas**

* **Redux (Legacy):** Para el estado global usamos Context API o Zustand (si fuera necesario). Para datos de API, TanStack Query.  
* **Moment.js:** Usamos date-fns o la API nativa Intl para manejo de fechas (Moment es muy pesado).  
* **Bootstrap / Material UI:** Usamos Shadcn/Tailwind para tener control total del diseño.

