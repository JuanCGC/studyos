# 📘 10. GitHub Actions + Newman

- **Concepto Clave Asimilado:** Integración de Newman en pipelines de CI/CD con GitHub Actions para ejecutar tests de API automáticamente en cada push o schedule.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** GHA + Newman Mínimo — Workflow mínimo que instala Node.js, instala Newman y corre una colección contra JSONPlaceholder.

**Instrucciones:**

1. En tu repositorio de GitHub, crear la carpeta `.github/workflows/`.

2. Crear archivo `.github/workflows/newman-hello.yml`:

```yaml
name: Newman Hello World

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  newman-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Newman
        run: npm install -g newman

      - name: Run Newman collection
        run: |
          newman run newman-hello-collection.json \
            -e newman-hello-env.json \
            --reporters cli
```

3. Subir también los archivos `newman-hello-collection.json` y `newman-hello-env.json` al repositorio (en la raíz).

4. Ir a GitHub → **Actions** → ver el workflow ejecutándose.
5. Verificar que el paso "Run Newman collection" muestre los tests en verde.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Pipeline de Logística Completo — GHA con matrix de entornos (staging, production), artefactos HTML, notificación Slack.

**Instrucciones:**

1. Crear archivo `.github/workflows/logistica-pipeline.yml`:

```yaml
name: Pipeline de Logística

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * *'   # 6 AM todos los días
  workflow_dispatch:
    inputs:
      environment:
        description: 'Entorno a probar'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      iterations:
        description: 'Número de iteraciones'
        required: false
        default: '10'

jobs:
  # Job 1: Ejecutar tests de logística
  run-tests:
    strategy:
      matrix:
        environment: [staging, production]
      fail-fast: false

    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Cache Node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Install Newman and reporters
        run: |
          npm install -g newman newman-reporter-htmlextra newman-reporter-junitfull

      - name: Determine environment files
        id: env-files
        run: |
          if [ "${{ matrix.environment }}" == "production" ]; then
            echo "env_file=logistica-env-prod.json" >> $GITHUB_OUTPUT
          else
            echo "env_file=logistica-env.json" >> $GITHUB_OUTPUT
          fi

      - name: Run logistics test suite
        id: newman-run
        continue-on-error: true
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          REPORT_DIR="./reports/$TIMESTAMP"
          mkdir -p "$REPORT_DIR"

          ITERATIONS=${{ github.event.inputs.iterations || '10' }}

          newman run logistica-collection.json \
            -e ${{ steps.env-files.outputs.env_file }} \
            --iteration-count $ITERATIONS \
            --delay-request 50 \
            --timeout-request 10000 \
            --reporters cli,htmlextra,junitfull \
            --reporter-htmlextra-export "$REPORT_DIR/logistica-report-${{ matrix.environment }}.html" \
            --reporter-htmlextra-title "Logística API - ${{ matrix.environment }}" \
            --reporter-junitfull-export "$REPORT_DIR/junit-${{ matrix.environment }}.xml" \
            --color on

          echo "report_path=$REPORT_DIR" >> $GITHUB_OUTPUT

      - name: Upload HTML report artifact
        uses: actions/upload-artifact@v4
        with:
          name: logistica-report-${{ matrix.environment }}
          path: ${{ steps.newman-run.outputs.report_path }}/
          retention-days: 30

      - name: Upload JUnit results
        uses: actions/upload-artifact@v4
        with:
          name: junit-results-${{ matrix.environment }}
          path: ${{ steps.newman-run.outputs.report_path }}/junit-${{ matrix.environment }}.xml
          retention-days: 90

      - name: Check test results
        if: steps.newman-run.outcome == 'failure'
        run: |
          echo "❌ Tests fallaron en entorno ${{ matrix.environment }}"
          exit 1

  # Job 2: Publish reports to GitHub Pages (opcional)
  publish-reports:
    needs: run-tests
    if: github.ref == 'refs/heads/main' && success()
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4

  # Job 3: Notify Slack (opcional)
  notify-slack:
    needs: [run-tests, publish-reports]
    if: always() && github.event_name != 'pull_request'
    runs-on: ubuntu-latest

    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Pipeline de Logística completado\nEntornos: staging, production\nResultado: ${{ needs.run-tests.result }}\nVer reportes: ${{ needs.publish-reports.outputs.page_url }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        continue-on-error: true
```

2. Agregar secrets de repositorio en GitHub:
   - `SLACK_WEBHOOK_URL` — URL del webhook de Slack para notificaciones.

3. Subir los archivos de colección y entorno al repositorio.

4. Ver el pipeline corriendo en GitHub Actions → pestaña **Actions**.

5. Probar manualmente desde GitHub con **workflow_dispatch** seleccionando entorno `staging` y `5` iteraciones.

6. Revisar los artefactos descargables: reportes HTML por entorno.
