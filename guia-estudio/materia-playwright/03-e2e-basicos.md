# 📘 [03. E2E Tests Básicos]

- **Concepto Clave Asimilado:** Locators por accesibilidad (`getByRole`, `getByText`), acciones asíncronas (`click`, `fill`, `selectOption`) y aserciones auto-retry (`toBeVisible`, `toHaveText`).

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Formulario de Registro Aislado — Crear un test que navegue a una página de registro pública (ej. https://demoqa.com/register), llene campos (firstname, lastname, username, password) y valide mensajes de error interactivos.

**Instrucciones:**
1. Ir a https://demoqa.com/register
2. Click en submit sin datos → validar mensajes de error visibles
3. Llenar solo username → click submit → validar error en campos vacíos
4. Llenar todos los campos → submit → validar que aparezca el captcha o mensaje de éxito

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Flujo de Checkout y Carrito — Desarrollar el script E2E completo para buscar un producto en la tienda, agregarlo al carrito, ir al checkout, llenar datos de envío y validar que el cálculo de impuestos y subtotales en la pantalla de revisión sea exacto.

**Instrucciones:**
1. Crear `specs/checkout.spec.ts`
2. Flujo:
   - Navegar a `/products`
   - Buscar producto por nombre usando `page.getByPlaceholder('Buscar...')`
   - Click en "Agregar al carrito"
   - Navegar a `/cart`
   - Validar que el producto aparece con precio correcto
   - Click en "Proceder al pago"
   - Llenar formulario de envío (nombre, dirección, ciudad, zip)
   - Seleccionar método de pago
   - Validar subtotal = precio * cantidad, impuesto = subtotal * 0.16, total = subtotal + impuesto
   - Click "Confirmar pedido"
   - Validar mensaje "Pedido confirmado" con número de orden visible
