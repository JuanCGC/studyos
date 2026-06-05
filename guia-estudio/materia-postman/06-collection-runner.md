# 📘 06. Collection Runner

- **Concepto Clave Asimilado:** Ejecución de colecciones completas desde el Collection Runner de Postman para correr múltiples iteraciones y analizar resultados agregados.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Collection Runner contra JSONPlaceholder — Correr colección de 5 requests contra la API pública y analizar resultados de ejecución.

**Instrucciones:**

1. Crear colección `JSONPlaceholder Runner` con entorno `base_url = https://jsonplaceholder.typicode.com` y los siguientes 5 requests:

   | Request | Método | URL |
   |---|---|---|
   | List Posts | GET | `{{base_url}}/posts` |
   | Get Post 1 | GET | `{{base_url}}/posts/1` |
   | Get Post 2 | GET | `{{base_url}}/posts/2` |
   | List Users | GET | `{{base_url}}/users` |
   | Get User 1 | GET | `{{base_url}}/users/1` |

2. Agregar tests a cada request para validar status 200 y response time.

3. Abrir el **Collection Runner** (Ctrl+Shift+R o botón Runner en la esquina inferior derecha).

4. Configurar:
   - Colección: `JSONPlaceholder Runner`
   - Entorno: el creado
   - Iteraciones: **3**
   - Delay: **200ms**
   - Save responses: ✅

5. Hacer clic en **Run**.

6. Analizar los resultados:
   - Revisar la pestaña **Pass/Fail** para ver qué tests pasaron/fallaron.
   - Revisar la pestaña **Response Times** para ver el promedio.
   - Exportar los resultados como JSON (botón Export).

7. Volver a correr pero con **0 iteraciones** de delay para comparar tiempos de respuesta.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Runner de Rutas Diarias — 50 iteraciones con datos de rutas simuladas, validar tiempos de respuesta y consistencia.

**Instrucciones:**

1. Asegurarse de tener la colección `API de Logística e Inventario` con al menos estos requests configurados en orden:
   - `POST /auth/login`
   - `POST /shipments`
   - `PUT /shipments/{{tracking_id}}/pickup`
   - `GET /shipments/{{tracking_id}}/status`

2. Agregar un test de performance a nivel de cada request:

```javascript
// Test de performance (agregar a cada request)
pm.test("Performance SLA check", function () {
    const sla = {
        "POST /auth/login": 500,
        "POST /shipments": 800,
        "PUT /shipments/:id/pickup": 600,
        "GET /shipments/:id/status": 400
    };
    const requestName = pm.info.requestName;
    const maxTime = sla[requestName] || 1000;
    pm.expect(pm.response.responseTime).to.be.below(maxTime);
});
```

3. Abrir el **Collection Runner** y configurar:
   - Iteraciones: **10** (comenzar con 10 para prueba, luego 50)
   - Delay: **100ms** (simular tiempo real entre operaciones)
   - Log variables: ✅ (seleccionar `tracking_id`, `shipment_weight`)
   - Stop if error: ✅ (detener si un request crítico falla)

4. Antes de ejecutar, agregar limpieza de entorno en un pre-request de colección para reiniciar variables entre iteraciones:

```javascript
// Pre-request a nivel colección
if (pm.info.iteration === 0) {
    console.log("=== Iniciando nueva ejecución ===");
    pm.environment.set("tracking_id", "");
    pm.environment.set("shipment_weight", "");
}
```

5. Ejecutar y analizar:
   - Revisar **Failed Tests** — si hay alguno, identificar el patrón.
   - Revisar **Average Response Time** por request.
   - Ordenar por **Slowest Requests** para identificar cuellos de botella.
   - Exportar resultados como JSON con nombre `resultados-runner-50.json`.

6. Crear un script de **post-execución** en un entorno Node.js local para calcular métricas adicionales:

```javascript
// pseudocódigo para análisis posterior
const results = require("./resultados-runner-50.json");
const times = results.run.failures.map(f => ({
    request: f.source.name,
    error: f.error.message
}));
console.log("Fallos encontrados:", times.length);
```

7. Configurar una segunda corrida con **50 iteraciones** pero con el entorno **Logística - Producción** y delay **0ms** para simular producción real.
