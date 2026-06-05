# 📘 11. Monitors

- **Concepto Clave Asimilado:** Monitores en Postman Cloud que ejecutan colecciones automáticamente en intervalos programados para supervisar disponibilidad y rendimiento de APIs.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Monitor Quick — Crear un monitor en Postman Cloud que corra cada hora contra JSONPlaceholder y verifique disponibilidad.

**Instrucciones:**

1. Crear colección `Health Check` con un request `GET https://jsonplaceholder.typicode.com/posts/1` y tests:

```javascript
pm.test("API is reachable", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Response time < 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

pm.test("Response has data", function () {
    pm.expect(pm.response.json()).to.have.property("id");
});
```

2. Ir a **Postman Web** → sección **Monitors** (en el sidebar izquierdo).

3. Hacer clic en **Create a Monitor**.

4. Configurar:
   - **Name:** `JSONPlaceholder Health Check`
   - **Collection:** Seleccionar `Health Check`
   - **Environment:** (ninguno o el que uses)
   - **Run frequency:** **Every hour**
   - **Region:** **US West** (o la más cercana)
   - **Request timeout:** **30 seconds**

5. Hacer clic en **Create**.

6. Esperar la primera ejecución automática o hacer clic en **Run Now**.

7. Revisar los resultados en la pestaña **Results** del monitor. Ver el historial de ejecuciones, tiempos de respuesta, y tests pasados/fallados.

8. Configurar **Alert**:
   - Ir a la pestaña **Alerts** del monitor.
   - Configurar alerta por email si 2 ejecuciones consecutivas fallan.
   - Opcional: agregar webhook de Slack.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Monitor de SLA Logístico — Monitoreo cada 5 minutos de endpoints críticos: tracking status, warehouse stock, delivery ETA. Alertas si se violan SLAs.

**Instrucciones:**

1. Crear colección `SLA Logístico - Monitores` con los siguientes requests:

   **Request 1: Health Check General**
   - `GET {{base_url}}/health`
   - Tests:
   ```javascript
   pm.test("API Health endpoint responds", function () {
       pm.expect(pm.response.code).to.equal(200);
   });
   pm.test("Health check response time < 300ms (SLA crítico)", function () {
       pm.expect(pm.response.responseTime).to.be.below(300);
   });
   pm.test("Service status is healthy", function () {
       pm.expect(pm.response.json().status).to.equal("healthy");
   });
   ```

   **Request 2: Tracking Status Check**
   - `GET {{base_url}}/tracking/{{tracking_id}}`
   - Tests:
   ```javascript
   pm.test("Tracking endpoint available", function () {
       pm.expect(pm.response.code).to.equal(200);
   });
   pm.test("Tracking response time < 500ms (SLA)", function () {
       pm.expect(pm.response.responseTime).to.be.below(500);
   });
   pm.test("Tracking data is complete", function () {
       const body = pm.response.json();
       pm.expect(body).to.have.property("status");
       pm.expect(body).to.have.property("lastUpdate");
       pm.expect(body).to.have.property("location");
   });
   ```

   **Request 3: Warehouse Stock Check**
   - `GET {{base_url}}/warehouses/{{warehouse_id}}/stock`
   - Tests:
   ```javascript
   pm.test("Warehouse stock endpoint available", function () {
       pm.expect(pm.response.code).to.equal(200);
   });
   pm.test("Stock response time < 400ms (SLA)", function () {
       pm.expect(pm.response.responseTime).to.be.below(400);
   });
   pm.test("Stock levels are above minimum thresholds", function () {
       const body = pm.response.json();
       body.items.forEach(item => {
           pm.expect(item.quantity).to.be.at.least(item.minThreshold);
       });
   });
   ```

   **Request 4: Delivery ETA Check**
   - `GET {{base_url}}/shipments/{{tracking_id}}/eta`
   - Tests:
   ```javascript
   pm.test("ETA endpoint responds", function () {
       pm.expect(pm.response.code).to.equal(200);
   });
   pm.test("ETA response time < 600ms (SLA)", function () {
       pm.expect(pm.response.responseTime).to.be.below(600);
   });
   pm.test("ETA is in future", function () {
       const eta = new Date(pm.response.json().estimatedDelivery);
       pm.expect(eta.getTime()).to.be.greaterThan(Date.now() - 3600000);
   });
   ```

2. Ir a **Postman Web** → **Monitors** → **Create a Monitor**.

3. Configuración:
   - **Name:** `SLA Logístico - Producción`
   - **Collection:** `SLA Logístico - Monitores`
   - **Environment:** `Logística - Producción`
   - **Run frequency:** **Every 5 minutes**
   - **Region:** Múltiples regiones (US West, US East, EU West)
   - **Request timeout:** **15 seconds**

4. En **Alerts**, configurar:
   - **Email notification:** Si cualquier test falla en 2 ejecuciones consecutivas.
   - **Webhook:** Pega la URL de Slack para recibir alertas en el canal #monitores.

5. Hacer clic en **Create** y luego **Run Now** para probar.

6. Revisar el dashboard del monitor después de varias ejecuciones. Analizar:
   - Tiempo promedio de respuesta por endpoint.
   - Tasa de éxito (%).
   - Tendencias de rendimiento en el tiempo.

7. Crear un segundo monitor para **Logística - Staging** con frecuencia cada 15 minutos y comparar resultados.
