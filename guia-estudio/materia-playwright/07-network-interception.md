# 📘 [07. Network Interception]

- **Concepto Clave Asimilado:** `page.route()`, modificación de requests/responses en vuelo, simulación de fallos de red, stub de APIs externas.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Interceptor de API Pública — Interceptar `https://fakestoreapi.com/products` y modificar la respuesta para devolver un array vacío, validando que la UI muestre "No hay productos disponibles".

**Instrucciones:**
1. `await page.route('**/products', route => route.fulfill({ body: '[]' }))`
2. Navegar a la página que consume esa API
3. Validar mensaje de empty state

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Simulación de Gateway de Pagos — Interceptar las llamadas al gateway de pagos externo para simular respuestas de éxito, rechazo y timeout, validando que la UI muestre el mensaje correcto en cada caso.

**Instrucciones:**
1. Interceptar `POST /api/payments/process`
2. Caso éxito: `route.fulfill({ status: 200, body: { status: 'approved', transactionId: 'tx-123' } })`
3. Caso rechazo: `route.fulfill({ status: 402, body: { error: 'Fondos insuficientes' } })`
4. Caso timeout: `route.abort('timedout')`
5. Test 01: Pago exitoso → ver mensaje "Pago aprobado"
6. Test 02: Pago rechazado → ver mensaje "Fondos insuficientes"
7. Test 03: Timeout → ver mensaje "Error de conexión"
