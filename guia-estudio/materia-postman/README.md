# Workspace Avanzado de Automatización para API de Logística e Inventario

## Descripción del Proyecto Unificado

Este proyecto simula un ecosistema real de **API de logística e inventario** para una empresa de mensajería y gestión de almacenes. A lo largo de los capítulos construirás un workspace completo en Postman que automatiza flujos de trabajo de envíos, tracking, gestión de stock y comunicación con proveedores externos.

## Stack Tecnológico

- **Postman** — Cliente API, collections, environments, scripts
- **Newman** — CLI para ejecución headless
- **GitHub Actions** — CI/CD pipeline
- **JSONPlaceholder** — API mock para laboratorios iniciales
- **tv4** — Validación de esquemas JSON
- **CryptoJS** — Firma HMAC y hashing
- **htmlextra** — Reportería HTML

## Endpoints Clave de la API de Logística

| Endpoint | Descripción |
|---|---|
| `POST /api/v1/auth/login` | Autenticación y obtención de token |
| `POST /api/v1/shipments` | Crear nuevo envío |
| `PUT /api/v1/shipments/:id/pickup` | Agendar recolección |
| `GET /api/v1/shipments/:id/status` | Consultar estado de envío |
| `GET /api/v1/warehouses/:id/stock` | Consultar stock en almacén |
| `POST /api/v1/inventory/reorder` | Ordenar reposición |
| `GET /api/v1/tracking/:id` | Obtener tracking detallado |
| `POST /api/v1/external/rates` | Cotización con proveedor externo |

## Variables de Entorno Compartidas

| Variable | Descripción |
|---|---|
| `base_url` | URL base de la API |
| `api_key` | API key para autenticación |
| `token` | JWT obtenido en login |
| `tracking_id` | ID del envío actual |
| `warehouse_id` | ID del almacén |
| `hmac_signature` | Firma HMAC del request |

## Estructura del Curso

| Capítulo | Tema |
|---|---|
| 01 | Colecciones, Variables y Entornos |
| 02 | pm.test() y Assertions |
| 03 | Pre-request Scripts |
| 04 | Schema Validation con tv4 |
| 05 | Chaining de Variables |
| 06 | Collection Runner |
| 07 | Data-Driven con CSV |
| 08 | Newman CLI |
| 09 | HTML Reports |
| 10 | GitHub Actions + Newman |
| 11 | Monitors |
| 12 | Mock Servers |
| 13 | API Documentation |
| 14 | Postman Flows |
| 15 | Contract Testing |
| 16 | Performance Testing |
| 17 | Negative Test Folder |
| 18 | Advanced Scripting |
| 19 | Examen Final |
