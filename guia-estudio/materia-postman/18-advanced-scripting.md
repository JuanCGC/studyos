# 📘 18. Advanced Scripting

- **Concepto Clave Asimilado:** Uso de librerías JavaScript integradas en Postman (CryptoJS, lodash, moment) y scripting avanzado para manipulación de datos, generación de códigos y cálculos complejos.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Crypto y Lodash — Usar CryptoJS para generar hash SHA256 de un payload, y lodash para manipular objetos y arrays en los tests.

**Instrucciones:**

1. Crear colección `Advanced Scripting Lab` con entorno `base_url = https://jsonplaceholder.typicode.com`.

2. **Request 1: GET /posts** — Usar lodash para analizar datos
   - URL: `{{base_url}}/posts`
   - Tests:
     ```javascript
     const posts = pm.response.json();

     // Usar lodash para manipular datos
     const titles = _.map(posts, "title");
     const first5 = _.take(posts, 5);
     const groupByUser = _.groupBy(posts, "userId");
     const longestTitle = _.maxBy(posts, p => p.title.length);
     const shortestTitle = _.minBy(posts, p => p.title.length);

     console.log("=== Lodash Analysis ===");
     console.log("Total posts:", posts.length);
     console.log("First 5 IDs:", _.map(first5, "id"));
     console.log("Users with posts:", Object.keys(groupByUser).length);
     console.log("Longest title:", longestTitle.title.substring(0, 50) + "...");
     console.log("Shortest title:", shortestTitle.title);

     // Tests con lodash
     pm.test("All posts have non-empty titles", function () {
         const allHaveTitles = _.every(posts, p => !_.isEmpty(p.title));
         pm.expect(allHaveTitles).to.be.true;
     });

     pm.test("User 1 has most posts", function () {
         const counts = _.mapValues(groupByUser, arr => arr.length);
         const maxUser = _.maxBy(Object.keys(counts), u => counts[u]);
         console.log("User with most posts:", maxUser, "(", counts[maxUser], "posts)");
         pm.expect(counts["1"]).to.be.at.least(5);
     });
     ```

3. **Request 2: POST /posts** — Generar hash del payload
   - URL: `{{base_url}}/posts`
   - Pre-request:
     ```javascript
     // Generar hash SHA256 del body que vamos a enviar
     const body = JSON.parse(pm.request.body.raw);
     const bodyString = JSON.stringify(body);
     const hash = CryptoJS.SHA256(bodyString).toString(CryptoJS.enc.Hex);

     pm.environment.set("payload_hash", hash);
     pm.environment.set("payload_hash_short", hash.substring(0, 8));

     console.log("Body hash (SHA256):", hash);
     ```
   - Body:
     ```json
     {
         "title": "Advanced Scripting Test",
         "body": "This post was created with cryptographic verification",
         "userId": 1,
         "hash": "{{payload_hash_short}}"
     }
     ```
   - Tests:
     ```javascript
     pm.test("Post created with hash reference", function () {
         pm.expect(pm.response.code).to.equal(201);
         const body = pm.response.json();
         console.log("Created post id:", body.id);
         console.log("Hash reference:", pm.environment.get("payload_hash_short"));
     });
     ```

4. **Request 3: GET /posts** — Analizar con cadenas de lodash
   - Tests:
     ```javascript
     const posts = pm.response.json();

     // Chaining con lodash
     const result = _.chain(posts)
         .filter(p => p.userId === 1)
         .map(p => ({ id: p.id, titleLength: p.title.length }))
         .orderBy(["titleLength"], ["desc"])
         .take(3)
         .value();

     console.log("Top 3 longest titles by User 1:", result);

     pm.test("User 1 has posts with varying title lengths", function () {
         const lengths = _.uniq(_.map(result, "titleLength"));
         pm.expect(lengths.length).to.be.at.least(2);
     });
     ```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Scripting Avanzado de Logística — Generar códigos de barras simulados, calcular distancias entre códigos postales, validar firmas digitales de entrega y timestamps.

**Instrucciones:**

1. **Generación de Código de Barras (pre-request para POST /shipments)**

```javascript
// ===== Pre-request: Generar código de barras simulado =====

// Generar número de tracking basado en timestamp + random
const timestamp = Date.now().toString(36).toUpperCase();
const random = Math.random().toString(36).substring(2, 6).toUpperCase();
const trackingNumber = `TRK-${timestamp}-${random}`;

// Código de barras en formato Code128 simulado
const barcodeData = {
    trackingNumber: trackingNumber,
    format: "CODE128",
    checkDigit: CryptoJS.SHA256(trackingNumber)
        .toString(CryptoJS.enc.Hex)
        .substring(0, 2)
        .toUpperCase(),
    humanReadable: trackingNumber
};

pm.environment.set("generated_tracking", trackingNumber);
pm.environment.set("barcode_data", JSON.stringify(barcodeData));

console.log("=== Barcode Generated ===");
console.log("Tracking:", trackingNumber);
console.log("Check digit:", barcodeData.checkDigit);

// Inyectar tracking number en el body
const body = JSON.parse(pm.request.body.raw || "{}");
body.trackingNumber = trackingNumber;
pm.request.body.raw = JSON.stringify(body, null, 2);
```

2. **Cálculo de Distancia entre Códigos Postales**

```javascript
// ===== Función: Calcular distancia entre ZIP codes (US) =====
// Usa aproximación basada en coordenadas de códigos postales

const zipCoordinates = {
    "10001": { lat: 40.7484, lon: -73.9967 },  // New York, NY
    "90210": { lat: 34.0901, lon: -118.4065 },  // Beverly Hills, CA
    "60601": { lat: 41.8819, lon: -87.6278 },   // Chicago, IL
    "33101": { lat: 25.7743, lon: -80.1937 },   // Miami, FL
    "75201": { lat: 32.7767, lon: -96.7970 },   // Dallas, TX
    "77001": { lat: 29.7604, lon: -95.3698 },   // Houston, TX
    "94102": { lat: 37.7749, lon: -122.4194 },  // San Francisco, CA
    "98101": { lat: 47.6062, lon: -122.3321 },  // Seattle, WA
    "20001": { lat: 38.9072, lon: -77.0369 },   // Washington, DC
    "85001": { lat: 33.4484, lon: -112.0740 }   // Phoenix, AZ
};

function calculateDistance(zip1, zip2) {
    const coords1 = zipCoordinates[zip1];
    const coords2 = zipCoordinates[zip2];

    if (!coords1 || !coords2) {
        console.log(`Coordinates not found for: ${zip1} or ${zip2}`);
        return null;
    }

    // Fórmula Haversine para distancia en km
    const R = 6371;  // Radio de la Tierra en km
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords1.lat * Math.PI / 180) *
        Math.cos(coords2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
}

// Uso en tests
const originZip = pm.environment.get("origin_zip") || "10001";
const destZip = pm.environment.get("destination_zip") || "90210";
const distance = calculateDistance(originZip, destZip);

console.log(`Distance from ${originZip} to ${destZip}: ${distance} km`);

// Guardar distancia para cálculos de tarifa
pm.environment.set("distance_km", distance ? distance.toString() : "0");
```

3. **Validación de Firma Digital de Entrega**

```javascript
// ===== Tests: Validación de firma digital de entrega =====

pm.test("[DELIVERY] Digital signature is valid", function () {
    const body = pm.response.json();

    // Verificar que la entrega tenga firma digital
    if (body.status === "DELIVERED" && body.deliveryConfirmation) {
        const confirmation = body.deliveryConfirmation;

        pm.expect(confirmation).to.have.property("signature");
        pm.expect(confirmation).to.have.property("signedBy");
        pm.expect(confirmation).to.have.property("timestamp");
        pm.expect(confirmation).to.have.property("photoEvidence");

        // Validar formato de la firma (base64 simulada)
        pm.expect(confirmation.signature).to.match(/^[A-Za-z0-9+/=]+$/);

        // Validar timestamp de entrega
        const deliveryTime = new Date(confirmation.timestamp);
        pm.expect(deliveryTime.getTime()).to.be.at.most(Date.now() + 60000);

        console.log("Delivery confirmed by:", confirmation.signedBy);
        console.log("At:", confirmation.timestamp);
    } else {
        console.log("Package not yet delivered, skipping signature validation");
        pm.expect(body.status).to.not.equal("DELIVERED");
    }
});
```

4. **Manipulación Avanzada de Arrays con lodash** (agregar a un GET /warehouses/:id/stock)

```javascript
// ===== Tests: Análisis de stock con lodash =====

const stockData = pm.response.json();
const items = stockData.items || [];

// Análisis avanzado
const lowStock = _.filter(items, i => i.quantity < i.minThreshold);
const totalValue = _.sumBy(items, i => i.quantity * i.unitPrice);
const categories = _.groupBy(items, "category");
const mostExpensive = _.maxBy(items, "unitPrice");
const categoryCounts = _.mapValues(categories, arr => arr.length);

console.log("=== Stock Analysis ===");
console.log("Total items:", items.length);
console.log("Low stock items:", lowStock.length);
console.log("Total inventory value: $", totalValue.toFixed(2));
console.log("Most expensive item:", mostExpensive?.name, "($", mostExpensive?.unitPrice, ")");
console.log("Categories:", JSON.stringify(categoryCounts));

// Test: Verificar que no hay items con stock negativo
pm.test("[INVENTORY] No negative stock values", function () {
    const negative = _.filter(items, i => i.quantity < 0);
    pm.expect(negative).to.be.empty;
});

// Test: Verificar que los items de bajo stock están identificados
pm.test("[INVENTORY] Low stock items are flagged", function () {
    lowStock.forEach(item => {
        pm.expect(item.status).to.satisfy(
            s => s === "LOW_STOCK" || s === "REORDER_NEEDED",
            `Item ${item.productId} should be flagged as low stock`
        );
    });
});
```

5. **Generación de Timestamps y Fechas Avanzadas**

```javascript
// ===== Pre-request: Generar ventana de entrega =====

const now = new Date();
const deliveryWindows = [];

// Generar 3 ventanas de entrega posibles
for (let i = 1; i <= 3; i++) {
    const start = new Date(now);
    start.setDate(start.getDate() + i);
    start.setHours(9, 0, 0, 0);

    const end = new Date(start);
    end.setHours(17, 0, 0, 0);

    deliveryWindows.push({
        date: start.toISOString().split("T")[0],
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        slotAvailable: Math.random() > 0.3
    });
}

pm.environment.set("delivery_windows", JSON.stringify(deliveryWindows));
console.log("Delivery windows generated:", deliveryWindows.length);
```

6. **Combinar todo**: Un script que genera tracking, calcula distancia, estima tarifa y firma el request en un solo pre-request:

```javascript
// ===== Pre-request Unificado =====

const origin = pm.environment.get("origin_zip") || "10001";
const dest = pm.environment.get("destination_zip") || "90210";
const distance = calculateDistance(origin, dest) || 0;
const weight = parseFloat(pm.environment.get("shipment_weight") || "5");

// Generar tracking
const ts = Date.now().toString(36).toUpperCase();
const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
const tracking = `TRK-${ts}-${rnd}`;
pm.environment.set("generated_tracking", tracking);

// Calcular tarifa estimada
const baseRate = 5.0;
const perKmRate = 0.05;
const perKgRate = 2.0;
const estimatedRate = baseRate + (distance * perKmRate) + (weight * perKgRate);
pm.environment.set("estimated_rate", estimatedRate.toFixed(2));

// Enriquecer body del request
try {
    const body = JSON.parse(pm.request.body.raw || "{}");
    body.trackingNumber = tracking;
    body.estimatedRate = parseFloat(estimatedRate.toFixed(2));
    body.calculatedDistance = distance;
    pm.request.body.raw = JSON.stringify(body, null, 2);
} catch (e) {
    console.log("Could not enrich body:", e.message);
}

console.log("=== Unified Pre-request ===");
console.log("Tracking:", tracking);
console.log("Distance:", distance, "km");
console.log("Est. Rate: $", estimatedRate.toFixed(2));
```
