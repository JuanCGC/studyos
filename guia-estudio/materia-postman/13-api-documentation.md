# 📘 13. API Documentation

- **Concepto Clave Asimilado:** Publicación de colecciones como documentación interactiva en Postman Web, con descripciones, ejemplos, schemas y posibilidad de dominio personalizado.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Doc Generator — Publicar colección de usuarios como documentación en Postman web y explorar sus características.

**Instrucciones:**

1. Usar la colección `Mock API Usuarios` del capítulo anterior.

2. Enriquecer la documentación dentro de Postman:
   - Para cada request, hacer clic en la pestaña **Documentation** (a la derecha del editor).
   - Agregar una breve descripción:
     ```
     # GET /users
     Returns a list of all registered users in the system.
     
     ## Response
     Array of user objects with id, name, email, and role.
     
     ## Example
     ```json
     [
       { "id": 1, "name": "Ana García", "email": "ana@example.com", "role": "admin" }
     ]
     ```
     ```

3. Ir a Postman Web → **Collections** → seleccionar la colección → **View Documentation** (icono de libro en la barra lateral).

4. Hacer clic en **Publish** (botón en la esquina superior derecha de la vista de documentación).

5. Configurar:
   - **Visibility:** **Public** (o **Private** si es equipo)
   - **Domain:** Opcional (si tienes dominio personalizado configurado)
   - **Theme:** Elegir entre los disponibles

6. Hacer clic en **Publish** y copiar la URL generada.

7. Abrir la URL en una ventana de incógnito/privada para ver cómo la ve un consumidor externo.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Documentación de Logística Publicada — Documentación completa con ejemplos, schemas, descripciones detalladas por endpoint, publicada con dominio personalizado.

**Instrucciones:**

1. En la colección `API de Logística e Inventario`, agregar documentación detallada a **cada** request. Ejemplo completo para el endpoint de creación de envío:

```markdown
# POST /shipments
Create a new shipment in the logistics system.

## Description
This endpoint creates a new shipment record, assigns a tracking number, 
calculates initial rate estimates, and queues the pickup process.

## Request Body

### Schema
| Field | Type | Required | Description |
|---|---|---|---|
| origin.name | string | Yes | Sender's full name or company name |
| origin.address | string | Yes | Street address of origin |
| origin.city | string | Yes | City of origin |
| origin.state | string | Yes | State code (2 letters) |
| origin.zipCode | string | Yes | ZIP code (5 or 9 digits) |
| destination.name | string | Yes | Recipient's full name |
| destination.address | string | Yes | Street address of destination |
| destination.city | string | Yes | City of destination |
| destination.state | string | Yes | State code (2 letters) |
| destination.zipCode | string | Yes | ZIP code (5 or 9 digits) |
| package.weight | number | Yes | Weight in kg (0.1 - 1000) |
| package.dimensions.length | number | Yes | Length in cm |
| package.dimensions.width | number | Yes | Width in cm |
| package.dimensions.height | number | Yes | Height in cm |
| package.priority | string | Yes | `STANDARD`, `EXPEDITED`, or `OVERNIGHT` |

### Example
```json
{
  "origin": {
    "name": "Almacén Central",
    "address": "123 Industrial Blvd",
    "city": "Dallas",
    "state": "TX",
    "zipCode": "75201"
  },
  "destination": {
    "name": "Cliente Final",
    "address": "456 Main St",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101"
  },
  "package": {
    "weight": 5.2,
    "dimensions": { "length": 30, "width": 20, "height": 15 },
    "priority": "EXPEDITED"
  }
}
```

## Responses

### 201 Created
Shipment created successfully. Returns the shipment details with assigned tracking ID.

### 400 Bad Request
Invalid input data. Check field validations.

### 401 Unauthorized
Missing or invalid API key / token.

### 422 Unprocessable Entity
Business rule violation (e.g., weight exceeds maximum).
```

2. Agregar documentación similar para estos endpoints:

   - **GET /shipments/:id/status** — Consultar estado de envío
   - **PUT /shipments/:id/pickup** — Agendar recolección
   - **GET /warehouses/:id/stock** — Consultar stock
   - **POST /inventory/reorder** — Reponer inventario

3. Para cada endpoint, asegurarse de tener al menos 2 Examples:
   - Respuesta exitosa (200/201)
   - Respuesta de error (400/404/500)

4. Ir a Postman Web → **API Documentation** → seleccionar colección.

5. Configurar publicación:
   ```yaml
   # Configuración recomendada
   Title: "Logística e Inventario API v1"
   Description: "API RESTful para gestión de envíos, tracking, inventario y comunicación con proveedores externos."
   Visibility: Public
   Domain: (opcional, si tienes dominio propio)
   Theme: Dark (recomendado para APIs)
   ```

6. Publicar y compartir la URL con el equipo.

7. Configurar un **dominio personalizado** (opcional, requiere plan Postman):
   - Ir a **Settings** → **Domains** en Postman Web.
   - Agregar el dominio (ej: `api-docs.logistica.com`).
   - Configurar el CNAME en el DNS apuntando a `docs.postman.com`.
   - Esperar la propagación y verificar.

8. Agregar un **badge** de documentación al README del repositorio:

```markdown
[![Postman Documentation](https://img.shields.io/badge/API%20Docs-Postman-orange)](https://documenter.getpostman.com/view/XXXXX/XXXXX)
```
