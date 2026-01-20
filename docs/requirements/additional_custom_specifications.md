# Additional custom specifications

## 1. Algoritmo de Identidad QR Dual (Smart QR)

El sistema de códigos QR impresos en las chapitas de las mascotas no es un enlace estático; se comporta como un **enrutador dinámico** basado en el estado actual de la entidad en la base de datos.

### **Lógica de Resolución**

Cuando un usuario escanea pazanimal.org/qr/{uuid}, el Backend ejecuta la siguiente lógica de decisión:

1. **Consulta de Estado:** Se busca el pet_id asociado al QR en la tabla public.pets.
2. **Bifurcación de Comportamiento:**
   - **Caso A: Estado ADOPTION_AVAILABLE o IN_PROCESS**
     - **Acción:** Redirige a la **Ficha Pública de Adopción**.
     - **Objetivo:** Fomentar que quien encuentre al perro vea su perfil, historia y botón de "Adoptar".
   - **Caso B: Estado OWNED (Con Dueño) o LOST (Perdido)**
     - **Acción:** Redirige a la **Vista de Alerta/Contacto de Emergencia**.
     - **Contenido:** Muestra foto de la mascota, nombre y un botón de **"Llamar al Dueño"** (o a la Fundación si el dueño no contesta).
     - **Privacidad:** NO muestra la dirección del dueño, solo métodos de contacto mediados o seguros.

## 2. Manejo de Multimedia Polimórfica (El "Media Handler")

Debido a que usamos una única tabla public.media para mascotas, usuarios, noticias y eventos, el proceso de subida de archivos requiere una lógica personalizada en el Backend para mantener la integridad referencial lógica.

### **Flujo de Subida (Upload Workflow)**

El endpoint POST /api/media/upload no recibe solo el archivo, sino el contexto:

1. **Recepción:** El middleware (Multer) recibe el archivo.
2. **Procesamiento:** Se redimensiona/optimiza la imagen (WebP) en memoria.
3. **Almacenamiento (Cloudflare R2):** Se sube al bucket con una ruta semántica: /{env}/{entity_type}/{uuid}/{filename}.webp.
4. **Vinculación (Drizzle Transaction):**
   - Se inserta en public.media con entity_type (ej. 'PET') y entity_id.
   - **Regla de Negocio:** Si is_main \= true, se busca si ya existía una imagen principal para esa entidad y se le quita la marca (UPDATE ... set is_main \= false).

### **Garbage Collection (Limpieza)**

- **Trigger Lógico:** Cuando se elimina una entidad (ej. se borra una Noticia), un **Job Asíncrono** debe:
  1. Listar los storage_url asociados en public.media.
  2. Eliminar los archivos físicos en Cloudflare R2.
  3. Eliminar las filas en la base de datos.

## 3. Máquina de Estados de Adopción (Adoption State Machine)

### **Reglas de Transición**

1. REQUESTED \-\> INTERVIEW: Solo si un Admin asigna fecha de entrevista.
2. INTERVIEW \-\> PROBATION (Periodo de Prueba):
   - Requiere que la entrevista tenga resultado POSITIVE.
   - Al pasar a PROBATION, la mascota cambia automáticamente su estado a IN_PROCESS (desaparece del listado público pero no se asigna dueño final aún).
3. PROBATION \-\> COMPLETED:
   - **Condición Crítica:** Deben haber pasado los seguimientos obligatorios (1, 3 o 6 meses) registrados en adoption_followups.
   - **Efecto:** La mascota pasa a estado OWNED y se vincula el owner_id definitivamente.
4. ANY \-\> REVOKED: Si en cualquier punto falla, la mascota vuelve inmediatamente a ADOPTION_AVAILABLE.

La plataforma maneja tres tipos de ingresos que deben converger en reportes financieros unificados, aunque sus orígenes sean distintos.

### **Especificación de Cálculo**

Para los reportes de "Transparencia", el sistema calcula el **Valor Total Recaudado** sumando:

1. **Dinero Digital:** Suma directa de public.transactions (Mercado Pago) con estado APPROVED.
2. **Dinero en Efectivo:** Suma de public.on_site_collections donde tipo es CASH.
3. **Valorización de Insumos (Estimación):**
   - Los ítems en public.in_kind_donations (ej. "Bolsa de Arroz 5kg") tienen un campo estimated_value (cargado manualmente por el Admin al recibirlo).
   - **Regla:** Este valor se suma al total general para mostrar "Impacto Total", pero se desglosa claramente como "No Monetario" en los reportes contables.

## 5. Algoritmo de Asignación de Voluntarios (JSON Matching)

Los voluntarios definen su disponibilidad en un formato JSON estructurado en la base de datos (ej. {"mon": \["08:00-12:00"\], "sat": \["all_day"\]}).

### **Lógica de Filtrado (Admin Dashboard)**

Cuando el administrador busca "Voluntarios para el Sábado a la mañana":

1. El Backend realiza una consulta sobre el campo JSONB availability.
2. Se aplica una lógica de intersección para encontrar usuarios que tengan el día solicitado y un rango horario compatible.
3. Se prioriza a aquellos con has_experience \= true para tareas críticas (ej. Enfermería).
