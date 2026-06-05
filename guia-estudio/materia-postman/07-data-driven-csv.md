# 📘 07. Data-Driven con CSV

- **Concepto Clave Asimilado:** Uso de archivos CSV como fuente de datos externa para ejecutar una colección con diferentes valores en cada iteración.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** CSV Driver — Crear CSV con 10 casos de prueba para `POST /posts` y correr Collection Runner con ese CSV como data source.

**Instrucciones:**

1. Crear colección `CSV Driver` con entorno `base_url = https://jsonplaceholder.typicode.com`.

2. Crear archivo `test-data.csv` en tu computador con el siguiente contenido:

```csv
title,body,userId
Test Post 1,Body content for post 1,1
Test Post 2,Body content for post 2,1
Test Post 3,Body content for post 3,2
Test Post 4,Body content for post 4,2
Test Post 5,Body content for post 5,3
Test Post 6,Body content for post 6,3
Test Post 7,Body content for post 7,4
Test Post 8,Body content for post 8,4
Test Post 9,Body content for post 9,5
Test Post 10,Body content for post 10,5
```

3. Crear request `POST {{base_url}}/posts` con body:

```json
{
    "title": "{{title}}",
    "body": "{{body}}",
    "userId": {{userId}}
}
```

4. Tests:

```javascript
pm.test("Post created with data-driven title", function () {
    const jsonData = pm.response.json();
    pm.expect(pm.response.code).to.equal(201);
    pm.expect(jsonData.title).to.equal(pm.iterationData.get("title"));
    pm.expect(jsonData.userId).to.equal(parseInt(pm.iterationData.get("userId")));
});

console.log("Iteración:", pm.info.iteration);
console.log("Title from CSV:", pm.iterationData.get("title"));
```

5. Abrir **Collection Runner** → seleccionar colección → **Select File** en Data → elegir `test-data.csv` → Run con 10 iteraciones.

6. Verificar que cada iteración use un valor diferente del CSV y que todos los tests pasen.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Data-Driven de Entregas — CSV con 100 envíos (origen, destino, peso, prioridad), correr validación de cálculo de tarifas contra la API de logística.

**Instrucciones:**

1. Crear archivo `envios-100.csv`:

```csv
origin_zip,destination_zip,weight,priority,expected_rate_min,expected_rate_max
10001,90210,2.5,STANDARD,10.00,15.00
10002,10001,1.0,STANDARD,5.00,8.00
60601,33101,8.3,EXPEDITED,25.00,35.00
90001,10001,15.0,OVERNIGHT,45.00,60.00
75201,77001,3.2,STANDARD,8.00,12.00
94102,98101,5.0,EXPEDITED,20.00,28.00
... (continuar hasta 100 filas)

// Plantilla para generar: puedes usar este script en Node.js local para generar las 100 filas:
```

2. Script opcional para generar las 100 filas (ejecutar localmente con Node.js):

```javascript
const fs = require("fs");
const lines = ["origin_zip,destination_zip,weight,priority,expected_rate_min,expected_rate_max"];
const zips = ["10001","90210","60601","33101","90001","75201","77001","94102","98101","20001"];
const priorities = ["STANDARD","EXPEDITED","OVERNIGHT"];

for (let i = 0; i < 100; i++) {
    const o = zips[Math.floor(Math.random() * zips.length)];
    const d = zips[Math.floor(Math.random() * zips.length)];
    const w = (Math.random() * 45 + 0.5).toFixed(1);
    const p = priorities[Math.floor(Math.random() * 3)];
    const minRate = (w * 2 + (p === "EXPEDITED" ? 5 : p === "OVERNIGHT" ? 15 : 0)).toFixed(2);
    const maxRate = (parseFloat(minRate) * 1.3).toFixed(2);
    lines.push(`${o},${d},${w},${p},${minRate},${maxRate}`);
}
fs.writeFileSync("./envios-100.csv", lines.join("\n"));
console.log("CSV generado con 100 filas");
```

3. Crear request `POST {{base_url}}/shipments/rate` con body:

```json
{
    "origin": {
        "zipCode": "{{origin_zip}}"
    },
    "destination": {
        "zipCode": "{{destination_zip}}"
    },
    "package": {
        "weight": {{weight}},
        "priority": "{{priority}}"
    }
}
```

4. Tests para validar el cálculo de tarifas:

```javascript
pm.test("Rate calculation response successful", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Rate is within expected range", function () {
    const response = pm.response.json();
    const rate = response.totalRate;
    const minRate = parseFloat(pm.iterationData.get("expected_rate_min"));
    const maxRate = parseFloat(pm.iterationData.get("expected_rate_max"));

    pm.expect(rate).to.be.at.least(minRate);
    pm.expect(rate).to.be.at.most(maxRate);

    console.log(`Iteración ${pm.info.iteration}: Rate $${rate} [${minRate} - ${maxRate}] ✓`);
});

pm.test("Rate breakdown is complete", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property("baseRate");
    pm.expect(response).to.have.property("distanceSurcharge");
    pm.expect(response).to.have.property("prioritySurcharge");
    pm.expect(response).to.have.property("weightSurcharge");
    pm.expect(response).to.have.property("totalRate");
});

pm.test("Rate matches weight + distance logic", function () {
    const response = pm.response.json();
    const weight = parseFloat(pm.iterationData.get("weight"));

    // Verificar que peso más alto = tarifa más alta (aproximadamente)
    pm.expect(response.weightSurcharge).to.be.at.least(weight * 0.5);
});
```

5. En el **Pre-request**, loguear los datos de la iteración actual:

```javascript
console.log(`=== Iteración ${pm.info.iteration} ===`);
console.log(`Origen: ${pm.iterationData.get("origin_zip")}`);
console.log(`Destino: ${pm.iterationData.get("destination_zip")}`);
console.log(`Peso: ${pm.iterationData.get("weight")} kg`);
console.log(`Prioridad: ${pm.iterationData.get("priority")}`);
```

6. Correr en Collection Runner con el CSV de 100 filas. Guardar los resultados como `resultados-data-driven-100.json`.

7. Analizar: ¿cuántos tests fallaron? ¿hubo patrones de fallo por ciertos códigos postales o pesos?
