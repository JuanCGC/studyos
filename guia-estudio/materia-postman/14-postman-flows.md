# 📘 14. Postman Flows

- **Concepto Clave Asimilado:** Postman Flows — herramienta visual para crear automatizaciones arrastrando bloques, conectando requests, transformando datos y ejecutando lógica condicional.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Flow Visual Simple — Flow que hace un `GET` a JSONPlaceholder, extrae datos del response, y hace un `POST` con esos datos.

**Instrucciones:**

1. Ir a Postman → pestaña **Flows** (en el sidebar izquierdo).

2. Hacer clic en **Create a Flow**.

3. Nombrar el Flow: `GET → POST Pipeline`.

4. Arrastrar un bloque **Send Request** al canvas.
   - Configurar: `GET https://jsonplaceholder.typicode.com/posts/1`
   - Conectar la salida (output) a un bloque **Parse JSON**.

5. Agregar bloque **Parse JSON**:
   - Conectarlo al output del Send Request.
   - Extraer: `{{response.body.title}}` y `{{response.body.userId}}`
   - Conectar output a un bloque siguiente.

6. Agregar bloque **Send Request** (segundo):
   - Configurar: `POST https://jsonplaceholder.typicode.com/posts`
   - Body:
     ```json
     {
         "title": "{{title}}",
         "body": "Created via Postman Flows",
         "userId": {{userId}}
     }
     ```
   - Usar las variables extraídas del paso anterior (`title`, `userId`).

7. Agregar bloque **Parse JSON** (segundo):
   - Conectar al output del segundo request.
   - Extraer `id` y mostrarlo.

8. Agregar bloque **Console** para ver el resultado final.

9. Hacer clic en **Run** y observar el flujo ejecutándose paso a paso.

10. Verificar que el Console muestre el ID del post creado correctamente.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Automation Flow de Reabastecimiento — Flow visual que verifica stock bajo, ordena reposición, notifica al proveedor y actualiza el inventario.

**Instrucciones:**

1. Crear un nuevo Flow llamado `Reabastecimiento Automático`.

2. **Bloque 1: Schedule Trigger**
   - Configurar: **Run on schedule** — cada 30 minutos.
   - También agregar botón **Run Manually** para pruebas.

3. **Bloque 2: Check Stock (Send Request)**
   - Configurar: `GET {{base_url}}/warehouses/{{warehouse_id}}/stock`
   - Headers: `Authorization: Bearer {{token}}`

4. **Bloque 3: Parse JSON (Stock)**
   - Conectar a la respuesta del stock check.
   - Extraer la lista de `items` del response.

5. **Bloque 4: Filter Array**
   - Configurar filtro: `item.quantity < item.minThreshold`
   - Esto produce un array con solo los productos que necesitan reposición.

6. **Bloque 5: Select (if empty → end)**
   - Usar bloque **Condition** para verificar si hay items con stock bajo.
   - Si el array filtrado está vacío → terminar el flujo.
   - Si hay items → continuar.

7. **Bloque 6: For Each (Loop)**
   - Iterar sobre cada item con stock bajo.
   - Para cada item, ejecutar los siguientes pasos.

8. **Bloque 7: Send Request (Create Reorder)**
   - Configurar: `POST {{base_url}}/inventory/reorder`
   - Body (usando datos del item actual):
     ```json
     {
         "warehouseId": "{{warehouse_id}}",
         "productId": "{{item.productId}}",
         "quantity": {{item.minThreshold}} * 2,
         "reason": "AUTO_REORDER",
         "triggeredBy": "Postman Flows"
     }
     ```
   - Headers: `Authorization: Bearer {{token}}`

9. **Bloque 8: Parse JSON (Reorder Response)**
   - Extraer `reorderId`, `productId`, `quantity`.

10. **Bloque 9: Send Request (Notify Supplier)**
    - Configurar: `POST {{base_url}}/external/notify-supplier`
    - Body:
      ```json
      {
          "supplierId": "{{item.supplierId}}",
          "productId": "{{item.productId}}",
          "quantity": {{quantity}},
          "reorderReference": "{{reorderId}}",
          "requestedDelivery": "{{$isoTimestamp}}"
      }
      ```

11. **Bloque 10: Update local inventory status**
    - Configurar: `PATCH {{base_url}}/warehouses/{{warehouse_id}}/items/{{item.productId}}`
    - Body:
      ```json
      {
          "status": "REORDER_IN_PROGRESS",
          "lastReorderId": "{{reorderId}}"
      }
      ```

12. **Bloque 11: Console Log (Results)**
    - Mostrar resumen: `"Reorder #{reorderId} for product {item.productId}: {quantity} units ordered at ${timestamp}"`

13. **Bloque 12: Notification (Send Email)**
    - Usar bloque **Send Email** o **Webhook** para notificar al equipo de logística.
    - Configurar webhook a Slack con mensaje:
      ```json
      {
          "text": "🔄 Reabastecimiento automático: {{quantity}} unidades de {{item.productId}} ordenadas. Reorder #{{reorderId}}"
      }
      ```

14. Probar el flujo manualmente:
    - Asegurarse de que hay al menos un producto con stock bajo.
    - Hacer clic en **Run**.
    - Observar que el flujo itera sobre cada producto y ejecuta los pasos de reabastecimiento.

15. Verificar en los logs del Flow que cada paso se ejecutó correctamente y que los datos se transformaron adecuadamente entre bloques.
