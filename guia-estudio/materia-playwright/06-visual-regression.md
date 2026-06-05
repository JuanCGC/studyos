# 📘 [06. Visual Regression Testing]

- **Concepto Clave Asimilado:** Capturas de pantalla con `toHaveScreenshot()`, manejo de `maxDiffPixels` y `threshold`, actualización de baselines.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Screenshot de Componente Aislado — Navegar a un componente UI público (ej. https://demoqa.com/buttons), tomar screenshot y comparar contra baseline.

**Instrucciones:**
1. `await expect(page.locator('.main-header')).toHaveScreenshot('header.png')`
2. Ejecutar, ver que se genere la imagen en `__screenshots__`
3. Modificar algo visual (zoom, resize) y ver el test fallar

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Catálogo Visual — Agregar visual regression tests para las páginas principales del e-commerce: homepage, listing de productos, página de detalle, carrito vacío vs lleno, confirmación de orden.

**Instrucciones:**
1. Homepage: `expect(page).toHaveScreenshot('homepage.png', { maxDiffPixels: 200 })`
2. Product listing: screenshot del grid de productos
3. Product detail: screenshot con producto específico visible
4. Carrito vacío vs carrito con items (2 screenshots)
5. Agregar al pipeline que los tests visuales corran solo en chromium
6. Configurar `--update-snapshots` para actualizar baselines cuando sea intencional
