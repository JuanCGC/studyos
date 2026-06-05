# 📘 [03. RestAssured Setup + pom.xml]

- **Concepto Clave Asimilado:** Configuración de proyecto Maven con RestAssured, request/response specs, logging, base URI.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Maven + RestAssured Mínimo — Crear proyecto Maven desde cero con RestAssured, JUnit 5 y un test simple contra JSONPlaceholder.

**Instrucciones:**
1. `mvn archetype:generate -DgroupId=com.banking -DartifactId=banking-api-test`
2. pom.xml con: rest-assured 5.5.0, junit-jupiter 5.11.0, json-schema-validator
3. Test: `GET https://jsonplaceholder.typicode.com/posts/1` → status 200
4. Logging: agregar filtros de request/response

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Configuración del Proyecto Bancario — Crear ApiConfig.java con specs reutilizables, logging condicional, baseURI apuntando al entorno local de la API bancaria.
