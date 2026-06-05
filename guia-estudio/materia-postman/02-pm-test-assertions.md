# 📘 02. pm.test() y Assertions

- **Concepto Clave Asimilado:** Uso de `pm.test()`, `pm.expect()` y el objeto `pm.response` para validar status, body, headers y tiempo de respuesta.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Assertions Playground — Tests contra JSONPlaceholder usando `pm.test()`, `pm.expect()` para status, body, headers, response time.

**Instrucciones:**

1. Crear colección `Assertions Playground` con entorno que tenga `base_url = https://jsonplaceholder.typicode.com`.

2. Crear request `GET {{base_url}}/posts/1`

3. Agregar los siguientes tests:

```javascript
// Test 1: Status code
pm.test("Status code is 200", function () {
    pm.expect(pm.response.code).to.equal(200);
});

// Test 2: Response time
pm.test("Response time < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test 3: Content-Type header
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// Test 4: Body has expected properties
pm.test("Response has id, title, body, userId", function () {
    const body = pm.response.json();
    pm.expect(body).to.have.property("id");
    pm.expect(body).to.have.property("title");
    pm.expect(body).to.have.property("body");
    pm.expect(body).to.have.property("userId");
});

// Test 5: Specific values
pm.test("id equals 1", function () {
    const body = pm.response.json();
    pm.expect(body.id).to.equal(1);
    pm.expect(body.title).to.be.a("string");
    pm.expect(body.userId).to.be.a("number");
});

// Test 6: Response body is not empty
pm.test("Response body is not empty", function () {
    pm.expect(pm.response.text()).to.not.be.empty;
});
```

4. Ejecutar y verificar que todos los tests pasen (color verde). Si algún test falla, leer el mensaje en la pestaña Test Results para depurar.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Assertions de la API de Logística — Validar estructura de rutas, paquetes, estados de entrega.

**Instrucciones:**

1. Crear request `GET {{base_url}}/shipments/{{tracking_id}}/status`

2. Agregar estos tests avanzados:

```javascript
// Validar código de respuesta
pm.test("Status code is 200 OK", function () {
    pm.expect(pm.response.code).to.equal(200);
});

// Validar estructura del body
pm.test("Response body has correct structure", function () {
    const body = pm.response.json();
    pm.expect(body).to.be.an("object");
    pm.expect(body).to.have.all.keys([
        "trackingId", "status", "origin", "destination",
        "package", "estimatedDelivery", "currentLocation"
    ]);
});

// Validar tipos de datos
pm.test("Package has correct data types", function () {
    const pkg = pm.response.json().package;
    pm.expect(pkg.trackingNumber).to.be.a("string");
    pm.expect(pkg.weight).to.be.a("number");
    pm.expect(pkg.dimensions).to.be.an("object");
    pm.expect(pkg.dimensions).to.have.keys(["length", "width", "height"]);
});

// Validar estado del envío
pm.test("Status is one of valid values", function () {
    const validStatuses = [
        "PENDING", "PICKED_UP", "IN_TRANSIT",
        "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"
    ];
    pm.expect(validStatuses).to.include(pm.response.json().status);
});

// Validar header de rate limiting
pm.test("Rate limit headers present", function () {
    pm.expect(pm.response.headers.get("X-RateLimit-Remaining")).to.exist;
    pm.expect(parseInt(pm.response.headers.get("X-RateLimit-Remaining"))).to.be.at.least(0);
});

// Validar response time (SLA)
pm.test("Response time within SLA of 800ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(800);
});

// Validar formato de fecha
pm.test("estimatedDelivery is valid ISO date", function () {
    const date = pm.response.json().estimatedDelivery;
    pm.expect(new Date(date).toISOString()).to.equal(date);
});
```

3. Probar forzando un fallo: cambiar temporalmente `tracking_id` a un valor inválido y ver qué tests se rompen. Luego restaurarlo.
