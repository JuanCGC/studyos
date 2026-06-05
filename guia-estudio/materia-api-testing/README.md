# API Testing — Proyecto Unificado: API REST de Servicios Financieros y Core Bancario

**Descripción del Proyecto Externo:**
Vas a construir y testear una API bancaria simulada con cuentas, transferencias, historial de transacciones, autenticación y módulos de compliance. Cada capítulo agrega una capa de testing sobre este mismo proyecto.

**Stack sugerido:** Java 21 + Maven + RestAssured + JUnit 5 + Allure + Pact + WireMock

**Estructura del proyecto externo:**
```
banking-api-test/
├── src/test/java/com/banking/
│   ├── config/ApiConfig.java
│   ├── tests/
│   │   ├── accounts/ (AccountsTest.java)
│   │   ├── auth/ (AuthTest.java)
│   │   ├── transactions/ (TransactionsTest.java)
│   │   └── security/ (SecurityTest.java)
│   └── contracts/ (Pact tests)
├── src/test/resources/schemas/
├── postman/ (colección para Postman)
├── .github/workflows/test.yml
└── pom.xml
```

**Progresión:** Cap 01 → Protocolo HTTP, Cap 02 → Validación Esquemas, Cap 03 → RestAssured Setup, Cap 04 → PostsTest, Cap 05 → Schema Validation, Cap 06 → Negative Tests, Cap 07 → Auth JWT/OAuth, Cap 08 → Security IDOR/XSS, Cap 09 → Data-Driven, Cap 10 → Allure, Cap 11 → UsersTest, Cap 12 → CommentsTest, Cap 13 → Pact, Cap 14 → WireMock, Cap 15 → CI/CD Gate, Cap 16 → k6, Cap 17 → API Design Patterns, Cap 18 → GraphQL, Cap 19 → gRPC, Cap 20 → Examen
