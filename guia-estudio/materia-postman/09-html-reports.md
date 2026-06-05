# 📘 09. HTML Reports

- **Concepto Clave Asimilado:** Generación de reportes HTML detallados con Newman y el reporter `htmlextra` para visualizar resultados de ejecución.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Newman HTML Report — Correr colección con `--reporters htmlextra`, abrir el reporte generado en el navegador.

**Instrucciones:**

1. Usar la colección y entorno exportados del capítulo anterior.

2. Instalar el reporter htmlextra:

```bash
npm install -g newman-reporter-htmlextra
```

3. Ejecutar Newman con reporter HTML:

```bash
newman run newman-hello-collection.json \
  -e newman-hello-env.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./reporte-hello.html
```

4. Abrir el archivo `reporte-hello.html` en el navegador (doble click o `open reporte-hello.html` en Mac, `start reporte-hello.html` en Windows).

5. Explorar el reporte:
   - Resumen general: tests pasados/fallados, tiempo total, tamaño de respuesta.
   - Lista de requests individuales con sus tests.
   - Timeline de tiempos de respuesta.
   - Pestaña de errores (si los hay).

6. Probar con `--reporter-htmlextra-title "Mi Reporte Personalizado"` para personalizar el título.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Reporte Unificado de Logística — Reporte HTML personalizado con métricas de éxito/fallo por endpoint, generado automáticamente tras la ejecución.

**Instrucciones:**

1. Asegurarse de tener `newman-reporter-htmlextra` instalado.

2. Crear el script de generación de reporte `generar-reporte-logistica.ps1`:

```powershell
# generar-reporte-logistica.ps1
param(
    [string]$Env = "dev",
    [int]$Iterations = 10,
    [string]$Title = "Reporte de Logística - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = ".\reports\$timestamp"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

Write-Host "Generando reporte de logística..." -ForegroundColor Cyan

newman run logistica-collection.json `
  -e logistica-env.json `
  --iteration-count $Iterations `
  --delay-request 100 `
  --reporters cli,htmlextra `
  --reporter-htmlextra-export "$reportDir\logistica-report.html" `
  --reporter-htmlextra-title "$Title" `
  --reporter-htmlextra-browserTitle "Logística API Tests" `
  --reporter-htmlextra-showOnlyFails false `
  --reporter-htmlextra-noSyntaxHighlighting false `
  --reporter-htmlextra-showEnvironmentData true `
  --reporter-htmlextra-skipSensitiveData false

# Generar también un resumen en JSON
$summary = @{
    timestamp = $timestamp
    environment = $Env
    iterations = $Iterations
    reportPath = "$reportDir\logistica-report.html"
} | ConvertTo-Json

$summary | Out-File -FilePath "$reportDir\summary.json" -Encoding UTF8

Write-Host "Reporte generado: $reportDir\logistica-report.html" -ForegroundColor Green
Write-Host "Resumen: $reportDir\summary.json" -ForegroundColor Green
```

3. Ejecutar:

```powershell
.\generar-reporte-logistica.ps1 -Env dev -Iterations 5
```

4. Abrir el reporte HTML y analizar:
   - **SKU (Summary):** Total de requests, tests pasados/fallados, tiempo promedio.
   - **Timeline:** Gráfico de barras con tiempos de respuesta por request.
   - **Total Requests:** Lista detallada con cada request y sus tests.
   - **Failed Tests:** Si hay fallos, aparecen resaltados en rojo.

5. Personalización avanzada del reporte con CSS inline (opcional):

Crear archivo `custom-style.css`:

```css
/* custom-style.css para htmlextra */
body {
    font-family: 'Segoe UI', sans-serif;
}
.suite-header {
    background: linear-gradient(135deg, #1a73e8, #0d47a1) !important;
}
.test-pass {
    background-color: #00c853 !important;
}
.test-fail {
    background-color: #ff1744 !important;
}
```

6. Configurar el reporte para que se abra automáticamente al terminar:

```powershell
# Agregar al final del script
Start-Process "$reportDir\logistica-report.html"
```

7. Probar con `Logística - Producción` y 50 iteraciones para generar un reporte completo.
