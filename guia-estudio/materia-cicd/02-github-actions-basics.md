# 📘 02. GitHub Actions Basics

- **Concepto Clave Asimilado:** GitHub Actions es un motor de automatización basado en eventos que ejecuta workflows definidos en YAML dentro del repositorio.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Hello World Workflow — Workflow mínimo que se activa con `push`, hace checkout del código y saluda.

**Instrucciones:**

1. Crear `.github/workflows/hello.yml`:

```yaml
name: Hello World
on: [push]

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Say Hello
        run: echo "Hello, CI/CD World!"

      - name: Show repo files
        run: ls -la

      - name: Print event info
        run: |
          echo "Event: ${{ github.event_name }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
```

2. Haz push al repositorio y revisa la ejecución en Actions.

**Salida esperada:**
```
Hello, CI/CD World!
total 16
drwxr-xr-x ...
...
Event: push
Branch: main
Commit: a1b2c3d...
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Pipeline Base de Integración — Workflow que corre en push a `main`, configura Node.js, instala dependencias y ejecuta tests.

**Instrucciones:**

1. Crear `.github/workflows/base-integracion.yml`:

```yaml
name: Base de Integración
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  NODE_ENV: test

jobs:
  lint:
    name: 📝 Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test-unit:
    name: 🧪 Unit Tests
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  build:
    name: 📦 Build
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

2. Crear un `package.json` mínimo si no existe:

```json
{
  "name": "api-logistica",
  "version": "1.0.0",
  "scripts": {
    "lint": "echo 'Linting passed'",
    "test": "echo 'Tests passed'",
    "build": "echo 'Build complete'"
  }
}
```

3. Haz push a `main` y verifica la ejecución.

**Conceptos cubiertos:**

| Elemento              | Propósito                                      |
| --------------------- | ---------------------------------------------- |
| `on: [push, PR]`      | Disparadores del workflow                      |
| `concurrency`         | Cancela ejecuciones previas en la misma rama   |
| `env`                 | Variables de entorno compartidas               |
| `actions/checkout`    | Clona el repositorio en el runner              |
| `actions/setup-node`  | Configura Node.js con caché de npm             |
| `npm ci`              | Instalación limpia (basada en package-lock)    |
| `actions/upload-artifact` | Sube artefactos para jobs posteriores     |
| `needs:`              | Dependencia entre jobs                         |

**Convenciones importantes:**

- `.github/workflows/` es la ubicación obligatoria para los workflows
- Cada workflow es un archivo YAML independiente
- `npm ci` es preferible a `npm install` en CI por ser más rápido y determinista
- La caché de `setup-node` acelera las instalaciones posteriores

---

**✅ Criterio de éxito:** El pipeline ejecuta lint → test → build secuencialmente, con caché de dependencias y subida de artefacts.
