# 📘 15. Contract Testing

- **Concepto Clave Asimilado:** Contract Testing — verificar que las respuestas de una API cumplen estrictamente con un esquema predefinido (contrato), asegurando compatibilidad entre proveedor y consumidor.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Contract Check — Validar que el response de `GET /posts` cumpla estrictamente con un schema predefinido usando `tv4.validate()` y reportar violaciones.

**Instrucciones:**

1. Crear colección `Contract Testing Lab` con entorno `base_url = https://jsonplaceholder.typicode.com`.

2. Crear request `GET {{base_url}}/posts`.

3. En **Tests**, implementar contract validation:

```javascript
// ===== Contract: Post Schema =====
const postContract = {
    type: "object",
    properties: {
        userId: { type: "number" },
        id: { type: "number" },
        title: { type: "string", minLength: 1 },
        body: { type: "string" }
    },
    required: ["userId", "id", "title", "body"],
    additionalProperties: false  // NO campos extra permitidos
};

// Test 1: Every item in array must match contract
pm.test("Contract: All posts match the Post schema", function () {
    const posts = pm.response.json();
    pm.expect(posts).to.be.an("array");

    posts.forEach((post, index) => {
        const valid = tv4.validate(post, postContract);
        if (!valid) {
            console.log(`Post ${index} (id=${post.id}): Contract violation`);
            console.log(`  Error: ${tv4.error.message}`);
            console.log(`  Path: ${tv4.error.dataPath}`);
        }
        pm.expect(valid).to.be.true;
    });
});

// Test 2: Check total fields count
pm.test("Contract: No additional fields beyond schema", function () {
    const posts = pm.response.json();
    posts.forEach((post, index) => {
        const allowedFields = ["userId", "id", "title", "body"];
        const actualFields = Object.keys(post);
        const extraFields = actualFields.filter(f => !allowedFields.includes(f));
        if (extraFields.length > 0) {
            console.log(`Post ${index}: Extra fields found: ${extraFields.join(", ")}`);
        }
        pm.expect(extraFields).to.be.empty;
    });
});

// Test 3: Data type contract
pm.test("Contract: Data types are correct", function () {
    const posts = pm.response.json();
    posts.forEach((post, index) => {
        pm.expect(post.userId, `Post ${post.id}: userId must be number`).to.be.a("number");
        pm.expect(post.id, `Post ${post.id}: id must be number`).to.be.a("number");
        pm.expect(post.title, `Post ${post.id}: title must be string`).to.be.a("string");
        pm.expect(post.body, `Post ${post.id}: body must be string`).to.be.a("string");
    });
});
```

4. Ejecutar y verificar que todos los posts cumplen el contrato.

5. Forzar un fallo: quitar `additionalProperties: false` y agregar un campo extra manualmente a un post, o cambiar el schema para exigir un campo que no existe.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Contrato de API de Inventario — Verificar cada endpoint contra su schema contract: `Product`, `Warehouse`, `StockMovement`.

**Instrucciones:**

1. Definir los contracts como variables de colección (para reusarlos entre requests).

Agregar en **Pre-request de colección**:

```javascript
// ===== Contracts de Logística =====

// Contract: Product
pm.collectionVariables.set("contract_product", JSON.stringify({
    type: "object",
    properties: {
        productId: { type: "string", pattern: "^PROD-\\d{4}$" },
        name: { type: "string", minLength: 1 },
        category: { type: "string", enum: ["ELECTRONICS", "CLOTHING", "FOOD", "MEDICINE", "OTHER"] },
        weight: { type: "number", minimum: 0 },
        dimensions: {
            type: "object",
            properties: {
                length: { type: "number", minimum: 0 },
                width: { type: "number", minimum: 0 },
                height: { type: "number", minimum: 0 }
            },
            required: ["length", "width", "height"]
        },
        price: { type: "number", minimum: 0 },
        supplierId: { type: "string" },
        minStock: { type: "number", minimum: 0 },
        currentStock: { type: "number", minimum: 0 },
        status: { type: "string", enum: ["ACTIVE", "DISCONTINUED", "OUT_OF_STOCK"] }
    },
    required: ["productId", "name", "category", "weight", "price", "status"],
    additionalProperties: false
}));

// Contract: Warehouse
pm.collectionVariables.set("contract_warehouse", JSON.stringify({
    type: "object",
    properties: {
        warehouseId: { type: "string", pattern: "^WH-\\d{3}$" },
        name: { type: "string" },
        location: {
            type: "object",
            properties: {
                address: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" }
            },
            required: ["address", "city", "state", "zipCode"]
        },
        capacity: { type: "number", minimum: 1 },
        currentUtilization: { type: "number", minimum: 0 },
        status: { type: "string", enum: ["ACTIVE", "MAINTENANCE", "CLOSED"] }
    },
    required: ["warehouseId", "name", "location", "capacity", "status"],
    additionalProperties: false
}));

// Contract: StockMovement
pm.collectionVariables.set("contract_stock_movement", JSON.stringify({
    type: "object",
    properties: {
        movementId: { type: "string", pattern: "^MOV-\\d{8}-\\d{4}$" },
        productId: { type: "string" },
        warehouseId: { type: "string" },
        type: { type: "string", enum: ["INBOUND", "OUTBOUND", "TRANSFER", "ADJUSTMENT"] },
        quantity: { type: "number" },
        reason: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
        userId: { type: "string" }
    },
    required: ["movementId", "productId", "warehouseId", "type", "quantity", "timestamp"],
    additionalProperties: false
}));
```

2. Crear request `GET {{base_url}}/warehouses/{{warehouse_id}}` y tests de contract:

```javascript
// Test 1: Validar contra contrato de Warehouse
pm.test("Contract: Warehouse response matches Warehouse schema", function () {
    const warehouse = pm.response.json();
    const schema = JSON.parse(pm.collectionVariables.get("contract_warehouse"));
    const valid = tv4.validate(warehouse, schema);
    if (!valid) {
        console.log("Contract violation:", JSON.stringify(tv4.error, null, 2));
    }
    pm.expect(valid).to.be.true;
});

// Test 2: Validar tipos específicos
pm.test("Contract: Warehouse ID format is WH-XXX", function () {
    const body = pm.response.json();
    pm.expect(body.warehouseId).to.match(/^WH-\d{3}$/);
});

// Test 3: Validar utilización contra capacidad
pm.test("Contract: Utilization does not exceed capacity", function () {
    const body = pm.response.json();
    pm.expect(body.currentUtilization).to.be.at.most(body.capacity);
});
```

3. Crear request `GET {{base_url}}/warehouses/{{warehouse_id}}/stock`:

```javascript
// Test 1: Contract para cada producto en stock
pm.test("Contract: All products match Product schema", function () {
    const response = pm.response.json();
    const products = response.items || [];
    const schema = JSON.parse(pm.collectionVariables.get("contract_product"));

    products.forEach((product, index) => {
        const valid = tv4.validate(product, schema);
        if (!valid) {
            console.log(`Product ${index} (${product.productId}): Contract violation`);
            console.log(`  Error: ${tv4.error.message}`);
            pm.expect(valid).to.be.true;
        }
    });
});

// Test 2: Stock levels are non-negative
pm.test("Contract: All stock levels are non-negative", function () {
    const products = pm.response.json().items;
    products.forEach(p => {
        pm.expect(p.currentStock, `${p.productId} has negative stock`).to.be.at.least(0);
    });
});
```

4. Crear request `POST {{base_url}}/inventory/movements` y test de contract:

```javascript
// Test 1: Response debe cumplir contrato StockMovement
pm.test("Contract: Created movement matches StockMovement schema", function () {
    const movement = pm.response.json();
    const schema = JSON.parse(pm.collectionVariables.get("contract_stock_movement"));
    const valid = tv4.validate(movement, schema);
    if (!valid) {
        console.log("Movement contract violation:", JSON.stringify(tv4.error, null, 2));
    }
    pm.expect(valid).to.be.true;
});

// Test 2: Movement ID format
pm.test("Contract: Movement ID format is MOV-YYYYMMDD-XXXX", function () {
    const body = pm.response.json();
    pm.expect(body.movementId).to.match(/^MOV-\d{8}-\d{4}$/);
});

// Test 3: Timestamp is valid ISO
pm.test("Contract: Timestamp is valid ISO 8601", function () {
    const body = pm.response.json();
    const ts = new Date(body.timestamp);
    pm.expect(ts.toISOString()).to.equal(body.timestamp);
});
```

5. Crear un **Contract Dashboard** — request que corre todos los contracts y reporta violaciones:

```javascript
// Test de resumen de contracts
pm.test("Contract Audit: All contracts pass", function () {
    console.log("=== Contract Audit Report ===");
    console.log("Product contract:", pm.collectionVariables.get("contract_product") ? "loaded" : "missing");
    console.log("Warehouse contract:", pm.collectionVariables.get("contract_warehouse") ? "loaded" : "missing");
    console.log("StockMovement contract:", pm.collectionVariables.get("contract_stock_movement") ? "loaded" : "missing");
    pm.expect(pm.collectionVariables.get("contract_product")).to.exist;
    pm.expect(pm.collectionVariables.get("contract_warehouse")).to.exist;
    pm.expect(pm.collectionVariables.get("contract_stock_movement")).to.exist;
});
```

6. Ejecutar toda la colección y revisar que ningún endpoint viole su contrato. Si algún contrato se rompe, el test debe fallar claramente indicando qué campo falló.
