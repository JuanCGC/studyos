# 📘 [08. Security Checklist — IDOR, XSS]

- **Concepto Clave Asimilado:** Detección de Insecure Direct Object References, Cross-Site Scripting en payloads.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** IDOR Simulado — User A crea recurso, User B intenta acceder.

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Security Hardening Bancario — Tests: usuario no puede ver cuenta de otro (IDOR), endpoint rechaza `<script>` en campos de texto (XSS), SQL injection en query params, rate limiting (429 después de N requests).
