# 📘 01. Colecciones, Variables y Entornos

- **Concepto Clave Asimilado:** Variables de entorno, variables de colección, y su uso para parametrizar requests dinámicamente.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Sandbox de Token Passthrough — Dos requests encadenadas: `POST /login` extrae un token → `GET /protected` lo consume usando `pm.environment.set()`.

**Instrucciones:**

1. Crear un entorno llamado `Auth Sandbox` con variable `base_url = https://jsonplaceholder.typicode.com` (aunque no tiene auth real, simulamos el flujo).

2. Crear una colección `Token Passthrough`.

3. Primer request: `POST {{base_url}}/posts`
   - Body (raw JSON):
     ```json
     {
       "title": "login",
       "body": "fake-token-abc123"
     }
     ```
   - Tests (Post-response):
     ```javascript
     const jsonData = pm.response.json();
     pm.environment.set("token", jsonData.title + "-" + jsonData.id);
     console.log("Token stored:", pm.environment.get("token"));
     ```

4. Segundo request: `GET {{base_url}}/posts/1`
   - Headers:
     ```
     Authorization: Bearer {{token}}
     ```
   - Tests:
     ```javascript
     pm.test("Token exists in environment", function () {
         pm.expect(pm.environment.get("token")).to.not.be.empty;
     });
     pm.test("Response is successful", function () {
         pm.expect(pm.response.code).to.equal(200);
     });
     ```

5. Ejecutar en orden: primero POST, luego GET. Verificar que el token se propagó correctamente viendo los logs de Postman Console.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Workspace de Rutas de Entrega — Configuración del entorno base con variables dinámicas `base_url`, `api_key`, `token`, `tracking_id`.

**Instrucciones:**

1. Crear la colección principal `API de Logística e Inventario`.

2. Crear el entorno **Logística - Desarrollo** con las siguientes variables:

| Variable | Valor Inicial | Tipo |
|---|---|---|
| `base_url` | `https://api.logistica.test/v1` | Default |
| `api_key` | `dev-key-001` | Secret |
| `token` | *(vacío)* | Default |
| `tracking_id` | *(vacío)* | Default |
| `warehouse_id` | `WH-001` | Default |
| `origin_zip` | `10001` | Default |
| `destination_zip` | `90210` | Default |

3. Crear el entorno **Logística - Producción** (mismas variables, valores distintos):
   - `base_url`: `https://api.logistica.com/v1`
   - `api_key`: `prod-key-999`

4. Crear una variable de colección llamada `app_version = 1.0.0`.

5. Agregar el siguiente script de **Prerrequest** a nivel de colección:
   ```javascript
   // Log de inicio de request
   console.log(`[${pm.info.requestName}] Iniciando request a ${pm.request.url}`);
   ```

6. Agregar el siguiente script de **Tests** a nivel de colección:
   ```javascript
   // Log de finalización
   console.log(`[${pm.info.requestName}] Completado con status ${pm.response.code}`);
   ```

7. Crear el primer request de login: `POST {{base_url}}/auth/login`
   - Body:
     ```json
     {
       "apiKey": "{{api_key}}",
       "timestamp": "{{$timestamp}}"
     }
     ```
   - Tests:
     ```javascript
     const response = pm.response.json();
     pm.test("Login successful", function () {
         pm.expect(pm.response.code).to.equal(200);
         pm.expect(response).to.have.property("token");
     });
     pm.environment.set("token", response.token);
     console.log("Token almacenado exitosamente");
     ```
