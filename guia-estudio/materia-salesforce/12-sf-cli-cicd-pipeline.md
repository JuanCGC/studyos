# 📘 12. SF CLI + CI/CD Pipeline

- **Concepto Clave Asimilado:** Automatización de despliegues y ejecución de pruebas usando Salesforce CLI en GitHub Actions. Pipeline CI/CD completo con gates de calidad.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** SF CLI en GHA — Workflow mínimo: autenticación con JWT, deploy de source y ejecución de tests Apex

**Instrucciones:**

1. Prepara los secretos en GitHub:
   - `SFDX_AUTH_URL`: URL de autenticación del Dev Hub
   - `SFDX_CLIENT_ID`: Consumer Key de la Connected App
   - `SFDX_JWT_KEY`: Llave privada para autenticación JWT (en base64)

2. Crea el directorio `.github/workflows/` si no existe.

3. Crea el workflow `sf-ci-minimal.yml`:

**`.github/workflows/sf-ci-minimal.yml`:**
```yaml
name: Salesforce CI - Mínimo

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Instalar SF CLI
        run: |
          npm install -g @salesforce/cli
          sf version

      - name: Autenticar con Dev Hub vía JWT
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
            --alias CIOrg \
            --duration-days 1 \
            --wait 5
          sf org list

      - name: Desplegar Source
        run: |
          sf project deploy start \
            --source-dir force-app/main/default \
            --target-org CIOrg \
            --wait 10

      - name: Ejecutar Tests Apex
        run: |
          sf apex run test \
            --target-org CIOrg \
            --test-level RunLocalTests \
            --wait 10 \
            --result-format human

      - name: Eliminar Scratch Org
        if: always()
        run: sf org delete scratch --target-org CIOrg
```

4. Sube el workflow a GitHub y verifica que se ejecuta:
```bash
git add .github/
git commit -m "feat: add minimal CI workflow with SF CLI"
git push origin main
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Pipeline ERP Completo — Jobs secuenciales: deploy a scratch org → run Apex tests → run LWC Jest → code coverage gate > 75% → deploy a staging → notify Slack

**Instrucciones:**

1. Crea el workflow completo `erp-pipeline.yml`:

**`.github/workflows/erp-pipeline.yml`:**
```yaml
name: ERP Pipeline Completo

on:
  push:
    branches: [main, develop, release/*]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  SF_ORG_ALIAS: CIOrg
  STAGING_ORG_ALIAS: StagingOrg
  COVERAGE_THRESHOLD: 75

jobs:
  # Job 1: Análisis y validación de código
  lint-and-validate:
    name: Lint & Validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Instalar dependencias
        run: npm ci

      - name: Validar metadatos XML
        run: |
          echo "Validando archivos XML de metadatos..."
          # Buscar archivos XML mal formados
          for file in $(find force-app -name "*.xml"); do
            if ! xmllint --noout "$file" 2>/dev/null; then
              echo "ERROR: Archivo XML inválido: $file"
              exit 1
            fi
          done
          echo "Todos los XML son válidos."

      - name: Verificar estructura del proyecto
        run: |
          test -d force-app/main/default/classes || { echo "No existe directorio classes"; exit 1; }
          test -d force-app/main/default/objects || { echo "No existe directorio objects"; exit 1; }
          test -f config/dev-scratch.json || { echo "No existe config/dev-scratch.json"; exit 1; }
          echo "Estructura de proyecto válida."

  # Job 2: Tests Apex en Scratch Org
  apex-tests:
    name: Apex Tests
    needs: lint-and-validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Instalar SF CLI
        run: npm install -g @salesforce/cli

      - name: Autenticar con Dev Hub
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
            --alias ${{ env.SF_ORG_ALIAS }} \
            --duration-days 1 \
            --wait 10

      - name: Desplegar Source
        run: |
          sf project deploy start \
            --source-dir force-app/main/default \
            --target-org ${{ env.SF_ORG_ALIAS }} \
            --wait 15

      - name: Ejecutar Tests Apex con Cobertura
        id: apex-tests
        run: |
          sf apex run test \
            --target-org ${{ env.SF_ORG_ALIAS }} \
            --test-level RunLocalTests \
            --wait 15 \
            --code-coverage \
            --result-format json \
            > apex-test-results.json

      - name: Extraer y Validar Cobertura
        id: coverage-check
        run: |
          # Extraer cobertura total del JSON
          TOTAL_COVERAGE=$(node -e "
            const data = require('./apex-test-results.json');
            const summary = data.result.summary;
            const covered = summary.testRunCoverage ? summary.testRunCoverage.coveredPercent : 0;
            console.log(covered);
          ")
          echo "Cobertura total: $TOTAL_COVERAGE%"
          echo "coverage=$TOTAL_COVERAGE" >> $GITHUB_OUTPUT

          if (( $(echo "$TOTAL_COVERAGE < ${{ env.COVERAGE_THRESHOLD }}" | bc -l) )); then
            echo "ERROR: Cobertura $TOTAL_COVERAGE% es menor al umbral ${{ env.COVERAGE_THRESHOLD }}%"
            exit 1
          fi
          echo "Cobertura supera el umbral del ${{ env.COVERAGE_THRESHOLD }}%"

      - name: Generar Reporte HTML de Tests
        if: always()
        run: |
          sf apex get report \
            --target-org ${{ env.SF_ORG_ALIAS }} \
            --test-run-id $(cat apex-test-results.json | node -e "process.stdout.write(require('fs').readFileSync('/dev/stdin','utf8').result.summary.testRunId)") \
            --output-dir test-reports

      - name: Subir Reporte de Tests
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: apex-test-reports
          path: test-reports/

      - name: Eliminar Scratch Org
        if: always()
        run: sf org delete scratch --target-org ${{ env.SF_ORG_ALIAS }}

    outputs:
      coverage: ${{ steps.coverage-check.outputs.coverage }}

  # Job 3: Tests Jest para LWC
  jest-tests:
    name: LWC Jest Tests
    needs: lint-and-validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Cache Node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar Tests Jest con Cobertura
        id: jest-tests
        run: |
          npx jest --coverage --testPathPattern="force-app/main/default/lwc" \
            --json --outputFile=jest-results.json

      - name: Validar Cobertura Jest
        run: |
          COVERAGE=$(node -e "
            const data = require('./jest-results.json');
            const total = data.coverageMap ? data.coverageMap.total : null;
            if (total) {
              const lines = total.lines.pct;
              const statements = total.statements.pct;
              const avg = (lines + statements) / 2;
              console.log(avg);
            } else {
              console.log('0');
            }
          ")
          echo "Cobertura Jest: $COVERAGE%"

      - name: Subir Reporte Jest
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: jest-coverage
          path: coverage/

  # Job 4: Deploy a Staging
  deploy-staging:
    name: Deploy a Staging
    needs: [apex-tests, jest-tests]
    if: github.ref == 'refs/heads/main' && needs.apex-tests.result == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Instalar SF CLI
        run: npm install -g @salesforce/cli

      - name: Autenticar en Staging
        run: |
          echo "${{ secrets.SFDX_JWT_KEY_STAGING }}" | base64 --decode > server.key
          sf org login jwt \
            --client-id ${{ secrets.SFDX_CLIENT_ID_STAGING }} \
            --jwt-key-file server.key \
            --username ${{ secrets.SFDX_USERNAME_STAGING }} \
            --alias ${{ env.STAGING_ORG_ALIAS }}

      - name: Validar Deploy (Check Only)
        run: |
          sf project deploy start \
            --source-dir force-app/main/default \
            --target-org ${{ env.STAGING_ORG_ALIAS }} \
            --check-only \
            --wait 10

      - name: Deploy a Staging
        run: |
          sf project deploy start \
            --source-dir force-app/main/default \
            --target-org ${{ env.STAGING_ORG_ALIAS }} \
            --wait 20

      - name: Ejecutar Tests en Staging
        run: |
          sf apex run test \
            --target-org ${{ env.STAGING_ORG_ALIAS }} \
            --test-level RunLocalTests \
            --wait 15

      - name: Verificar Estado del Deploy
        run: |
          sf project deploy report \
            --target-org ${{ env.STAGING_ORG_ALIAS }}

  # Job 5: Notificar a Slack
  notify:
    name: Notificar Resultados
    needs: [apex-tests, jest-tests, deploy-staging]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Determinar Estado General
        id: status
        run: |
          APEX_STATUS="${{ needs.apex-tests.result }}"
          JEST_STATUS="${{ needs.jest-tests.result }}"
          DEPLOY_STATUS="${{ needs.deploy-staging.result }}"

          if [ "$APEX_STATUS" == "success" ] && [ "$JEST_STATUS" == "success" ] && [ "$DEPLOY_STATUS" == "success" ]; then
            echo "status=success" >> $GITHUB_OUTPUT
            echo "mensaje=Pipeline ERP completado exitosamente" >> $GITHUB_OUTPUT
          else
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "mensaje=Pipeline ERP falló: Apex=$APEX_STATUS Jest=$JEST_STATUS Deploy=$DEPLOY_STATUS" >> $GITHUB_OUTPUT
          fi

      - name: Notificar a Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "[ERP] Pipeline ${{ steps.status.outputs.status }}: ${{ steps.status.outputs.mensaje }}%0ACobertura Apex: ${{ needs.apex-tests.outputs.coverage }}%%0ARama: ${{ github.ref_name }}%0ACommit: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

2. Crea el archivo de configuración para el pipeline:

**`.github/workflows/erp-pipeline-README.md`:**
```markdown
# ERP Pipeline CI/CD

## Jobs

1. **Lint & Validate**: Valida XML de metadatos y estructura del proyecto
2. **Apex Tests**: Crea scratch org, deploy source, ejecuta tests con cobertura > 75%
3. **LWC Jest Tests**: Tests unitarios de componentes LWC
4. **Deploy a Staging**: Deploy a staging si todos los tests pasan (solo main)
5. **Notify Slack**: Notifica resultado del pipeline

## Secretos Requeridos

| Secreto | Propósito |
|---------|-----------|
| SFDX_CLIENT_ID | Consumer Key de Connected App (Dev Hub) |
| SFDX_JWT_KEY | Llave privada JWT (base64) |
| SFDX_USERNAME | Username del Dev Hub |
| SFDX_CLIENT_ID_STAGING | Consumer Key para staging |
| SFDX_JWT_KEY_STAGING | Llave privada JWT para staging |
| SFDX_USERNAME_STAGING | Username del staging |
| SLACK_WEBHOOK_URL | Webhook de Slack para notificaciones |

## Gates de Calidad

- Cobertura Apex mínima: 75%
- Todos los tests Apex deben pasar
- Todos los tests Jest deben pasar
- Deploy a staging solo desde main
- Validación pre-deploy (check-only) antes del deploy real
```

3. Crea el archivo de configuración de scratch org para CI:

**`config/project-scratch-def.json`** (versión CI):
```json
{
  "orgName": "ERP CI - {{ENV}}",
  "edition": "Developer",
  "features": ["API", "DebugApex", "PlatformEvents"],
  "settings": {
    "orgPreferenceSettings": {
      "s1DesktopEnabled": true,
      "selfSetPasswordInApi": true
    }
  }
}
```

4. Configura los secretos en GitHub:
```bash
gh secret set SFDX_CLIENT_ID --body "tu-consumer-key"
gh secret set SFDX_USERNAME --body "tu-dev-hub-username"
gh secret set SFDX_CLIENT_ID_STAGING --body "tu-consumer-key-staging"
gh secret set SFDX_USERNAME_STAGING --body "tu-staging-username"
gh secret set SLACK_WEBHOOK_URL --body "tu-webhook-url"

# La llave JWT debe estar en base64
base64 -w0 server.key > server.key.b64
gh secret set SFDX_JWT_KEY < server.key.b64
gh secret set SFDX_JWT_KEY_STAGING < server.key.b64
```

5. Verifica el pipeline en GitHub Actions:
```bash
git add .github/
git commit -m "feat: complete ERP CI/CD pipeline with coverage gates and Slack notification"
git push origin main
```

6. Monitorea la ejecución en GitHub → Actions → ERP Pipeline Completo.
