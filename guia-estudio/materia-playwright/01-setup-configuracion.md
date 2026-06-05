# 📘 [01. Setup y Configuración]

- **Concepto Clave Asimilado:** Inicialización de proyectos Playwright, configuración de navegadores (chromium/firefox/webkit), playwright.config.ts y primera corrida.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Hola Mundo Browser — Inicializar un proyecto Playwright limpio en un directorio temporal, configurar chromium como único navegador, escribir un test que navegue a `https://example.com` y verifique el título de la página.

**Instrucciones:**
1. `npm init playwright@latest` en carpeta temporal
2. Elegir TypeScript, sin GitHub Actions
3. Configurar playwright.config.ts con `browserName: 'chromium'` y `headless: true`
4. Crear `tests/hola-mundo.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
```
5. Ejecutar `npx playwright test` y ver el pass en terminal

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Inicialización del Proyecto E-Commerce — Crear el directorio `ecommerce-platform/`, inicializar Playwright con TypeScript, configurar los 3 navegadores en playwright.config.ts, definir `baseURL: 'http://localhost:3000'` y crear el archivo `global-setup.ts` con autenticación básica.

**Instrucciones:**
1. Crear carpeta `ecommerce-platform/e2e-tests/`
2. `npm init playwright@latest` dentro
3. playwright.config.ts:
```typescript
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```
4. Crear `global-setup.ts` que verifique que el servidor local responda
5. Agregar `globalSetup` al config
