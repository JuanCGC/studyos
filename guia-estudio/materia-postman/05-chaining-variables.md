# 📘 05. Chaining de Variables

- **Concepto Clave Asimilado:** Encadenamiento de requests donde la respuesta de uno alimenta la entrada del siguiente mediante variables de entorno o colección.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Chain de 3 Requests — `POST` crear recurso → extraer `id` → `GET` con ese `id` → extraer `userId` → `GET` user detail.

**Instrucciones:**

1. Crear colección `Chaining Lab` con entorno `base_url = https://jsonplaceholder.typicode.com`.

2. **Request 1: POST /posts**
   - Body:
     ```json
     {
         "title": "Chain Test",
         "body": "This post is part of a chaining flow",
         "userId": 5
     }
     ```
   - Tests:
     ```javascript
     const jsonData = pm.response.json();
     pm.expect(pm.response.code).to.equal(201);
     pm.environment.set("post_id", jsonData.id);
     pm.environment.set("user_id", jsonData.userId);
     console.log("Post created with ID:", jsonData.id);
     console.log("User ID:", jsonData.userId);
     ```

3. **Request 2: GET /posts/{{post_id}}**
   - Tests:
     ```javascript
     const jsonData = pm.response.json();
     pm.test("Retrieved correct post", function () {
         pm.expect(jsonData.id).to.equal(parseInt(pm.environment.get("post_id")));
     });
     // Extraer userId para el siguiente request
     pm.environment.set("user_id", jsonData.userId);
     console.log("Post belongs to userId:", jsonData.userId);
     ```

4. **Request 3: GET /users/{{user_id}}**
   - Tests:
     ```javascript
     const jsonData = pm.response.json();
     pm.test("Retrieved user details", function () {
         pm.expect(jsonData.id).to.equal(parseInt(pm.environment.get("user_id")));
         pm.expect(jsonData).to.have.property("name");
         pm.expect(jsonData).to.have.property("email");
     });
     pm.test("User name matches expected", function () {
         const userName = pm.response.json().name;
         pm.expect(userName).to.not.be.empty;
     });
     console.log("User found:", jsonData.name, "-", jsonData.email);
     ```

5. Ejecutar en secuencia: correr la colección entera desde el Collection Runner (o manualmente request por request en orden).

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Chaining de Envío — `POST /shipments` → extraer `trackingId` → `PUT /shipments/{{trackingId}}/pickup` → `GET /shipments/{{trackingId}}/status`.

**Instrucciones:**

1. **Request 1: POST /shipments** — Crear nuevo envío
   - Body:
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
   - Tests:
     ```javascript
     const response = pm.response.json();
     pm.test("Shipment created successfully", function () {
         pm.expect(pm.response.code).to.equal(201);
         pm.expect(response).to.have.property("trackingId");
     });

     // Guardar trackingId y otros datos para requests siguientes
     pm.environment.set("tracking_id", response.trackingId);
     pm.environment.set("shipment_origin", response.origin.zipCode);
     pm.environment.set("shipment_destination", response.destination.zipCode);
     pm.environment.set("shipment_weight", response.package.weight);

     console.log("=== Shipment Created ===");
     console.log("Tracking ID:", response.trackingId);
     console.log("Status:", response.status);
     ```

2. **Request 2: PUT /shipments/{{tracking_id}}/pickup** — Agendar recolección
   - Body:
     ```json
     {
         "pickupDate": "{{$isoTimestamp}}",
         "pickupAddress": "123 Industrial Blvd, Dallas, TX 75201",
         "contactPerson": "Juan Perez",
         "contactPhone": "555-0100"
     }
     ```
   - Tests:
     ```javascript
     const response = pm.response.json();
     pm.test("Pickup scheduled", function () {
         pm.expect(pm.response.code).to.equal(200);
         pm.expect(response.status).to.equal("PICKED_UP");
     });

     pm.environment.set("pickup_time", response.pickupConfirmedAt);
     console.log("Pickup confirmed at:", response.pickupConfirmedAt);
     ```

3. **Request 3: GET /shipments/{{tracking_id}}/status** — Consultar estado
   - Tests:
     ```javascript
     const response = pm.response.json();
     pm.test("Status retrieved and matches expected flow", function () {
         pm.expect(pm.response.code).to.equal(200);
         pm.expect(response.trackingId).to.equal(pm.environment.get("tracking_id"));
     });

     pm.test("Status progressed from PENDING", function () {
         pm.expect(response.status).to.not.equal("PENDING");
     });

     // Verificar que el campo estimatedDelivery existe
     pm.test("Estimated delivery date is set", function () {
         pm.expect(response.estimatedDelivery).to.exist;
         const deliveryDate = new Date(response.estimatedDelivery);
         pm.expect(deliveryDate.getTime()).to.be.greaterThan(Date.now());
     });

     console.log("=== Delivery Status ===");
     console.log("Current status:", response.status);
     console.log("Estimated delivery:", response.estimatedDelivery);
     console.log("Current location:", response.currentLocation);
     ```

4. Agregar un **cuarto request** opcional: `PATCH /shipments/{{tracking_id}}/deliver` para simular la entrega exitosa y cerrar el ciclo.

5. Probar toda la cadena desde el Collection Runner para verificar que las variables se propagan correctamente entre requests.
