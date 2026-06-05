// ═══════════════════════════════════════════════
//  UNIFIED APP — STUDYOS + SDET GUIDE
// ═══════════════════════════════════════════════

window.CHAP_MAP = {"HTTP & REST Fundamentals": "api-basics", "Status Codes & Headers": "api-basics", "RestAssured setup + pom.xml": "project1", "PostsTest.java — happy path": "project1", "JSON Schema validation": "api-testing", "Negative tests & boundaries": "api-testing", "Auth testing — JWT & OAuth": "auth", "Security checklist — IDOR, XSS": "auth", "Data-driven tests @ParameterizedTest": "project1", "Allure reporting": "project1", "UsersTest.java Complete": "project1", "CommentsTest.java Complete": "project1", "Pact contract tests": "project2", "WireMock stubs": "project2", "CI/CD — GitHub Actions gate": "cicd", "k6 performance gates": "cicd", "Pipelines & Stages": "cicd", "GitHub Actions basics": "cicd", "Quality gates": "cicd", "Docker fundamentals": "project2", "Docker Compose for Tests": "project2", "Matrix builds": "project2", "Environments & Secrets": "cicd", "Allure + Artifacts": "project2", "Setup & Configuration": "playwright", "API Tests with Request Fixture": "playwright", "Basic E2E Tests": "playwright", "Page Object Model": "playwright", "Hybrid API + UI tests": "playwright", "Visual regression testing": "project-playwright", "Network interception": "project-playwright", "Cross-browser testing": "project-playwright", "Debugging & Traces": "playwright", "GitHub Actions integration": "cicd", "demoqa.com Full Project": "project-playwright", "Dev Org setup + SF CLI": "sf-overview", "Apex basics": "apex-testing", "@isTest & @TestSetup": "apex-testing", "HttpCalloutMock": "apex-testing", "System.runAs() & FLS": "apex-testing", "Governor limits testing": "apex-testing", "Debug logs reading": "apex-testing", "LWC Jest tests": "apex-testing", "Batch Apex testing": "apex-testing", "Platform Events testing": "sf-project", "Flow Testing in Apex": "sf-project", "SF CLI CI/CD pipeline": "sf-project", "Multi-org regression": "sf-project", "Copado basics": "sf-project", "Collections & Workspaces": "project-postman", "Environment Variables": "project-postman", "pm.test assertions": "project-postman", "Pre-request scripts": "project-postman", "Schema validation": "api-testing", "Chaining with Env Variables": "project-postman", "Collection Runner": "project-postman", "Data-Driven with CSV": "project-postman", "Newman CLI": "project-postman", "HTML reports": "project-postman", "GitHub Actions + Newman": "project-postman", "Monitors": "project-postman", "Mock servers": "project-postman", "API documentation": "frameworks", "Flows (new)": "project-postman", "Contract testing": "project2", "Performance testing": "cicd", "Negative test folder": "project-postman", "Advanced scripting": "project-postman", "Final Exam": "cheatsheet", "API design patterns": "api-testing", "GraphQL testing": "frameworks", "gRPC testing": "frameworks"};
const CHAP_MAP = window.CHAP_MAP;
window.CHAP_MAP['Data-Driven Testing with External JSON'] = 'playwright';
window.CHAP_MAP['Multi-Tenant Config Engine'] = 'playwright';
window.CHAP_MAP['Harness Pipelines Fundamentals'] = 'cicd';
window.CHAP_MAP['Quality Gates in Harness'] = 'cicd';
window.CHAP_MAP['Harness CD Pipeline'] = 'cicd';
window.CHAP_MAP['K6 Setup & VU Concepts'] = 'cicd';
window.CHAP_MAP['Smoke Testing'] = 'cicd';
window.CHAP_MAP['Load Testing'] = 'cicd';
window.CHAP_MAP['Stress Testing'] = 'cicd';
window.CHAP_MAP['Soak Testing'] = 'cicd';
window.CHAP_MAP['Thresholds & Metrics'] = 'cicd';
window.CHAP_MAP['K6 in CI/CD'] = 'cicd';
window.CHAP_MAP['Final Project: Black Friday'] = 'cicd';
window.CHAP_MAP['SQL Fundamentals & SELECT'] = 'api-basics';
window.CHAP_MAP['JOINs & Relationships'] = 'api-basics';
window.CHAP_MAP['GROUP BY & HAVING'] = 'api-basics';
window.CHAP_MAP['Subqueries & CTEs'] = 'api-basics';
window.CHAP_MAP['Data Integrity Validation'] = 'api-basics';
window.CHAP_MAP['Duplicate & Orphan Detection'] = 'api-basics';
window.CHAP_MAP['Post-Automation Audit'] = 'api-basics';
window.CHAP_MAP['Final Project: DB Audit'] = 'api-basics';

// ═══════════════════════════════════════════════════════════════
//  EMBEDDED STUDY GUIDES — Lab Express + Project Evolution
//  Estructura: { subjectId_index: { kc, le: {title,body}, pe: {title,body} } }
// ═══════════════════════════════════════════════════════════════
const EMBEDDED_GUIDES = {
  // ── API TESTING ──────────────────────────────────────────
  'api_0':{
    kc:'Request structure, Responses, Headers, query params and HTTP verbs (GET, POST, PUT, DELETE)',
    le:{title:'Public Currency Endpoint Consumption',
      body:'Use curl and Postman against exchangerate-api.com.\n1. curl -I https://api.exchangerate-api.com/v4/latest/USD → validate 200 + Content-Type\n2. curl ... | jq \'.rates | length\' → must be > 10\n3. In Postman: GET, view body, headers, pretty print\n4. Invalid URL: /v4/latest/INVALID → expect 404'},
    pe:{title:'Accounts and Balances Endpoints',
      body:'Base Postman collection + RestAssured for the banking project.\n1. POST /accounts → 201, accountId, accountType:"SAVINGS", balance:0\n2. GET /accounts/{id} → 200, matches creation\n3. GET /balances?accountId={id} → 200, availableBalance, currentBalance\n4. GET /accounts/99999 → 404\n5. Postman variables: base_url, account_id, token'}
  },
  'api_1':{
    kc:'Strict data type assertions, required fields and strict JSON Schema validation',
    le:{title:'Isolated Type Validator',
      body:'JSON Schema for user profile vs GET /users/1 from JSONPlaceholder.\n1. Schema with id(int), name(string), email(pattern), address(object)\n2. additionalProperties: false\n3. Validate with GET /users/1 → must pass\n4. Change email to type:number → validation fails'},
    pe:{title:'Transaction History Contract Validation',
      body:'Suite that verifies GET /transactions complies with schema.\n1. Schema: transactionId(pattern), amount(number), currency(enum), type(enum), timestamp(format:date-time)\n2. Validate GET /transactions against schema\n3. Validate GET /transactions?status=PENDING\n4. Schema for array: type:array, items with $ref'}
  },
  'api_2':{
    kc:'Maven project setup with RestAssured, request/response specs, logging, base URI',
    le:{title:'Maven + RestAssured Minimal',
      body:'Maven project from scratch with RestAssured, JUnit 5, simple test.\n1. mvn archetype:generate -DgroupId=com.banking -DartifactId=banking-api-test\n2. pom.xml: rest-assured 5.5.0, junit-jupiter 5.11.0, json-schema-validator\n3. Test: GET /posts/1 → status 200\n4. Add request/response logging filters'},
    pe:{title:'Banking Project Configuration',
      body:'ApiConfig.java with reusable specs.\n1. RequestSpecBuilder with baseURI, ContentType JSON, logging\n2. ResponseSpecBuilder with max timeout\n3. Extract config to BASE_URL environment variable'}
  },
  'api_3':{
    kc:'Happy path tests for CRUD endpoints using RestAssured given/when/then',
    le:{title:'CRUD Happy Path against JSONPlaceholder',
      body:'Tests GET, POST, PUT, PATCH, DELETE against /posts.\n1. GET /posts → 200 + 100 items\n2. GET /posts/1 → 200 + id=1\n3. POST /posts → 201 + generated id\n4. PUT /posts/1 → 200 + updated data\n5. DELETE /posts/1 → 200'},
    pe:{title:'Bank Account CRUD',
      body:'Happy path tests for bank accounts.\n1. POST /accounts → 201\n2. GET /accounts/{id} → 200\n3. PUT /accounts/{id} change type\n4. PATCH /accounts/{id} update nickname\n5. DELETE /accounts/{id} → 200'}
  },
  'api_4':{
    kc:'Programmatic JSON Schema validation in RestAssured with matchesJsonSchemaInClasspath',
    le:{title:'Schema Validator',
      body:'1. Create post.json schema with additionalProperties: false\n2. matchesJsonSchemaInClasspath("schemas/post.json")\n3. Break schema intentionally → test fails'},
    pe:{title:'Banking Core Schemas',
      body:'Validate each endpoint against its schema: Account, Transaction, User, Balance. All with additionalProperties: false'}
  },
  'api_5':{
    kc:'Boundary tests, edge values, invalid data and expecting 4xx codes',
    le:{title:'Negative Playground',
      body:'Tests with negative IDs, empty strings, malformed body against JSONPlaceholder.\n1. Negative IDs → 404\n2. Empty body {} → 400/422\n3. Extra fields → depends on API'},
    pe:{title:'Negative Banking',
      body:'Tests: insufficient balance, negative amount, transfer to non-existent account, wrong types.'}
  },
  'api_6':{
    kc:'JWT authentication flow, token retrieval, use in Authorization headers, refresh tokens',
    le:{title:'Token Flow in Postman',
      body:'Use reqres.in to register user, extract token, pass to next request.\n1. POST /api/register → extract token with pm.environment.set()\n2. Protected GET with Authorization: Bearer {{token}}'},
    pe:{title:'Banking Authentication',
      body:'Tests: login gets JWT, endpoint without token → 401, expired token → 401, valid token → 200, refresh token'}
  },
  'api_7':{
    kc:'Detection of Insecure Direct Object References and Cross-Site Scripting in payloads',
    le:{title:'Simulated IDOR',
      body:'User A creates resource, User B tries to access. JSONPlaceholder does not protect, but the test documents the concept.'},
    pe:{title:'Banking Security Hardening',
      body:'Tests: user cannot see another account (IDOR), endpoint rejects <script> (XSS), SQLi in params, rate limiting 429'}
  },
  'api_8':{
    kc:'Parameterized tests with @CsvSource, @ValueSource, @MethodSource in JUnit 5',
    le:{title:'Parametrized Playground',
      body:'Test with 10 different post IDs validating status 200 on all.\n@ValueSource(ints = {1,2,3,4,5,6,7,8,9,10})'},
    pe:{title:'Data-Driven Banking',
      body:'Parameterized test with 20 accounts, all balance >= 0. CSV with transfer cases (origin, destination, amount, expectedStatus)'}
  },
  'api_9':{
    kc:'Allure configuration, @DisplayName, @Feature, @Story annotations, visual reports',
    le:{title:'Allure Quickstart',
      body:'Add Allure to Maven project, generate local report.\nmvn allure:serve'},
    pe:{title:'Complete Banking Report',
      body:'Annotate all tests with @Feature("Accounts"), @Story("Create Account"). Unified report in CI/CD as artifact.'}
  },
  'api_10':{
    kc:'Tests for endpoints with resource relationships and nested fields',
    le:{title:'UsersTest against JSONPlaceholder',
      body:'GET /users, validate nested address/company, filter by username, GET /users/1/posts'},
    pe:{title:'Bank Customers',
      body:'Tests GET/POST /customers, validate nested documents (address, contactInfo), search by email, pagination'}
  },
  'api_11':{
    kc:'List validation, query param filters, field formats',
    le:{title:'CommentsTest against JSONPlaceholder',
      body:'GET /comments (500), GET /comments?postId=1, validate email pattern'},
    pe:{title:'Transaction Audit',
      body:'GET /transactions with filters by date, type, amount; pagination; ordering'}
  },
  'api_12':{
    kc:'Consumer-Driven Contracts with Pact to validate agreements between services',
    le:{title:'Pact Hello World',
      body:'Consumer test for simulated payment service, generate Pact contract.\n@Pact(consumer="TaskFlowAPI", provider="PaymentsService")'},
    pe:{title:'Banking Contract with Credit Score Service',
      body:'Define interactions, generate contract, publish to Pact Broker, verify on provider side'}
  },
  'api_13':{
    kc:'Virtualization of external services with WireMock for isolated tests',
    le:{title:'WireMock Standalone',
      body:'Start WireMock in Docker, create JSON stub, test with curl.\ndocker run -p 8081:8080 wiremock/wiremock'},
    pe:{title:'Credit Bureau Stubbing',
      body:'Simulate credit bureau responses: high score (approved), low score (rejected), timeout'}
  },
  'api_14':{
    kc:'Automated test pipeline with quality gates in GitHub Actions',
    le:{title:'Minimal GHA',
      body:'Workflow that runs mvn clean test on every push.\n.github/workflows/test.yml'},
    pe:{title:'Banking Pipeline with Gates',
      body:'Stages: unit → integration → contract → security → performance. Gates: coverage ≥ 80%, 0 security, p95 < 500ms'}
  },
  'api_15':{
    kc:'Load, stress, threshold and performance gates in CI/CD with k6',
    le:{title:'k6 Smoke Test',
      body:'1 VU script against JSONPlaceholder with p95 < 200ms threshold. k6 run smoke.js'},
    pe:{title:'Performance Banking',
      body:'Smoke test critical endpoints, stress test 100 concurrent VUs. Thresholds: p95 < 500ms, error rate < 1%'}
  },
  'api_16':{
    kc:'REST API design patterns: HATEOAS, pagination, versioning, idempotency',
    le:{title:'Idempotency Test',
      body:'Same POST twice → different IDs (not idempotent). Same PUT twice → same result.'},
    pe:{title:'Banking Idempotency',
      body:'Tests: POST /transactions with idempotency-key, HATEOAS pagination, versioning /v1/ vs /v2/'}
  },
  'api_17':{
    kc:'GraphQL API testing: queries, mutations, schema validation',
    le:{title:'GraphQL Playground',
      body:'Query https://countries.trevorblades.com requesting name, code and continent of countries.\n{ countries { name code continent { name } } }'},
    pe:{title:'Banking GraphQL',
      body:'Tests for account query, transfer mutation, GraphQL error validation, reusable fragments'}
  },
  'api_18':{
    kc:'gRPC fundamentals, protocol buffers, tests with gRPC client',
    le:{title:'gRPC Hello World',
      body:'Use grpcurl against public gRPC API to list services and make an RPC.'},
    pe:{title:'gRPC for Internal Transactions',
      body:'Test internal gRPC transaction validation endpoint with different payloads.'}
  },
  'api_19':{
    kc:'Complete banking suite with all testing patterns',
    le:{title:'Mini-Banking Test in 30 min',
      body:'Create schema, happy path, negative test, auth test, data-driven test.'},
    pe:{title:'Banking Project Closeout',
      body:'Full suite passing in CI/CD, Allure report, coverage ≥ 80%, final README with badges.'}
  },

  // ── CI/CD ──────────────────────────────────────────────
  'cicd_0':{
    kc:'Workflow configuration file syntax, triggers (push, pull_request) and virtual runners',
    le:{title:'Hello World Pipeline',
      body:'Workflow with 3 stages (build, test, deploy) each with an echo.\n.github/workflows/pipeline.yml'},
    pe:{title:'Logistics Pipeline Stages',
      body:'build → test → contract → security → performance → deploy → notify'}
  },
  'cicd_1':{
    kc:'GitHub Actions: jobs, steps, actions, triggers, runners',
    le:{title:'Hello World Workflow',
      body:'.github/workflows/hello.yml with trigger push, checkout, echo.\nname: My first pipeline\non: [push]\njobs:\n  hello:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo "Pipeline running on $(date)"'},
    pe:{title:'Integration Base Pipeline',
      body:'Workflow on push to main, sets up Node.js, installs deps, runs tests.\nIncludes node_modules cache and report upload.'}
  },
  'cicd_2':{
    kc:'Quality gates as quality barriers in pipelines that block merge if not met',
    le:{title:'Simulated Gate',
      body:'Job that evaluates a condition and fails if not met.\nrun: test 1 -eq 1 → passes, test 1 -eq 2 → fails'},
    pe:{title:'Logistics Pipeline Gates',
      body:'Coverage ≥ 80%, Tests passing 100%, Performance p95 < 500ms, Security scan pass. Each gate is a separate job.'}
  },
  'cicd_3':{
    kc:'Docker: images, containers, Dockerfile, multi-stage builds',
    le:{title:'Docker Hello World',
      body:'Simple Dockerfile with Nginx, build, run.\ndocker build -t my-nginx .\ndocker run -p 8080:80 my-nginx'},
    pe:{title:'Dockerfile for Logistics API',
      body:'Multi-stage: build with Maven, run with JRE slim, healthcheck configured.'}
  },
  'cicd_4':{
    kc:'Docker Compose for orchestrating multiple services in integration tests',
    le:{title:'Minimal Docker Compose',
      body:'API service + Postgres, start with docker compose up.\ndocker compose up -d'},
    pe:{title:'Logistics Compose',
      body:'api + mysql + wiremock + redis interconnected for integration tests.'}
  },
  'cicd_5':{
    kc:'Matrix builds to run tests across multiple versions/platforms in parallel',
    le:{title:'Hello World Matrix',
      body:'Matrix of OS [ubuntu, windows] + node [18, 20].\nstrategy:\n  matrix:\n    os: [ubuntu-latest, windows-latest]\n    node: [18, 20]'},
    pe:{title:'Logistics Matrix',
      body:'JDK [17, 21] + browser [chromium, firefox] for E2E + API suite.'}
  },
  'cicd_6':{
    kc:'GitHub Environments, secrets management, protected environment variables',
    le:{title:'Secrets Demo',
      body:'Workflow that uses secret MY_SECRET and displays it (with masking).\n${{ secrets.MY_SECRET }}'},
    pe:{title:'Logistics Pipeline Secrets',
      body:'API_KEY, DB_URL, SLACK_WEBHOOK, PACT_BROKER_TOKEN configured in GitHub Environments with protection.'}
  },
  'cicd_7':{
    kc:'Build artifacts: upload, download, persistence between jobs',
    le:{title:'Allure Artifact',
      body:'Workflow that runs Maven tests, uploads allure-results as artifact.\nuses: actions/upload-artifact@v4'},
    pe:{title:'Complete Artifacts',
      body:'allure-results, playwright-report, newman-report, k6-json. All uploaded with 30-day retention.'}
  },
  'cicd_8':{
    kc:'Load/stress/soak testing with k6 and thresholds in CI/CD',
    le:{title:'k6 in GHA',
      body:'Workflow that installs k6, runs smoke.js, verifies thresholds.\nk6 run smoke.js'},
    pe:{title:'Performance Stage',
      body:'Smoke + stress + soak scripts. All executed in CI. Gate blocks if p95 > 500ms.'}
  },
  'cicd_9':{
    kc:'Contract testing with Pact in CI/CD pipeline, provider-side verification',
    le:{title:'Pact in CI',
      body:'Workflow that runs Pact tests and verifies contracts.\nmvn test -Dtest=*Pact*'},
    pe:{title:'Contract Stage',
      body:'Consumer tests publish contracts, provider tests verify them, Pact Broker as source of truth.'}
  },
  'cicd_10':{
    kc:'Slack integration: automatic pipeline notifications',
    le:{title:'Slack Hello',
      body:'Workflow with Slack notification sending "Pipeline started".\nuses: slackapi/slack-github-action@v2'},
    pe:{title:'Logistics Pipeline Notifications',
      body:'Slack per stage (success/failure), @channel mention on critical failures.'}
  },
  'cicd_11':{
    kc:'Ephemeral environments created by PR, destroyed on merge',
    le:{title:'Review App',
      body:'Workflow that creates temporary environment on each PR with welcome message.'},
    pe:{title:'Logistics Ephemeral',
      body:'Per PR: deploy API+DB+mock to temporary environment, run tests, destroy on merge.'}
  },
  'cicd_12':{
    kc:'Multi-org deployment with manual approvals and automatic rollback',
    le:{title:'Multi-Env Deploy',
      body:'Workflow with environment: [dev, staging, prod] and approval gates.\nenvironment:\n  name: production\n  url: https://api.example.com'},
    pe:{title:'Multi-Region Logistics Deploy',
      body:'Deploy to US/EU/ASIA with manual approvals in prod, automatic rollback on failure.'}
  },
  'cicd_13':{
    kc:'Complete CI/CD pipeline with stages, gates, artifacts, notifications and deploy',
    le:{title:'Complete Pipeline in 30 min',
      body:'4 stages with gates, artifacts, Slack notifications.'},
    pe:{title:'Logistics Pipeline Closeout',
      body:'Full pipeline passing, documentation with badges, deploy SLA < 10 min.'}
  },

  // ── CI/CD (Harness) ─────────────────────────────────────
  'cicd_14':{
    kc:'Harness Pipelines configuration, Harness Delegates, and automated quality barriers based on output metrics',
    le:{title:'Basic Pipeline in Harness Cloud',
      body:'Configure a basic pipeline in Harness Cloud that connects to an external repo and runs syntax validation (Linting).\n1. Create Harness account, connect example repo\n2. Pipeline with stage: git clone → run linter\n3. Add output variable with lint result\n4. Run pipeline and verify logs'},
    pe:{title:'CD Pipeline with Quality Gates in Harness',
      body:'Design a continuous delivery (CD) pipeline in Harness that runs your Playwright suite on each change and stops deployment if checks fail.\n1. Trigger on push to main\n2. Stage build → test (Playwright suite)\n3. Quality Gate: % of tests passed ≥ 95%\n4. If gate fails → cancel, notify Slack\n5. If gate passes → deploy to staging environment'}
  },
  'cicd_15':{
    kc:'Integration of performance tests as Quality Gates within Harness pipelines',
    le:{title:'Harness + K6 Gate',
      body:'Pipeline that runs K6 smoke test and blocks if p95 exceeds SLA.\n1. Stage with K6 run step\n2. Extract metrics from JSON output\n3. Manual approval step if performance is marginal'},
    pe:{title:'Complete Pipeline with Multiple Gates',
      body:'CD pipeline with 3 gates: lint → test (Playwright) → performance (K6).\nEach gate is an independent step with evaluable barrier.\nAutomatic rollback if any later gate fails.'}
  },
  'cicd_16':{
    kc:'Progressive deploy strategies in Harness: canary, blue/green, feature flags',
    le:{title:'Canary Deploy',
      body:'Harness pipeline with canary deploy: 10% → 50% → 100%.\nEach phase with health check and automatic rollback.'},
    pe:{title:'Corporate Deploy Strategy',
      body:'Combine canary + feature flags + quality gates.\nComplete pipeline with manual approval for production.'}
  },

  // ── PLAYWRIGHT ──────────────────────────────────────────
  'playwright_0':{
    kc:'Playwright project initialization, browser configuration (chromium/firefox/webkit), playwright.config.ts and first run',
    le:{title:'Hello World Browser',
      body:'1. npm init playwright@latest in temp folder\n2. playwright.config.ts with browserName:"chromium", headless:true\n3. tests/hello-world.spec.ts: navigate to example.com, validate title\n4. npx playwright test → pass'},
    pe:{title:'E-Commerce Project Initialization',
      body:'1. Create ecommerce-platform/e2e-tests/\n2. npm init playwright@latest\n3. Configure 3 browsers in projects\n4. baseURL: http://localhost:3000\n5. global-setup.ts with server verification'}
  },
  'playwright_1':{
    kc:'Using Playwright request fixture to test REST APIs without browser, APIRequestContext',
    le:{title:'Product Catalog from Public API',
      body:'request fixture against https://fakestoreapi.com/products.\n1. GET /products → status 200\n2. 20 products\n3. Each with id, title, price(number), category'},
    pe:{title:'Internal Catalog API Tests',
      body:'Suite against store REST endpoints.\n1. GET /api/products → 200, array\n2. GET /api/products/1 → 200, body.id === 1\n3. GET /api/products/999 → 404\n4. GET /api/categories → 200\n5. ApiHelper class with reusable methods'}
  },
  'playwright_2':{
    kc:'Accessibility-based locators (getByRole, getByText), async actions (click, fill) and auto-retry assertions (toBeVisible, toHaveText)',
    le:{title:'Isolated Registration Form',
      body:'Navigate to https://demoqa.com/register.\n1. Click submit with no data → visible errors\n2. Fill only username → error on empty fields\n3. Fill everything → submit → success/captcha'},
    pe:{title:'Checkout and Cart Flow',
      body:'Complete E2E purchase script.\n1. Navigate to /products\n2. Search product\n3. Add to cart\n4. Validate subtotal, tax, total\n5. Confirm order\n6. Validate "Order confirmed" message'}
  },
  'playwright_3':{
    kc:'Interface abstraction, selector encapsulation in POM classes, clean interaction methods',
    le:{title:'Modular Login POM',
      body:'LoginPage class with goto(), login(email, password), isLoggedIn(), getErrorMessage().\nTest consuming the class for invalid login.'},
    pe:{title:'Store Page Architecture',
      body:'CatalogPage, CartPage, CheckoutPage, OrderConfirmationPage.\nRefactor checkout.spec.ts to use POMs.\nMethods: search(), addToCart(), getItems(), fillShipping(), confirmOrder()'}
  },
  'playwright_4':{
    kc:'Session state injection, authentication bypass via Storage State, backend precondition preparation',
    le:{title:'Login Bypass via auth.json',
      body:'1. npx playwright codegen --save-storage=auth.json\n2. Test with storageState: \'auth.json\'\n3. Browser starts authenticated without login'},
    pe:{title:'Full Inventory Injection for Purchase',
      body:'1. beforeAll: POST /api/cart with 5 products\n2. Save storageState\n3. Navigate directly to /checkout/review\n4. Validate 5 products and correct total'}
  },
  'playwright_5':{
    kc:'Screenshots with toHaveScreenshot(), maxDiffPixels and threshold handling, baseline updates',
    le:{title:'Isolated Component Screenshot',
      body:'Navigate to https://demoqa.com/buttons.\nexpect(page.locator(".main-header")).toHaveScreenshot("header.png")\nModify zoom → test fails'},
    pe:{title:'E-Commerce Visual Catalog',
      body:'Visual regression for homepage, listing, detail, empty/full cart, confirmation.\n--update-snapshots to update baselines.'}
  },
  'playwright_6':{
    kc:'page.route(), in-flight request/response modification, network failure simulation, external API stubbing',
    le:{title:'Public API Interceptor',
      body:'Intercept fakestoreapi.com/products, return empty [].\npage.route(\'**/products\', route => route.fulfill({body: \'[]\'}))\nValidate "No products" message'},
    pe:{title:'Payment Gateway Simulation',
      body:'POST /api/payments/process intercepted.\nSuccess case → 200 "approved"\nRejection case → 402 "Insufficient funds"\nTimeout case → route.abort(\'timedout\')'}
  },
  'playwright_7':{
    kc:'Running the same suite in chromium, firefox and webkit; rendering difference detection; projects in config',
    le:{title:'Difference Detector',
      body:'Screenshot of example.com in chromium and firefox.\nCompare outputs and document differences.'},
    pe:{title:'Complete Cross-Browser Suite',
      body:'3 projects in config: chromium, firefox, webkit.\nRetries: 2 only for webkit.\nRun login, checkout, catalog on all 3.'}
  },
  'playwright_8':{
    kc:'Trace Viewer, inspector mode (--debug), page.pause(), action logging, codegen generation',
    le:{title:'Failed Test Trace',
      body:'Test that intentionally fails with trace: \'on\'.\nnpx playwright show-trace test-results/.../trace.zip\nExplore timeline, network, console, DOM snapshot'},
    pe:{title:'Payment Flow Debugging',
      body:'trace: \'on-first-retry\' in prod.\npage.pause() during development.\nnpx playwright codegen http://localhost:3000/checkout'}
  },
  'playwright_9':{
    kc:'Playwright CI/CD integration, playwright.yml, browser cache, HTML reports as artifacts',
    le:{title:'Minimal Playwright Pipeline',
      body:'.github/workflows/playwright.yml with official action.\nnpx playwright install --with-deps\nnpx playwright test\nUpload playwright-report/'},
    pe:{title:'Complete E-Commerce Pipeline',
      body:'Browser matrix: [chromium, firefox, webkit].\nCache ~/.cache/ms-playwright.\nHTML report + Slack notification.'}
  },
  'playwright_10':{
    kc:'Integrated application of all Playwright concepts against a single target site (demoqa.com)',
    le:{title:'Elements and Forms Automation',
      body:'Tests for Text Box, Check Box, Radio Button, Web Tables on demoqa.com.\nPOM per section. Validate output messages.'},
    pe:{title:'Not directly applicable to E-Commerce project',
      body:'This chapter is complementary. Use it as a final integrative practice.'}
  },
  'playwright_11':{
    kc:'Total integration: all 4 test types (API, E2E, visual, hybrid), CI/CD, reports',
    le:{title:'Complete Mini-Suite in 30 min',
      body:'Suite covering API test + E2E + visual + network against a site of choice.'},
    pe:{title:'E-Commerce Project Closeout',
      body:'Full e-commerce suite, Allure + HTML report, GHA pipeline on 3 browsers, final README.'}
  },

  // ── PLAYWRIGHT (New) ────────────────────────────────────
  'playwright_12':{
    kc:'Support for Continuous Delivery through data-driven repeatable tests, advanced fixture control and isolated parallelism',
    le:{title:'Data-Driven Script with External JSON',
      body:'Create an isolated data-driven.spec.ts that consumes dynamic external JSON to iterate user flows without duplicating code.\n1. Create data/test-users.json with 5+ profiles (admin, user, guest, etc.)\n2. test.each(data)(`Flow as $username`, async () => {...})\n3. Each profile navigates login → specific action → logout\n4. Add invalid data case (malformed email, short password)\n5. Run with --workers=4 and verify isolation'},
    pe:{title:'Multi-Tenant Configuration Engine',
      body:'Implement a multi-tenant configuration engine in your current framework to support parameterized executions by environment variables.\n1. Create config/loader.ts that reads process.env.TENANT + JSON per tenant\n2. Profiles: dev, staging, prod with different URLs and credentials\n3. Global fixture that loads config before each suite (workerScope)\n4. Tests using tenant-specific selectors and data\n5. Reports with tenant and environment metadata'}
  },
  'playwright_13':{
    kc:'Corporate framework design with data isolation, parameterized fixture strategies and multi-tenant execution',
    le:{title:'Multi-Tenant Fixtures',
      body:'Extend Playwright base fixture to support per-tenant data.\n1. test.use({ storageState: \`./auth/\${tenant}.json\` })\n2. tenantPage fixture that configures cookies, language, currency\n3. Complete suite against 2 tenants in parallel\n4. Validate Tenant A data does not contaminate Tenant B'},
    pe:{title:'Corporate Data-Driven Suite',
      body:'Refactor all existing POMs to accept data-driven configs.\n1. Page objects with constructor receiving TenantConfig\n2. Test runners parameterized by tenant + feature\n3. JSON of expectations per scenario (expected results)\n4. CI integration to run all tenants in matrix'}
  },

  // ── SALESFORCE ──────────────────────────────────────────
  'sf_0':{
    kc:'Scratch org creation, Salesforce CLI, metadata deployment, Dev Hub configuration',
    le:{title:'Create Scratch Org',
      body:'sf org create scratch --definition-file config/dev-scratch.json --alias TestOrg\nsf project deploy start\nsf apex run test'},
    pe:{title:'ERP Setup',
      body:'Create Dev Hub, scratch org with custom objects: Customer__c, Contract__c, Commission__c. Deploy data model.'}
  },
  'sf_1':{
    kc:'Native data structures (List, Set, Map), classes, access modifiers and typed collections in Apex',
    le:{title:'Discount Calculator',
      body:'Apex class with static methods that process price collections, apply discounts by range, return totals.'},
    pe:{title:'Corporate Customer Model',
      body:'CustomerService with methods: calculateCategory(revenue), validateRFC(rfc), assignCreditLimit(customerId). Domain classes.'}
  },
  'sf_2':{
    kc:'@isTest annotation, test methods, @TestSetup for reusable data in Apex tests',
    le:{title:'@isTest Hello',
      body:'Test class with method testing sum of 2 numbers. System.assertEquals(4, add(2,2)).'},
    pe:{title:'Contract TestSetup',
      body:'@TestSetup that creates 5 contracts in different states. Tests verifying queries by state, expiration dates, amounts.'}
  },
  'sf_3':{
    kc:'HttpCalloutMock to simulate external HTTP calls in Apex tests',
    le:{title:'Simple Callout Mock',
      body:'Class that does GET to external API. HttpCalloutMock returning 200 with fixed JSON. Test.setMock(HttpCalloutMock.class, new MyMock()).'},
    pe:{title:'Banking API Sync',
      body:'SyncCustomersBatch that sends customers to banking core. Mock for success, rejection (422), timeout.'}
  },
  'sf_4':{
    kc:'System.runAs() for permission testing, FLS (Field-Level Security) in Apex tests',
    le:{title:'runAs Demo',
      body:'Test using System.runAs(userWithoutPermissions) and verifying DML fails with System.DmlException.'},
    pe:{title:'FLS on Contracts',
      body:'Tests: user without permission to Amount__c cannot see it. Admin can. Partial permission only edits allowed fields.'}
  },
  'sf_5':{
    kc:'Governor limits in Apex: SOQL 100, DML 150, CPU time, heap size. How to test them.',
    le:{title:'Limits Inspector',
      body:'Test that does 101 SOQL in loop and catches System.LimitException. Check current limits with Limits.getQueries().'},
    pe:{title:'Bulk Contract Processing',
      body:'Batch processing 10,000 contracts. Test verifies: SOQL 100, DML 150, CPU time, heap size with 200 records.'}
  },
  'sf_6':{
    kc:'System.debug(), log levels, debugging via Setup → Logs',
    le:{title:'System.debug Logger',
      body:'Class with System.debug() at DEBUG, INFO, WARN, ERROR levels. Test executes it, review logs in Setup → Logs.'},
    pe:{title:'Commission Pipeline Debug',
      body:'Complex method calculating commissions with logs at each step. Test generates logs to debug rounding error.'}
  },
  'sf_7':{
    kc:'Jest for LWC: configuration, wire service mocks, Lightning component testing',
    le:{title:'Jest for LWC Hello',
      body:'Initialize Jest in LWC project. Test that renders helloWorld and verifies text. npm run test:unit'},
    pe:{title:'Jest for ContractList LWC',
      body:'Component listing customer contracts. Tests: render with mock data, empty, click opens detail, currency format.'}
  },
  'sf_8':{
    kc:'Database.Batchable, start/execute/finish methods, testing batch processes in Apex',
    le:{title:'Batch Hello',
      body:'Database.Batchable that updates all Account with a field. Test verifying execution with Database.executeBatch().'},
    pe:{title:'Contract Expiration Batch',
      body:'Batch that finds contracts about to expire (30 days), changes status to "Renewal Pending", creates task. Test with 200 records.'}
  },
  'sf_9':{
    kc:'Platform Events: publication and subscription, end-to-end testing of event-driven flows',
    le:{title:'Platform Event Pub/Sub',
      body:'Publish Order_Event__e with orderId. Listener that receives it and debugs. EventBus.publish().'},
    pe:{title:'Renewed Contract Event',
      body:'Publish Contract_Renewed__e when renewed. Subscriber updates commission. End-to-end test of full flow.'}
  },
  'sf_10':{
    kc:'Flow + Apex actions: invoke Apex from Flow builder, testing the invoked Apex',
    le:{title:'Flow + Apex',
      body:'Simple Flow calling Apex action that validates email. Unit test of the Apex method.'},
    pe:{title:'Credit Approval Flow',
      body:'Flow that evaluates request, calls Apex to verify bureau. Tests: auto-approval, rejection, manual review.'}
  },
  'sf_11':{
    kc:'CI/CD Pipeline with SF CLI: JWT auth, deploy, run tests, coverage gate',
    le:{title:'SF CLI in GHA',
      body:'Minimal workflow: JWT auth, deploy source, run Apex tests. sf org login jwt, sf project deploy start, sf apex run test'},
    pe:{title:'Complete ERP Pipeline',
      body:'Jobs: deploy scratch org → run Apex tests → run LWC Jest → coverage gate > 75% → deploy staging → notify Slack.'}
  },
  'sf_12':{
    kc:'Multi-org regression: run test suite across multiple organizations simultaneously',
    le:{title:'Basic Multi-Org',
      body:'Workflow running tests on 2 different scratch orgs in parallel.'},
    pe:{title:'Multi-Org ERP Regression',
      body:'Full suite on: scratch org (dev), sandbox (staging), production (select only). Compare results.'}
  },
  'sf_13':{
    kc:'Copado: pipelines, commits, deployments, change sets, release management strategy',
    le:{title:'Copado Fundamentals',
      body:'Document: pipelines, commits, deployments, change sets vs Copado. Key release management concepts.'},
    pe:{title:'Copado Deployment Strategy',
      body:'Plan: branches by environment, test datasets, pre-deploy validation, documented rollback plan.'}
  },
  'sf_14':{
    kc:'Complete Apex + LWC + CI/CD suite with coverage > 75%',
    le:{title:'Mini Apex Suite in 30 min',
      body:'3 tests: @TestSetup, HttpCalloutMock, System.runAs(). All passing.'},
    pe:{title:'ERP Project Closeout',
      body:'Full suite in CI/CD, coverage > 75%, object documentation, external project README.'}
  },

  // ── POSTMAN ─────────────────────────────────────────────
  'postman_0':{
    kc:'Variable scope management (Global, Environment, Collection) and dynamic request chaining',
    le:{title:'Token Passthrough Sandbox',
      body:'2 requests: POST /login extracts token → GET /protected uses it.\npm.environment.set("token", pm.response.json().token)\nAuthorization: Bearer {{token}}'},
    pe:{title:'Delivery Routes Workspace',
      body:'Dynamic variables: base_url, api_key, token, tracking_id.\nSeparate environments: dev, staging, prod.'}
  },
  'postman_1':{
    kc:'pm.test(), pm.expect() to validate status, body, headers, response time in Postman',
    le:{title:'Assertions Playground',
      body:'Tests against JSONPlaceholder.\npm.test("Status 200", () => pm.response.to.have.status(200))\npm.expect(pm.response.json().id).to.eql(1)'},
    pe:{title:'Logistics API Assertions',
      body:'Validate route structure, packages, delivery statuses. Response time < 2000ms.'}
  },
  'postman_2':{
    kc:'Pre-request scripts to generate dynamic data, timestamps, hashes, signatures',
    le:{title:'Timestamp Generator',
      body:'Pre-request that generates ISO timestamp, sets as variable.\npm.variables.set("timestamp", new Date().toISOString())'},
    pe:{title:'HMAC Signature for Secure Endpoints',
      body:'Generate HMAC-SHA256 signature in pre-request.\nconst hmac = CryptoJS.HmacSHA256(data, secret)\npm.variables.set("signature", hmac.toString())'}
  },
  'postman_3':{
    kc:'JSON schema validation in Postman using tv4 (Tiny Validator)',
    le:{title:'tv4 Schema Validator',
      body:'Validate /posts/1 response against inline schema.\npm.test("Schema valid", () => pm.expect(tv4.validate(body, schema)).to.be.true)'},
    pe:{title:'Package Schema Validation',
      body:'Package schema: trackingNumber, weight, dimensions, origin, destination, status, estimatedDelivery'}
  },
  'postman_4':{
    kc:'Chaining: extract data from one response and use it in the next request',
    le:{title:'3-Request Chain',
      body:'POST create → extract id → GET with that id → extract userId → GET user detail.\npm.environment.set("createdId", pm.response.json().id)'},
    pe:{title:'Logistic Shipment Chaining',
      body:'POST /shipments → trackingId → PUT /shipments/{{trackingId}}/pickup → GET /shipments/{{trackingId}}/status'}
  },
  'postman_5':{
    kc:'Collection Runner: run complete collections, view aggregated results',
    le:{title:'Collection Runner against JSONPlaceholder',
      body:'Collection of 5 requests, run with Collection Runner, view results by request.'},
    pe:{title:'Daily Routes Runner',
      body:'50 iterations with simulated route data, validate response times < 3000ms.'}
  },
  'postman_6':{
    kc:'Data-driven testing with CSV files in Collection Runner',
    le:{title:'CSV Driver',
      body:'CSV with 10 test cases (title, expectedStatus). Collection Runner with CSV.\npm.iterationData.get("title")'},
    pe:{title:'Delivery Data-Driven',
      body:'CSV with 100 shipments (origin, destination, weight, priority). Validate rate calculation against expectedPrice.'}
  },
  'postman_7':{
    kc:'Newman CLI: run Postman collections from terminal, integrate in CI/CD',
    le:{title:'Newman Hello World',
      body:'Export collection, run with newman.\nnewman run collection.json -e env.json --reporters cli'},
    pe:{title:'Newman in Logistics Pipeline',
      body:'Script running full logistics suite with cli, htmlextra, junit reporters.'}
  },
  'postman_8':{
    kc:'Newman HTML reports with htmlextra for result visualization',
    le:{title:'Newman HTML Report',
      body:'Run with --reporters htmlextra.\nnewman run collection.json -e env.json --reporters htmlextra\nOpen generated HTML.'},
    pe:{title:'Unified Logistics Report',
      body:'Custom HTML report with pass/fail metrics by endpoint, times, charts.'}
  },
  'postman_9':{
    kc:'Newman integration in GitHub Actions for Postman automation',
    le:{title:'Minimal GHA + Newman',
      body:'Workflow that installs Newman and runs collection.\nnpm install -g newman\nnewman run collection.json'},
    pe:{title:'Complete Logistics Pipeline',
      body:'GHA with environment matrix (staging, production). HTML artifacts. Slack notification.'}
  },
  'postman_10':{
    kc:'Postman Monitors: scheduled collection execution in the cloud',
    le:{title:'Quick Monitor',
      body:'Create Postman Cloud monitor running every hour against JSONPlaceholder. View results in dashboard.'},
    pe:{title:'Logistics SLA Monitor',
      body:'Monitoring every 5 min of critical endpoints: tracking status, warehouse stock, delivery ETA.'}
  },
  'postman_11':{
    kc:'Mock Servers in Postman to simulate APIs without real backend',
    le:{title:'Isolated Mock Server',
      body:'Create mock server for users API with 3 endpoints. Example response configured in collection example.'},
    pe:{title:'External Provider Mock',
      body:'Simulate courier API (FedEx/DHL) with tracking, rates, pickup responses.'}
  },
  'postman_12':{
    kc:'API documentation generation from Postman collections',
    le:{title:'Doc Generator',
      body:'Publish collection as documentation on Postman web.\nWorkspace → View in web → Publish.'},
    pe:{title:'Published Logistics Documentation',
      body:'Complete documentation with examples, schemas, descriptions, published with custom domain.'}
  },
  'postman_13':{
    kc:'Postman Flows: visual automation of data flows between APIs',
    le:{title:'Simple Visual Flow',
      body:'Flow: GET → extract data → POST with that data. Using output/input nodes.'},
    pe:{title:'Restock Automation Flow',
      body:'Flow: check low stock → order replenishment → notify supplier → update inventory.'}
  },
  'postman_14':{
    kc:'Contract testing in Postman: validate responses against predefined schemas',
    le:{title:'Contract Check',
      body:'Validate /posts response meets predefined schema with tv4.'},
    pe:{title:'Inventory API Contract',
      body:'Verify each endpoint against contract schema: Product, Warehouse, StockMovement.'}
  },
  'postman_15':{
    kc:'Performance testing in Postman: multiple iterations, time measurement',
    le:{title:'Quick Performance',
      body:'Collection runner with 50 iterations, no delay. Analyze p50/p95/p99 of each request.'},
    pe:{title:'Logistics Performance',
      body:'200 iterations, measure p50/p95/p99 of each endpoint, identify bottlenecks.'}
  },
  'postman_16':{
    kc:'Dedicated negative tests folder: invalid auth, malformed body, incorrect methods',
    le:{title:'Negative Collection',
      body:'Folder with tests: invalid auth → 401, malformed body → 400, non-existent ID → 404, method not allowed → 405.'},
    pe:{title:'Logistics Negative Suite',
      body:'Exceeded weight → 422, invalid address → 400, incorrect zip code → 400, recipient without data → 422.'}
  },
  'postman_17':{
    kc:'Advanced scripting with CryptoJS, lodash, object manipulation in Postman',
    le:{title:'Crypto and Lodash',
      body:'CryptoJS for SHA256 hash. Lodash for object manipulation, merge, pick, omit.'},
    pe:{title:'Advanced Logistics Scripting',
      body:'Generate barcodes, calculate distances between ZIP codes, validate digital delivery signatures.'}
  },
  'postman_18':{
    kc:'Complete mini-suite integrating chaining, data-driven, schema validation, Monitors, Mock Servers',
    le:{title:'Logistics Mini-Suite in 20 min',
      body:'3 tests with chaining, data-driven CSV, schema validation. All passing in Newman.'},
    pe:{title:'Postman Project Closeout',
      body:'Full logistics suite in CI/CD with Monitors, Mock Servers, published documentation.'}
  },

  // ── K6 (Performance Engineering) ─────────────────────────
  'k6_0':{
    kc:'K6 project initialization, Node.js runtime, basic options (vus, duration) and script lifecycle',
    le:{title:'Setup and First Script',
      body:'1. Install K6: winget install k6 or k6 install\n2. Create basic script: import http from \'k6/http\'; export default () => { http.get(\'https://test.k6.io\'); }\n3. k6 run --vus 1 --duration 10s script.js\n4. Interpret output: http_req_duration, http_reqs, vus'},
    pe:{title:'Performance Project Configuration',
      body:'1. Dedicated repo: performance-suite/\n2. Central options.js with defaults: thresholds, stages\n3. Separate scripts per scenario\n4. package.json with npm scripts for each test type'}
  },
  'k6_1':{
    kc:'Design of 1-minute smoke tests with 5 concurrent VUs to capture baseline response speed',
    le:{title:'Smoke Test in K6',
      body:'Design a 1-minute Smoke Test with 5 concurrent VUs.\n1. options: { vus: 5, duration: \'1m\' }\n2. Threshold: http_req_duration < 500ms\n3. k6 run smoke.js → interpret report\n4. Establish baseline: p50, p95, p99, avg'},
    pe:{title:'Performance Testing Strategy',
      body:'Define complete test matrix:\n- Smoke: 1m/5vu (baseline)\n- Load: 5m/50vu (normal operation)\n- Stress: ramp to 200vu (peak)\n- Soak: 10m/30vu (endurance)\nDocument SLAs per test type.'}
  },
  'k6_2':{
    kc:'Constant load models: fixed VU configuration for sustained and representative load tests',
    le:{title:'Load Test with Constant VUs',
      body:'Script with 50 constant VUs for 5 minutes.\noptions: { scenarios: { load: { executor: \'constant-vus\', vus: 50, duration: \'5m\' } } }\nThreshold: p95 < 1500ms, error < 1%\nMonitor http_reqs/s as capacity metric.'},
    pe:{title:'Representative System Load',
      body:'Analyze Google Analytics / logs to determine realistic VUs.\nScenario: typical peak hour with 50 concurrent users.\nDocument base system capacity at these levels.'}
  },
  'k6_3':{
    kc:'Progressive stages and ramp configuration to simulate stress spikes and scalability',
    le:{title:'Stress Test with Stages',
      body:'Script with stages: 0→20vu in 2m, hold 5m, peak 50vu 1m, cooldown.\noptions: { stages: [{ duration: \'2m\', target: 20 }, { duration: \'5m\', target: 20 }, { duration: \'1m\', target: 50 }, { duration: \'2m\', target: 0 }] }\nThreshold: http_req_failed < 0.01.'},
    pe:{title:'Black Friday Scenario',
      body:'Emulate high concurrency peak.\nStages: 0→100vu(2m) → 100vu(3m) → 100→500vu(1m) → 500vu(2m) → 0\nThresholds: p95 < 3s, p99 < 5s, error rate < 2%\nExecutive report with scaling recommendations.'}
  },
  'k6_4':{
    kc:'Sustained load (Soak) testing to detect gradual degradation, memory leaks and system fatigue',
    le:{title:'Soak Test',
      body:'Script with 30 VUs for 10 minutes.\noptions: { vus: 30, duration: \'10m\' }\nMonitor http_req_duration over time.\nDetect if it progressively increases (fatigue).\nThreshold: p95 < 1s sustained, no increase >10%.'},
    pe:{title:'Corporate Soak',
      body:'30 min soak with 50 constant VUs.\nRecord metrics every 1 minute.\nAlarm if p95 increases more than 20% between first and last minute.\nDocument degradation patterns.'}
  },
  'k6_5':{
    kc:'Definition of rigid quality thresholds with multiple conditions and performance assertions',
    le:{title:'Multiple Thresholds',
      body:'Configure combined thresholds:\n- p95 < 1000ms\n- p99 < 2500ms\n- error rate < 1%\n- http_reqs per second > 50\nUse thresholds by tag: { \'http_req_duration{endpoint:login}\': [\'p(95)<500\'] }'},
    pe:{title:'Project SLA Thresholds',
      body:'Thresholds aligned with real SLA: critical endpoint p95 < 200ms, non-critical < 1s.\nCI/CD threshold that breaks build if not met.\nCustom metrics: Trend + Rate for granular error tracking.'}
  },
  'k6_6':{
    kc:'K6 execution in CI/CD (GitHub Actions, Harness) with threshold validation and artifacts',
    le:{title:'K6 in GitHub Actions',
      body:'Workflow that installs K6, runs smoke.js, fails if thresholds not met.\nk6 run --summary-export=summary.json smoke.js\nUpload summary as artifact.'},
    pe:{title:'Performance Gate in Pipeline',
      body:'Integrate K6 as stage in Harness CD.\nExport summary.json, parse in script, gate evaluates p95 against SLA.\nHTML report generated with charts.\nPipeline blocks deploy if performance gate fails.'}
  },
  'k6_7':{
    kc:'Complete performance suite with multiple scenarios, rigorous thresholds and unified reports',
    le:{title:'Mini Performance Suite in 30 min',
      body:'Smoke + load + stress with thresholds on each.\nk6 run --scenario smoke --scenario load --scenario stress full-suite.js\nConsolidated report with all metrics.'},
    pe:{title:'Final Project: Black Friday',
      body:'Stress suite emulating Black Friday.\nProgressive stages up to 500 VUs.\nThresholds: p95 < 3s, p99 < 5s, error < 1%.\nExecutive report + scaling recommendations.\nPipeline with blocking performance gate.'}
  },

  // ── SQL ──────────────────────────────────────────────────
  'sql_0':{
    kc:'Relational database structure, basic SELECT statements, WHERE, ORDER BY and LIMIT',
    le:{title:'Fundamental Queries',
      body:'Connect to test DB and execute base queries.\n1. SELECT * FROM orders LIMIT 10;\n2. SELECT * FROM customers WHERE country = \'MX\' ORDER BY name;\n3. SELECT COUNT(*), MIN(amount), MAX(amount), AVG(amount) FROM payments;\n4. Explore schema: SHOW TABLES; DESCRIBE orders;'},
    pe:{title:'Audit Database Setup',
      body:'Connect to the project test DB.\nCreate exploration queries: count records per table, map key columns.\nDocument table relationships (FK candidates).'}
  },
  'sql_1':{
    kc:'JOINs (INNER, LEFT, RIGHT, FULL), table relationships, foreign keys and referential integrity',
    le:{title:'JOINs and Relationships',
      body:'Queries crossing related tables.\n1. INNER JOIN: orders + customers + status\n2. LEFT JOIN: find customers without orders\n3. RIGHT JOIN: products never sold\n4. FULL OUTER JOIN: detect orphan records in both directions\n5. Multiple JOINs: orders → items → products → categories'},
    pe:{title:'Business Relationship Validation',
      body:'Queries verifying: every order has valid customer, every order_item has parent order, every payment has associated invoice.\nScript reporting referential integrity violations.'}
  },
  'sql_2':{
    kc:'GROUP BY, aggregate functions (COUNT, SUM, AVG, MIN, MAX) and filtering with HAVING',
    le:{title:'Aggregations and Totals',
      body:'Queries with GROUP BY for analysis.\n1. Total sales by month: SUM(amount) GROUP BY MONTH(created_at)\n2. Customers by country: COUNT(*) GROUP BY country\n3. Best-selling categories: JOIN + GROUP BY + ORDER BY DESC\n4. HAVING: customers with > 5 orders\n5. Validate totals against app UI'},
    pe:{title:'UI vs DB Post-Test Reconciliation',
      body:'Script that after checkout tests: reads UI reported data → queries DB → compares totals.\nDiscrepancies > 0.1% trigger alert.\nReconciliation report per individual transaction.'}
  },
  'sql_3':{
    kc:'Correlated and non-correlated subqueries, Common Table Expressions (WITH)',
    le:{title:'Subqueries and CTEs',
      body:'Master nested queries.\n1. Subquery: customers with order above overall average\n2. CTE: WITH monthly_sales AS (...) SELECT * FROM monthly_sales\n3. Recursive CTE: category hierarchy\n4. EXISTS vs IN: performance comparison\n5. Subquery in SELECT: calculate difference from average'},
    pe:{title:'Business Rule Validation with CTE',
      body:'CTE calculating applied discount vs allowed discount per rule.\nDetect orders with excessive discount (>30%).\nCTE to detect anomalous customer behavior (>3σ from average).'}
  },
  'sql_4':{
    kc:'Data integrity validation: constraints, triggers, consistent states and data cleansing',
    le:{title:'Data Integrity Validation',
      body:'Data validation queries.\n1. Find orders without valid status\n2. Payments with negative or zero amount\n3. Products without assigned category\n4. Inconsistent timestamps: updated_at < created_at\n5. Duplicate records: GROUP BY + COUNT + HAVING > 1'},
    pe:{title:'Transactional Audit Suite',
      body:'Complete batch of integrity queries.\nVerify: order_items without parent order, payments without order, products with price 0.\nReport classified by severity (CRITICAL, WARNING, INFO).'}
  },
  'sql_5':{
    kc:'Exact and partial duplicate detection, orphan records, and inconsistent transactions',
    le:{title:'Duplicate and Orphan Detector',
      body:'Detection techniques.\n1. Exact duplicates: SELECT col1,col2,COUNT(*) FROM t GROUP BY col1,col2 HAVING COUNT(*) > 1\n2. Duplicates by email with different data: ROW_NUMBER() PARTITION BY email\n3. LEFT JOIN with NULL: find records without parent\n4. Transactions with start without corresponding end\n5. Auto-increment IDs with gaps'},
    pe:{title:'Data Quality Dashboard',
      body:'Script generating daily report: total records, orphans, duplicates, inconsistencies.\nExecutable at end of each automation suite.\nAlarm if data quality < 99.5%.'}
  },
  'sql_6':{
    kc:'Post-test execution audit automation: reusable scripts, stored procedures, audit triggers',
    le:{title:'Post-Automation Audit',
      body:'Create audit script that runs after tests.\n1. Stored Procedure: audit_integrity() running all queries\n2. Get report: SELECT * FROM audit_results ORDER BY severity\n3. Compare stock in DB vs UI after a purchase\n4. Verify transaction IDs match between frontend and backend'},
    pe:{title:'Automated Post-Test Integration',
      body:'Node.js script that after Playwright suite: connects to DB → runs SQL audit → compares with expectations → fails if discrepancies found.\nPipeline blocks deploy if audit finds anomalies.'}
  },
  'sql_7':{
    kc:'Complete backend validation suite: post-automation audit, reports, CI/CD gates',
    le:{title:'Mini SQL Suite in 30 min',
      body:'5 audit queries against test DB: duplicates, orphans, totals, anomalies, consistency.\nUnified report with findings.'},
    pe:{title:'Final Project: DB Audit',
      body:'Audit scripts executed after interface tests finish.\nEnsure table impacts (stock deductions, transaction IDs, customer data) exactly match what UI reported.\nPipeline blocks if discrepancies > 0.\nExecutive report with data integrity summary.'}
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
  const sb = document.getElementById('sidebar');
  if (sb && sb.classList.contains('open')) sb.classList.remove('open');
  const ov = document.getElementById('sidebar-overlay');
  if (ov && ov.classList.contains('open')) ov.classList.remove('open');
  const panel = document.getElementById('panel-guide');
  if (panel) panel.scrollTo(0, 0);
  const crumb = document.getElementById('guide-crumb');
  if (crumb) crumb.textContent = id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

function toggleGuideSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if (sb) sb.classList.toggle('open');
  if (ov) ov.classList.toggle('open');
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
  if(!confirm('Delete all notes?')) return;
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
      {id:'dashboard',icon:'squares-four',label:'Dashboard'},
      {id:'pomodoro',icon:'timer',label:'Pomodoro'},
      {id:'tasks',icon:'clipboard-text',label:'Tasks'},
      {id:'calendar',icon:'calendar',label:'Calendar'},
    ],

    // ── Auth / user ──
    profileName: '',
    profileSaving: false,
    profileSaved: false,
    get userName() { return this.profileName || window._user?.user_metadata?.full_name?.split(' ')[0] || window._user?.email?.split('@')[0] || 'User'; },
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
        id:'api', name:'API Testing', defaultLang:'Java', icon:'microscope', pct:0, color:'blue', tag:'In progress', priority:1,
        chapters:'14/20 ch', hours:'18h', exam:'Jun 15',
        chapList: [
          {name:'HTTP & REST Fundamentals',done:false},{name:'Status Codes & Headers',done:false},
          {name:'RestAssured setup + pom.xml',done:false},{name:'PostsTest.java — happy path',done:false},
          {name:'JSON Schema validation',done:false},          {name:'Negative tests & boundaries',done:false},
          {name:'Auth testing — JWT & OAuth',done:false},{name:'Security checklist — IDOR, XSS',done:false},
          {name:'Data-driven tests @ParameterizedTest',done:false},{name:'Allure reporting',done:false},
          {name:'UsersTest.java Complete',done:false},{name:'CommentsTest.java Complete',done:false},
          {name:'Pact contract tests',done:false},{name:'WireMock stubs',done:false},
          {name:'CI/CD — GitHub Actions gate',done:false},{name:'k6 performance gates',done:false},
          {name:'API design patterns',done:false},{name:'GraphQL testing',done:false},
          {name:'gRPC testing',done:false},{name:'Final Exam',done:false},
        ]
      },
      {
        id:'cicd', name:'CI/CD → Harness', defaultLang:'YAML', icon:'rocket-launch', pct:0, color:'green', tag:'In progress', priority:4,
        chapters:'8/17 ch', hours:'15h', exam:null,
        chapList: [
          {name:'Pipelines & Stages',done:false},{name:'GitHub Actions basics',done:false},
          {name:'Quality gates',done:false},{name:'Docker fundamentals',done:false},
          {name:'Docker Compose for Tests',done:false},{name:'Matrix builds',done:false},
          {name:'Environments & Secrets',done:false},{name:'Allure + Artifacts',done:false},
          {name:'k6 performance gates',done:false},{name:'Pact contract tests',done:false},
          {name:'Slack notifications',done:false},{name:'Ephemeral environments',done:false},
          {name:'Multi-org deployment',done:false},{name:'Harness Pipelines Fundamentals',done:false},
          {name:'Quality Gates in Harness',done:false},{name:'Harness CD Pipeline',done:false},
          {name:'Final Exam',done:false},
        ]
      },
      {
        id:'playwright', name:'Playwright', defaultLang:'JavaScript', icon:'mask-happy', pct:0, color:'purple', tag:'Started', priority:3,
        chapters:'5/14 ch', hours:'10h', exam:'Jul 2',
        chapList: [
          {name:'Setup & Configuration',done:false},{name:'API Tests with Request Fixture',done:false},
          {name:'Basic E2E Tests',done:false},{name:'Page Object Model',done:false},
          {name:'Hybrid API + UI tests',done:false},{name:'Visual regression testing',done:false},
          {name:'Network interception',done:false},{name:'Cross-browser testing',done:false},
          {name:'Debugging & Traces',done:false},{name:'GitHub Actions integration',done:false},
          {name:'Data-Driven Testing with External JSON',done:false},{name:'Multi-Tenant Config Engine',done:false},
          {name:'demoqa.com Full Project',done:false},{name:'Final Exam',done:false},
        ]
      },
      {
        id:'sf', name:'Apex/Salesforce', defaultLang:'Apex', icon:'cloud', pct:0, color:'orange', tag:'Pending', priority:5,
        chapters:'3/15 ch', hours:'5h', exam:'Jul 20',
        chapList: [
          {name:'Dev Org setup + SF CLI',done:false},{name:'Apex basics',done:false},
          {name:'@isTest & @TestSetup',done:false},{name:'HttpCalloutMock',done:false},
          {name:'System.runAs() & FLS',done:false},{name:'Governor limits testing',done:false},
          {name:'Debug logs reading',done:false},{name:'LWC Jest tests',done:false},
          {name:'Batch Apex testing',done:false},{name:'Platform Events testing',done:false},
          {name:'Flow Testing in Apex',done:false},{name:'SF CLI CI/CD pipeline',done:false},
          {name:'Multi-org regression',done:false},{name:'Copado basics',done:false},
          {name:'Final Exam',done:false},
        ]
      },
      {
        id:'postman', name:'Postman', defaultLang:'JavaScript', icon:'mailbox', pct:0, color:'green', tag:'Advanced', priority:2,
        chapters:'17/20 ch', hours:'22h', exam:null,
        chapList: [
          {name:'Collections & Workspaces',done:false},{name:'Environment Variables',done:false},
          {name:'pm.test assertions',done:false},{name:'Pre-request scripts',done:false},
          {name:'Schema validation',done:false},{name:'Chaining with Env Variables',done:false},
          {name:'Collection Runner',done:false},{name:'Data-Driven with CSV',done:false},
          {name:'Newman CLI',done:false},{name:'HTML reports',done:false},
          {name:'GitHub Actions + Newman',done:false},{name:'Monitors',done:false},
          {name:'Mock servers',done:false},{name:'API documentation',done:false},
          {name:'Flows (new)',done:false},{name:'Contract testing',done:false},
          {name:'Performance testing',done:false},{name:'Negative test folder',done:false},
          {name:'Advanced scripting',done:false},{name:'Final Exam',done:false},
        ]
      },
      {
        id:'k6', name:'Performance Engineering (K6)', defaultLang:'JavaScript', icon:'chart-bar', pct:0, color:'red', tag:'New', priority:6,
        chapters:'0/8 ch', hours:'0h', exam:null,
        chapList: [
          {name:'K6 Setup & VU Concepts',done:false},{name:'Smoke Testing',done:false},
          {name:'Load Testing',done:false},{name:'Stress Testing',done:false},
          {name:'Soak Testing',done:false},{name:'Thresholds & Metrics',done:false},
          {name:'K6 in CI/CD',done:false},{name:'Final Project: Black Friday',done:false},
        ]
      },
      {
        id:'sql', name:'SQL & Backend Validation', defaultLang:'SQL', icon:'database', pct:0, color:'amber', tag:'New', priority:7,
        chapters:'0/8 ch', hours:'0h', exam:null,
        chapList: [
          {name:'SQL Fundamentals & SELECT',done:false},{name:'JOINs & Relationships',done:false},
          {name:'GROUP BY & HAVING',done:false},{name:'Subqueries & CTEs',done:false},
          {name:'Data Integrity Validation',done:false},{name:'Duplicate & Orphan Detection',done:false},
          {name:'Post-Automation Audit',done:false},{name:'Final Project: DB Audit',done:false},
        ]
      },
    ],

    get overallPct() {
      return Math.round(this.subjects.reduce((a,s)=>a+this.chapPct(s),0)/this.subjects.length);
    },

    // ── Deadlines ──
    getSubjectTag(s) {
      const pct = this.chapPct(s);
      if (pct === 100) return 'Completed';
      if (pct > 0) return 'In progress';
      return 'Pending';
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
            ? `${done}/${total} ch · ${pct}% completed`
            : 'Next: ch. 1',
          action: pct > 0 ? 'Continue' : 'Start',
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
    days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    activity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

    // ── Pomodoro ──
    pomoPhase:'work', running:false, donePomos:0, timerInterval:null, timeLeft:25*60,
    circ:2*Math.PI*60, circBig:2*Math.PI*96, pomoLog:[],
    phaseDur:{work:25*60,short:5*60,long:15*60},
    phaseNames:{work:'FOCUS',short:'SHORT BREAK',long:'LONG BREAK'},
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
            const now=new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
            this.pomoLog.unshift({id:Date.now(),
              label:this.pomoPhase==='work'?`Session #${this.donePomos+1}`:'Break',
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

      // Set language from global preference or subject default
      this.aiGuide.language = localStorage.getItem('stos_ai_language') || subject.defaultLang || 'JavaScript';

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
      localStorage.setItem('stos_ai_language', this.aiGuide.language);
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
    async _restoreAIGuide() {
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
        let cached = localStorage.getItem(cacheKey);
        if (!cached) cached = await this._loadCacheFromSupabase(cacheKey);
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
        // Restore language from global preference or saved state
        this.aiGuide.language = localStorage.getItem('stos_ai_language') || g.language || subject.defaultLang || 'JavaScript';
        let cachedQ = localStorage.getItem(quizKey);
        if (!cachedQ) cachedQ = await this._loadCacheFromSupabase(quizKey);
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
        await this._restoreAIGuide();
      } else {
        await this._restoreAIGuide();
        window.addEventListener('supabase-ready', async () => {
          await this.loadProgress();
          if (!this.profileName && window._user?.user_metadata?.full_name) {
            this.profileName = window._user.user_metadata.full_name;
          }
          await this._restoreAIGuide();
        }, { once: true });
      }
      this.$watch('subjects', () => this._debounceSave(), { deep: true });
      this.$watch('tasks', () => this._debounceSave(), { deep: true });
      this.$watch('settings', () => this._saveSettings(), { deep: true });
      this.$watch('pomoSettings', () => this._saveSettings(), { deep: true });
      this.$watch('weekGoal', () => this._saveSettings());
      this.$watch('pomosGoal', () => this._saveSettings());
      this.$watch('currentWeek', () => this._saveSettings());
      window.addEventListener('beforeunload', () => {
        if (window._sb && window._user) this.saveProgress();
      });
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
