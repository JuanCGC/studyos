# 📘 04. Schema Validation con tv4

- **Concepto Clave Asimilado:** Validación de respuestas JSON contra esquemas predefinidos usando la librería `tv4` (Tiny Validator v4) integrada en Postman.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** tv4 Schema Validator — Validar response de `GET /posts/1` contra un schema inline usando `tv4.validate()`.

**Instrucciones:**

1. Crear colección `Schema Validator` con entorno `base_url = https://jsonplaceholder.typicode.com`.

2. Crear request `GET {{base_url}}/posts/1`

3. En **Tests**, escribir:

```javascript
// Definir schema inline
const postSchema = {
    type: "object",
    properties: {
        userId: { type: "number" },
        id: { type: "number" },
        title: { type: "string" },
        body: { type: "string" }
    },
    required: ["userId", "id", "title", "body"]
};

// Validar con tv4
pm.test("Response matches Post schema", function () {
    const jsonData = pm.response.json();
    const valid = tv4.validate(jsonData, postSchema);
    pm.expect(valid).to.be.true;
});

// Mostrar errores si falla
pm.test("No validation errors", function () {
    const jsonData = pm.response.json();
    tv4.validate(jsonData, postSchema);
    if (tv4.error) {
        console.log("Validation error:", tv4.error.message);
        console.log("Data path:", tv4.error.dataPath);
    }
    pm.expect(tv4.error).to.be.null;
});
```

4. Modificar el schema para que pida un campo inexistente (ej: `"email"`) y observar el test fallar. Luego restaurarlo.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Validación de Esquema de Paquete — Schema completo de Package con `trackingNumber`, `weight`, `dimensions`, `origin`, `destination`, `status`, `estimatedDelivery`.

**Instrucciones:**

1. Crear request `GET {{base_url}}/shipments/{{tracking_id}}/status`

2. En **Tests**, definir schema completo del objeto Package:

```javascript
// ===== Schema: Package =====
const packageSchema = {
    type: "object",
    properties: {
        trackingNumber: {
            type: "string",
            pattern: "^TRK-[A-Z0-9]{8}$"
        },
        weight: {
            type: "number",
            minimum: 0.1,
            maximum: 1000
        },
        dimensions: {
            type: "object",
            properties: {
                length: { type: "number", minimum: 1 },
                width: { type: "number", minimum: 1 },
                height: { type: "number", minimum: 1 },
                unit: { type: "string", enum: ["cm", "in"] }
            },
            required: ["length", "width", "height", "unit"]
        },
        origin: {
            type: "object",
            properties: {
                name: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string", pattern: "^\\d{5}(-\\d{4})?$" },
                country: { type: "string", minLength: 2 }
            },
            required: ["name", "address", "city", "state", "zipCode", "country"]
        },
        destination: {
            type: "object",
            properties: {
                name: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string", pattern: "^\\d{5}(-\\d{4})?$" },
                country: { type: "string", minLength: 2 }
            },
            required: ["name", "address", "city", "state", "zipCode", "country"]
        },
        status: {
            type: "string",
            enum: ["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"]
        },
        estimatedDelivery: {
            type: "string",
            format: "date-time"
        },
        priority: {
            type: "string",
            enum: ["STANDARD", "EXPEDITED", "OVERNIGHT"]
        }
    },
    required: [
        "trackingNumber", "weight", "dimensions",
        "origin", "destination", "status", "estimatedDelivery"
    ]
};
```

3. Agregar tests que usen el schema:

```javascript
// Test 1: Validar estructura completa del response
pm.test("Shipment response matches Package schema", function () {
    const body = pm.response.json();
    const valid = tv4.validate(body, {
        type: "object",
        properties: {
            trackingId: { type: "string" },
            status: { type: "string" },
            package: packageSchema
        },
        required: ["trackingId", "status", "package"]
    });
    pm.expect(valid).to.be.true;
});

// Test 2: Validar solo el sub-objeto package
pm.test("Package sub-object is valid", function () {
    const pkg = pm.response.json().package;
    const valid = tv4.validate(pkg, packageSchema);
    if (!valid) {
        console.log("Package validation error:", JSON.stringify(tv4.error, null, 2));
    }
    pm.expect(valid).to.be.true;
});

// Test 3: Validar que dimensiones tengan valores positivos
pm.test("Dimensions are positive numbers", function () {
    const dims = pm.response.json().package.dimensions;
    pm.expect(dims.length).to.be.above(0);
    pm.expect(dims.width).to.be.above(0);
    pm.expect(dims.height).to.be.above(0);
});

// Test 4: Validar código postal de origen
pm.test("Origin zip code is valid US format", function () {
    const zip = pm.response.json().package.origin.zipCode;
    pm.expect(zip).to.match(/^\d{5}(-\d{4})?$/);
});
```

4. Crear un request adicional `POST {{base_url}}/shipments` con tests que validen el schema del body de entrada antes de enviar:

```javascript
// Pre-request: validar body antes de enviar
const requestBody = JSON.parse(pm.request.body.raw);
const inputSchema = {
    type: "object",
    properties: {
        origin: { type: "string", minLength: 5 },
        destination: { type: "string", minLength: 5 },
        weight: { type: "number", minimum: 0.1 },
        priority: { type: "string", enum: ["STANDARD", "EXPEDITED", "OVERNIGHT"] }
    },
    required: ["origin", "destination", "weight"]
};

if (!tv4.validate(requestBody, inputSchema)) {
    throw new Error("Request body validation failed: " + tv4.error.message);
}
```
