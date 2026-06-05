# 📘 [04. Page Object Model]

- **Concepto Clave Asimilado:** Abstracción de interfaces, encapsulamiento de selectores en clases, métodos limpios de interacción, mantenimiento desacoplado.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** POM Modular de Login — Diseñar la clase `LoginPage` aislada con métodos `goto()`, `login(email, password)`, `isLoggedIn()`, `getErrorMessage()` y un test que la consuma.

**Instrucciones:**
1. Crear `pages/LoginPage.ts`:
```typescript
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/login'); }
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Contraseña').fill(password);
    await this.page.getByRole('button', { name: 'Iniciar sesión' }).click();
  }
  async isLoggedIn() { return this.page.getByText('Dashboard').isVisible(); }
  async getErrorMessage() { return this.page.locator('.error-msg').textContent(); }
}
```
2. Test que usa LoginPage:
```typescript
test('login fails with wrong credentials', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('wrong@email.com', 'badpassword');
  expect(await login.getErrorMessage()).toContain('Credenciales inválidas');
});
```

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Arquitectura de Páginas de la Tienda — Refactorizar todo el flujo de compra externo mapeando las vistas críticas en clases individuales (CatalogPage, CartPage, CheckoutPage, OrderConfirmationPage) eliminando selectores duplicados y centralizando la lógica de interacción.

**Instrucciones:**
1. Crear `pages/CatalogPage.ts` — métodos: `search(query)`, `addToCart(productName)`, `getProductPrice(name)`
2. Crear `pages/CartPage.ts` — métodos: `getItems()`, `getSubtotal()`, `removeItem(name)`, `proceedToCheckout()`
3. Crear `pages/CheckoutPage.ts` — métodos: `fillShipping(data)`, `selectPayment(method)`, `getTotal()`, `confirmOrder()`
4. Crear `pages/OrderConfirmationPage.ts` — métodos: `getOrderNumber()`, `isConfirmationVisible()`
5. Refactorizar `checkout.spec.ts` para usar estos POMs
