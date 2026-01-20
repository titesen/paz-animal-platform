# Guía de Testing y Estrategia de Calidad (QA)

## 1. Pirámide de Pruebas (Estrategia)

Priorizamos los tests que dan más confianza por el menor costo de mantenimiento.

### Tests de Integración (Backend) - 🏆 Prioridad Alta

- **Qué prueban:** Que el endpoint `/api/donations` reciba un JSON, lo guarde en la DB real (Docker) y responda `200`.
- **Herramienta:** Supertest + Vitest.
- **Por qué:** Garantizan que la API funciona como un todo.

### Tests Unitarios (Lógica Pura)

- **Qué prueban:** Funciones utilitarias (`calculateAge(birthDate)`), validaciones de Zod complejas y reglas de negocio aisladas en Servicios.
- **Herramienta:** Vitest.

### Tests de Componentes (Frontend)

- **Qué prueban:** Que el botón "Donar" esté habilitado solo cuando el monto es válido. Accesibilidad básica.
- **Herramienta:** React Testing Library.

### End-to-End (E2E) - (Fase 2)

- **Qué prueban:** Flujo completo de usuario real en un navegador real.
- **Herramienta:** Playwright.

---

## 2. Stack Tecnológico (The Testing Toolkit)

Unificamos herramientas para simplificar la configuración del Monorepo.

| Ámbito           | Herramienta           | Propósito                                                               |
| ---------------- | --------------------- | ----------------------------------------------------------------------- |
| **Runner**       | Vitest                | Ejecutor de tests ultra-rápido (reemplaza a Jest). Compatible con Vite. |
| **Backend API**  | Supertest             | Simula peticiones HTTP contra la app de Express sin abrir puerto real.  |
| **Frontend DOM** | React Testing Library | Renderiza componentes React para testear interacciones.                 |
| **Browser E2E**  | Playwright            | Automatización de navegadores (Chrome/Firefox/Safari).                  |
| **Mocks**        | Vitest / MSW          | Mocking de funciones y servidores API (Mock Service Worker).            |

---

## 3. Convenciones y Organización

### Ubicación de Archivos (Co-ubicación)

Los tests viven al lado del código que prueban. Esto facilita ver si un componente tiene tests o no.

- ✅ `src/features/pets/services/pets.service.ts`
- ✅ `src/features/pets/services/pets.service.test.ts` (Unitario)
- ✅ `src/features/pets/pets.controller.test.ts` (Integración)

### Nomenclatura

- **Archivos:** `*.test.ts` o `*.test.tsx`.
- **Suites (`describe`):** Nombre del módulo o componente.
- **Casos (`it` / `test`):** Deben leerse como una frase en inglés.
- ✅ `it('should create a transaction when payment is approved')`
- ❌ `it('test 1')`

---

## 4. Guía de Testing Backend

### A. Tests de Integración (Controller + DB)

Usamos una base de datos real (Docker container) para pruebas, que se limpia antes de cada suite. No mockeamos la base de datos en integración, queremos ver que el SQL funcione.

```typescript
// pets.controller.test.ts
import request from "supertest";
import { app } from "../../app";

describe("POST /api/pets", () => {
  it("should create a pet and return 201", async () => {
    const res = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Firulais", species: "DOG" });

    expect(res.status).toBe(201);
    expect(res.body.data.pet.name).toBe("Firulais");
  });
});
```

### B. Manejo de Dependencias (Mocks)

Mockeamos servicios externos que cobran dinero o envían emails reales.

- **Mercado Pago:** Se mockea siempre. No queremos cobrar tarjetas reales en CI.
- **Email Service:** Se mockea para no spammear.

---

## 5. Guía de Testing Frontend

### A. Tests de Componentes

Probamos lo que el usuario ve y hace, no el estado interno.

```typescript
// DonationForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DonationForm } from './DonationForm';

test('shows error when amount is too low', () => {
  render(<DonationForm />);

  const input = screen.getByLabelText(/monto/i);
  fireEvent.change(input, { target: { value: '10' } }); // Mínimo es 100
  fireEvent.click(screen.getByText(/donar/i));

  expect(screen.getByText(/el monto mínimo es $100/i)).toBeInTheDocument();
});

```

---

## 6. Cobertura de Código (Code Coverage)

No perseguimos el 100% ciegamente.

- **Objetivo Global:** > 70%.
- **Objetivo Crítico (Donaciones/Auth):** 100% de ramas (branches).
- **Reporte:** Se genera automáticamente en CI con `vitest run --coverage`.

---

## 7. Integración Continua (CI)

En GitHub Actions:

1. Levantamos servicios: `docker-compose up -d db-test`.
2. Ejecutamos Backend Tests: `npm run test:integration -w apps/backend`.
3. Ejecutamos Frontend Tests: `npm run test -w apps/frontend`.

> **Regla:** Si falla un test, no se puede hacer Merge a `main`.
