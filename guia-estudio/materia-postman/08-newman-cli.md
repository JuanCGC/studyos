# 📘 08. Newman CLI

- **Concepto Clave Asimilado:** Ejecución headless de colecciones Postman desde la línea de comandos usando Newman, con reporters y opciones de configuración.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Newman Hello World — Exportar colección y entorno, correr con `newman run collection.json -e env.json` desde terminal.

**Instrucciones:**

1. Crear colección `Newman Hello` con un solo request `GET https://jsonplaceholder.typicode.com/posts/1` y el siguiente test:

```javascript
pm.test("Status code is 200", function () {
    pm.expect(pm.response.code).to.equal(200);
});
```

2. Exportar la colección:
   - Click derecho en la colección → **Export** → **Collection v2.1** → guardar como `newman-hello-collection.json`.

3. Exportar el entorno:
   - Click en el engranaje → **Environments** → **Export** → guardar como `newman-hello-env.json`.

4. Abrir terminal (PowerShell, CMD o bash) y ejecutar:

```bash
# Instalar Newman globalmente (si no está instalado)
npm install -g newman

# Ejecutar la colección
newman run newman-hello-collection.json -e newman-hello-env.json
```

5. Ver el output en terminal:
   - Deberías ver resumen con `✔` para tests pasados, tiempos de respuesta, y resumen final.

6. Probar con flags adicionales:

```bash
newman run newman-hello-collection.json \
  -e newman-hello-env.json \
  --reporters cli \
  --delay-request 100 \
  --timeout-request 5000
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Newman en Pipeline Logístico — Script que corre la suite completa de logística con reporters `cli`, `htmlextra`, `junit` y exportación de resultados.

**Instrucciones:**

1. Exportar la colección completa `API de Logística e Inventario` como `logistica-collection.json`.

2. Exportar el entorno `Logística - Desarrollo` como `logistica-env.json`.

3. Crear un archivo `run-logistica.ps1` (PowerShell) con el siguiente contenido:

```powershell
# run-logistica.ps1
# Script de ejecución de la suite de logística con Newman

param(
    [string]$Env = "dev",
    [int]$Iterations = 1,
    [string]$DataFile = ""
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportDir = ".\reports\$timestamp"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

# Seleccionar entorno
$envFile = if ($Env -eq "prod") { "logistica-env-prod.json" } else { "logistica-env.json" }

Write-Host "=== Ejecutando Suite Logística ===" -ForegroundColor Cyan
Write-Host "Entorno: $Env" -ForegroundColor Yellow
Write-Host "Iteraciones: $Iterations" -ForegroundColor Yellow
Write-Host "Reportes en: $reportDir" -ForegroundColor Yellow

# Construir comando base
$newmanArgs = @(
    "run", "logistica-collection.json",
    "-e", $envFile,
    "--reporters", "cli,htmlextra,junit",
    "--reporter-htmlextra-export", "$reportDir\reporte-logistica.html",
    "--reporter-junit-export", "$reportDir\resultados-junit.xml",
    "--delay-request", "50",
    "--timeout-request", "10000",
    "--color", "on"
)

# Agregar iteraciones si > 1
if ($Iterations -gt 1) {
    $newmanArgs += @("--iteration-count", $Iterations)
}

# Agregar data file si se especificó
if ($DataFile -ne "") {
    $newmanArgs += @("--iteration-data", $DataFile)
}

# Ejecutar
$env:NODE_OPTIONS = "--max-old-space-size=4096"
newman $newmanArgs

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Suite completada exitosamente ===" -ForegroundColor Green
} else {
    Write-Host "=== Suite completada con FALLOS ===" -ForegroundColor Red
    Write-Host "Código de salida: $LASTEXITCODE" -ForegroundColor Red
}

exit $LASTEXITCODE
```

4. Crear también un archivo `run-logistica.sh` para Linux/Mac:

```bash
#!/bin/bash
# run-logistica.sh - Ejecución de suite logística

ENV=${1:-dev}
ITERATIONS=${2:-1}
DATA_FILE=${3:-""}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="./reports/$TIMESTAMP"

mkdir -p "$REPORT_DIR"

ENV_FILE="logistica-env.json"
[ "$ENV" = "prod" ] && ENV_FILE="logistica-env-prod.json"

echo "=== Ejecutando Suite Logística ==="
echo "Entorno: $ENV"
echo "Iteraciones: $ITERATIONS"

ARGS="run logistica-collection.json -e $ENV_FILE \
  --reporters cli,htmlextra,junit \
  --reporter-htmlextra-export $REPORT_DIR/reporte-logistica.html \
  --reporter-junit-export $REPORT_DIR/resultados-junit.xml \
  --delay-request 50 \
  --timeout-request 10000"

[ "$ITERATIONS" -gt 1 ] && ARGS="$ARGS --iteration-count $ITERATIONS"
[ -n "$DATA_FILE" ] && ARGS="$ARGS --iteration-data $DATA_FILE"

npx newman $ARGS
echo "Exit code: $?"
```

5. Ejecutar el script:

```bash
# Windows PowerShell
.\run-logistica.ps1 -Env dev -Iterations 5

# Linux/Mac
chmod +x run-logistica.sh
./run-logistica.sh dev 5
```

6. Revisar los reportes generados en la carpeta `reports/`.
