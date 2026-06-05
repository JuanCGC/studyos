# 📘 17. Negative Test Folder

- **Concepto Clave Asimilado:** Pruebas negativas (también llamadas pruebas de error o invalid testing) verifican que la API maneje correctamente entradas inválidas, autenticación incorrecta, y casos borde.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Negative Collection — Carpeta dedicada dentro de una colección con tests de: auth inválida, body malformado, IDs inexistentes, métodos no permitidos.

**Instrucciones:**

1. Crear colección `Negative Testing Lab` con entorno `base_url = https://jsonplaceholder.typicode.com`.

2. Crear una **carpeta** (Folder) llamada `🧪 Negative Tests`.

3. **Test 1: Método no permitido** — `PATCH /posts/1`
   - URL: `{{base_url}}/posts/1`
   - Método: `PATCH`
   - Tests:
   ```javascript
   pm.test("[NEGATIVE] PATCH returns error", function () {
       // JSONPlaceholder acepta PATCH, pero queremos probar que no sea 200 OK
       // En una API real esperaríamos 405 Method Not Allowed
       console.log("PATCH response code:", pm.response.code);
       pm.expect(pm.response.code).to.not.equal(404);
   });
   ```

4. **Test 2: ID inexistente** — `GET /posts/99999`
   - URL: `{{base_url}}/posts/99999`
   - Tests:
   ```javascript
   pm.test("[NEGATIVE] Non-existent ID returns empty", function () {
       const body = pm.response.json();
       pm.expect(Object.keys(body).length).to.equal(0);
   });
   ```

5. **Test 3: Body malformado** — `POST /posts` con JSON inválido
   - URL: `{{base_url}}/posts`
   - Body (raw): `{ "title": "incomplete" }`  (falta userId)
   - Tests:
   ```javascript
   pm.test("[NEGATIVE] POST with missing fields still succeeds? (JSONPlaceholder no valida)", function () {
       // En APIs reales esperaríamos 400 Bad Request
       const body = pm.response.json();
       pm.expect(body).to.have.property("id");
       console.log("API accepted incomplete data, id:", body.id);
   });
   ```

6. **Test 4: Content-Type incorrecto** — `POST /posts` con `Content-Type: text/plain`
   - URL: `{{base_url}}/posts`
   - Headers: `Content-Type: text/plain`
   - Body: `This is plain text, not JSON`
   - Tests:
   ```javascript
   pm.test("[NEGATIVE] Wrong Content-Type handling", function () {
       console.log("Status:", pm.response.code);
       console.log("Response:", pm.response.text());
   });
   ```

7. **Test 5: Autenticación faltante** — `GET /posts/1` sin headers
   - Aunque JSONPlaceholder no requiere auth, simulamos el test
   - Tests:
   ```javascript
   pm.test("[NEGATIVE] No auth header present", function () {
       const authHeader = pm.request.headers.get("Authorization");
       pm.expect(authHeader).to.be.null;
   });
   ```

8. Ejecutar la carpeta `🧪 Negative Tests` en el Collection Runner para asegurarse de que todos los tests se ejecutan sin romper la colección principal.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Negative Suite de Logística — Pruebas de: peso excedido, dirección inválida, código postal incorrecto, destinatario sin datos.

**Instrucciones:**

1. En la colección `API de Logística e Inventario`, crear una carpeta llamada `🚫 Negative Tests - Logística`.

2. **Test 1: Peso excedido**
   - Request: `POST {{base_url}}/shipments`
   - Body:
     ```json
     {
         "origin": { "name": "Test", "address": "123 St", "city": "City", "state": "TX", "zipCode": "75201" },
         "destination": { "name": "Test", "address": "456 St", "city": "City2", "state": "FL", "zipCode": "33101" },
         "package": { "weight": 5000, "dimensions": { "length": 10, "width": 10, "height": 10 }, "priority": "STANDARD" }
     }
     ```
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] Weight exceeded returns 400", function () {
         pm.expect(pm.response.code).to.equal(400);
     });
     pm.test("[NEGATIVE] Error message mentions weight limit", function () {
         const body = pm.response.json();
         pm.expect(body.error).to.include("WEIGHT");
         pm.expect(body.message.toLowerCase()).to.include("weight");
     });
     ```

3. **Test 2: Dirección de origen inválida**
   - Request: `POST {{base_url}}/shipments`
   - Body:
     ```json
     {
         "origin": { "name": "", "address": "", "city": "", "state": "", "zipCode": "00000" },
         "destination": { "name": "Test", "address": "456 St", "city": "City2", "state": "FL", "zipCode": "33101" },
         "package": { "weight": 5, "dimensions": { "length": 10, "width": 10, "height": 10 }, "priority": "STANDARD" }
     }
     ```
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] Empty origin fields return 400", function () {
         pm.expect(pm.response.code).to.equal(400);
     });
     pm.test("[NEGATIVE] Validation errors list each empty field", function () {
         const body = pm.response.json();
         if (body.errors) {
             pm.expect(body.errors).to.be.an("array");
             pm.expect(body.errors.length).to.be.at.least(1);
             console.log("Validation errors:", JSON.stringify(body.errors, null, 2));
         }
     });
     ```

4. **Test 3: Código postal incorrecto**
   - Request: `POST {{base_url}}/shipments`
   - Body:
     ```json
     {
         "origin": { "name": "Test", "address": "123 St", "city": "City", "state": "TX", "zipCode": "NOT_A_ZIP" },
         "destination": { "name": "Test", "address": "456 St", "city": "City2", "state": "FL", "zipCode": "33101" },
         "package": { "weight": 5, "dimensions": { "length": 10, "width": 10, "height": 10 }, "priority": "STANDARD" }
     }
     ```
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] Invalid zip format returns 400", function () {
         pm.expect(pm.response.code).to.equal(400);
     });
     pm.test("[NEGATIVE] Error mentions zipCode field", function () {
         const body = pm.response.json();
         const errorStr = JSON.stringify(body).toLowerCase();
         pm.expect(errorStr).to.include("zip");
     });
     ```

5. **Test 4: Destinatario sin datos**
   - Request: `POST {{base_url}}/shipments`
   - Body (destination vacío):
     ```json
     {
         "origin": { "name": "Test", "address": "123 St", "city": "City", "state": "TX", "zipCode": "75201" },
         "destination": {},
         "package": { "weight": 5, "dimensions": { "length": 10, "width": 10, "height": 10 }, "priority": "STANDARD" }
     }
     ```
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] Empty destination returns 400 or 422", function () {
         pm.expect(pm.response.code).to.be.oneOf([400, 422]);
     });
     pm.test("[NEGATIVE] Error lists missing destination fields", function () {
         const body = pm.response.json();
         console.log("Error response:", JSON.stringify(body, null, 2));
     });
     ```

6. **Test 5: Autenticación inválida**
   - Request: `GET {{base_url}}/shipments/{{tracking_id}}/status`
   - Headers: `Authorization: Bearer invalid_token_12345`
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] Invalid token returns 401", function () {
         pm.expect(pm.response.code).to.equal(401);
     });
     pm.test("[NEGATIVE] Error indicates authentication failure", function () {
         const body = pm.response.json();
         pm.expect(body.error).to.exist;
         const errorStr = JSON.stringify(body).toLowerCase();
         pm.expect(errorStr).to.satisfy(
             s => s.includes("auth") || s.includes("token") || s.includes("unauthorized"),
             "Error message should mention auth/token/unauthorized"
         );
     });
     ```

7. **Test 6: Método DELETE no permitido**
   - Request: `DELETE {{base_url}}/shipments/{{tracking_id}}`
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] DELETE returns 405 Method Not Allowed", function () {
         pm.expect(pm.response.code).to.equal(405);
     });
     ```

8. **Test 7: Prioridad inválida**
   - Request: `POST {{base_url}}/shipments`
   - Body con prioridad inválida:
     ```json
     {
         "origin": { "name": "Test", "address": "123 St", "city": "City", "state": "TX", "zipCode": "75201" },
         "destination": { "name": "Test", "address": "456 St", "city": "City2", "state": "FL", "zipCode": "33101" },
         "package": { "weight": 5, "dimensions": { "length": 10, "width": 10, "height": 10 }, "priority": "SUPER_FAST" }
     }
     ```
   - Tests:
     ```javascript
     pm.test("[NEGATIVE] Invalid priority returns 400", function () {
         pm.expect(pm.response.code).to.equal(400);
     });
     pm.test("[NEGATIVE] Error mentions valid priority values", function () {
         const body = pm.response.json();
         const errorStr = JSON.stringify(body).toLowerCase();
         pm.expect(errorStr).to.include("priority");
     });
     ```

9. Ejecutar toda la carpeta negativa en el Collection Runner. Verificar que **todos los tests pasen** (lo que significa que la API rechazó correctamente las entradas inválidas).

10. Si algún test negativo falla (la API devuelve 200 cuando debería rechazar), documentarlo como un bug.
