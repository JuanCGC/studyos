# 📘 03. Pre-request Scripts

- **Concepto Clave Asimilado:** Scripts que se ejecutan **antes** de enviar el request, usados para preparar datos, generar firmas, timestamps o modificar dinámicamente el payload.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Timestamp Generator — Pre-request que genera un timestamp ISO, lo guarda en variable y lo inyecta en el body del request.

**Instrucciones:**

1. Crear colección `Timestamp Generator` y un entorno con `base_url = https://jsonplaceholder.typicode.com`.

2. Crear request `POST {{base_url}}/posts`

3. En la pestaña **Pre-request Script**, escribir:

```javascript
// Generar timestamp ISO actual
const now = new Date();
const isoDate = now.toISOString();

// Guardar en variable de entorno
pm.environment.set("generated_timestamp", isoDate);
pm.environment.set("request_id", "REQ-" + now.getTime());

console.log("Timestamp generado:", isoDate);
console.log("Request ID:", pm.environment.get("request_id"));
```

4. En el **Body** (raw JSON), usar las variables:

```json
{
    "title": "Reporte de sistema",
    "body": "Generado en {{generated_timestamp}}",
    "userId": 1,
    "requestId": "{{request_id}}"
}
```

5. En **Tests**, verificar que el timestamp se inyectó correctamente:

```javascript
pm.test("Timestamp injected in response", function () {
    const body = pm.response.json();
    pm.expect(body.body).to.include(pm.environment.get("generated_timestamp").substring(0, 10));
});

console.log("Final request body:", JSON.stringify(pm.request.body));
```

6. Ejecutar y revisar Postman Console para ver los logs del pre-request.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Firma HMAC para Endpoints Seguros — Generar firma HMAC-SHA256 en pre-request para autenticar requests de inventario.

**Instrucciones:**

1. Crear request `POST {{base_url}}/inventory/reorder`

2. En **Pre-request Script**, implementar la generación de firma HMAC:

```javascript
// ===== Pre-request: Generación de Firma HMAC =====

// 1. Obtener o generar datos necesarios
const timestamp = Math.floor(Date.now() / 1000);
const nonce = CryptoJS.lib.WordArray.random(16).toString();
const apiKey = pm.environment.get("api_key");
const secretKey = pm.environment.get("api_secret") || "dev-secret-key-2024";

// 2. Construir el payload del body actual
const body = JSON.parse(pm.request.body.raw || "{}");

// 3. Crear string para firmar (canonical request)
const method = pm.request.method;
const path = pm.request.url.getPath();
const bodyHash = CryptoJS.SHA256(pm.request.body.raw || "").toString();
const stringToSign = `${method}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;

// 4. Generar HMAC-SHA256
const signature = CryptoJS.HmacSHA256(stringToSign, secretKey).toString(CryptoJS.enc.Hex);

// 5. Almacenar en variables para los headers
pm.environment.set("hmac_signature", signature);
pm.environment.set("hmac_timestamp", timestamp.toString());
pm.environment.set("hmac_nonce", nonce);
pm.environment.set("hmac_body_hash", bodyHash);

console.log("=== HMAC Signature Generated ===");
console.log("String to sign:", stringToSign.replace(secretKey, "***"));
console.log("Signature:", signature);
```

3. Agregar **Headers** al request:

```
X-HMAC-Signature: {{hmac_signature}}
X-HMAC-Timestamp: {{hmac_timestamp}}
X-HMAC-Nonce: {{hmac_nonce}}
X-HMAC-Body-Hash: {{hmac_body_hash}}
X-Api-Key: {{api_key}}
Content-Type: application/json
```

4. El **Body** del request:

```json
{
    "warehouseId": "{{warehouse_id}}",
    "productId": "PROD-0042",
    "quantity": 150,
    "threshold": 50
}
```

5. En **Tests**, validar que la firma fue aceptada:

```javascript
pm.test("Request authenticated with HMAC", function () {
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("HMAC signature was sent in headers", function () {
    const sentHeaders = pm.request.headers;
    pm.expect(sentHeaders.get("X-HMAC-Signature")).to.exist;
    pm.expect(sentHeaders.get("X-HMAC-Signature").length).to.equal(64);
});

pm.test("Server accepted the signature", function () {
    const body = pm.response.json();
    if (body.signatureValid !== undefined) {
        pm.expect(body.signatureValid).to.be.true;
    }
});
```

6. Probar cambiando el secret key por uno incorrecto y ver que la firma no coincida (simulado).
