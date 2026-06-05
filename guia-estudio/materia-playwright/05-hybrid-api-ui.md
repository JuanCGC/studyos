# 📘 [05. Hybrid API + UI Tests]

- **Concepto Clave Asimilado:** Inyección de estados de sesión, bypass de autenticación por Storage State, preparación de precondiciones por backend.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Bypass de Login por auth.json — Generar una rutina aislada que guarde las cookies de sesión en `auth.json` y las inyecte en el contexto para omitir el UI login.

**Instrucciones:**
1. `npx playwright codegen --save-storage=auth.json https://example.com`
2. Crear test que use `storageState: 'auth.json'`
3. Verificar que el navegador arranque ya autenticado sin pasar por el formulario de login

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Inyección de Inventario Completo para Compra — Ejecutar peticiones POST por API en el bloque `beforeAll` para poblar el carrito con 5 productos específicos, luego levantar el navegador directamente en el paso final de pago, saltando toda la navegación previa.

**Instrucciones:**
1. Usar `request` fixture en `beforeAll` para crear sesión de usuario vía API
2. Agregar 5 productos al carrito vía `POST /api/cart`
3. Guardar el `storageState` de la sesión
4. En el test, usar ese state y navegar directamente a `/checkout/review`
5. Validar que los 5 productos aparezcan en el resumen
6. Confirmar que el total calculado coincida con la suma de precios
