# 📘 16. Performance Testing

- **Concepto Clave Asimilado:** Pruebas de rendimiento con Postman Collection Runner — ejecución masiva de iteraciones, medición de tiempos de respuesta y detección de cuellos de botella.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Performance Quick — Collection runner con 50 iteraciones sin delay, analizar tiempos de respuesta y detectar anomalías.

**Instrucciones:**

1. Crear colección `Performance Lab` con entorno `base_url = https://jsonplaceholder.typicode.com` y 3 requests:
   - `GET {{base_url}}/posts`
   - `GET {{base_url}}/posts/1`
   - `GET {{base_url}}/users`

2. Cada request debe tener:

```javascript
pm.test("Status code is 200", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Response time logged", function () {
    console.log(`[PERF] ${pm.info.requestName}: ${pm.response.responseTime}ms`);
});
```

3. Abrir **Collection Runner** → seleccionar colección → configurar:
   - Iteraciones: **50**
   - Delay: **0ms** (sin delay entre requests)
   - Save responses: ✅
   - Keep variable values: ✅

4. Ejecutar y esperar que termine.

5. Analizar resultados:
   - Ir a **Run Results** → pestaña **Response Times**.
   - Ver el **Average Response Time** total.
   - Ordenar requests por **Slowest** para identificar cuáles son más lentos.
   - Identificar si hay picos de latencia (requests que tardan mucho más que el promedio).

6. Exportar resultados como JSON y calcular métricas adicionales:

```javascript
// Pseudocódigo para análisis externo
const results = require("./perf-results.json");
const times = results.run.executions.map(e => e.response.responseTime);
times.sort((a, b) => a - b);

console.log("Min:", times[0]);
console.log("p50:", times[Math.floor(times.length * 0.5)]);
console.log("p95:", times[Math.floor(times.length * 0.95)]);
console.log("p99:", times[Math.floor(times.length * 0.99)]);
console.log("Max:", times[times.length - 1]);
console.log("Avg:", times.reduce((a, b) => a + b, 0) / times.length);
console.log("Std Dev:", Math.sqrt(times.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / times.length));
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Performance de Logística — 200 iteraciones midiendo p50/p95/p99 de cada endpoint, identificar cuellos de botella y generar reporte de performance.

**Instrucciones:**

1. Agregar tests de performance a cada request de la colección `API de Logística e Inventario`:

```javascript
// Test de performance estándar para cada request
pm.test("[PERF] Response time within SLA", function () {
    const sla = pm.response.responseTime;
    const endpoint = pm.info.requestName;

    // SLAs por endpoint
    const slaLimits = {
        "POST /auth/login": 500,
        "POST /shipments": 1000,
        "PUT /shipments/:id/pickup": 600,
        "GET /shipments/:id/status": 400,
        "GET /warehouses/:id/stock": 300,
        "POST /inventory/reorder": 800,
        "GET /tracking/:id": 350,
        "POST /external/rates": 2000
    };

    const limit = slaLimits[endpoint] || 1000;
    pm.expect(sla, `${endpoint} exceeded SLA of ${limit}ms (${sla}ms)`).to.be.below(limit);
});

// Recolectar métricas de performance en variable
const perfMetrics = JSON.parse(pm.environment.get("perf_metrics") || "[]");
perfMetrics.push({
    request: pm.info.requestName,
    time: pm.response.responseTime,
    status: pm.response.code,
    timestamp: new Date().toISOString()
});
pm.environment.set("perf_metrics", JSON.stringify(perfMetrics));
```

2. Crear un script de pre-request de colección para inicializar métricas:

```javascript
// Inicializar métricas en la primera iteración
if (pm.info.iteration === 0) {
    pm.environment.set("perf_metrics", "[]");
    pm.environment.set("perf_start_time", new Date().toISOString());
    console.log("=== Iniciando Performance Test ===");
}
```

3. Agregar un request final `GET /performance/report` que genere el reporte de performance en los tests:

```javascript
pm.test("[PERF] Generating performance report", function () {
    const metrics = JSON.parse(pm.environment.get("perf_metrics") || "[]");
    const startTime = pm.environment.get("perf_start_time");

    // Agrupar por endpoint
    const grouped = {};
    metrics.forEach(m => {
        if (!grouped[m.request]) grouped[m.request] = [];
        grouped[m.request].push(m.time);
    });

    console.log("============================================");
    console.log("   PERFORMANCE TEST REPORT");
    console.log("   Started:", startTime);
    console.log("   Ended:", new Date().toISOString());
    console.log("   Total Requests:", metrics.length);
    console.log("============================================");

    Object.keys(grouped).forEach(endpoint => {
        const times = grouped[endpoint].sort((a, b) => a - b);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const p50 = times[Math.floor(times.length * 0.5)];
        const p95 = times[Math.floor(times.length * 0.95)];
        const p99 = times[Math.floor(times.length * 0.99)];
        const max = times[times.length - 1];
        const min = times[0];

        console.log(`\n[${endpoint}]`);
        console.log(`  Samples: ${times.length}`);
        console.log(`  Min:     ${min}ms`);
        console.log(`  p50:     ${p50}ms`);
        console.log(`  p95:     ${p95}ms`);
        console.log(`  p99:     ${p99}ms`);
        console.log(`  Max:     ${max}ms`);
        console.log(`  Avg:     ${avg.toFixed(0)}ms`);
    });
});
```

4. Crear un nuevo entorno `Logística - Performance` con valores optimizados para pruebas de rendimiento:
   - Sin delays de autenticación
   - Sin logging excesivo
   - Timeouts más agresivos

5. Ejecutar en **Collection Runner**:
   - Iteraciones: **200**
   - Delay: **0ms**
   - Entorno: `Logística - Performance`
   - Save responses: ✅ (solo errores para ahorrar espacio)

6. Analizar el reporte generado en la consola de Postman.

7. Identificar cuellos de botella:
   - ¿Qué endpoint tiene el peor p95?
   - ¿Hay endpoints con alta varianza (diferencia grande entre min y max)?
   - ¿Algún endpoint excede consistentemente su SLA?

8. Crear un **Performance Budget** — documento que define los límites aceptables:

```yaml
# Performance Budget - Logística API
endpoints:
  POST /auth/login:
    p95: < 500ms
    p99: < 1000ms
  POST /shipments:
    p95: < 1000ms
    p99: < 2000ms
  GET /shipments/:id/status:
    p95: < 400ms
    p99: < 800ms
  GET /warehouses/:id/stock:
    p95: < 300ms
    p99: < 600ms
```

9. Si se identifican cuellos de botella, documentar las recomendaciones en un issue o ticket de mejora.
