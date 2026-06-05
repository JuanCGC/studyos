# Playwright — Proyecto Unificado: Plataforma E-Commerce Completa (Storefront + API Gateway)

**Descripción del Proyecto Externo:**  
Vas a construir y automatizar una tienda online simulada con catálogo de productos, carrito de compras, checkout y panel de administración. Cada capítulo agrega una capa de testing sobre este mismo proyecto.

**Stack sugerido:** Next.js + TypeScript + Playwright + MSW

**Estructura del proyecto externo:**
```
ecommerce-platform/
├── src/
│   ├── pages/ (CatalogPage, CartPage, CheckoutPage, LoginPage, AdminPage)
│   ├── api/ (productos, carrito, órdenes, usuarios)
│   └── components/
├── e2e-tests/
│   ├── pages/ (page objects de Playwright)
│   ├── specs/ (tests por flujo)
│   └── playwright.config.ts
└── README.md
```

**Progresión:** Capítulo 01 → Setup, Cap 02 → Request Fixture, Cap 03 → E2E básicos, Cap 04 → POM, Cap 05 → Hybrid API+UI, Cap 06 → Visual Regression, Cap 07 → Network Interception, Cap 08 → Cross-browser, Cap 09 → Debugging, Cap 10 → CI/CD, Cap 11 → Proyecto completo demoqa, Cap 12 → Examen
