// ═══════════════════════════════════════════════
//  UNIFIED APP — STUDYOS + SDET GUIDE
// ═══════════════════════════════════════════════

window.CHAP_MAP = {"Fundamentos HTTP y REST": "api-basics", "Status codes y headers": "api-basics", "RestAssured setup + pom.xml": "project1", "PostsTest.java — happy path": "project1", "JSON Schema validation": "api-testing", "Negative tests y boundaries": "api-testing", "Auth testing — JWT y OAuth": "auth", "Security checklist — IDOR, XSS": "auth", "Data-driven tests @ParameterizedTest": "project1", "Allure reporting": "project1", "UsersTest.java completo": "project1", "CommentsTest.java completo": "project1", "Pact contract tests": "project2", "WireMock stubs": "project2", "CI/CD — GitHub Actions gate": "cicd", "k6 performance gates": "cicd", "Pipelines y stages": "cicd", "GitHub Actions basics": "cicd", "Quality gates": "cicd", "Docker fundamentals": "project2", "Docker Compose para tests": "project2", "Matrix builds": "project2", "Environments y secrets": "cicd", "Allure + artefactos": "project2", "Setup y configuración": "playwright", "API tests con request fixture": "playwright", "E2E tests básicos": "playwright", "Page Object Model": "playwright", "Hybrid API + UI tests": "playwright", "Visual regression testing": "project-playwright", "Network interception": "project-playwright", "Cross-browser testing": "project-playwright", "Debugging y traces": "playwright", "GitHub Actions integration": "cicd", "demoqa.com proyecto completo": "project-playwright", "Dev Org setup + SF CLI": "sf-overview", "Apex basics": "apex-testing", "@isTest y @TestSetup": "apex-testing", "HttpCalloutMock": "apex-testing", "System.runAs() y FLS": "apex-testing", "Governor limits testing": "apex-testing", "Debug logs reading": "apex-testing", "LWC Jest tests": "apex-testing", "Batch Apex testing": "apex-testing", "Platform Events testing": "sf-project", "Flow testing en Apex": "sf-project", "SF CLI CI/CD pipeline": "sf-project", "Multi-org regression": "sf-project", "Copado basics": "sf-project", "Colecciones y workspaces": "project-postman", "Variables de entorno": "project-postman", "pm.test assertions": "project-postman", "Pre-request scripts": "project-postman", "Schema validation": "api-testing", "Chaining con env variables": "project-postman", "Collection Runner": "project-postman", "Data-driven con CSV": "project-postman", "Newman CLI": "project-postman", "HTML reports": "project-postman", "GitHub Actions + Newman": "project-postman", "Monitors": "project-postman", "Mock servers": "project-postman", "API documentation": "frameworks", "Flows (nuevo)": "project-postman", "Contract testing": "project2", "Performance testing": "cicd", "Negative test folder": "project-postman", "Advanced scripting": "project-postman", "Examen final": "cheatsheet", "API design patterns": "api-testing", "GraphQL testing": "frameworks", "gRPC testing": "frameworks"};
const CHAP_MAP = window.CHAP_MAP;

// ═══════════════════════════════════════════════════════════════
//  EMBEDDED STUDY GUIDES — Lab Express + Project Evolution
//  Estructura: { subjectId_index: { kc, le: {title,body}, pe: {title,body} } }
// ═══════════════════════════════════════════════════════════════
const EMBEDDED_GUIDES = {
  // ── API TESTING ──────────────────────────────────────────
  'api_0':{
    kc:'Estructura de Requests, Responses, Headers, query params y verbos HTTP (GET, POST, PUT, DELETE)',
    le:{title:'Consumo de Endpoints Públicos de Moneda',
      body:'Usa curl y Postman contra exchangerate-api.com.\n1. curl -I https://api.exchangerate-api.com/v4/latest/USD → validar 200 + Content-Type\n2. curl ... | jq \'.rates | length\' → debe ser > 10\n3. En Postman: GET, ver body, headers, pretty print\n4. URL inválida: /v4/latest/INVALID → esperar 404'},
    pe:{title:'Endpoints de Cuentas y Balances',
      body:'Colección base Postman + RestAssured para el proyecto bancario.\n1. POST /accounts → 201, accountId, accountType:"SAVINGS", balance:0\n2. GET /accounts/{id} → 200, coincide con creación\n3. GET /balances?accountId={id} → 200, availableBalance, currentBalance\n4. GET /accounts/99999 → 404\n5. Variables Postman: base_url, account_id, token'}
  },
  'api_1':{
    kc:'Aserciones rígidas de tipos de datos, obligatoriedad de campos y validación estricta de JSON Schema',
    le:{title:'Validador de Tipos Aislado',
      body:'Schema JSON para perfil de usuario vs GET /users/1 de JSONPlaceholder.\n1. Schema con id(int), name(string), email(pattern), address(object)\n2. additionalProperties: false\n3. Validar con GET /users/1 → debe pasar\n4. Cambiar email a type:number → validación falla'},
    pe:{title:'Validación de Contrato del Historial de Transacciones',
      body:'Suite que verifica GET /transactions cumpla esquema.\n1. Schema: transactionId(pattern), amount(number), currency(enum), type(enum), timestamp(format:date-time)\n2. Validar GET /transactions contra schema\n3. Validar GET /transactions?status=PENDING\n4. Schema para array: type:array, items con $ref'}
  },
  'api_2':{
    kc:'Configuración de proyecto Maven con RestAssured, request/response specs, logging, base URI',
    le:{title:'Maven + RestAssured Mínimo',
      body:'Proyecto Maven desde cero con RestAssured, JUnit 5, test simple.\n1. mvn archetype:generate -DgroupId=com.banking -DartifactId=banking-api-test\n2. pom.xml: rest-assured 5.5.0, junit-jupiter 5.11.0, json-schema-validator\n3. Test: GET /posts/1 → status 200\n4. Agregar filtros de request/response logging'},
    pe:{title:'Configuración del Proyecto Bancario',
      body:'ApiConfig.java con specs reutilizables.\n1. RequestSpecBuilder con baseURI, ContentType JSON, logging\n2. ResponseSpecBuilder con tiempo máximo\n3. Extraer config a variable de entorno BASE_URL'}
  },
  'api_3':{
    kc:'Tests de happy path para endpoints CRUD usando RestAssured given/when/then',
    le:{title:'CRUD Happy Path contra JSONPlaceholder',
      body:'Tests GET, POST, PUT, PATCH, DELETE contra /posts.\n1. GET /posts → 200 + 100 items\n2. GET /posts/1 → 200 + id=1\n3. POST /posts → 201 + id generado\n4. PUT /posts/1 → 200 + datos actualizados\n5. DELETE /posts/1 → 200'},
    pe:{title:'CRUD de Cuentas Bancarias',
      body:'Tests happy path para cuentas bancarias.\n1. POST /accounts → 201\n2. GET /accounts/{id} → 200\n3. PUT /accounts/{id} cambiar tipo\n4. PATCH /accounts/{id} actualizar nickname\n5. DELETE /accounts/{id} → 200'}
  },
  'api_4':{
    kc:'Validación programática de schemas JSON en RestAssured con matchesJsonSchemaInClasspath',
    le:{title:'Schema Validator',
      body:'1. Crear schema post.json con additionalProperties: false\n2. matchesJsonSchemaInClasspath("schemas/post.json")\n3. Romper schema intencionalmente → test falla'},
    pe:{title:'Schemas del Core Bancario',
      body:'Validar cada endpoint contra su schema: Account, Transaction, User, Balance. Todos con additionalProperties: false'}
  },
  'api_5':{
    kc:'Pruebas de límites, valores frontera, datos inválidos y esperar códigos 4xx',
    le:{title:'Negative Playground',
      body:'Tests con IDs negativos, strings vacíos, body malformado contra JSONPlaceholder.\n1. IDs negativos → 404\n2. Body vacío {} → 400/422\n3. Campos extra → según API'},
    pe:{title:'Negative Banking',
      body:'Tests: saldo insuficiente, monto negativo, transferencia a cuenta inexistente, tipos incorrectos.'}
  },
  'api_6':{
    kc:'Flujo de autenticación JWT, obtención de tokens, uso en headers Authorization, refresh tokens',
    le:{title:'Token Flow en Postman',
      body:'Usar reqres.in para registrar usuario, extraer token, pasarlo al siguiente request.\n1. POST /api/register → extraer token con pm.environment.set()\n2. GET protegido con Authorization: Bearer {{token}}'},
    pe:{title:'Autenticación Bancaria',
      body:'Tests: login obtiene JWT, endpoint sin token → 401, token expirado → 401, token válido → 200, refresh token'}
  },
  'api_7':{
    kc:'Detección de Insecure Direct Object References y Cross-Site Scripting en payloads',
    le:{title:'IDOR Simulado',
      body:'User A crea recurso, User B intenta acceder. JSONPlaceholder no protege, pero el test documenta el concepto.'},
    pe:{title:'Security Hardening Bancario',
      body:'Tests: usuario no ve cuenta de otro (IDOR), endpoint rechaza <script> (XSS), SQLi en params, rate limiting 429'}
  },
  'api_8':{
    kc:'Tests parametrizados con @CsvSource, @ValueSource, @MethodSource en JUnit 5',
    le:{title:'Parametrized Playground',
      body:'Test con 10 IDs de posts diferentes validando status 200 en todos.\n@ValueSource(ints = {1,2,3,4,5,6,7,8,9,10})'},
    pe:{title:'Data-Driven Banking',
      body:'Test parametrizado con 20 cuentas, todas balance >= 0. CSV con casos de transferencia (origen, destino, monto, expectedStatus)'}
  },
  'api_9':{
    kc:'Configuración de Allure, anotaciones @DisplayName, @Feature, @Story, reportes visuales',
    le:{title:'Allure Quickstart',
      body:'Agregar Allure a proyecto Maven, generar reporte local.\nmvn allure:serve'},
    pe:{title:'Reporte Bancario Completo',
      body:'Anotar todos los tests con @Feature("Accounts"), @Story("Create Account"). Reporte unificado en CI/CD como artefacto.'}
  },
  'api_10':{
    kc:'Tests para endpoints con relaciones entre recursos y campos anidados',
    le:{title:'UsersTest contra JSONPlaceholder',
      body:'GET /users, validar nested address/company, filtrar por username, GET /users/1/posts'},
    pe:{title:'Clientes del Banco',
      body:'Tests GET/POST /customers, validar documentos anidados (address, contactInfo), búsqueda por email, paginación'}
  },
  'api_11':{
    kc:'Validación de listas, filtros por query param, formato de campos',
    le:{title:'CommentsTest contra JSONPlaceholder',
      body:'GET /comments (500), GET /comments?postId=1, validar email pattern'},
    pe:{title:'Auditoría de Transacciones',
      body:'GET /transactions con filtros por fecha, tipo, monto; paginación; ordenamiento'}
  },
  'api_12':{
    kc:'Consumer-Driven Contracts con Pact para validar acuerdos entre servicios',
    le:{title:'Pact Hello World',
      body:'Consumer test para servicio de pagos simulado, generar contrato Pact.\n@Pact(consumer="TaskFlowAPI", provider="PaymentsService")'},
    pe:{title:'Contrato Bancario con Credit Score Service',
      body:'Definir interacciones, generar contrato, publicar en Pact Broker, verificar del lado provider'}
  },
  'api_13':{
    kc:'Virtualización de servicios externos con WireMock para tests aislados',
    le:{title:'WireMock Standalone',
      body:'Levantar WireMock en Docker, crear stub JSON, probar con curl.\ndocker run -p 8081:8080 wiremock/wiremock'},
    pe:{title:'Stubbing del Credit Bureau',
      body:'Simular respuestas del buró de crédito: score alto (aprobado), score bajo (rechazado), timeout'}
  },
  'api_14':{
    kc:'Pipeline de tests automatizados con quality gates en GitHub Actions',
    le:{title:'GHA Mínimo',
      body:'Workflow que corre mvn clean test en cada push.\n.github/workflows/test.yml'},
    pe:{title:'Pipeline Bancario con Gates',
      body:'Stages: unit → integration → contract → security → performance. Gates: coverage ≥ 80%, 0 security, p95 < 500ms'}
  },
  'api_15':{
    kc:'Pruebas de carga, estrés, thresholds y performance gates en CI/CD con k6',
    le:{title:'k6 Smoke Test',
      body:'Script 1 VU contra JSONPlaceholder con threshold p95 < 200ms. k6 run smoke.js'},
    pe:{title:'Performance Banking',
      body:'Smoke test endpoints críticos, stress test 100 VUs concurrentes. Thresholds: p95 < 500ms, error rate < 1%'}
  },
  'api_16':{
    kc:'Patrones de diseño de APIs REST: HATEOAS, paginación, versionado, idempotencia',
    le:{title:'Idempotency Test',
      body:'Mismo POST dos veces → IDs diferentes (no idempotente). Mismo PUT dos veces → mismo resultado.'},
    pe:{title:'Idempotencia Bancaria',
      body:'Tests: POST /transactions con idempotency-key, paginación HATEOAS, versionado /v1/ vs /v2/'}
  },
  'api_17':{
    kc:'Testing de APIs GraphQL: queries, mutations, validación de schemas',
    le:{title:'GraphQL Playground',
      body:'Query a https://countries.trevorblades.com pidiendo nombre, código y continente de países.\n{ countries { name code continent { name } } }'},
    pe:{title:'GraphQL Bancario',
      body:'Tests para query de cuentas, mutation de transferencia, validación de errores GraphQL, fragmentos reutilizables'}
  },
  'api_18':{
    kc:'Fundamentos de gRPC, protocol buffers, tests con gRPC client',
    le:{title:'gRPC Hello World',
      body:'Usar grpcurl contra API gRPC pública para listar servicios y hacer un RPC.'},
    pe:{title:'gRPC para Transacciones Internas',
      body:'Probar endpoint gRPC interno de validación de transacciones con diferentes payloads.'}
  },
  'api_19':{
    kc:'Suite completa bancaria con todos los patrones de testing',
    le:{title:'Mini-Banking Test en 30 min',
      body:'Crear schema, happy path, negative test, auth test, data-driven test.'},
    pe:{title:'Cierre del Proyecto Bancario',
      body:'Suite completa pasando en CI/CD, Allure report, cobertura ≥ 80%, README final con badges.'}
  },

  // ── CI/CD ──────────────────────────────────────────────
  'cicd_0':{
    kc:'Sintaxis de archivos de configuración de workflows, triggers (push, pull_request) y runners virtuales',
    le:{title:'Pipeline Hola Mundo',
      body:'Workflow con 3 stages (build, test, deploy) cada uno con un echo.\n.github/workflows/pipeline.yml'},
    pe:{title:'Stages del Pipeline Logístico',
      body:'build → test → contract → security → performance → deploy → notify'}
  },
  'cicd_1':{
    kc:'GitHub Actions: jobs, steps, actions, triggers, runners',
    le:{title:'Hello World Workflow',
      body:'.github/workflows/hello.yml con trigger push, checkout, echo.\nname: Mi primer pipeline\non: [push]\njobs:\n  hello:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo "Pipeline corriendo en $(date)"'},
    pe:{title:'Pipeline Base de Integración',
      body:'Workflow en push a main, configura Node.js, instala deps, corre tests.\nIncluye caché de node_modules y upload de reportes.'}
  },
  'cicd_2':{
    kc:'Quality gates como barreras de calidad en pipelines que bloquean el merge si no se cumplen',
    le:{title:'Gate Simulado',
      body:'Job que evalúa condición y falla si no se cumple.\nrun: test 1 -eq 1 → pasa, test 1 -eq 2 → falla'},
    pe:{title:'Gates del Pipeline Logístico',
      body:'Coverage ≥ 80%, Tests pasando 100%, Performance p95 < 500ms, Security scan pass. Cada gate es un job separado.'}
  },
  'cicd_3':{
    kc:'Docker: imágenes, contenedores, Dockerfile, multi-stage builds',
    le:{title:'Docker Hello World',
      body:'Dockerfile simple con Nginx, build, run.\ndocker build -t my-nginx .\ndocker run -p 8080:80 my-nginx'},
    pe:{title:'Dockerfile para API de Logística',
      body:'Multi-stage: build con Maven, run con JRE slim, healthcheck configurado.'}
  },
  'cicd_4':{
    kc:'Docker Compose para orquestar múltiples servicios en tests de integración',
    le:{title:'Docker Compose Mínimo',
      body:'Servicio API + Postgres, levantar con docker compose up.\ndocker compose up -d'},
    pe:{title:'Compose de Logística',
      body:'api + mysql + wiremock + redis interconectados para tests de integración.'}
  },
  'cicd_5':{
    kc:'Matrix builds para ejecutar tests en múltiples versiones/plataformas en paralelo',
    le:{title:'Matrix Hola Mundo',
      body:'Matrix de OS [ubuntu, windows] + node [18, 20].\nstrategy:\n  matrix:\n    os: [ubuntu-latest, windows-latest]\n    node: [18, 20]'},
    pe:{title:'Matrix Logístico',
      body:'JDK [17, 21] + browser [chromium, firefox] para suite E2E + API.'}
  },
  'cicd_6':{
    kc:'GitHub Environments, secrets management, variables de entorno protegidas',
    le:{title:'Secrets Demo',
      body:'Workflow que usa secret MY_SECRET y lo muestra (con masking).\n${{ secrets.MY_SECRET }}'},
    pe:{title:'Secrets del Pipeline Logístico',
      body:'API_KEY, DB_URL, SLACK_WEBHOOK, PACT_BROKER_TOKEN configurados en GitHub Environments con protección.'}
  },
  'cicd_7':{
    kc:'Artefactos de build: upload, download, persistencia entre jobs',
    le:{title:'Allure Artefacto',
      body:'Workflow que corre tests Maven, sube allure-results como artefacto.\nuses: actions/upload-artifact@v4'},
    pe:{title:'Artefactos Completos',
      body:'allure-results, playwright-report, newman-report, k6-json. Todos subidos con retention de 30 días.'}
  },
  'cicd_8':{
    kc:'Pruebas de carga/estrés/soak con k6 y thresholds en CI/CD',
    le:{title:'k6 en GHA',
      body:'Workflow que instala k6, corre smoke.js, verifica thresholds.\nk6 run smoke.js'},
    pe:{title:'Performance Stage',
      body:'Scripts smoke + stress + soak. Todos ejecutados en CI. Gate bloquea si p95 > 500ms.'}
  },
  'cicd_9':{
    kc:'Contract testing con Pact en pipeline CI/CD, verificación provider-side',
    le:{title:'Pact en CI',
      body:'Workflow que corre tests Pact y verifica contratos.\nmvn test -Dtest=*Pact*'},
    pe:{title:'Contract Stage',
      body:'Consumer tests publican contratos, provider tests los verifican, Pact Broker como fuente de verdad.'}
  },
  'cicd_10':{
    kc:'Integración con Slack: notificaciones automáticas de pipelines',
    le:{title:'Slack Hello',
      body:'Workflow con Slack notification enviando "Pipeline started".\nuses: slackapi/slack-github-action@v2'},
    pe:{title:'Notificaciones del Pipeline Logístico',
      body:'Slack por stage (success/failure), mención @channel en fallos críticos.'}
  },
  'cicd_11':{
    kc:'Ephemeral environments creados por PR, destruidos al mergear',
    le:{title:'Review App',
      body:'Workflow que crea entorno temporal en cada PR con mensaje de bienvenida.'},
    pe:{title:'Ephemeral Logístico',
      body:'Por PR: deploy API+DB+mock a entorno temporal, correr tests, destruir al mergear.'}
  },
  'cicd_12':{
    kc:'Multi-org deployment con approvals manuales y rollback automático',
    le:{title:'Deploy Multi-Env',
      body:'Workflow con environment: [dev, staging, prod] y approval gates.\nenvironment:\n  name: production\n  url: https://api.example.com'},
    pe:{title:'Deploy Logístico Multi-Región',
      body:'Despliegue a US/EU/ASIA con approvals manuales en prod, rollback automático en fallo.'}
  },
  'cicd_13':{
    kc:'Pipeline CI/CD completo con stages, gates, artefactos, notificaciones y deploy',
    le:{title:'Pipeline Completo en 30 min',
      body:'4 stages con gates, artefactos, notificaciones Slack.'},
    pe:{title:'Cierre del Pipeline Logístico',
      body:'Pipeline completo pasando, documentación con badges, SLA de deploy < 10 min.'}
  },

  // ── PLAYWRIGHT ──────────────────────────────────────────
  'playwright_0':{
    kc:'Inicialización de proyectos Playwright, configuración de navegadores (chromium/firefox/webkit), playwright.config.ts y primera corrida',
    le:{title:'Hola Mundo Browser',
      body:'1. npm init playwright@latest en carpeta temporal\n2. playwright.config.ts con browserName:"chromium", headless:true\n3. tests/hola-mundo.spec.ts: navegar a example.com, validar título\n4. npx playwright test → pass'},
    pe:{title:'Inicialización del Proyecto E-Commerce',
      body:'1. Crear ecommerce-platform/e2e-tests/\n2. npm init playwright@latest\n3. Configurar 3 browsers en projects\n4. baseURL: http://localhost:3000\n5. global-setup.ts con verificación del server'}
  },
  'playwright_1':{
    kc:'Uso de request fixture de Playwright para testear APIs REST sin navegador, APIRequestContext',
    le:{title:'Catálogo de Productos desde API Pública',
      body:'request fixture contra https://fakestoreapi.com/products.\n1. GET /products → status 200\n2. 20 productos\n3. Cada uno con id, title, price(number), category'},
    pe:{title:'API Tests del Catálogo Interno',
      body:'Suite contra endpoints REST de la tienda.\n1. GET /api/products → 200, array\n2. GET /api/products/1 → 200, body.id === 1\n3. GET /api/products/999 → 404\n4. GET /api/categories → 200\n5. ApiHelper class con métodos reutilizables'}
  },
  'playwright_2':{
    kc:'Locators por accesibilidad (getByRole, getByText), acciones asíncronas (click, fill) y aserciones auto-retry (toBeVisible, toHaveText)',
    le:{title:'Formulario de Registro Aislado',
      body:'Navegar a https://demoqa.com/register.\n1. Click submit sin datos → errores visibles\n2. Llenar solo username → error en campos vacíos\n3. Llenar todo → submit → éxito/captcha'},
    pe:{title:'Flujo de Checkout y Carrito',
      body:'Script E2E completo de compra.\n1. Navegar a /products\n2. Buscar producto\n3. Agregar al carrito\n4. Validar subtotal, impuesto, total\n5. Confirmar pedido\n6. Validar mensaje "Pedido confirmado"'}
  },
  'playwright_3':{
    kc:'Abstracción de interfaces, encapsulamiento de selectores en clases POM, métodos limpios de interacción',
    le:{title:'POM Modular de Login',
      body:'Clase LoginPage con goto(), login(email, password), isLoggedIn(), getErrorMessage().\nTest que consume la clase para login inválido.'},
    pe:{title:'Arquitectura de Páginas de la Tienda',
      body:'CatalogPage, CartPage, CheckoutPage, OrderConfirmationPage.\nRefactorizar checkout.spec.ts para usar POMs.\nMétodos: search(), addToCart(), getItems(), fillShipping(), confirmOrder()'}
  },
  'playwright_4':{
    kc:'Inyección de estados de sesión, bypass de autenticación por Storage State, preparación de precondiciones por backend',
    le:{title:'Bypass de Login por auth.json',
      body:'1. npx playwright codegen --save-storage=auth.json\n2. Test con storageState: \'auth.json\'\n3. Navegador arranca autenticado sin login'},
    pe:{title:'Inyección de Inventario Completo para Compra',
      body:'1. beforeAll: POST /api/cart con 5 productos\n2. Guardar storageState\n3. Navegar directo a /checkout/review\n4. Validar 5 productos y total correcto'}
  },
  'playwright_5':{
    kc:'Capturas de pantalla con toHaveScreenshot(), manejo de maxDiffPixels y threshold, actualización de baselines',
    le:{title:'Screenshot de Componente Aislado',
      body:'Navegar a https://demoqa.com/buttons.\nexpect(page.locator(".main-header")).toHaveScreenshot("header.png")\nModificar zoom → test falla'},
    pe:{title:'Catálogo Visual del E-Commerce',
      body:'Visual regression para homepage, listing, detalle, carrito vacío/lleno, confirmación.\n--update-snapshots para actualizar baselines.'}
  },
  'playwright_6':{
    kc:'page.route(), modificación de requests/responses en vuelo, simulación de fallos de red, stub de APIs externas',
    le:{title:'Interceptor de API Pública',
      body:'Interceptar fakestoreapi.com/products, devolver [] vacío.\npage.route(\'**/products\', route => route.fulfill({body: \'[]\'}))\nValidar mensaje "No hay productos"'},
    pe:{title:'Simulación de Gateway de Pagos',
      body:'POST /api/payments/process interceptado.\nCaso éxito → 200 "approved"\nCaso rechazo → 402 "Fondos insuficientes"\nCaso timeout → route.abort(\'timedout\')'}
  },
  'playwright_7':{
    kc:'Ejecución de la misma suite en chromium, firefox y webkit; detección de diferencias de rendering; proyectos en config',
    le:{title:'Detector de Diferencias',
      body:'Screenshot de example.com en chromium y firefox.\nComparar outputs y documentar diferencias.'},
    pe:{title:'Suite Cross-Browser Completa',
      body:'3 proyectos en config: chromium, firefox, webkit.\nRetries: 2 solo para webkit.\nEjecutar login, checkout, catálogo en los 3.'}
  },
  'playwright_8':{
    kc:'Trace Viewer, modo inspector (--debug), page.pause(), logging de acciones, generación con codegen',
    le:{title:'Trace de un Test Fallido',
      body:'Test que falla intencionalmente con trace: \'on\'.\nnpx playwright show-trace test-results/.../trace.zip\nExplorar timeline, network, console, DOM snapshot'},
    pe:{title:'Debugging del Flujo de Pago',
      body:'trace: \'on-first-retry\' en prod.\npage.pause() durante desarrollo.\nnpx playwright codegen http://localhost:3000/checkout'}
  },
  'playwright_9':{
    kc:'Integración de Playwright en CI/CD, playwright.yml, cache de navegadores, reportes HTML como artefactos',
    le:{title:'Pipeline Playwright Mínimo',
      body:'.github/workflows/playwright.yml con action oficial.\nnpx playwright install --with-deps\nnpx playwright test\nUpload playwright-report/'},
    pe:{title:'Pipeline E-Commerce Completo',
      body:'Matrix de browsers: [chromium, firefox, webkit].\nCache de ~/.cache/ms-playwright.\nReporte HTML + Slack notification.'}
  },
  'playwright_10':{
    kc:'Aplicación integrada de todos los conceptos de Playwright contra un solo sitio objetivo (demoqa.com)',
    le:{title:'Automation de Elements y Forms',
      body:'Tests para Text Box, Check Box, Radio Button, Web Tables en demoqa.com.\nPOM por sección. Validar mensajes de salida.'},
    pe:{title:'No aplica directamente al proyecto E-Commerce',
      body:'Este capítulo es complementario. Úsalo como práctica integradora final.'}
  },
  'playwright_11':{
    kc:'Integración total: los 4 tipos de tests (API, E2E, visual, hybrid), CI/CD, reportes',
    le:{title:'Mini-Suite Completa en 30 min',
      body:'Suite que cubra API test + E2E + visual + network contra un sitio a elección.'},
    pe:{title:'Cierre del Proyecto E-Commerce',
      body:'Suite completa del e-commerce, reporte Allure + HTML, pipeline GHA en 3 browsers, README final.'}
  },

  // ── SALESFORCE ──────────────────────────────────────────
  'sf_0':{
    kc:'Creación de scratch orgs, Salesforce CLI, deploy de metadatos, configuración de Dev Hub',
    le:{title:'Crear Scratch Org',
      body:'sf org create scratch --definition-file config/dev-scratch.json --alias TestOrg\nsf project deploy start\nsf apex run test'},
    pe:{title:'Setup del ERP',
      body:'Crear Dev Hub, scratch org con objetos personalizados: Cliente__c, Contrato__c, Comision__c. Deploy del modelo de datos.'}
  },
  'sf_1':{
    kc:'Estructuras de datos nativas (List, Set, Map), clases, modificadores de acceso y colecciones tipadas en Apex',
    le:{title:'Calculadora de Descuentos',
      body:'Clase Apex con métodos estáticos que procesan colecciones de precios, aplican descuentos según rango, retornan totales.'},
    pe:{title:'Modelo de Clientes Corporativos',
      body:'ClienteService con métodos: calcularCategoria(ingresos), validarRFC(rfc), asignarLimiteCredito(clienteId). Clases de dominio.'}
  },
  'sf_2':{
    kc:'Anotación @isTest, métodos test, @TestSetup para datos reutilizables en pruebas Apex',
    le:{title:'@isTest Hello',
      body:'Clase de test con método que prueba suma de 2 números. System.assertEquals(4, sumar(2,2)).'},
    pe:{title:'TestSetup de Contratos',
      body:'@TestSetup que crea 5 contratos en diferentes estados. Tests que verifican consultas por estado, fechas de expiración, montos.'}
  },
  'sf_3':{
    kc:'HttpCalloutMock para simular llamadas HTTP externas en tests Apex',
    le:{title:'Callout Mock Simple',
      body:'Clase que hace GET a API externa. HttpCalloutMock que devuelve 200 con JSON fijo. Test.setMock(HttpCalloutMock.class, new MyMock()).'},
    pe:{title:'Sincronización con API Bancaria',
      body:'SyncClientesBatch que envía clientes al core bancario. Mock para éxito, rechazo (422), timeout.'}
  },
  'sf_4':{
    kc:'System.runAs() para probar permisos, FLS (Field-Level Security) en tests Apex',
    le:{title:'runAs Demo',
      body:'Test que usa System.runAs(usuarioSinPermisos) y verifica que DML falle con System.DmlException.'},
    pe:{title:'FLS en Contratos',
      body:'Tests: usuario sin permiso a Monto__c no puede verlo. Admin sí. Permiso parcial solo edita campos permitidos.'}
  },
  'sf_5':{
    kc:'Governor limits en Apex: SOQL 100, DML 150, CPU time, heap size. Cómo testearlos.',
    le:{title:'Limits Inspector',
      body:'Test que hace 101 SOQL en loop y captura System.LimitException. Ver límites actuales con Limits.getQueries().'},
    pe:{title:'Bulk Contract Processing',
      body:'Batch que procesa 10,000 contratos. Test verifica: SOQL 100, DML 150, CPU time, heap size con 200 registros.'}
  },
  'sf_6':{
    kc:'System.debug(), niveles de log, depuración viendo logs en Setup → Logs',
    le:{title:'System.debug Logger',
      body:'Clase con System.debug() en niveles DEBUG, INFO, WARN, ERROR. Test la ejecuta, revisar logs en Setup → Logs.'},
    pe:{title:'Debug del Pipeline de Comisiones',
      body:'Método complejo que calcula comisiones con logs en cada paso. Test genera logs para depurar error de redondeo.'}
  },
  'sf_7':{
    kc:'Jest para LWC: configuración, mocks de servicios wire, testing de componentes Lightning',
    le:{title:'Jest para LWC Hello',
      body:'Inicializar Jest en proyecto LWC. Test que renderiza helloWorld y verifica texto. npm run test:unit'},
    pe:{title:'Jest para ContractList LWC',
      body:'Componente que lista contratos del cliente. Tests: render con datos mock, vacío, click abre detalle, formato moneda.'}
  },
  'sf_8':{
    kc:'Database.Batchable, métodos start/execute/finish, testing de procesos batch en Apex',
    le:{title:'Batch Hello',
      body:'Database.Batchable que actualiza todos los Account con un campo. Test que verifica ejecución con Database.executeBatch().'},
    pe:{title:'Batch de Vencimiento de Contratos',
      body:'Batch que encuentra contratos por vencer (30 días), cambia estado a "Renovación Pendiente", crea tarea. Test con 200 registros.'}
  },
  'sf_9':{
    kc:'Platform Events: publicación y suscripción, testing end-to-end de flujos event-driven',
    le:{title:'Platform Event Pub/Sub',
      body:'Publicar Order_Event__e con orderId. Listener que lo recibe y debuggea. EventBus.publish().'},
    pe:{title:'Evento de Contrato Renovado',
      body:'Publicar Contract_Renewed__e cuando se renueva. Subscriber actualiza comisión. Test end-to-end del flujo completo.'}
  },
  'sf_10':{
    kc:'Flow + Apex actions: invocar Apex desde Flow builder, testing del Apex invocado',
    le:{title:'Flow + Apex',
      body:'Flow simple que llama a Apex action que valida email. Test unitario del método Apex.'},
    pe:{title:'Flow de Aprobación de Crédito',
      body:'Flow que evalúa solicitud, llama a Apex para verificar buró. Tests: aprobación automática, rechazo, revisión manual.'}
  },
  'sf_11':{
    kc:'Pipeline CI/CD con SF CLI: auth JWT, deploy, run tests, coverage gate',
    le:{title:'SF CLI en GHA',
      body:'Workflow mínimo: auth con JWT, deploy source, run Apex tests. sf org login jwt, sf project deploy start, sf apex run test'},
    pe:{title:'Pipeline ERP Completo',
      body:'Jobs: deploy scratch org → run Apex tests → run LWC Jest → coverage gate > 75% → deploy staging → notify Slack.'}
  },
  'sf_12':{
    kc:'Multi-org regression: ejecutar suite de tests en múltiples organizaciones simultáneamente',
    le:{title:'Multi-Org básico',
      body:'Workflow que corre tests en 2 scratch orgs diferentes en paralelo.'},
    pe:{title:'Regression Multi-Org ERP',
      body:'Suite completa en: scratch org (dev), sandbox (staging), producción (solo selectos). Comparar resultados.'}
  },
  'sf_13':{
    kc:'Copado: pipelines, commits, deployments, change sets, estrategia de release management',
    le:{title:'Copado Fundamentals',
      body:'Documentar: pipelines, commits, deployments, change sets vs Copado. Conceptos clave de release management.'},
    pe:{title:'Estrategia de Deploy con Copado',
      body:'Plan: ramas por ambiente, datasets de prueba, validación pre-deploy, rollback plan documentado.'}
  },
  'sf_14':{
    kc:'Suite completa Apex + LWC + CI/CD con coverage > 75%',
    le:{title:'Mini-Suite Apex en 30 min',
      body:'3 tests: @TestSetup, HttpCalloutMock, System.runAs(). Todos pasando.'},
    pe:{title:'Cierre del Proyecto ERP',
      body:'Suite completa en CI/CD, coverage > 75%, documentación de objetos, README del proyecto externo.'}
  },

  // ── POSTMAN ─────────────────────────────────────────────
  'postman_0':{
    kc:'Manejo de scopes de variables (Global, Environment, Collection) y encadenamiento dinámico de requests',
    le:{title:'Sandbox de Token Passthrough',
      body:'2 requests: POST /login extrae token → GET /protected lo usa.\npm.environment.set("token", pm.response.json().token)\nAuthorization: Bearer {{token}}'},
    pe:{title:'Workspace de Rutas de Entrega',
      body:'Variables dinámicas: base_url, api_key, token, tracking_id.\nEnvironments separados: dev, staging, prod.'}
  },
  'postman_1':{
    kc:'pm.test(), pm.expect() para validar status, body, headers, response time en Postman',
    le:{title:'Assertions Playground',
      body:'Tests contra JSONPlaceholder.\npm.test("Status 200", () => pm.response.to.have.status(200))\npm.expect(pm.response.json().id).to.eql(1)'},
    pe:{title:'Assertions de la API de Logística',
      body:'Validar estructura de rutas, paquetes, estados de entrega. Response time < 2000ms.'}
  },
  'postman_2':{
    kc:'Pre-request scripts para generar datos dinámicos, timestamps, hashes, firmas',
    le:{title:'Timestamp Generator',
      body:'Pre-request que genera timestamp ISO, lo pone en variable.\npm.variables.set("timestamp", new Date().toISOString())'},
    pe:{title:'Firma HMAC para Endpoints Seguros',
      body:'Generar signature HMAC-SHA256 en pre-request.\nconst hmac = CryptoJS.HmacSHA256(data, secret)\npm.variables.set("signature", hmac.toString())'}
  },
  'postman_3':{
    kc:'Validación de esquemas JSON en Postman usando tv4 (Tiny Validator)',
    le:{title:'tv4 Schema Validator',
      body:'Validar response de /posts/1 contra schema inline.\npm.test("Schema valid", () => pm.expect(tv4.validate(body, schema)).to.be.true)'},
    pe:{title:'Validación de Esquema de Paquete',
      body:'Schema Package: trackingNumber, weight, dimensions, origin, destination, status, estimatedDelivery'}
  },
  'postman_4':{
    kc:'Chaining: extraer datos de una response y usarlos en el siguiente request',
    le:{title:'Chain de 3 Requests',
      body:'POST crear → extraer id → GET con ese id → extraer userId → GET user detail.\npm.environment.set("createdId", pm.response.json().id)'},
    pe:{title:'Chaining de Envío Logístico',
      body:'POST /shipments → trackingId → PUT /shipments/{{trackingId}}/pickup → GET /shipments/{{trackingId}}/status'}
  },
  'postman_5':{
    kc:'Collection Runner: ejecutar colecciones completas, ver resultados agregados',
    le:{title:'Collection Runner contra JSONPlaceholder',
      body:'Colección de 5 requests, correr con Collection Runner, ver resultados por request.'},
    pe:{title:'Runner de Rutas Diarias',
      body:'50 iteraciones con data de rutas simuladas, validar tiempos de respuesta < 3000ms.'}
  },
  'postman_6':{
    kc:'Data-driven testing con archivos CSV en Collection Runner',
    le:{title:'CSV Driver',
      body:'CSV con 10 casos de prueba (title, expectedStatus). Collection Runner con el CSV.\npm.iterationData.get("title")'},
    pe:{title:'Data-Driven de Entregas',
      body:'CSV con 100 envíos (origen, destino, peso, prioridad). Validar cálculo de tarifas contra expectedPrice.'}
  },
  'postman_7':{
    kc:'Newman CLI: ejecutar colecciones Postman desde terminal, integrar en CI/CD',
    le:{title:'Newman Hello World',
      body:'Exportar colección, correr con newman.\nnewman run collection.json -e env.json --reporters cli'},
    pe:{title:'Newman en Pipeline Logístico',
      body:'Script que corre suite completa de logística con reporters cli, htmlextra, junit.'}
  },
  'postman_8':{
    kc:'Newman HTML reports con htmlextra para visualización de resultados',
    le:{title:'Newman HTML Report',
      body:'Correr con --reporters htmlextra.\nnewman run collection.json -e env.json --reporters htmlextra\nAbrir el HTML generado.'},
    pe:{title:'Reporte Unificado de Logística',
      body:'Reporte HTML personalizado con métricas de éxito/fallo por endpoint, tiempos, gráficas.'}
  },
  'postman_9':{
    kc:'Integración de Newman en GitHub Actions para automatización de Postman',
    le:{title:'GHA + Newman Mínimo',
      body:'Workflow que instala Newman y corre colección.\nnpm install -g newman\nnewman run collection.json'},
    pe:{title:'Pipeline de Logística Completo',
      body:'GHA con matrix de entornos (staging, production). Artefactos HTML. Slack notification.'}
  },
  'postman_10':{
    kc:'Postman Monitors: ejecución programada de colecciones en la nube',
    le:{title:'Monitor Quick',
      body:'Crear monitor en Postman Cloud que corra cada hora contra JSONPlaceholder. Ver resultados en dashboard.'},
    pe:{title:'Monitor de SLA Logístico',
      body:'Monitoreo cada 5 min de endpoints críticos: tracking status, warehouse stock, delivery ETA.'}
  },
  'postman_11':{
    kc:'Mock Servers en Postman para simular APIs sin backend real',
    le:{title:'Mock Server Aislado',
      body:'Crear mock server para API de usuarios con 3 endpoints. Ejemplo de respuesta configurada en ejemplo de colección.'},
    pe:{title:'Mock de Proveedor Externo',
      body:'Simular API de paquetería (FedEx/DHL) con respuestas de tracking, rates, pickup.'}
  },
  'postman_12':{
    kc:'Generación de documentación de API desde colecciones Postman',
    le:{title:'Doc Generator',
      body:'Publicar colección como documentación en Postman web.\nWorkspace → View in web → Publish.'},
    pe:{title:'Documentación de Logística Publicada',
      body:'Documentación completa con ejemplos, schemas, descripciones, publicada con dominio personalizado.'}
  },
  'postman_13':{
    kc:'Postman Flows: automatización visual de flujos de datos entre APIs',
    le:{title:'Flow Visual Simple',
      body:'Flow: GET → extraer datos → POST con esos datos. Usar nodos de output/input.'},
    pe:{title:'Automation Flow de Reabastecimiento',
      body:'Flow: verificar stock bajo → ordenar reposición → notificar proveedor → actualizar inventario.'}
  },
  'postman_14':{
    kc:'Contract testing en Postman: validar responses contra schemas predefinidos',
    le:{title:'Contract Check',
      body:'Validar que response de /posts cumpla schema predefinido con tv4.'},
    pe:{title:'Contrato de API de Inventario',
      body:'Verificar cada endpoint contra schema contract: Product, Warehouse, StockMovement.'}
  },
  'postman_15':{
    kc:'Pruebas de performance en Postman: múltiples iteraciones, medición de tiempos',
    le:{title:'Performance Quick',
      body:'Collection runner con 50 iteraciones sin delay. Analizar p50/p95/p99 de cada request.'},
    pe:{title:'Performance de Logística',
      body:'200 iteraciones, medir p50/p95/p99 de cada endpoint, identificar cuellos de botella.'}
  },
  'postman_16':{
    kc:'Carpeta dedicada de negative tests: auth inválida, body malformado, métodos incorrectos',
    le:{title:'Negative Collection',
      body:'Carpeta con tests de: auth inválida → 401, body malformado → 400, ID inexistente → 404, method no permitido → 405.'},
    pe:{title:'Negative Suite de Logística',
      body:'Peso excedido → 422, dirección inválida → 400, código postal incorrecto → 400, destinatario sin datos → 422.'}
  },
  'postman_17':{
    kc:'Scripting avanzado con CryptoJS, lodash, manipulación de objetos en Postman',
    le:{title:'Crypto y Lodash',
      body:'CryptoJS para hash SHA256. Lodash para manipular objetos, merge, pick, omit.'},
    pe:{title:'Scripting Avanzado de Logística',
      body:'Generar códigos de barras, calcular distancias entre CPs, validar firmas digitales de entrega.'}
  },
  'postman_18':{
    kc:'Mini-suite completa integrando chaining, data-driven, schema validation, Monitors, Mock Servers',
    le:{title:'Mini-Suite Logística en 20 min',
      body:'3 tests con chaining, data-driven CSV, schema validation. Todo pasando en Newman.'},
    pe:{title:'Cierre del Proyecto Postman',
      body:'Suite completa de logística en CI/CD con Monitors, Mock Servers, documentación publicada.'}
  }
};


// ── GUIDE routing (from sdet-guide.html) ────────
const SECTIONS = ['dashboard','api-basics','api-testing','auth','cicd','frameworks',
  'sf-overview','apex-testing','playwright','sf-project','project1','project2',
  'project-postman','project-playwright','cheatsheet','study','notes','tracker','interview'];

function go(id) {
  SECTIONS.forEach(s => { document.getElementById('s-'+s).classList.toggle('active', s===id); });
  document.querySelectorAll('.sb-item').forEach(n => {
    n.classList.toggle('active', n.getAttribute('onclick') && n.getAttribute('onclick').includes("'"+id+"'"));
  });
  const panel = document.getElementById('panel-guide');
  if (panel) panel.scrollTo(0, 0);
  const crumb = document.getElementById('guide-crumb');
  if (crumb) crumb.textContent = id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

function toggleGroup(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

// ── PANEL switching ─────────────────────────────
function switchPanel(panel) {
  document.getElementById('panel-dash').classList.toggle('visible', panel==='dash');
  document.getElementById('panel-guide').classList.toggle('visible', panel==='guide');
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.panel===panel));
  try { localStorage.setItem('stos_panel', panel); } catch(e) {}
  if (panel==='dash') window._dashApp && window._dashApp.$nextTick(()=>null);
}

// Navigate guide from dashboard chapter click
function openGuideSection(sectionId, chapName) {
  switchPanel('guide');
  go(sectionId);
  const crumb = document.getElementById('guide-crumb');
  if (crumb) crumb.textContent = chapName;
}

// ── Notes (guide) ───────────────────────────────
function saveNote() {
  try { localStorage.setItem('sdet_notes', document.getElementById('note-area').value); } catch(e){}
  const s = document.getElementById('note-status');
  if(s) { s.style.opacity='1'; setTimeout(()=>s.style.opacity='0',2000); }
}
function copyNote() { navigator.clipboard.writeText(document.getElementById('note-area').value).catch(()=>{}); }
function clearNote() {
  if(!confirm('¿Borrar todas las notas?')) return;
  const el = document.getElementById('note-area');
  if(el) el.value = '';
  try { localStorage.removeItem('sdet_notes'); } catch(e){}
}

// ── Supabase init + Auth guard ───────────────────
window._sb = null;
window._user = null;

(async () => {
  try {
    const cfg = await fetch('/api/config').then(r => r.json());
    if (!cfg.supabaseUrl) return; // local dev without Supabase
    window._sb = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data: { session } } = await window._sb.auth.getSession();
    if (!session) {
      window.location.href = '/login.html';
      return;
    }
    window._user = session.user;
    window.dispatchEvent(new CustomEvent('supabase-ready'));
  } catch (e) {
    console.warn('Supabase init failed (local dev?):', e.message);
  }
})();

// ── DASHBOARD Alpine app ─────────────────────────
function app() {
  return {
    // ── Routing ──
    view: (() => { const v = localStorage.getItem('stos_view'); return (v && (v === 'dashboard' || v === 'subjects' || v === 'pomodoro' || v === 'interview' || v === 'settings' || v === 'challenges' || v.startsWith('subject-') || v === 'ai-guide')) ? v : 'dashboard'; })(),
    navigate(v) {
      this.view = v;
      localStorage.setItem('stos_view', v);
      if (v !== 'ai-guide') localStorage.removeItem('stos_ai_guide');
      this.$nextTick(() => document.getElementById('panel-dash').scrollTo(0, 0));
    },
    goGuide(sectionId) {
      if (sectionId) {
        switchPanel('guide');
        go(sectionId);
      } else {
        switchPanel('dash');
      }
    },
    goChapter(chapName, subjectId) {
      const sectionId = CHAP_MAP[chapName];
      if (sectionId) {
        openGuideSection(sectionId, chapName);
      }
    },

    navMain: [
      {id:'dashboard',icon:'⊞',label:'Dashboard'},
      {id:'pomodoro',icon:'🍅',label:'Pomodoro'},
      {id:'tasks',icon:'📋',label:'Tareas'},
      {id:'calendar',icon:'📅',label:'Calendario'},
    ],

    // ── Auth / user ──
    profileName: '',
    profileSaving: false,
    profileSaved: false,
    get userName() { return this.profileName || window._user?.user_metadata?.full_name?.split(' ')[0] || window._user?.email?.split('@')[0] || 'Usuario'; },
    async saveProfile() {
      this.profileSaving = true;
      try {
        localStorage.setItem('studyos_profileName', this.profileName);
        if (window._sb && window._user) {
          await window._sb.auth.updateUser({ data: { full_name: this.profileName } });
        }
        this.profileSaved = true;
        setTimeout(() => this.profileSaved = false, 2000);
      } catch(e) {}
      this.profileSaving = false;
    },
    async logout() {
      if (window._sb) await window._sb.auth.signOut();
      window.location.href = '/login.html';
    },

    // ── CV ──
    cvFile: null,
    cvFilename: '',
    cvAnalyzing: false,
    cvError: '',
    cvAnalysis: null,

    handleCVFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.cvFile = file;
      this.cvFilename = file.name;
      this.cvError = '';
    },

    async analyzeCV() {
      if (!this.cvFile) return;
      this.cvAnalyzing = true;
      this.cvError = '';
      try {
        const buffer = await this.cvFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        const fileBase64 = btoa(binary);
        const res = await fetch('/api/analyze-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64,
            mimeType: 'application/pdf',
            currentSubjects: this.subjects.map(s => ({ name: s.name })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');
        this.cvAnalysis = data.analysis;
        // add recommended subjects to learning path
        (data.analysis.recommended_subjects || []).forEach(s => this.subjects.push(s));
        this.saveProgress();
        // save analysis to Supabase profile
        if (window._sb && window._user) {
          await window._sb.from('profiles').upsert({
            id: window._user.id,
            cv_filename: this.cvFilename,
            cv_analysis: data.analysis,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        this.cvError = e.message;
      } finally {
        this.cvAnalyzing = false;
      }
    },

    // ── Interview ──
    interviewTopic: '',
    interviewMessages: [],
    interviewUserInput: '',
    interviewLoading: false,
    interviewStartTime: null,
    interviewHistory: JSON.parse(localStorage.getItem('stos_interview_history') || '[]'),

    // ── Challenges ──
    challengeTopic: '',
    challengeTopicCustom: '',
    challengeDifficulty: 'medium',
    challengeLanguage: 'javascript',
    currentExercise: null,
    challengeCode: '',
    challengeRunning: false,
    challengeResult: null,
    challengeGenerating: false,
    challengeError: '',
    challengeShowSolution: false,
    challengeShowHints: false,
    challengeHistory: JSON.parse(localStorage.getItem('stos_challenge_history') || '[]'),

    async generateExercise() {
      const topic = this.challengeTopicCustom.trim() || this.challengeTopic;
      if (!topic) { this.challengeError = 'Select or type a topic first'; return; }
      this.challengeGenerating = true;
      this.challengeError = '';
      this.currentExercise = null;
      this.challengeCode = '';
      this.challengeResult = null;
      this.challengeShowSolution = false;
      this.challengeShowHints = false;
      try {
        const res = await fetch('/api/exercise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, difficulty: this.challengeDifficulty, language: this.challengeLanguage }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error generating exercise');
        this.currentExercise = data.exercise;
        this.challengeCode = data.exercise.starterCode || '';
      } catch (e) {
        this.challengeError = e.message;
      } finally {
        this.challengeGenerating = false;
      }
    },

    async runChallenge() {
      if (!this.currentExercise || !this.challengeCode.trim()) return;
      this.challengeRunning = true;
      this.challengeResult = null;
      try {
        if (this.challengeLanguage === 'javascript') {
          // Run directly in browser — no external API, instant, zero failures
          const tc = this.currentExercise.testCases || [];
          const fn = this.currentExercise.functionName || 'solution';
          let userFn;
          try {
            userFn = new Function(`${this.challengeCode}; return ${fn};`)();
          } catch(e) {
            this.challengeResult = { error: 'Syntax error: ' + e.message, passed: 0, total: tc.length, results: [] };
            return;
          }
          let passed = 0;
          const results = tc.map((t, i) => {
            try {
              const got = userFn(t.input);
              const ok = JSON.stringify(got) === JSON.stringify(t.expected);
              if (ok) passed++;
              return { t: i+1, s: ok ? 'PASS' : 'FAIL', got: JSON.stringify(got), exp: JSON.stringify(t.expected), label: t.label || '' };
            } catch(e) {
              return { t: i+1, s: 'ERROR', err: e.message, label: t.label || '' };
            }
          });
          this.challengeResult = { passed, total: tc.length, results };
          if (passed === tc.length && tc.length > 0) this._saveChallengeToHistory(true);
        } else {
          // Python — use Piston API
          const res = await fetch('/api/run-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userCode: this.challengeCode,
              testCases: this.currentExercise.testCases,
              functionName: this.currentExercise.functionName,
              language: this.challengeLanguage,
            }),
          });
          const data = await res.json();
          this.challengeResult = data;
          if (!data.error && data.passed === data.total && data.total > 0) this._saveChallengeToHistory(true);
        }
      } catch (e) {
        this.challengeResult = { error: e.message };
      } finally {
        this.challengeRunning = false;
      }
    },

    _saveChallengeToHistory(passed) {
      const entry = {
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        topic: this.currentExercise?.topic || '',
        title: this.currentExercise?.title || '',
        difficulty: this.currentExercise?.difficulty || '',
        language: this.challengeLanguage,
        passed,
      };
      this.challengeHistory = [entry, ...this.challengeHistory].slice(0, 50);
      try { localStorage.setItem('stos_challenge_history', JSON.stringify(this.challengeHistory)); } catch(e) {}
    },

    _saveInterviewSession() {
      const userMsgs = this.interviewMessages.filter(m => m.role === 'user').length;
      if (!userMsgs) return;
      const duration = this.interviewStartTime ? Math.round((Date.now() - this.interviewStartTime) / 60000) : 0;
      const score = Math.min(100, Math.round(40 + userMsgs * 8 + (duration > 5 ? 10 : 0)));
      const entry = {
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        topic: this.interviewTopic || 'Tema libre',
        duration,
        score,
      };
      this.interviewHistory = [entry, ...this.interviewHistory].slice(0, 20);
      try { localStorage.setItem('stos_interview_history', JSON.stringify(this.interviewHistory)); } catch(e) {}
    },

    async startInterview() {
      this._saveInterviewSession();
      this.interviewMessages = [];
      this.interviewUserInput = '';
      this.interviewStartTime = Date.now();
      await this.sendInterviewMessage('__start__');
    },

    startInterviewWithQuestion(q) {
      this.navigate('interview');
      this._saveInterviewSession();
      this.interviewMessages = [];
      this.interviewStartTime = Date.now();
      this.$nextTick(() => this.sendInterviewMessage('__start__'));
    },

    async sendInterviewMessage(override) {
      const text = override === '__start__' ? '' : this.interviewUserInput.trim();
      if (!override && !text) return;

      if (text) {
        this.interviewMessages.push({ role: 'user', content: text });
        this.interviewUserInput = '';
      }

      this.interviewLoading = true;
      this.$nextTick(() => {
        const el = document.getElementById('interview-scroll');
        if (el) el.scrollTop = el.scrollHeight;
      });

      try {
        const cvSummary = this.cvAnalysis
          ? `${this.cvAnalysis.experience_summary} Skills: ${(this.cvAnalysis.skills || []).join(', ')}`
          : '';
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: this.interviewMessages.slice(-10),
            cvSummary,
            topic: this.interviewTopic,
            userName: this.profileName || this.userName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        this.interviewMessages.push({ role: 'assistant', content: data.reply });
      } catch (e) {
        this.interviewMessages.push({ role: 'assistant', content: '⚠️ Error: ' + e.message });
      } finally {
        this.interviewLoading = false;
        this.$nextTick(() => {
          const el = document.getElementById('interview-scroll');
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
    },

    // ── Supabase save / load ──
    async saveProgress() {
      if (!window._sb || !window._user) return;
      await window._sb.from('progress').upsert({
        user_id: window._user.id,
        subjects: JSON.stringify(this.subjects),
        tasks: JSON.stringify(this.tasks),
        updated_at: new Date().toISOString(),
      });
    },

    async loadProgress() {
      if (!window._sb || !window._user) return;
      const { data } = await window._sb.from('progress').select('*').eq('user_id', window._user.id).single();
      if (data?.subjects) {
        try { this.subjects = JSON.parse(data.subjects); } catch(e){}
      }
      if (data?.tasks) {
        try { this.tasks = JSON.parse(data.tasks); } catch(e){}
      }
      // load CV analysis
      const { data: profile } = await window._sb.from('profiles').select('*').eq('id', window._user.id).single();
      if (profile?.cv_analysis) {
        this.cvAnalysis = profile.cv_analysis;
        this.cvFilename = profile.cv_filename || '';
      }
    },

    // ── State ──
    streak: 0, pomosToday: 0, pomosGoal: 8,
    weekGoal: 35, currentWeek: 1,
    settings: { alarmOn: true, focusMode: false },
    pomoSettings: { work: 25, short: 5, long: 15 },
    taskFilter: 'all', newTask: '',

    // ── Subjects ──
    subjects: [
      {
        id:'api', name:'API Testing', defaultLang:'Java', icon:'🔬', pct:0, color:'blue', tag:'En curso', priority:1,
        chapters:'14/20 caps', hours:'18h', exam:'Jun 15',
        chapList: [
          {name:'Fundamentos HTTP y REST',done:false},{name:'Status codes y headers',done:false},
          {name:'RestAssured setup + pom.xml',done:false},{name:'PostsTest.java — happy path',done:false},
          {name:'JSON Schema validation',done:false},{name:'Negative tests y boundaries',done:false},
          {name:'Auth testing — JWT y OAuth',done:false},{name:'Security checklist — IDOR, XSS',done:false},
          {name:'Data-driven tests @ParameterizedTest',done:false},{name:'Allure reporting',done:false},
          {name:'UsersTest.java completo',done:false},{name:'CommentsTest.java completo',done:false},
          {name:'Pact contract tests',done:false},{name:'WireMock stubs',done:false},
          {name:'CI/CD — GitHub Actions gate',done:false},{name:'k6 performance gates',done:false},
          {name:'API design patterns',done:false},{name:'GraphQL testing',done:false},
          {name:'gRPC testing',done:false},{name:'Examen final',done:false},
        ]
      },
      {
        id:'cicd', name:'CI/CD', defaultLang:'YAML', icon:'🚀', pct:0, color:'green', tag:'En curso', priority:4,
        chapters:'8/14 caps', hours:'12h', exam:null,
        chapList: [
          {name:'Pipelines y stages',done:false},{name:'GitHub Actions basics',done:false},
          {name:'Quality gates',done:false},{name:'Docker fundamentals',done:false},
          {name:'Docker Compose para tests',done:false},{name:'Matrix builds',done:false},
          {name:'Environments y secrets',done:false},{name:'Allure + artefactos',done:false},
          {name:'k6 performance gates',done:false},{name:'Pact contract tests',done:false},
          {name:'Slack notifications',done:false},{name:'Ephemeral environments',done:false},
          {name:'Multi-org deployment',done:false},{name:'Examen final',done:false},
        ]
      },
      {
        id:'playwright', name:'Playwright', defaultLang:'JavaScript', icon:'🎭', pct:0, color:'purple', tag:'Iniciado', priority:3,
        chapters:'5/12 caps', hours:'8h', exam:'Jul 2',
        chapList: [
          {name:'Setup y configuración',done:false},{name:'API tests con request fixture',done:false},
          {name:'E2E tests básicos',done:false},{name:'Page Object Model',done:false},
          {name:'Hybrid API + UI tests',done:false},{name:'Visual regression testing',done:false},
          {name:'Network interception',done:false},{name:'Cross-browser testing',done:false},
          {name:'Debugging y traces',done:false},{name:'GitHub Actions integration',done:false},
          {name:'demoqa.com proyecto completo',done:false},{name:'Examen final',done:false},
        ]
      },
      {
        id:'sf', name:'Apex/Salesforce', defaultLang:'Apex', icon:'☁', pct:0, color:'orange', tag:'Pendiente', priority:5,
        chapters:'3/15 caps', hours:'5h', exam:'Jul 20',
        chapList: [
          {name:'Dev Org setup + SF CLI',done:false},{name:'Apex basics',done:false},
          {name:'@isTest y @TestSetup',done:false},{name:'HttpCalloutMock',done:false},
          {name:'System.runAs() y FLS',done:false},{name:'Governor limits testing',done:false},
          {name:'Debug logs reading',done:false},{name:'LWC Jest tests',done:false},
          {name:'Batch Apex testing',done:false},{name:'Platform Events testing',done:false},
          {name:'Flow testing en Apex',done:false},{name:'SF CLI CI/CD pipeline',done:false},
          {name:'Multi-org regression',done:false},{name:'Copado basics',done:false},
          {name:'Examen final',done:false},
        ]
      },
      {
        id:'postman', name:'Postman', defaultLang:'JavaScript', icon:'📮', pct:0, color:'green', tag:'Avanzado', priority:2,
        chapters:'17/20 caps', hours:'22h', exam:null,
        chapList: [
          {name:'Colecciones y workspaces',done:false},{name:'Variables de entorno',done:false},
          {name:'pm.test assertions',done:false},{name:'Pre-request scripts',done:false},
          {name:'Schema validation',done:false},{name:'Chaining con env variables',done:false},
          {name:'Collection Runner',done:false},{name:'Data-driven con CSV',done:false},
          {name:'Newman CLI',done:false},{name:'HTML reports',done:false},
          {name:'GitHub Actions + Newman',done:false},{name:'Monitors',done:false},
          {name:'Mock servers',done:false},{name:'API documentation',done:false},
          {name:'Flows (nuevo)',done:false},{name:'Contract testing',done:false},
          {name:'Performance testing',done:false},{name:'Negative test folder',done:false},
          {name:'Advanced scripting',done:false},{name:'Examen final',done:false},
        ]
      },
    ],

    get overallPct() {
      return Math.round(this.subjects.reduce((a,s)=>a+this.chapPct(s),0)/this.subjects.length);
    },

    // ── Deadlines ──
    getSubjectTag(s) {
      const pct = this.chapPct(s);
      if (pct === 100) return 'Completado';
      if (pct > 0) return 'En curso';
      return 'Pendiente';
    },
    get nextChapters() {
      return this.subjects
        .map(s => {
          const done = s.chapList.filter(c => c.done).length;
          const total = s.chapList.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const nextChap = s.chapList.find(c => !c.done);
          return { s, done, total, pct, nextChap };
        })
        .filter(({ nextChap }) => nextChap)
        .sort((a, b) => {
          // 1. in-progress first
          const aActive = a.pct > 0 ? 1 : 0;
          const bActive = b.pct > 0 ? 1 : 0;
          if (bActive !== aActive) return bActive - aActive;
          // 2. highest % among in-progress
          if (a.pct !== b.pct) return b.pct - a.pct;
          // 3. tiebreak by pedagogical priority (lower = first)
          return (a.s.priority || 99) - (b.s.priority || 99);
        })
        .slice(0, 4)
        .map(({ s, done, total, pct, nextChap }) => ({
          id: s.id,
          subject: s.name,
          color: s.color,
          icon: s.icon,
          title: nextChap.name,
          pct,
          done,
          total,
          reason: pct > 0
            ? `${done}/${total} caps · ${pct}% completado`
            : 'Siguiente: cap. 1',
          action: pct > 0 ? 'Continuar' : 'Empezar',
        }));
    },

    // ── Tasks ──
    tasks: [
      {id:1,text:'Leer cap 15 RestAssured',done:false,pri:'high'},
      {id:2,text:'Escribir PostsTest.java completo',done:false,pri:'high'},
      {id:3,text:'Configurar Docker Compose Proyecto 2',done:false,pri:'high'},
      {id:4,text:'Ejercicios Auth & Security',done:false,pri:'medium'},
      {id:5,text:'Instalar Playwright + primeros tests',done:false,pri:'medium'},
      {id:6,text:'Revisar cheat sheet CI/CD',done:false,pri:'low'},
      {id:7,text:'Crear Dev Org Salesforce',done:false,pri:'medium'},
      {id:8,text:'Newman CLI en pipeline',done:false,pri:'high'},
    ],
    get doneTasks(){ return this.tasks.filter(t=>t.done).length },
    get filteredTasks(){
      if(this.taskFilter==='pending') return this.tasks.filter(t=>!t.done);
      if(this.taskFilter==='done')    return this.tasks.filter(t=>t.done);
      return this.tasks;
    },
    toggleTask(i){ this.tasks[i].done=!this.tasks[i].done },
    deleteTask(id){ this.tasks=this.tasks.filter(t=>t.id!==id); },
    addTask(){
      if(!this.newTask.trim()) return;
      this.tasks.push({id:Date.now(),text:this.newTask.trim(),done:false,pri:'medium'});
      this.newTask='';
    },

    // ── Hours ──
    weekHours: [0,0,0,0,0,0,0],
    get totalHours(){ return this.weekHours.reduce((a,b)=>a+b,0) },
    get maxH(){ return Math.max(...this.weekHours,1) },
    get todayIdx(){ const d=new Date().getDay(); return d===0?6:d-1 },
    days: ['L','M','X','J','V','S','D'],
    activity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

    // ── Pomodoro ──
    pomoPhase:'work', running:false, donePomos:0, timerInterval:null, timeLeft:25*60,
    circ:2*Math.PI*60, circBig:2*Math.PI*96, pomoLog:[],
    phaseDur:{work:25*60,short:5*60,long:15*60},
    phaseNames:{work:'ENFOQUE',short:'DESCANSO CORTO',long:'DESCANSO LARGO'},
    get fmtTime(){
      const m=Math.floor(this.timeLeft/60).toString().padStart(2,'0');
      const s=(this.timeLeft%60).toString().padStart(2,'0');
      return m+':'+s;
    },
    get phaseLabel(){ return this.phaseNames[this.pomoPhase] },
    get dash(){
      return this.circ*(1-this.timeLeft/this.phaseDur[this.pomoPhase]);
    },
    get dashBig(){
      return this.circBig*(1-this.timeLeft/this.phaseDur[this.pomoPhase]);
    },
    setPhase(phase){
      this.pomoPhase=phase; this.timeLeft=this.phaseDur[phase];
      this.running=false; clearInterval(this.timerInterval);
    },
    toggleTimer(){
      if(this.running){ clearInterval(this.timerInterval); this.running=false; }
      else {
        this.running=true;
        this.timerInterval=setInterval(()=>{
          if(this.timeLeft>0){ this.timeLeft--; }
          else {
            clearInterval(this.timerInterval); this.running=false;
            const now=new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
            this.pomoLog.unshift({id:Date.now(),
              label:this.pomoPhase==='work'?`Sesión #${this.donePomos+1}`:'Descanso',
              type:this.pomoPhase, time:now,
              focus: this.pomoPhase==='work' ? this.pomoFocusLabel : ''});
            if(this.pomoPhase==='work'){
              this.donePomos=Math.min(4,this.donePomos+1); this.pomosToday++;
              this.setPhase(this.donePomos%4===0?'long':'short');
            } else { this.setPhase('work'); }
          }
        },1000);
      }
    },
    resetTimer(){
      clearInterval(this.timerInterval); this.running=false;
      this.timeLeft=this.phaseDur[this.pomoPhase];
    },
    applyPomoSettings(){
      this.phaseDur={work:this.pomoSettings.work*60,short:this.pomoSettings.short*60,long:this.pomoSettings.long*60};
      this.resetTimer();
    },

    // ── Chapter Notes ──
    notesOpen: {},
    toggleNotes(s, idx) {
      const key = s.id + '_' + idx;
      this.notesOpen = { ...this.notesOpen, [key]: !this.notesOpen[key] };
    },
    isNotesOpen(s, idx) {
      return !!this.notesOpen[s.id + '_' + idx];
    },


    // ── Pomodoro focus ──
    pomoFocusSubjectId: '',
    pomoFocusChapterName: '',
    get pomoFocusSubject() {
      return this.subjects.find(s => s.id === this.pomoFocusSubjectId) || null;
    },
    get pomoFocusLabel() {
      if (!this.pomoFocusSubjectId) return '';
      const s = this.pomoFocusSubject;
      if (!s) return '';
      return this.pomoFocusChapterName ? s.name + ' — ' + this.pomoFocusChapterName : s.name;
    },

    // ── Chapter / subject helpers ──
    resetTarget: null,
    deleteTarget: null,
    confirmDelete(s){ this.deleteTarget = this.deleteTarget === s.id ? null : s.id; },
    doDelete(s){
      this.subjects = this.subjects.filter(sub => sub.id !== s.id);
      this.deleteTarget = null;
      this.navigate('subjects');
      this.saveProgress();
    },
    chapPct(s){
      if(!s.chapList||!s.chapList.length) return 0;
      return Math.round(s.chapList.filter(c=>c.done).length/s.chapList.length*100);
    },
    syncSubjectPct(s){ s.pct=this.chapPct(s); },
    confirmReset(s){ this.resetTarget=this.resetTarget===s.id?null:s.id; },
    doReset(s){ s.chapList.forEach(ch=>ch.done=false); s.pct=0; this.resetTarget=null; this.saveProgress(); },

    // ── AI Guide View ──
    aiGuide: { subject: null, chapter: null, chapterIndex: 0, loading: false, quizOnly: false, error: '', content: null, quiz: null, keyConcept: '', labExpress: null, projectEvolution: null, language: 'JavaScript' },
    _guideSession: 0,

    async _loadCacheFromSupabase(key) {
      if (!window._sb || !window._user) return null;
      try {
        const { data } = await window._sb.from('guide_cache').select('content').eq('user_id', window._user.id).eq('cache_key', key).single();
        return data?.content || null;
      } catch { return null; }
    },
    async _saveCacheToSupabase(key, content) {
      if (!window._sb || !window._user) return;
      try {
        await window._sb.from('guide_cache').upsert({
          user_id: window._user.id,
          cache_key: key,
          content,
          updated_at: new Date().toISOString(),
        });
      } catch {}
    },

    async openAIGuide(subject, chapter, chapterIndex, quizOnly = false) {
      const session = ++this._guideSession;
      const alreadyDone = chapter?.done === true;
      this.aiGuide = {
        subject, chapter, chapterIndex, loading: !quizOnly, quizOnly, error: '', content: null,
        quiz: { questions: [], answers: [null, null, null], loading: !alreadyDone, submitted: alreadyDone, score: alreadyDone ? 3 : 0, error: false },
      };
      // Populate embedded guide data (Lab Express + Project Evolution)
      const embeddedKey = subject.id + '_' + chapterIndex;
      const embedded = EMBEDDED_GUIDES[embeddedKey];
      if (embedded) {
        this.aiGuide.keyConcept = embedded.kc;
        this.aiGuide.labExpress = embedded.le;
        this.aiGuide.projectEvolution = embedded.pe;
      }

      // Set language from subject default
      this.aiGuide.language = subject.defaultLang || 'JavaScript';

      this.navigate('ai-guide');
      localStorage.setItem('stos_ai_guide', JSON.stringify({
        subjectId: subject.id, chapterIndex,
        quizOnly,
        language: this.aiGuide.language
      }));
      try { localStorage.setItem('stos_panel', 'dash'); } catch(e) {}

      const cacheKey = `guide_${subject.id}_${chapterIndex}`;
      const quizKey  = `quiz_${subject.id}_${chapterIndex}`;

      // Guide: localStorage → Supabase fallback
      if (!quizOnly) {
        try {
          let cached = localStorage.getItem(cacheKey);
          if (!cached) cached = await this._loadCacheFromSupabase(cacheKey);
          if (cached) {
            this.aiGuide.content = typeof cached === 'string' ? JSON.parse(cached) : cached;
            this.aiGuide.loading = false;
          }
        } catch(e) {}
      }
      // Quiz: localStorage → Supabase fallback
      try {
        let cachedQ = localStorage.getItem(quizKey);
        if (!cachedQ) cachedQ = await this._loadCacheFromSupabase(quizKey);
        if (cachedQ) {
          this.aiGuide.quiz.questions = typeof cachedQ === 'string' ? JSON.parse(cachedQ) : cachedQ;
          this.aiGuide.quiz.loading = false;
        }
      } catch(e) {}

      const tasks = [];

      if (!quizOnly && !this.aiGuide.content) {
        tasks.push(
          fetch('/api/generate-guide', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subjectName: subject.name,
              chapterName: chapter.name,
              subjectReason: subject.reason || '',
              language: this.aiGuide.language,
              embeddedGuide: this.aiGuide.labExpress ? {
                keyConcept: this.aiGuide.keyConcept,
                labExpress: this.aiGuide.labExpress,
                projectEvolution: this.aiGuide.projectEvolution
              } : null
            }),
          })
          .then(r => r.json())
          .then(data => {
            if (this._guideSession !== session) return;
            if (data.error) throw new Error(data.error);
            this.aiGuide.content = data.guide;
            try { localStorage.setItem(cacheKey, JSON.stringify(data.guide)); } catch(e) {}
            this._saveCacheToSupabase(cacheKey, data.guide);
          })
          .catch(e => { if (this._guideSession === session) this.aiGuide.error = e.message; })
          .finally(() => { if (this._guideSession === session) this.aiGuide.loading = false; })
        );
      }

      if (!this.aiGuide.quiz.questions.length) {
        tasks.push(
          fetch('/api/quiz', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectName: subject.name, chapterName: chapter.name, chapterIndex, totalChapters: subject.chapList?.length || 0, language: this.aiGuide.language }),
          })
          .then(r => r.json())
          .then(data => {
            if (this._guideSession !== session) return;
            if (data.questions) {
              this.aiGuide.quiz.questions = data.questions;
              try { localStorage.setItem(quizKey, JSON.stringify(data.questions)); } catch(e) {}
              this._saveCacheToSupabase(quizKey, data.questions);
            }
          })
          .catch(() => { if (this._guideSession === session) this.aiGuide.quiz.error = true; })
          .finally(() => { if (this._guideSession === session) this.aiGuide.quiz.loading = false; })
        );
      }

      await Promise.all(tasks);
    },

    submitAIQuiz() {
      let score = 0;
      (this.aiGuide.quiz.questions || []).forEach((q, i) => {
        if (this.aiGuide.quiz.answers[i] === q.correct) score++;
      });
      this.aiGuide.quiz.score = score;
      this.aiGuide.quiz.submitted = true;
      if (score >= 2) {
        const s = this.aiGuide.subject;
        const idx = this.aiGuide.chapterIndex;
        if (s?.chapList?.[idx]) {
          s.chapList[idx].done = true;
          this.syncSubjectPct(s);
          this.saveProgress();
        }
      }
    },


    async regenerateGuide() {
      const { subject, chapter, chapterIndex, labExpress, keyConcept, projectEvolution } = this.aiGuide;
      if (!subject) return;
      const cacheKey = `guide_${subject.id}_${chapterIndex}`;

      localStorage.removeItem(cacheKey);
      try {
        if (window._sb && window._user) {
          await window._sb.from('guide_cache').delete().eq('user_id', window._user.id).eq('cache_key', cacheKey);
        }
      } catch(e) {}

      this.aiGuide.content = null;
      this.aiGuide.loading = true;
      this.aiGuide.error = '';

      const session = ++this._guideSession;
      fetch('/api/generate-guide', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subject.name,
          chapterName: chapter.name,
          subjectReason: subject.reason || '',
          language: this.aiGuide.language,
          embeddedGuide: labExpress ? { keyConcept, labExpress, projectEvolution } : null
        }),
      })
      .then(r => r.json())
      .then(data => {
        if (this._guideSession !== session) return;
        if (data.error) throw new Error(data.error);
        this.aiGuide.content = data.guide;
        try { localStorage.setItem(cacheKey, JSON.stringify(data.guide)); } catch(e) {}
        this._saveCacheToSupabase(cacheKey, data.guide);
      })
      .catch(e => { if (this._guideSession === session) this.aiGuide.error = e.message; })
      .finally(() => { if (this._guideSession === session) this.aiGuide.loading = false; });
    },
    _restoreAIGuide() {
      if (this.view !== 'ai-guide') return;
      const saved = localStorage.getItem('stos_ai_guide');
      if (!saved) { this._leaveAIGuide(); return; }
      try {
        const g = JSON.parse(saved);
        const subject = this.subjects.find(s => s.id === g.subjectId);
        if (!subject || g.chapterIndex < 0 || g.chapterIndex >= subject.chapList.length) throw new Error('invalid');
        const chapter = subject.chapList[g.chapterIndex];
        const cacheKey = `guide_${g.subjectId}_${g.chapterIndex}`;
        const quizKey  = `quiz_${g.subjectId}_${g.chapterIndex}`;
        const cached = localStorage.getItem(cacheKey);
        const alreadyDone = chapter.done === true;
        if (!cached && !g.quizOnly) { this._leaveAIGuide(); return; }
        this.aiGuide = {
          subject, chapter, chapterIndex: g.chapterIndex,
          loading: false, quizOnly: !!g.quizOnly, error: '',
          content: cached ? JSON.parse(cached) : null,
          quiz: {
            questions: [],
            answers: [null, null, null],
            loading: !alreadyDone,
            submitted: alreadyDone,
            score: alreadyDone ? 3 : 0,
            error: false,
          },
        };
        const embeddedKey = g.subjectId + '_' + g.chapterIndex;
        const embedded = EMBEDDED_GUIDES[embeddedKey];
        if (embedded) {
          this.aiGuide.keyConcept = embedded.kc;
          this.aiGuide.labExpress = embedded.le;
          this.aiGuide.projectEvolution = embedded.pe;
        }
        // Restore language from saved state
        this.aiGuide.language = g.language || subject.defaultLang || 'JavaScript';
        const cachedQ = localStorage.getItem(quizKey);
        if (cachedQ) {
          this.aiGuide.quiz.questions = JSON.parse(cachedQ);
          this.aiGuide.quiz.loading = false;
        }
      } catch(e) {
        this._leaveAIGuide();
      }
    },
    _leaveAIGuide() {
      this.view = 'dashboard';
      localStorage.setItem('stos_view', 'dashboard');
      localStorage.removeItem('stos_ai_guide');
    },

    // ── AI Suggestions ──
    aiLoading: false,
    aiError: '',

    async fetchSuggestions() {
      this.aiLoading = true;
      this.aiError = '';
      try {
        const payload = this.subjects.map(s => ({
          name: s.name,
          pct: this.chapPct(s),
        }));
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjects: payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error desconocido');
        data.suggestions.forEach(s => this.subjects.push(s));
        await this.saveProgress();
      } catch (e) {
        this.aiError = e.message;
      } finally {
        this.aiLoading = false;
      }
    },

    // ── Calendar ──
    calYear:new Date().getFullYear(), calMonth:new Date().getMonth(),
    get calLabel(){
      return new Date(this.calYear,this.calMonth,1).toLocaleDateString('es',{month:'long',year:'numeric'});
    },
    get calCells(){
      const today=new Date();
      const first=new Date(this.calYear,this.calMonth,1);
      const last=new Date(this.calYear,this.calMonth+1,0);
      let dow=first.getDay()===0?7:first.getDay();
      const cells=[];
      const evMap={};
      for(let i=dow-1;i>0;i--){
        const d=new Date(this.calYear,this.calMonth,1-i);
        cells.push({key:'p'+i,d:d.getDate(),inMonth:false,today:false,event:false,urgent:false,events:[]});
      }
      for(let d=1;d<=last.getDate();d++){
        const isToday=today.getFullYear()===this.calYear&&today.getMonth()===this.calMonth&&today.getDate()===d;
        const evs=evMap[d]||[];
        cells.push({key:'c'+d,d,inMonth:true,today:isToday,event:evs.length>0,urgent:evs.some(e=>e.urg),events:evs});
      }
      const rem=42-cells.length;
      for(let i=1;i<=rem;i++) cells.push({key:'n'+i,d:i,inMonth:false,today:false,event:false,urgent:false,events:[]});
      return cells;
    },
    prevMonth(){ if(this.calMonth===0){this.calMonth=11;this.calYear--;}else this.calMonth--; },
    nextMonth(){ if(this.calMonth===11){this.calMonth=0;this.calYear++;}else this.calMonth++; },

    // ── Misc ──
    get todayStr(){
      return new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'short'});
    },

    pomoSettings: {work:25,short:5,long:15},
    settings: {alarmOn:true,focusMode:false},

    // ── Settings persistence (localStorage) ──
    loadSettings() {
      try {
        const s = JSON.parse(localStorage.getItem('studyos_settings') || '{}');
        if (s.settings) Object.assign(this.settings, s.settings);
        if (s.pomoSettings) { Object.assign(this.pomoSettings, s.pomoSettings); this.applyPomoSettings(); }
        if (s.weekGoal != null) this.weekGoal = s.weekGoal;
        if (s.pomosGoal != null) this.pomosGoal = s.pomosGoal;
        if (s.currentWeek != null) this.currentWeek = s.currentWeek;
        const savedName = localStorage.getItem('studyos_profileName');
        if (savedName) this.profileName = savedName;
        else if (window._user?.user_metadata?.full_name) this.profileName = window._user.user_metadata.full_name;
      } catch(e) {}
    },
    _saveSettings() {
      try {
        localStorage.setItem('studyos_settings', JSON.stringify({
          settings: this.settings,
          pomoSettings: this.pomoSettings,
          weekGoal: this.weekGoal,
          pomosGoal: this.pomosGoal,
          currentWeek: this.currentWeek,
        }));
      } catch(e) {}
    },

    async init() {
      // Bust old quiz caches so improved prompt regenerates questions
      if (!localStorage.getItem('stos_quiz_cache_v2')) {
        Object.keys(localStorage).filter(k => k.startsWith('quiz_')).forEach(k => localStorage.removeItem(k));
        localStorage.setItem('stos_quiz_cache_v2', '1');
      }
      this.loadSettings();
      // Restore ai-guide state after subjects are finalised
      if (window._sb) {
        await this.loadProgress();
        this._restoreAIGuide();
      } else {
        this._restoreAIGuide();
        window.addEventListener('supabase-ready', async () => {
          await this.loadProgress();
          if (!this.profileName && window._user?.user_metadata?.full_name) {
            this.profileName = window._user.user_metadata.full_name;
          }
          this._restoreAIGuide();
        }, { once: true });
      }
      this.$watch('subjects', () => this._debounceSave(), { deep: true });
      this.$watch('tasks', () => this._debounceSave(), { deep: true });
      this.$watch('settings', () => this._saveSettings(), { deep: true });
      this.$watch('pomoSettings', () => this._saveSettings(), { deep: true });
      this.$watch('weekGoal', () => this._saveSettings());
      this.$watch('pomosGoal', () => this._saveSettings());
      this.$watch('currentWeek', () => this._saveSettings());
    },

    _saveTimer: null,
    _debounceSave() {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this.saveProgress(), 1500);
    },
  };
}

// ── Guide notes from localStorage ───────────────
document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('sdet_notes');
    const el = document.getElementById('note-area');
    if (saved && el) el.value = saved;
  } catch(e) {}

  // Load tracker state
  try {
    const st = JSON.parse(localStorage.getItem('sdet_tracker_v3') || '{}');
    window._trackerState = st;
  } catch(e) {}

  // Task lists definitions for the tracker
  const p1_items = [
    "Configurar JDK 21 y Maven", "Crear proyecto api-test-suite", "Configurar dependencias en pom.xml",
    "Establecer ApiConfig.java baseURI", "T01: GET /posts returns 200 & 100 posts", "T02: GET /posts/1 returns schema & id=1",
    "T03: GET /posts?userId=1 returns filtered results", "T04: POST /posts returns 201 & generated id", "T05: PUT /posts/1 returns updated data",
    "T06: PATCH /posts/1 returns patched title", "T07: DELETE /posts/1 returns empty body", "T08: GET /posts/99999 returns 404",
    "Configurar schemas/post.json", "Validar adicionalProperties: false en schema", "Crear UsersTest.java",
    "T01 (Users): GET /users returns 10", "T02 (Users): Check nested address and company fields", "T03 (Users): GET /users/1/posts returns 10 posts",
    "T04 (Users): Filter by query param username", "T05 (Users): Verify todo items completion status", "T06 (Users): Invalid user IDs return 404",
    "Crear CommentsTest.java", "T01 (Comments): GET /comments returns 500", "T02 (Comments): Filter by query param postId",
    "T03 (Comments): Verify nested route results", "Integrar Allure report en pom.xml", "Generar primer reporte Allure local",
    "Crear workflow GitHub Actions básico", "Habilitar caché Maven en GHA workflow"
  ]; // 29 items

  const p2_items = [
    "Instalar Docker Desktop local", "Crear Dockerfile para tests", "Definir docker-compose.yml",
    "Levantar servicios locales en Docker", "Instalar Grafana k6", "Escribir script smoke.js en k6",
    "Configurar thresholds de performance en k6", "Ejecutar k6 smoke localmente", "Validar fallos de performance en k6",
    "Crear stub en WireMock", "Validar respuestas mock con JUnit", "Escribir tests Pact básicos",
    "Generar contrato Pact local", "Subir contrato a Pact Broker", "Configurar GitHub Actions matrix builds",
    "Habilitar cache de Docker layers en GHA", "Configurar secrets de GitHub Actions", "Ejecutar tests unitarios en pipeline",
    "Ejecutar tests funcionales en pipeline", "Ejecutar k6 performance gate en GHA", "Subir reportes Allure como artefactos GHA",
    "Configurar alertas en Slack desde pipeline"
  ]; // 22 items

  const concepts_items = [
    "Métodos HTTP y su idempotencia", "Status Codes de éxito (2xx) y redirección (3xx)", "Status Codes de error cliente (4xx) y servidor (5xx)",
    "Diferencia entre 401 Unauthorized y 403 Forbidden", "Estructura y campos clave de un JWT (JSON Web Token)", "Diferencia entre autenticación y autorización",
    "Vulnerabilidad de seguridad IDOR (Direct Object Reference)", "Vulnerabilidad de seguridad SQL injection en APIs", "Vulnerabilidad de seguridad XSS en payloads",
    "Concepto de Rate Limiting y código 429", "Qué es la validación estricta de esquemas JSON", "Diferencia entre pruebas de carga, estrés y picos",
    "Qué es Consumer-Driven Contract Testing (Pact)", "Para qué sirve hacer stubs o mocks con WireMock", "Qué es un Quality Gate en un pipeline de CI/CD"
  ]; // 15 items

  const study_items = [
    "Semana 1: Fundamentos HTTP y REST", "Semana 1: Herramientas curl y Postman", "Semana 2: Patrones de API Testing",
    "Semana 2: Primeros assertions en RestAssured", "Semana 3: Auth y Seguridad en APIs", "Semana 3: IDOR, SQLi y XSS",
    "Semana 4: CI/CD Pipelines básico", "Semana 4: GitHub Actions setup", "Semana 5: Docker y Mocking",
    "Semana 5: WireMock y Docker Compose", "Semana 6: Contract Testing", "Semana 6: Pact JVM integration",
    "Semana 7: Performance Testing con k6", "Semana 7: Performance gates en CI/CD", "Semana 8: Salesforce SDET basics",
    "Semana 8: Simulación de entrevistas y portafolio"
  ]; // 16 items

  const p3sf_items = [
    "Crear Dev Org Salesforce gratuita", "Instalar Salesforce CLI local", "Autenticar org con SF CLI",
    "Escribir primera clase Apex de prueba", "Usar anotación @isTest", "Configurar datos en @TestSetup",
    "Implementar HttpCalloutMock", "Mockear llamadas de API externas en Apex", "Validar permisos y FLS en tests",
    "Escribir tests usando System.runAs()", "Probar governor limits en Apex", "Ejecutar tests desde SF CLI",
    "Generar reporte de cobertura de código Apex", "Escribir Jest tests para LWC", "Instalar Node dependencias de LWC",
    "Mockear servicios wire en LWC", "Configurar pipeline CI/CD en GHA para Salesforce", "Configurar variables de entorno y auth CLI en GHA",
    "Ejecutar regression testing en multi-org", "Entender conceptos básicos de Copado"
  ]; // 20 items

  const p4postman_items = [
    "Crear cuenta y workspace en Postman", "Definir variables globales y de entorno", "Escribir assertions con pm.test",
    "Implementar scripts de Pre-request", "Guardar valores de respuesta en variables", "Crear colecciones de happy path",
    "Diseñar carpeta de negative tests", "Validar esquemas JSON en Postman", "Encadenar requests (chaining)",
    "Configurar Collection Runner", "Ejecutar pruebas con Newman CLI", "Generar reportes HTML con htmlextra",
    "Automatizar Newman en GitHub Actions", "Programar Postman Monitors en la nube", "Configurar Mock Servers en Postman",
    "Generar documentación de API interactiva", "Validar flujos con Postman Flows", "Configurar pruebas de contract testing",
    "Implementar pruebas de performance básicas"
  ]; // 19 items

  const p5playwright_items = [
    "Inicializar proyecto Playwright con TypeScript", "Configurar playwright.config.ts", "Escribir pure API tests con request fixture",
    "Diseñar Page Object Models (POM)", "Implementar LoginPage.ts", "Implementar FormsPage.ts",
    "Escribir e2e tests para formularios (demoqa)", "Escribir e2e tests para tablas (webtables)", "Implementar hybrid API + UI tests",
    "Realizar limpieza en afterAll vía API", "Escribir visual regression tests con toHaveScreenshot", "Interceptar tráfico de red (route.fulfill)",
    "Configurar cross-browser testing (chromium/firefox/webkit)", "Ejecutar pruebas con repeat-each para flake detection", "Depurar tests usando Playwright Trace Viewer",
    "Integrar tests Playwright en pipeline CI/CD de GHA"
  ]; // 16 items

  // Build the groups in the DOM
  buildGroup(p1_items, 'p1', 'tr-p1', 'p1-counter', 'p1-bar', 'blue');
  buildGroup(p2_items, 'p2', 'tr-p2', 'p2-counter', 'p2-bar', 'purple');
  buildGroup(concepts_items, 'concepts', 'tr-concepts', 'concepts-counter', 'concepts-bar', 'teal');
  buildGroup(study_items, 'study', 'tr-study', 'study-counter', 'study-bar', 'blue');
  buildGroup(p3sf_items, 'p3sf', 'tr-p3sf', 'p3sf-counter', 'p3sf-bar', 'red');
  buildGroup(p4postman_items, 'p4postman', 'tr-p4postman', 'p4postman-counter', 'p4postman-bar', 'teal');
  buildGroup(p5playwright_items, 'p5playwright', 'tr-p5playwright', 'p5playwright-counter', 'p5playwright-bar', 'amber');

  // Restore panel preference (default dash)
  const panelPref = localStorage.getItem('stos_panel') || 'dash';
  switchPanel(panelPref);
  updateTrackerAll();
});

// Guide tracker functions (reused from guide)
function buildGroup(items, key, bodyId, counterId, barId, accent) {
  const c = document.getElementById(bodyId);
  if (!c) return;
  const st = window._trackerState || {};
  items.forEach((item, i) => {
    const k = key+'_'+i;
    const done = !!st[k];
    const row = document.createElement('div');
    row.className = 'task-item' + (done ? ' done' : '');
    row.innerHTML = `<div class="task-cb ${done?'on':''}"><span ${done?'':'style="display:none"'}>✓</span></div><span class="task-lbl ${done?'done':''}">${item}</span>`;
    row.addEventListener('click', () => {
      st[k] = !st[k];
      window._trackerState = st;
      try { localStorage.setItem('sdet_tracker_v3', JSON.stringify(st)); } catch(e) {}
      row.classList.toggle('done', st[k]);
      const cb = row.querySelector('.task-cb');
      if(cb) cb.classList.toggle('on', st[k]);
      const lbl = row.querySelector('.task-lbl');
      if(lbl) lbl.classList.toggle('done', st[k]);
      updateTrackerAll();
    });
    c.appendChild(row);
  });
  updateGroupCounter(key, items.length, counterId, barId, accent);
}

function updateGroupCounter(key, total, cId, bId, accent) {
  const st = window._trackerState || {};
  const done = Object.keys(st).filter(k=>k.startsWith(key+'_')&&st[k]).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const ce = document.getElementById(cId); if(ce) ce.textContent = done+' / '+total;
  const be = document.getElementById(bId); if(be) be.style.width = pct+'%';
}

function updateTrackerAll() {
  const TD_COUNTS = {
    p1:29, p2:22, concepts:15, study:16, p3sf:20, p4postman:19, p5playwright:16
  };
  const st = window._trackerState || {};
  const total = Object.values(TD_COUNTS).reduce((a,b)=>a+b,0);
  const done  = Object.keys(st).filter(k=>st[k]).length;
  const pct   = total ? Math.round(done/total*100) : 0;
  
  const pb = document.getElementById('progress-bar'); if(pb) pb.style.width=pct+'%';
  const pd = document.getElementById('pct-display');  if(pd) pd.textContent=pct+'%';
  const sb = document.getElementById('sb-badge');     if(sb) sb.textContent=pct+'%';

  // Update top tracker stats
  const tDone = document.getElementById('t-done'); if(tDone) tDone.textContent = done;
  const tTotal = document.getElementById('t-total'); if(tTotal) tTotal.textContent = total;
  const tPctLabel = document.getElementById('t-pct-label'); if(tPctLabel) tPctLabel.textContent = done + ' / ' + total + ' tasks';
  const tBar = document.getElementById('t-bar'); if(tBar) tBar.style.width = pct+'%';

  // Update individual project stats
  const getProjPct = (key, tot) => {
    const d = Object.keys(st).filter(k=>k.startsWith(key+'_')&&st[k]).length;
    return tot ? Math.round(d/tot*100) : 0;
  };
  const tp1 = document.getElementById('t-p1'); if(tp1) tp1.textContent = getProjPct('p1', TD_COUNTS.p1)+'%';
  const tp2 = document.getElementById('t-p2'); if(tp2) tp2.textContent = getProjPct('p2', TD_COUNTS.p2)+'%';
  const tp3 = document.getElementById('t-p3'); if(tp3) tp3.textContent = getProjPct('p3sf', TD_COUNTS.p3sf)+'%';
  const tp4 = document.getElementById('t-p4'); if(tp4) tp4.textContent = getProjPct('p4postman', TD_COUNTS.p4postman)+'%';
  const tp5 = document.getElementById('t-p5'); if(tp5) tp5.textContent = getProjPct('p5playwright', TD_COUNTS.p5playwright)+'%';
}
