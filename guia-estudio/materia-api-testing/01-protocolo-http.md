# 📘 [01. Protocolo HTTP y Métodos]

- **Concepto Clave Asimilado:** Estructura de Requests, Responses, Headers, query parameters y verbos HTTP (GET, POST, PUT, DELETE).

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Consumo de Endpoints Públicos de Moneda — Crear scripts en Bash/curl y Postman que consuman `https://api.exchangerate-api.com/v4/latest/USD`, validando códigos de estado 200, estructura JSON con `base`, `date`, `rates`, y que `rates` contenga al menos 10 pares de monedas.

**Instrucciones:**
1. `curl -I https://api.exchangerate-api.com/v4/latest/USD` → validar status 200 + Content-Type: application/json
2. `curl https://api.exchangerate-api.com/v4/latest/USD | jq '.rates | length'` → debe ser > 10
3. En Postman: crear request GET, ver body, headers, pretty print
4. Probar con moneda inválida: `/v4/latest/INVALID` → esperar 404 o error

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Endpoints de Cuentas y Balances — Crear la colección base externa en Postman y RestAssured para validar la creación de cuentas de ahorro (POST /accounts) y la correcta respuesta de saldos activos (GET /balances).

**Instrucciones:**
1. POST /accounts → 201, body con `accountId`, `accountType: "SAVINGS"`, `balance: 0`, `status: "ACTIVE"`, `createdAt` (ISO date)
2. GET /accounts/{accountId} → 200, coincide con lo creado
3. GET /balances?accountId={id} → 200, body con `availableBalance`, `currentBalance`
4. GET /accounts/99999 → 404
5. En Postman: variables de entorno `base_url`, `account_id`, `token`
6. Tests en Postman con pm.test() para status code + schema mínimo
