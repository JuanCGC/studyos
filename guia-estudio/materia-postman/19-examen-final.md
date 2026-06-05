# 📘 19. Examen Final

- **Concepto Clave Asimilado:** Integración y aplicación de todos los conceptos del curso en un examen práctico que combina chaining, data-driven, schema validation, scripting, y CI/CD.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Mini-Suite Logística en 20 min — Resolver 3 ejercicios que integran chaining, data-driven, y schema validation contra JSONPlaceholder.

**Instrucciones (20 minutos cronometrados):**

**Ejercicio 1: Chaining (7 min)**
Crear una colección `Examen Chaining` que haga:
1. `POST /posts` con body `{ "title": "Examen Final", "body": "Test", "userId": 3 }`
2. Extraer el `id` de la respuesta
3. `GET /posts/{id}` para verificar que se creó correctamente
4. `GET /users/3` para obtener datos del usuario que creó el post

Agregar tests que verifiquen:
- Status 201 en creación
- Status 200 en GETs
- El título del post coincide con el enviado
- El nombre del usuario no está vacío

**Ejercicio 2: Data-Driven (7 min)**
Crear archivo CSV con 5 registros:
```csv
title,body,userId
Post DD 1,Body for data-driven test 1,1
Post DD 2,Body for data-driven test 2,1
Post DD 3,Body for data-driven test 3,2
Post DD 4,Body for data-driven test 4,2
Post DD 5,Body for data-driven test 5,3
```

Crear request `POST /posts` con body `{{title}}`, `{{body}}`, `{{userId}}` y tests que:
- Verifiquen status 201
- Verifiquen que el título en la respuesta coincida con `pm.iterationData.get("title")`
- Verifiquen que `userId` en la respuesta coincida con el CSV

Correr en Collection Runner con el CSV y verificar que los 5 pasen.

**Ejercicio 3: Schema Validation (6 min)**
Usando `tv4`, crear un schema para el response de `GET /posts/1` que valide:
- `userId` es number
- `id` es number
- `title` es string no vacío
- `body` es string
- No hay propiedades adicionales (`additionalProperties: false`)

Agregar test que:
- Valide el schema
- Si falla, imprima `tv4.error.message` en console
- Fuerce intencionalmente un fallo agregando `email` al schema required

**Evaluación:**
- Todos los tests pasan (excepto el fallo intencional): **10/10**
- Tests pasan pero con errores en console: **7/10**
- Más de 20 minutos: **-2 puntos por cada 5 minutos extra**
- No logra completar los 3 ejercicios: **0/10**

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Cierre — Suite completa de logística en CI/CD con Monitors, Mock Servers, documentación publicada y pipeline de GitHub Actions.

**Instrucciones:**

Este examen final del proyecto principal consiste en **verificar que todos los componentes** del workspace de logística están correctamente configurados, publicados y funcionando. Completa cada paso y marca como ✓ cuando esté listo.

---

## Checklist de Examen Final — Proyecto Logística

### 1. Colección y Entornos ✓/—

- [ ] 1.1. Colección `API de Logística e Inventario` existe con todos los requests
- [ ] 1.2. Entorno `Logística - Desarrollo` tiene todas las variables configuradas
- [ ] 1.3. Entorno `Logística - Producción` tiene valores distintos
- [ ] 1.4. Variables de colección (`app_version`, contracts) están definidas
- [ ] 1.5. Scripts a nivel de colección (pre-request y tests) están activos

### 2. Chaining Completo ✓/—

Verificar que la cadena completa de requests se ejecuta sin errores:
- [ ] 2.1. `POST /auth/login` → extrae token
- [ ] 2.2. `POST /shipments` → extrae trackingId
- [ ] 2.3. `PUT /shipments/:id/pickup` → cambia estado
- [ ] 2.4. `GET /shipments/:id/status` → muestra progreso

Ejecutar la cadena manualmente y verificar que cada paso pasa sus tests.

### 3. Assertions y Tests ✓/—

- [ ] 3.1. Cada request tiene al menos 3 tests
- [ ] 3.2. Hay tests de status code, response time, y estructura de body
- [ ] 3.3. Los tests de response time verifican SLAs específicos por endpoint
- [ ] 3.4. Hay tests de tipo de datos (number, string, array)

### 4. Schema Validation ✓/—

- [ ] 4.1. Contracts de Product, Warehouse, StockMovement definidos
- [ ] 4.2. Tests de validación contra tv4 en cada endpoint relevante
- [ ] 4.3. `additionalProperties: false` configurado
- [ ] 4.4. Los contracts están almacenados como variables de colección

### 5. Pre-request Scripts ✓/—

- [ ] 5.1. Firma HMAC-SHA256 implementada para endpoints seguros
- [ ] 5.2. Generación de timestamps ISO en pre-request
- [ ] 5.3. Logging de inicio de cada request

### 6. Data-Driven ✓/—

- [ ] 6.1. CSV con al menos 10 casos de prueba para rate calculation
- [ ] 6.2. Tests que usan `pm.iterationData` para validar rangos de tarifa
- [ ] 6.3. Ejecución exitosa en Collection Runner con el CSV

### 7. Newman CLI ✓/—

- [ ] 7.1. Script `run-logistica.ps1` o `.sh` creado
- [ ] 7.2. Ejecución exitosa con `newman run` desde terminal
- [ ] 7.3. Reporters cli y htmlextra funcionando
- [ ] 7.4. Parámetros de entorno, iteraciones y data file funcionales

### 8. HTML Reports ✓/—

- [ ] 8.1. Reporte HTML generado con htmlextra
- [ ] 8.2. Reporte muestra todos los requests y tests
- [ ] 8.3. Reporte muestra timeline de tiempos de respuesta
- [ ] 8.4. Reporte se abre correctamente en navegador

### 9. GitHub Actions ✓/—

- [ ] 9.1. Workflow `.github/workflows/logistica-pipeline.yml` creado
- [ ] 9.2. Matrix de entornos (staging, production) configurada
- [ ] 9.3. Artefactos HTML se suben correctamente
- [ ] 9.4. Workflow se ejecuta en GitHub Actions

### 10. Monitors ✓/—

- [ ] 10.1. Monitor `SLA Logístico - Producción` creado en Postman Cloud
- [ ] 10.2. Frecuencia cada 5 minutos configurada
- [ ] 10.3. Alertas por email/Slack configuradas
- [ ] 10.4. Monitor ha tenido al menos una ejecución exitosa

### 11. Mock Servers ✓/—

- [ ] 11.1. Mock `Mock Proveedor Externo` creado
- [ ] 11.2. Endpoints de rates, tracking, pickup funcionando
- [ ] 11.3. Examples para 200 y 400/404 guardados
- [ ] 11.4. La colección principal puede apuntar al mock cambiando variable

### 12. Postman Flows ✓/—

- [ ] 12.1. Flow `Reabastecimiento Automático` creado
- [ ] 12.2. Flow verifica stock bajo y filtra
- [ ] 12.3. Flow crea reorder y notifica a proveedor
- [ ] 12.4. Flow se ejecuta correctamente de principio a fin

### 13. Documentación ✓/—

- [ ] 13.1. Documentación publicada en Postman Web
- [ ] 13.2. Cada endpoint tiene descripción detallada
- [ ] 13.3. Schemas y ejemplos incluidos

### 14. Negative Tests ✓/—

- [ ] 14.1. Carpeta `🚫 Negative Tests - Logística` existe
- [ ] 14.2. Tests de peso excedido, zip inválido, auth inválida funcionan
- [ ] 14.3. Tests verifican códigos de error específicos (400, 401, 405)

### 15. Advanced Scripting ✓/—

- [ ] 15.1. Generación de tracking numbers con hash
- [ ] 15.2. Cálculo de distancia entre códigos postales
- [ ] 15.3. Validación de firmas digitales de entrega

---

## Evaluación Final

| Sección | Puntos | Obtenido |
|---|---|---|
| Colección y Entornos | 5 | __/5 |
| Chaining | 10 | __/10 |
| Assertions | 10 | __/10 |
| Schema Validation | 10 | __/10 |
| Pre-request Scripts | 5 | __/5 |
| Data-Driven | 10 | __/10 |
| Newman CLI | 10 | __/10 |
| HTML Reports | 5 | __/5 |
| GitHub Actions | 15 | __/15 |
| Monitors | 10 | __/10 |
| Mock Servers | 10 | __/10 |
| Postman Flows | 10 | __/10 |
| Documentación | 5 | __/5 |
| Negative Tests | 10 | __/10 |
| Advanced Scripting | 5 | __/5 |
| **Total** | **130** | **__/130** |

**Resultado:**
- 117-130 (90-100%): **Excelente — Experto en Postman**
- 104-116 (80-89%): **Bueno — Sólido conocimiento**
- 91-103 (70-79%): **Satisfactorio — Requiere práctica**
- < 91 (< 70%): **Necesita repasar capítulos específicos**

---

## Entregable Final

Para aprobar el examen final, subir a GitHub (o compartir con el instructor):

1. **Colección exportada:** `logistica-collection.json`
2. **Entornos exportados:** `logistica-env.json` y `logistica-env-prod.json`
3. **CSV de datos:** `envios-100.csv`
4. **Scripts Newman:** `run-logistica.ps1` / `run-logistica.sh`
5. **Workflow GHA:** `.github/workflows/logistica-pipeline.yml`
6. **Reporte HTML:** Una ejecución completa con htmlextra
7. **URL del Monitor:** Enlace al monitor activo en Postman Cloud
8. **URL del Mock Server:** Enlace al mock server publicado
9. **URL de Documentación:** Enlace a la documentación publicada
10. **Flow exportado:** Captura o JSON del Flow de Reabastecimiento

**¡Felicidades por completar el curso de Postman!**
