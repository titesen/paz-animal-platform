# Guía de Git y Control de Versiones (DVCS)

## 1. Propósito

Establecer las reglas de juego para el control de versiones. Nuestro objetivo es mantener un historial limpio, legible y reversible, que sirva como documentación viva de la evolución del proyecto.

## 2. Estrategia de Ramificación (Branching Strategy)

Utilizamos un modelo simplificado híbrido, optimizado para CI/CD en Railway.

### **Ramas Permanentes**

| Rama        | Entorno        | Protección   | Descripción                                                                                              |
| :---------- | :------------- | :----------- | :------------------------------------------------------------------------------------------------------- |
| **main**    | **Producción** | 🔒 Protegida | Código estable y desplegable. Nadie hace commit directo aquí. Solo acepta PRs desde develop o hotfix/\*. |
| **develop** | **Staging**    | 🔒 Protegida | Rama de integración. Aquí convergen las features para ser probadas en el entorno de staging.             |

###

### **Ramas Temporales**

| Prefijo | Origen  | Destino         | Uso                                                             |
| :------ | :------ | :-------------- | :-------------------------------------------------------------- |
| feat/   | develop | develop         | Nueva funcionalidad (ej. feat/adopcion-form).                   |
| fix/    | develop | develop         | Corrección de errores en etapa de desarrollo.                   |
| hotfix/ | main    | main \+ develop | Error crítico en producción que requiere arreglo inmediato.     |
| chore/  | develop | develop         | Tareas técnicas (deps, config) sin impacto en código funcional. |

# 3\. Convenciones de Nomenclatura

Los nombres de las ramas deben ser descriptivos y en **minúsculas**, separados por guiones.

- ✅ feat/auth-google-login
- ✅ fix/pet-gallery-responsive
- ✅ docs/update-readme
- ❌ feat/login (Muy vago)
- ❌ ArregloBug (Usa mayúsculas y español genérico)

---

# 4\. Convenciones de Commits

Es **OBLIGATORIO** usar [Conventional Commits](https://www.conventionalcommits.org/). Husky abortará el commit si no sigues este formato.

Estructura:

\<tipo\>(\<alcance\>): \<descripción corta\>

**Tipos permitidos:**

- feat: Una nueva característica para el usuario.
- fix: Una corrección de un bug.
- docs: Cambios solo en documentación.
- style: Formato, puntos y comas (no afecta lógica).
- refactor: Cambio de código que no arregla bugs ni añade features.
- test: Añadir o corregir tests.
- chore: Cambios en build, herramientas, librerías.

**Ejemplos Reales:**

- feat(pets): agregar filtro por edad en buscador
- fix(auth): corregir expiración de token JWT
- chore(deps): actualizar drizzle-orm a v0.30

# 5\. Flujo de Trabajo (Pull Requests)

1. **Sincronizar:** Antes de empezar, siempre git pull origin develop.
2. **Crear Rama:** git checkout \-b feat/mi-feature.
3. **Desarrollar:** Escribe código y haz commits atómicos (pequeños y frecuentes).
4. **Push:** git push origin feat/mi-feature.
5. **Abrir PR:** En GitHub, abre un Pull Request hacia develop.
   - **Título:** Igual que el commit principal.
   - **Descripción:** Explica _qué_ hiciste y _cómo_ probarlo.
6. **CI Checks:** Espera a que GitHub Actions (Tests y Lint) pasen. ✅
7. **Merge:**
   - Preferimos **"Squash and Merge"** para features pequeñas (convierte 10 commits de trabajo en 1 limpio en develop).

# 6\. Buenas Prácticas y Configuraciones

### **🧹 Historial Limpio**

- No subas commits tipo wip, guardando, fix. Usa git commit \--amend o haz squash antes de subir.
- Evita archivos binarios grandes (imágenes pesadas, PDFs) en el repo. Úsalos en Cloudflare R2.

### **🙈 .gitignore**

El archivo .gitignore en la raíz es la fuente de verdad.

- Nunca ignores package-lock.json.
- Siempre ignora .env y .DS_Store.
- Ignora carpetas de build (dist/, build/).

### **⚙️ Configuración Local**

Asegúrate de que tu email de Git coincida con tu cuenta de GitHub para que las contribuciones se atribuyan correctamente.

Bash

git config \--global user.name "Facundo Nicolás González"
git config \--global user.email "tu@email.com"
