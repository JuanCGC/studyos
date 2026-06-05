# 📘 [10. GitHub Actions Integration]

- **Concepto Clave Asimilado:** Integración de Playwright en CI/CD, `playwright.yml`, cache de navegadores, reportes HTML como artefactos.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Pipeline Playwright Mínimo — Crear `.github/workflows/playwright.yml` que corra los tests en un runner de Ubuntu con el action oficial `playwright/action`.

**Instrucciones:**
1. Crear workflow:
```yaml
name: Playwright Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Pipeline E-Commerce Completo — Agregar al pipeline principal del proyecto los jobs de Playwright con matrix de navegadores, cache de dependencies, reporte HTML y notificaciones.

**Instrucciones:**
1. Job con matrix: `browser: [chromium, firefox, webkit]`
2. Cache de `~/.cache/ms-playwright` para acelerar instalación
3. `--project=${{ matrix.browser }}` en el comando
4. Upload de `playwright-report/` como artefacto
5. Notificación a Slack en fallo
