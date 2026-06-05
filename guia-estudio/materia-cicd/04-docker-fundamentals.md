# 📘 04. Docker Fundamentals

- **Concepto Clave Asimilado:** Docker empaqueta aplicaciones y dependencias en contenedores ligeros y portables que se ejecutan de forma consistente en cualquier entorno.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Docker Hello World — Crear un Dockerfile simple con Nginx, hacer build y correr el contenedor.

**Instrucciones:**

1. Crear `Dockerfile`:

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
HEALTHCHECK --interval=5s --timeout=3s CMD wget -qO- http://localhost:80 || exit 1
```

2. Crear `index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>CI/CD Docker</title></head>
<body>
  <h1>🚀 Hola desde Docker</h1>
  <p>Pipeline CI/CD - Fundamentos Docker</p>
</body>
</html>
```

3. Build y ejecución:

```bash
# Construir la imagen
docker build -t hello-cicd .

# Ejecutar el contenedor
docker run -d -p 8080:80 --name hello-container hello-cicd

# Verificar
curl http://localhost:8080

# Limpiar
docker stop hello-container && docker rm hello-container
```

**Salida esperada:**
```
<!DOCTYPE html>
<html>
<head><title>CI/CD Docker</title></head>
<body>
  <h1>🚀 Hola desde Docker</h1>
  <p>Pipeline CI/CD - Fundamentos Docker</p>
</body>
</html>
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Dockerfile para API de Logística — Multi-stage build con Maven para compilar y JRE slim para ejecutar, con healthcheck.

**Instrucciones:**

1. Crear `Dockerfile` para la API Java de logística:

```dockerfile
# ============================================================
# STAGE 1: Build
# ============================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copiar solo POM primero para cachear dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# STAGE 2: Runtime
# ============================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# Seguridad: crear usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar solo el JAR desde builder
COPY --from=builder /app/target/api-logistica-*.jar app.jar

# Healthcheck contra el endpoint de salud
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Puerto de la aplicación
EXPOSE 8080

# Usuario no-root
USER appuser

# Punto de entrada
ENTRYPOINT ["java", "-jar", "app.jar"]
```

2. Crear `.dockerignore`:

```dockerignore
.git
.gitignore
node_modules
target/*.jar
target/*.war
*.md
.DS_Store
docker-compose*.yml
README.md
```

3. Build de la imagen multi-stage:

```bash
docker build -t api-logistica:latest .

# Verificar las capas
docker history api-logistica:latest

# Escanear vulnerabilidades
docker scout quickview api-logistica:latest
```

**Beneficios del multi-stage:**

| Aspecto           | Builder                    | Runtime                     |
| ----------------- | -------------------------- | --------------------------- |
| Base image        | maven:3.9-eclipse-temurin  | eclipse-temurin:17-jre-alpine |
| Tamaño aprox.     | ~700 MB                    | ~180 MB                     |
| Contiene          | JDK, Maven, código fuente  | JRE mínimo, solo JAR        |
| Uso               | Solo compilar               | Solo ejecutar               |

**Mejores prácticas aplicadas:**

| Práctica                  | Implementación                               |
| ------------------------- | -------------------------------------------- |
| Multi-stage build         | Compilar y ejecutar en imágenes separadas    |
| Capas cacheables          | POM primero, luego source                    |
| Imagen mínima             | Alpine + JRE en lugar de JDK completo        |
| No-root                   | `adduser` + `USER appuser`                   |
| Healthcheck declarativo   | `HEALTHCHECK` con wget                       |
| Puerto explícito          | `EXPOSE 8080`                                |
| .dockerignore             | Excluir archivos innecesarios del contexto   |
| Argumentos JVM            | `-jar` directo (sin catalina.sh inecesario)  |

---

**✅ Criterio de éxito:** La imagen multi-stage compila correctamente, pesa menos de 200 MB en runtime y el healthcheck responde 200 OK.
