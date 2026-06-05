# 📘 [09. Debugging y Traces]

- **Concepto Clave Asimilado:** Trace Viewer, modo inspector (`--debug`), `page.pause()`, logging de acciones, generación de código con codegen.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Trace de un Test Fallido — Escribir un test que falla intencionalmente, configurar `trace: 'on'` y analizar el trace en el viewer.

**Instrucciones:**
1. Configurar `trace: 'on'` en playwright.config.ts
2. Escribir test con assertion que falla intencionalmente
3. Ejecutar: `npx playwright test --trace on`
4. Abrir trace: `npx playwright show-trace test-results/.../trace.zip`
5. Explorar: timeline, network, console, DOM snapshot

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Debugging del Flujo de Pago — Configurar traces para el flujo de checkout completo, habilitar `trace: 'on-first-retry'` en producción y usar `page.pause()` durante desarrollo para inspeccionar selectores en el checkout.

**Instrucciones:**
1. Config global: `trace: 'on-first-retry'`
2. En test de checkout, agregar `await page.pause();` después de llenar datos de envío
3. Ejecutar en modo debug: `npx playwright test checkout.spec.ts --debug`
4. Usar codegen para generar selectores: `npx playwright codegen http://localhost:3000/checkout`
5. Reemplazar selectores frágiles con `getByRole`, `getByLabel`
