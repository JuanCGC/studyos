# 📘 [08. Cross-Browser Testing]

- **Concepto Clave Asimilado:** Ejecución de la misma suite en chromium, firefox y webkit; detección de diferencias de rendering; configuración de proyectos en playwright.config.ts.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Detector de Diferencias — Tomar un screenshot de `https://example.com` en chromium y firefox, comparar visualmente y documentar diferencias.

**Instrucciones:**
1. Configurar playwright.config.ts con proyectos chromium y firefox
2. Test que navega a example.com y toma screenshot
3. Correr `npx playwright test --project=chromium --project=firefox`
4. Comparar outputs visuales

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Suite Cross-Browser Completa — Configurar los 3 proyectos (chromium, firefox, webkit) en el e-commerce, ejecutar los tests críticos (login, checkout, catálogo) en los 3 navegadores y configurar retries específicos por browser.

**Instrucciones:**
1. Configurar 3 proyectos en playwright.config.ts con `name` y `use.browserName`
2. Agregar `retries: 2` solo para webkit (el más inestable)
3. Ejecutar suite crítica: `npx playwright test checkout.spec.ts --project=chromium --project=firefox --project=webkit`
4. Configurar reporte HTML unificado
