# **🤝 Guía de Contribución para Paz Animal**

¡Gracias por tu interés en contribuir a la Plataforma Paz Animal\! Este documento es tu brújula para colaborar de manera efectiva, asegurando que el código mantenga la calidad profesional que nos define.

---

## **1\. Cómo Contribuir**

### **🐛 Reportar Errores (Bugs)**

Si encuentras un error, por favor crea un *Issue* en GitHub siguiendo estos pasos:

1. **Busca primero:** Revisa si el error ya fue reportado en los *Issues* abiertos.  
2. **Usa la plantilla:** Si es nuevo, usa la etiqueta bug.  
3. **Información Requerida:**  
   * Pasos para reproducir (paso a paso).  
   * Comportamiento esperado vs. real.  
   * Capturas de pantalla o logs de error.  
   * Entorno (Navegador, SO, versión de Node).

### **💡 Sugerir Nuevas Características**

¿Tienes una idea para mejorar la adopción o las donaciones?

1. Abre un *Issue* con la etiqueta enhancement.  
2. **Justificación:** Explica *por qué* es necesario y a quién beneficia (Usuarios, Admins, Mascotas).  
3. **Propuesta Técnica:** Si es posible, sugiere qué tecnologías o endpoints se necesitarían.

### **🔀 Enviar Cambios (Pull Requests)**

Somos estrictos con la calidad del código. Sigue este flujo:

1. **Fork & Clone:** Haz un fork del repositorio y clónalo localmente.  
2. **Rama (Branch):** Crea una rama descriptiva desde main:  
   * feat/nueva-funcionalidad  
   * fix/correccion-bug  
   * docs/actualizar-readme  
3. **Código:** Escribe tu código siguiendo los estándares (ver Sección 3).  
4. **Commits:** Usa **Conventional Commits** (ver abajo).  
5. **Push & PR:** Sube tu rama y abre un Pull Request hacia main.  
   * El CI (GitHub Actions) ejecutará los tests automáticamente.  
   * **Requisito:** Tu PR no se aprobará si los tests fallan o si baja el score de accesibilidad.

---

## **2\. Entorno de Desarrollo**

Este proyecto es un **Monorepo** gestionado con npm workspaces.

### **Instalación**

Bash

\# 1\. Clonar el repositorio  
git clone https://github.com/tu-usuario/paz-animal-platform.git  
cd paz-animal-platform

\# 2\. Instalar dependencias (Raíz)  
npm install

\# 3\. Variables de Entorno  
cp apps/backend/.env.example apps/backend/.env  
\# (Solicita las credenciales de desarrollo al Tech Lead)

### **Ejecución Local**

Bash

\# 1\. Levantar Base de Datos (Docker)  
npm run db:up

\# 2\. Sincronizar Esquema (Drizzle)  
npm run db:push \-w apps/backend

\# 3\. Iniciar todo (Back \+ Front)  
npm run dev

---

## **3\. Estándares y Convenciones**

📜 Estilo de Código (Linting) 

Usamos **ESLint** y **Prettier**.

* **Husky:** No podrás hacer commit si tu código tiene errores de estilo.  
* Si tienes problemas, ejecuta: npm run lint:fix \--workspaces.

### **💬 Convención de Commits**

Es **obligatorio** usar [Conventional Commits](https://www.conventionalcommits.org/) para que el historial sea legible y automatizable:

* feat(pets): agregar filtro por edad ✅  
* fix(auth): corregir error en login con google ✅  
* arreglé el login ❌ (Será rechazado)

🧪 Pruebas (Testing) 

* **Backend:** Tests de integración con **Vitest \+ Supertest**.  
  * npm run test \-w apps/backend  
* **Frontend:** Tests de componentes con **React Testing Library**.  
  * npm run test \-w apps/frontend  
* **Regla de Oro:** Si añades una funcionalidad, añade un test que demuestre que funciona.

### **♿ Accesibilidad**

Todo componente de UI debe cumplir con **WCAG 2.1 AA**.

* Usa HTML semántico.  
* No elimines el outline de foco.  
* Prueba navegar tu cambio usando solo el teclado.

---

## **4\. Código de Conducta**

Nos comprometemos a ofrecer un entorno libre de acoso para todos. Por favor, lee y respeta nuestro CODE\_OF\_CONDUCT.md. La amabilidad y la empatía son tan importantes como el código limpio.

---

## **5\. Recursos Adicionales**

* **Diccionario de Datos:** Consulta diccionario\_de\_datos.pdf para entender la DB V23.  
* **Dudas Técnicas:** Abre una discusión en GitHub.

---

**¡Gracias por ayudar a cambiar vidas, una línea de código a la vez\!** 🐾

