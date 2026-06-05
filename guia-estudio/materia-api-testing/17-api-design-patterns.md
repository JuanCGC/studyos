# 📘 [17. API Design Patterns]

- **Concepto Clave Asimilado:** Patrones de diseño de APIs REST: HATEOAS, paginación, versionado, idempotencia.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Idempotency Test — Enviar mismo POST /posts dos veces, verificar que JSONPlaceholder genere IDs diferentes (no es idempotente). Luego PUT /posts/1 dos veces → mismo resultado.

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Idempotencia Bancaria — Tests para: POST /transactions con idempotency-key (misma key → mismo resultado), paginación con links HATEOAS, versionado de API (/v1/, /v2/).
