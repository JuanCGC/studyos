# 📘 13. Multi-Org Regression Testing

- **Concepto Clave Asimilado:** Ejecución de pruebas de regresión en múltiples organizaciones Salesforce (scratch org, sandbox, producción) para garantizar compatibilidad y detectar regresiones entre ambientes.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Multi-Org Básico — Workflow de GitHub Actions que ejecuta tests en 2 scratch orgs diferentes (API versiones distintas)

**Instrucciones:**

1. Crea dos archivos de configuración de scratch org para diferentes versiones de API:

**`config/scratch-org-v58.json`:**
```json
{
  "orgName": "MultiOrg - API v58",
  "edition": "Developer",
  "features": ["API", "DebugApex"],
  "settings": {
    "orgPreferenceSettings": {
      "s1DesktopEnabled": true
    }
  },
  "apiVersion": 58
}
```

**`config/scratch-org-v59.json`:**
```json
{
  "orgName": "MultiOrg - API v59",
  "edition": "Developer",
  "features": ["API", "DebugApex"],
  "settings": {
    "orgPreferenceSettings": {
      "s1DesktopEnabled": true
    }
  },
  "apiVersion": 59
}
```

2. Crea el workflow multi-org:

**`.github/workflows/multi-org-basic.yml`:**
```yaml
name: Multi-Org Basic

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * 1' # Todos los lunes a las 6 AM

jobs:
  matrix-test:
    strategy:
      fail-fast: false
      matrix:
        api-version: [58, 59]
        org-config:
          - config/scratch-org-v58.json
          - config/scratch-org-v59.json

    runs-on: ubuntu-latest
    name: Tests en API v${{ matrix.api-version }}
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Instalar SF CLI
        run: npm install -g @salesforce/cli

      - name: Autenticar Dev Hub
        run: |
          echo "${{ secrets.SFDX_JWT_KEY }}" | base64 --decode > server.key
          sf org login jwt \
            --client-id ${{ secrets.SFDX_CLIENT_ID }} \
            --jwt-key-file server.key \
            --username ${{ secrets.SFDX_USERNAME }} \
            --set-default-dev-hub

      - name: Crear Scratch Org (API v${{ matrix.api-version }})
        run: |
          sf org create scratch \
            --definition-file ${{ matrix.org-config }} \
            --alias Org${{ matrix.api-version }} \
            --duration-days 1 \
            --wait 10

      - name: Desplegar Source
        run: |
          sf project deploy start \
            --source-dir force-app/main/default \
            --target-org Org${{ matrix.api-version }} \
            --wait 15

      - name: Ejecutar Tests Apex
        run: |
          sf apex run test \
            --target-org Org${{ matrix.api-version }} \
            --test-level RunLocalTests \
            --wait 10 \
            --result-format human

      - name: Eliminar Scratch Org
        if: always()
        run: sf org delete scratch --target-org Org${{ matrix.api-version }}

  consolidate:
    needs: matrix-test
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Verificar resultados
        run: |
          echo "=== RESULTADOS MULTI-ORG ==="
          echo "Tests ejecutados en API v58 y v59"
          echo "Pipeline completado: ${{ needs.matrix-test.result }}"
```

3. Ejecuta el workflow y revisa los resultados de ambas orgs.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Regression Multi-Org ERP — Ejecutar suite completa de pruebas en: scratch org (dev), sandbox (staging) y producción (solo tests selectos). Comparar resultados y validar consistencia.

**Instrucciones:**

1. Crea el archivo de configuración con los diferentes ambientes:

**`config/org-config.json`:**
```json
{
  "environments": [
    {
      "name": "dev",
      "type": "scratch",
      "configFile": "config/dev-scratch.json",
      "alias": "DevOrg",
      "testLevel": "RunLocalTests",
      "maxWait": 10,
      "description": "Scratch org para validación rápida"
    },
    {
      "name": "staging",
      "type": "sandbox",
      "alias": "StagingOrg",
      "testLevel": "RunLocalTests",
      "maxWait": 20,
      "description": "Sandbox de staging con datos reales"
    },
    {
      "name": "production",
      "type": "production",
      "alias": "ProdOrg",
      "testLevel": "RunSpecifiedTests",
      "maxWait": 30,
      "description": "Producción - solo tests selectos de alto impacto"
    }
  ],
  "productionTests": [
    "ClienteServiceTest",
    "ContratoServiceTest",
    "ContratoFLSServiceTest",
    "ComisionCalculatorTest"
  ]
}
```

2. Crea el script de orquestación de regresión:

**`scripts/run-regression.ps1`:**
```powershell
# Script de regresión multi-org para ERP
param(
    [string]$Environment = "all",
    [string]$ApiVersion = "59"
)

$results = @()

function Run-Tests {
    param($OrgAlias, $TestLevel, $WaitMinutes, $SpecifiedTests)

    Write-Host "=== Ejecutando tests en $OrgAlias ==="
    Write-Host "Test Level: $TestLevel"
    Write-Host "Wait: ${WaitMinutes}min"

    $cmd = "sf apex run test --target-org $OrgAlias --test-level $TestLevel --wait $WaitMinutes --result-format json"

    if ($SpecifiedTests -and $TestLevel -eq "RunSpecifiedTests") {
        $classNames = ($SpecifiedTests -join ",")
        $cmd += " --class-names $classNames"
    }

    Write-Host "Comando: $cmd"

    # Ejecutar comando (simulado en script)
    $startTime = Get-Date
    try {
        $result = Invoke-Expression $cmd
        $elapsed = (Get-Date) - $startTime
        Write-Host "Tests completados en $($elapsed.TotalSeconds)s"

        return @{
            OrgAlias = $OrgAlias
            Status = "success"
            Duration = $elapsed.TotalSeconds
        }
    } catch {
        Write-Host "ERROR: $_"
        return @{
            OrgAlias = $OrgAlias
            Status = "failure"
            Error = $_.ToString()
        }
    }
}

# Determinar qué ambientes ejecutar
$environments = @()

switch ($Environment) {
    "dev" { $environments += @{name="dev"; type="scratch"; alias="DevOrg"; testLevel="RunLocalTests"; waitTime=10} }
    "staging" { $environments += @{name="staging"; type="sandbox"; alias="StagingOrg"; testLevel="RunLocalTests"; waitTime=20} }
    "production" { $environments += @{name="production"; type="production"; alias="ProdOrg"; testLevel="RunSpecifiedTests"; waitTime=30} }
    "all" {
        $environments = @(
            @{name="dev"; type="scratch"; alias="DevOrg"; testLevel="RunLocalTests"; waitTime=10},
            @{name="staging"; type="sandbox"; alias="StagingOrg"; testLevel="RunLocalTests"; waitTime=20},
            @{name="production"; type="production"; alias="ProdOrg"; testLevel="RunSpecifiedTests"; waitTime=30}
        )
    }
    default {
        Write-Host "Ambiente no reconocido: $Environment"
        exit 1
    }
}

# Producción solo tests específicos
$productionTests = @("ClienteServiceTest", "ContratoServiceTest", "ContratoFLSServiceTest", "ComisionCalculatorTest")

foreach ($env in $environments) {
    $specified = $null
    if ($env.testLevel -eq "RunSpecifiedTests") {
        $specified = $productionTests
    }

    $result = Run-Tests -OrgAlias $env.alias -TestLevel $env.testLevel -WaitMinutes $env.waitTime -SpecifiedTests $specified
    $results += $result
}

# Generar reporte consolidado
Write-Host "`n=== REPORTE DE REGRESIÓN MULTI-ORG ==="
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "`nResultados:"

foreach ($r in $results) {
    $icon = if ($r.Status -eq "success") { "✓" } else { "✗" }
    Write-Host "$icon $($r.OrgAlias): $($r.Status)"
    if ($r.Duration) { Write-Host "   Duración: $([math]::Round($r.Duration, 2))s" }
    if ($r.Error) { Write-Host "   Error: $($r.Error)" }
}

$allPassed = ($results | Where-Object { $_.Status -eq "failure" }).Count -eq 0
if ($allPassed) {
    Write-Host "`n✓ TODOS LOS AMBIENTES PASARON LAS PRUEBAS DE REGRESIÓN"
} else {
    Write-Host "`n✗ ALGUNOS AMBIENTES FALLARON LAS PRUEBAS DE REGRESIÓN"
    exit 1
}
```

3. Crea el workflow completo de regresión:

**`.github/workflows/multi-org-regression.yml`:**
```yaml
name: Multi-Org Regression ERP

on:
  push:
    branches: [main, release/*]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 4 * * 1-5' # Lun-Vie 4 AM

jobs:
  # --- DEV: Scratch Org ---
  dev-scratch:
    name: Dev (Scratch Org)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Instalar SF CLI
        run: npm install -g @salesforce/cli

      - name: Autenticar Dev Hub
        run: |
          echo "${{ secrets.SFDX_JWT_KEY }}" | base64 --decode > server.key
          sf org login jwt \
            --client-id ${{ secrets.SFDX_CLIENT_ID }} \
            --jwt-key-file server.key \
            --username ${{ secrets.SFDX_USERNAME }} \
            --set-default-dev-hub

      - name: Crear Scratch Org
        run: |
          sf org create scratch \
            --definition-file config/dev-scratch.json \
            --alias DevOrg --duration-days 1 --wait 10

      - name: Desplegar Source
        run: sf project deploy start --source-dir force-app/main/default --target-org DevOrg --wait 15

      - name: Ejecutar Tests
        id: dev-tests
        run: |
          sf apex run test \
            --target-org DevOrg --test-level RunLocalTests \
            --wait 10 --code-coverage --result-format json > dev-results.json

      - name: Extraer Resultados Dev
        id: dev-summary
        run: |
          echo "testsPassed=$(node -e "const d=require('./dev-results.json'); console.log(d.result.summary.testsPassed)")" >> $GITHUB_OUTPUT
          echo "testsFailed=$(node -e "const d=require('./dev-results.json'); console.log(d.result.summary.testsFailed)")" >> $GITHUB_OUTPUT
          echo "coverage=$(node -e "const d=require('./dev-results.json'); const c=d.result.summary.testRunCoverage; console.log(c?c.coveredPercent:0)")" >> $GITHUB_OUTPUT

      - name: Subir Resultados Dev
        uses: actions/upload-artifact@v3
        with:
          name: dev-results
          path: dev-results.json

      - name: Eliminar Scratch Org
        if: always()
        run: sf org delete scratch --target-org DevOrg

    outputs:
      passed: ${{ steps.dev-summary.outputs.testsPassed }}
      failed: ${{ steps.dev-summary.outputs.testsFailed }}
      coverage: ${{ steps.dev-summary.outputs.coverage }}

  # --- STAGING: Sandbox ---
  staging-sandbox:
    name: Staging (Sandbox)
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Instalar SF CLI
        run: npm install -g @salesforce/cli

      - name: Autenticar en Staging
        run: |
          echo "${{ secrets.SFDX_JWT_KEY_STAGING }}" | base64 --decode > server.key
          sf org login jwt \
            --client-id ${{ secrets.SFDX_CLIENT_ID_STAGING }} \
            --jwt-key-file server.key \
            --username ${{ secrets.SFDX_USERNAME_STAGING }} \
            --alias StagingOrg

      - name: Desplegar a Staging
        run: sf project deploy start --source-dir force-app/main/default --target-org StagingOrg --wait 30

      - name: Ejecutar Tests en Staging
        id: staging-tests
        run: |
          sf apex run test \
            --target-org StagingOrg --test-level RunLocalTests \
            --wait 20 --code-coverage --result-format json > staging-results.json

      - name: Extraer Resultados Staging
        id: staging-summary
        run: |
          echo "testsPassed=$(node -e "const d=require('./staging-results.json'); console.log(d.result.summary.testsPassed)")" >> $GITHUB_OUTPUT
          echo "testsFailed=$(node -e "const d=require('./staging-results.json'); console.log(d.result.summary.testsFailed)")" >> $GITHUB_OUTPUT
          echo "coverage=$(node -e "const d=require('./staging-results.json'); const c=d.result.summary.testRunCoverage; console.log(c?c.coveredPercent:0)")" >> $GITHUB_OUTPUT

      - name: Subir Resultados Staging
        uses: actions/upload-artifact@v3
        with:
          name: staging-results
          path: staging-results.json

    outputs:
      passed: ${{ steps.staging-summary.outputs.testsPassed }}
      failed: ${{ steps.staging-summary.outputs.testsFailed }}
      coverage: ${{ steps.staging-summary.outputs.coverage }}

  # --- PRODUCCIÓN: Solo tests selectos ---
  production-select:
    name: Producción (Selectivos)
    runs-on: ubuntu-latest
    environment: production
    needs: [dev-scratch, staging-sandbox]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Instalar SF CLI
        run: npm install -g @salesforce/cli

      - name: Autenticar en Producción
        run: |
          echo "${{ secrets.SFDX_JWT_KEY_PROD }}" | base64 --decode > server.key
          sf org login jwt \
            --client-id ${{ secrets.SFDX_CLIENT_ID_PROD }} \
            --jwt-key-file server.key \
            --username ${{ secrets.SFDX_USERNAME_PROD }} \
            --alias ProdOrg

      - name: Validar Deploy Pre-Producción
        run: |
          sf project deploy start \
            --source-dir force-app/main/default \
            --target-org ProdOrg \
            --check-only --wait 20

      - name: Ejecutar Tests Selectos en Producción
        id: prod-tests
        run: |
          sf apex run test \
            --target-org ProdOrg \
            --test-level RunSpecifiedTests \
            --class-names "ClienteServiceTest,ContratoServiceTest,ContratoFLSServiceTest,ComisionCalculatorTest" \
            --wait 30 --code-coverage --result-format json > prod-results.json

      - name: Extraer Resultados Producción
        id: prod-summary
        run: |
          echo "testsPassed=$(node -e "const d=require('./prod-results.json'); console.log(d.result.summary.testsPassed)")" >> $GITHUB_OUTPUT
          echo "testsFailed=$(node -e "const d=require('./prod-results.json'); console.log(d.result.summary.testsFailed)")" >> $GITHUB_OUTPUT
          echo "coverage=$(node -e "const d=require('./prod-results.json'); const c=d.result.summary.testRunCoverage; console.log(c?c.coveredPercent:0)")" >> $GITHUB_OUTPUT

      - name: Subir Resultados Producción
        uses: actions/upload-artifact@v3
        with:
          name: prod-results
          path: prod-results.json

    outputs:
      passed: ${{ steps.prod-summary.outputs.testsPassed }}
      failed: ${{ steps.prod-summary.outputs.testsFailed }}
      coverage: ${{ steps.prod-summary.outputs.coverage }}

  # --- CONSOLIDACIÓN: Comparar resultados ---
  consolidation:
    name: Consolidación y Comparativa
    needs: [dev-scratch, staging-sandbox, production-select]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Descargar Resultados
        uses: actions/download-artifact@v3
        with:
          path: results/

      - name: Generar Reporte Comparativo
        run: |
          $REPORT = @"
          # Reporte de Regresión Multi-Org ERP

          **Fecha:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

          ## Resultados por Ambiente

          | Ambiente | Tests Pasados | Tests Fallidos | Cobertura |
          |----------|:------------:|:--------------:|:---------:|
          | Dev (Scratch) | ${{ needs.dev-scratch.outputs.passed || 'N/A' }} | ${{ needs.dev-scratch.outputs.failed || 'N/A' }} | ${{ needs.dev-scratch.outputs.coverage || 'N/A' }}% |
          | Staging (Sandbox) | ${{ needs.staging-sandbox.outputs.passed || 'N/A' }} | ${{ needs.staging-sandbox.outputs.failed || 'N/A' }} | ${{ needs.staging-sandbox.outputs.coverage || 'N/A' }}% |
          | Producción | ${{ needs.production-select.outputs.passed || 'N/A' }} | ${{ needs.production-select.outputs.failed || 'N/A' }} | ${{ needs.production-select.outputs.coverage || 'N/A' }}% |

          ## Evaluación

          - **Dev:** ${{ needs.dev-scratch.result }}
          - **Staging:** ${{ needs.staging-sandbox.result }}
          - **Producción:** ${{ needs.production-select.result }}

          ## Estados

          - **Pipeline:** ${{ needs.dev-scratch.result == 'success' && needs.staging-sandbox.result == 'success' && needs.production-select.result == 'success' && '✅ APROBADO' || '❌ RECHAZADO' }}

          "@

          Set-Content -Path "regression-report.md" -Value $REPORT

      - name: Subir Reporte Consolidado
        uses: actions/upload-artifact@v3
        with:
          name: regression-report
          path: regression-report.md

      - name: Notificar Resultado Consolidado
        run: |
          $STATUS = "${{ needs.dev-scratch.result }}-${{ needs.staging-sandbox.result }}-${{ needs.production-select.result }}"
          if ($STATUS -eq "success-success-success") {
            Write-Host "✅ REGRESIÓN COMPLETA APROBADA EN TODOS LOS AMBIENTES"
          } else {
            Write-Host "❌ REGRESIÓN FALLÓ EN ALGÚN AMBIENTE"
            exit 1
          }
```

4. Configura los secretos adicionales para staging y producción:
```bash
gh secret set SFDX_CLIENT_ID_STAGING --body "consumer-key-staging"
gh secret set SFDX_USERNAME_STAGING --body "username-staging"
gh secret set SFDX_CLIENT_ID_PROD --body "consumer-key-prod"
gh secret set SFDX_USERNAME_PROD --body "username-prod"
gh secret set SFDX_JWT_KEY_STAGING < server.key.b64
gh secret set SFDX_JWT_KEY_PROD < server.key.b64
```

5. Commit y push del workflow:
```bash
git add .github/workflows/multi-org-regression.yml config/ scripts/
git commit -m "feat: multi-org regression testing pipeline for ERP"
git push origin main
```

6. Puntos clave sobre Multi-Org Regression:
   - **Cobertura progresiva**: Dev (100% tests) → Staging (100% tests) → Producción (tests selectos).
   - **Ambientes separados**: Cada uno con sus propios secretos y credenciales.
   - **Gates por ambiente**: Dev y staging deben pasar para que producción se ejecute.
   - **Comparativa**: El reporte consolidado compara resultados entre ambientes.
   - **Fall-fast vs matrix**: Con `fail-fast: false` todos los ambientes corren incluso si uno falla.
   - **Schedule**: Regresión automática cada mañana para detectar regresiones temprano.
