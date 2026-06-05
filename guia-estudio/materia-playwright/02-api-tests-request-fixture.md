# 📘 [02. API Tests con Request Fixture]

- **Concepto Clave Asimilado:** Uso de `request` fixture de Playwright para testear APIs REST sin navegador, `APIRequestContext` y validación de respuestas JSON.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Catálogo de Productos desde API Pública — Usar `request` fixture para consumir `https://fakestoreapi.com/products`, validar que trae 20 productos y que cada uno tiene `id`, `title`, `price` (number) y `category`.

**Instrucciones:**
1. Crear `tests/api-products.spec.ts`
2. Usar `test('...', async ({ request }) => { ... })`
3. GET /products → status 200
4. Validar: `Array.isArray(body) && body.length === 20`
5. Validar: cada item tiene `id`, `title`, `price` (typeof number), `category`
6. Validar: `price` > 0 para todos

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** API Tests del Catálogo Interno — Crear suite de tests de API contra los endpoints REST de la tienda (`GET /api/products`, `GET /api/products/:id`, `GET /api/categories`) y validar estructura de datos usando schemas dinámicos con assertions de Playwright.

**Instrucciones:**
1. Crear `specs/api/catalog-api.spec.ts`
2. Test 01: `GET /api/products` → 200, body es array, cada item tiene: `id`, `name`, `price`, `stock`, `categoryId`
3. Test 02: `GET /api/products/1` → 200, `body.id === 1`
4. Test 03: `GET /api/products/999` → 404
5. Test 04: `GET /api/categories` → 200, body es array con `id` y `name`
6. Crear helpers en `pages/api-helper.ts` con métodos reutilizables

```typescript
export class ApiHelper {
  constructor(private request: APIRequestContext) {}
  async getProducts() { return this.request.get('/api/products'); }
  async getProduct(id: number) { return this.request.get(`/api/products/${id}`); }
  async createCart(items: Array<{productId: number, qty: number}>) {
    return this.request.post('/api/cart', { data: { items } });
  }
}
```
