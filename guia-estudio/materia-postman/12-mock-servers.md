# 📘 12. Mock Servers

- **Concepto Clave Asimilado:** Mock servers en Postman que simulan APIs reales devolviendo respuestas predefinidas, útiles para desarrollo paralelo y pruebas sin dependencias externas.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Mock Server Aislado — Crear un mock server en Postman para una API de usuarios con 3 endpoints: listar, obtener por ID, crear.

**Instrucciones:**

1. Crear una nueva colección llamada `Mock API Usuarios`.

2. Agregar 3 requests con sus respectivos **Example Responses**:

   **Request 1: GET /users** — Listar usuarios
   - URL: `https://mock-api-usuarios.com/users`
   - Guardar un **Example** (response):
     ```json
     [
         { "id": 1, "name": "Ana García", "email": "ana@example.com", "role": "admin" },
         { "id": 2, "name": "Carlos López", "email": "carlos@example.com", "role": "user" },
         { "id": 3, "name": "María Rodríguez", "email": "maria@example.com", "role": "user" }
     ]
     ```
   - Status: `200 OK`

   **Request 2: GET /users/:id** — Obtener usuario por ID
   - URL: `https://mock-api-usuarios.com/users/1`
   - Guardar un **Example**:
     ```json
     {
         "id": 1,
         "name": "Ana García",
         "email": "ana@example.com",
         "role": "admin",
         "createdAt": "2024-01-15T10:30:00Z"
     }
     ```
   - Status: `200 OK`
   - Guardar otro **Example** para 404:
     - Status: `404 NOT FOUND`
     - Body: `{ "error": "User not found" }`

   **Request 3: POST /users** — Crear usuario
   - URL: `https://mock-api-usuarios.com/users`
   - Body request: `{ "name": "Nuevo Usuario", "email": "nuevo@example.com", "role": "user" }`
   - Guardar un **Example**:
     ```json
     {
         "id": 4,
         "name": "Nuevo Usuario",
         "email": "nuevo@example.com",
         "role": "user",
         "createdAt": "2024-06-05T14:20:00Z"
     }
     ```
   - Status: `201 CREATED`

3. Ir a Postman Web → **Mock Servers** → **Create Mock Server**.

4. Configurar:
   - **Name:** `Mock Usuarios API`
   - **Collection:** `Mock API Usuarios`
   - **Environment:** (ninguno)
   - **Mock Server URL:** (se genera automáticamente, ej: `https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.mock.pstmn.io`)

5. Hacer clic en **Create Mock Server**.

6. Probar el mock desde Postman (o desde cualquier cliente HTTP):
   - `GET {{mock_url}}/users`
   - `GET {{mock_url}}/users/1`
   - `POST {{mock_url}}/users`

7. Verificar que las respuestas coinciden con los Examples guardados.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Mock de Proveedor Externo — Simular API de paquetería externa (FedEx/DHL) con endpoints de tracking, rates y pickup scheduling.

**Instrucciones:**

1. Crear colección `Mock Proveedor Externo - Paquetería`.

2. **Endpoint 1: POST /external/rates** — Cotizar envío
   - Request: `POST {{base_url}}/external/rates`
   - Body request:
     ```json
     {
         "originZip": "10001",
         "destinationZip": "90210",
         "weight": 5.0,
         "dimensions": { "length": 30, "width": 20, "height": 15 },
         "serviceType": "GROUND"
     }
     ```
   - **Example Response** (200 OK):
     ```json
     {
         "provider": "FedEx",
         "serviceType": "GROUND",
         "baseRate": 12.50,
         "fuelSurcharge": 1.88,
         "totalRate": 14.38,
         "estimatedTransitDays": 5,
         "deliveryDate": "2024-06-12T18:00:00Z",
         "rateId": "RATE-20240605-001"
     }
     ```
   - Guardar otro **Example** para peso excedido (400):
     ```json
     { "error": "WEIGHT_EXCEEDED", "message": "Weight exceeds maximum of 150 lbs", "maxWeight": 150 }
     ```

3. **Endpoint 2: GET /external/tracking/:id** — Tracking de envío
   - Request: `GET {{base_url}}/external/tracking/TRK-FEDEX-001`
   - **Example Response** (200 OK):
     ```json
     {
         "trackingNumber": "TRK-FEDEX-001",
         "status": "IN_TRANSIT",
         "estimatedDelivery": "2024-06-12T18:00:00Z",
         "currentLocation": {
             "city": "Memphis",
             "state": "TN",
             "facility": "FedEx Memphis Hub"
         },
         "scanEvents": [
             { "timestamp": "2024-06-06T08:00:00Z", "location": "Dallas, TX", "event": "PICKED_UP" },
             { "timestamp": "2024-06-06T22:00:00Z", "location": "Memphis, TN", "event": "ARRIVED_AT_HUB" },
             { "timestamp": "2024-06-07T03:00:00Z", "location": "Memphis, TN", "event": "DEPARTED_HUB" }
         ],
         "serviceType": "GROUND"
     }
     ```
   - Guardar **Example** para 404: `{ "error": "Tracking number not found" }`

4. **Endpoint 3: POST /external/pickup** — Agendar recolección
   - Request: `POST {{base_url}}/external/pickup`
   - Body request:
     ```json
     {
         "address": "123 Industrial Blvd, Dallas, TX 75201",
         "contactName": "Juan Pérez",
         "contactPhone": "555-0100",
         "packageCount": 3,
         "readyBy": "2024-06-06T14:00:00Z",
         "closeTime": "2024-06-06T17:00:00Z"
     }
     ```
   - **Example Response** (201 Created):
     ```json
     {
         "confirmationNumber": "PICKUP-20240605-789",
         "scheduledDate": "2024-06-06",
         "pickupWindow": "14:00-17:00",
         "driverInstructions": "Use loading dock at rear of building",
         "status": "SCHEDULED"
     }
     ```
   - Guardar **Example** para conflicto de horario (409): `{ "error": "PICKUP_SLOT_UNAVAILABLE", "message": "No pickup slots available for the requested time" }`

5. Crear el Mock Server en Postman Web:
   - **Name:** `Mock Proveedor Externo`
   - **Collection:** `Mock Proveedor Externo - Paquetería`
   - **Environment:** `Logística - Desarrollo`

6. Configurar la colección principal de logística para que pueda cambiar entre mock y proveedor real:
   - Crear variable de entorno `provider_base_url` con valor inicial `{{base_url}}/external` (apunta al mock).
   - Opcional: tener variables separadas `mock_url` y `production_provider_url`.

7. Probar los endpoints del mock desde la colección de logística y verificar que las respuestas simuladas son correctas.

8. Probar escenarios:
   - Cotización exitosa con peso normal.
   - Cotización con peso excedido (esperar error 400).
   - Tracking de número existente.
   - Tracking de número inexistente (esperar 404).
