# Software Design Patterns & Architecture Reference

Este documento define los estándares arquitectónicos y los patrones de diseño aplicados en el proyecto.

## 1. Visión General de Arquitectura

Antes de entrar en patrones específicos de clases, definimos los patrones de alto nivel que estructuran la solución.

### 🏛️ Arquitectura de N-Capas (Layered Architecture)

- **Contexto:** `apps/backend`
- **Descripción:** Separamos el código en capas lógicas con responsabilidades únicas.

1. **Controller:** Maneja la entrada/salida HTTP (Requests/Responses).
2. **Service:** Contiene la lógica de negocio pura (Reglas, Validaciones de negocio).
3. **Repository:** Abstrae el acceso a datos (SQL/Drizzle).

- **Justificación:** Permite cambiar la base de datos (ej. de Postgres a Mongo) tocando solo el _Repository_, sin romper la lógica de negocio ni los controladores.

---

## 2. Patrones Creacionales (Creational)

_Cómo se crean e instancian los objetos._

### 🔒 Singleton

- **Contexto:** Conexión a Base de Datos (`apps/backend/src/db/index.ts`).
- **Implementación:**
  Node.js cachea los módulos (`require`/`import`). Al exportar una instancia de `drizzle(client)`, aseguramos que todo el aplicativo reutilice el mismo **pool de conexiones** en lugar de abrir una nueva conexión por cada request.
- **Referencia:** `export const db = drizzle(...)`.

---

## 3. Patrones Estructurales (Structural)

_Cómo se componen y relacionan las clases._

### 🔌 Adapter (Adaptador)

- **Contexto:** Configuración de Entorno (`apps/backend/src/config/env.ts`).
- **Implementación:**
  Utilizamos **Zod** como un adaptador que toma las variables de entorno crudas (`process.env`, que son strings inseguros) y las transforma en un objeto tipado y validado (ej. `env.PORT` como `number`).
- **Justificación:** Protege al sistema de fallar en _runtime_ por variables faltantes o mal formadas.

### 📦 Repository Pattern

- **Contexto:** Acceso a Datos (`apps/backend/src/modules/*/repository.ts`).
- **Implementación:**
  En lugar de escribir SQL (`db.select()...`) disperso por los controladores, encapsulamos las queries en métodos semánticos (`findPetById`, `createDonation`).
- **Justificación:** Centraliza la lógica de SQL. Si mañana cambia el esquema de la tabla `pets`, solo arreglamos el repositorio.

### 🎭 Facade (Fachada)

- **Contexto:** Servicios (`apps/backend/src/modules/*/service.ts`).
- **Implementación:**
  El _Service_ actúa como una fachada simple para el _Controller_. El Controller no sabe si para "Adoptar" hay que enviar emails, actualizar stocks o validar usuarios; solo llama a `adoptionService.create()`.
- **Justificación:** Reduce el acoplamiento y la complejidad en los controladores.

---

## 4. Patrones de Comportamiento (Behavioral)

_Cómo se comunican los objetos._

### ⛓️ Chain of Responsibility (Cadena de Responsabilidad)

- **Contexto:** Express Middlewares (`apps/backend/src/app.ts`).
- **Implementación:**
  Cada request pasa por una cadena de procesadores:
  `Helmet (Seguridad)` → `Cors` → `JSON Parser` → `Cookie Parser` → `Pino HTTP` → `Auth Middleware` → `validate()` → `Controller`.
  Si uno falla (o no llama a `next()`), la cadena se corta.
- **Justificación:** Permite añadir validaciones transversales (como autenticación) sin modificar el código de los endpoints.

### 📡 Observer (Observador) — Backend

- **Contexto:** Event Bus de dominio (`apps/backend/src/common/events/eventBus.ts`).
- **Implementación:**
  Clase `DomainEventBus` tipada que envuelve el `EventEmitter` nativo de Node.js. Los servicios de negocio emiten eventos de dominio (`user.registered`, `adoption.created`, `adoption.statusChanged`, `donation.created`, `donation.inKindCreated`, `volunteer.promoted`) y los listeners suscritos reaccionan de forma desacoplada.
- **Referencia:** `eventBus.emit('adoption.created', payload)` en `adoptions.service.ts`.
- **Justificación:** Permite añadir side-effects (emails, notificaciones, auditoría) sin ensuciar la lógica de negocio principal.

### 📡 Observer (Observador) — Frontend

- **Contexto:** Gestión de Estado Frontend (`apps/frontend`).
- **Implementación:**
  Utilizamos **TanStack Query**. Los componentes de UI se "suscriben" a una query (ej. `['pets', id]`). Si la data cambia o se invalida en cualquier parte de la app, todos los componentes observadores se re-renderizan automáticamente.
- **Justificación:** Mantiene la UI sincronizada con el servidor sin necesidad de _prop drilling_ o manejo manual de eventos.

### 🛡️ Graceful Shutdown

- **Contexto:** Ciclo de vida del servidor (`apps/backend/src/server.ts`).
- **Implementación:**
  El servidor captura señales SIGTERM y SIGINT para un apagado ordenado: (1) cierra el servidor HTTP para dejar de aceptar nuevas conexiones, (2) drena el pool de PostgreSQL con `pool.end()`, (3) desconecta Redis con `redis.quit()`, (4) ejecuta `process.exit(0)`. Un timeout de 30 segundos fuerza `process.exit(1)` si el apagado se estanca.
- **Justificación:** Evita corrupción de datos y conexiones huérfanas en despliegues y reinicios.

---

## 5. Patrones de UI (Frontend Specific)

### 🧱 Compound Components (Componentes Compuestos)

- **Contexto:** UI Kit (`apps/frontend/src/components/ui/dialog.tsx`).
- **Implementación:**
  Patrón utilizado por **Shadcn/UI**. En lugar de un componente gigante con 50 props, usamos sub-componentes que trabajan juntos:

```tsx
<Dialog>
  <DialogTrigger>Abrir</DialogTrigger>
  <DialogContent>Hola Mundo</DialogContent>
</Dialog>
```

- **Justificación:** Máxima flexibilidad de composición para el desarrollador.

### 🎣 Hooks Pattern

- **Contexto:** Lógica Reutilizable (`apps/frontend/src/hooks/use-auth.ts`).
- **Implementación:**
  Encapsulamos lógica de estado compleja (login, logout, check session) en funciones que empiezan con `use`.
- **Justificación:** Permite compartir lógica de comportamiento entre componentes visualmente distintos.
