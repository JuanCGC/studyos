# 📘 [02. Validaciones de Esquemas y Contratos]

- **Concepto Clave Asimilado:** Aserciones rígidas de tipos de datos, obligatoriedad de campos y validación estricta de JSON Schema.

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)
- **Desafío:** Validador de Tipos Aislado — Crear un schema JSON estricto para un perfil de usuario y contrastarlo contra respuestas de JSONPlaceholder `/users/1`.

**Instrucciones:**
1. Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "pattern": "^[\\w.-]+@[\\w.-]+\\.\\w+$" },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      },
      "required": ["street", "city"]
    }
  },
  "required": ["id", "name", "email", "address"],
  "additionalProperties": false
}
```
2. Validar contra `GET /users/1` → debe pasar
3. Modificar schema: cambiar `email` a `type: "number"` → validación falla
4. Usar online validator (https://www.jsonschemavalidator.net) o Postman con tv4

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia
- **Evolución del Software:** Validación de Contrato del Historial de Transacciones — Desarrollar la suite externa que verifique que `GET /transactions` cumpla al 100% con: fechas ISO 8601, montos como número flotante con 2 decimales, arreglo obligatorio aunque vacío, campos `type` enum ["DEPOSIT", "WITHDRAWAL", "TRANSFER"].

**Instrucciones:**
1. Crear `schemas/transaction-schema.json` con:
   - `transactionId`: string, pattern `^txn-[a-z0-9]+$`
   - `amount`: number, exclusiveMinimum: 0
   - `currency`: string, enum ["USD", "EUR", "MXN"]
   - `type`: string, enum ["DEPOSIT", "WITHDRAWAL", "TRANSFER"]
   - `timestamp`: string, format: "date-time"
   - `description`: string
   - `status`: string, enum ["PENDING", "COMPLETED", "FAILED"]
2. Validar `GET /transactions` contra schema
3. Validar `GET /transactions?status=PENDING` contra schema
4. Schema para array de transacciones: `type: array, items: { $ref: "#/$defs/transaction" }`
