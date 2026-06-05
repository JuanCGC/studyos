# 📘 04. HttpCalloutMock

- **Concepto Clave Asimilado:** Mock de llamadas HTTP externas usando `HttpCalloutMock` e `HttpResponse` para pruebas unitarias de integraciones REST sin depender de servicios reales.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Callout Mock Simple — Clase que hace GET a API externa y HttpCalloutMock que devuelve 200 con JSON fijo

**Instrucciones:**

1. Crea la clase que hace el callout `ApiCliente.cls`:
```apex
public class ApiCliente {

    public static String obtenerTasaCambio(String moneda) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.banxico.org.mx/tasas/' + moneda);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');

        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            return res.getBody();
        } else {
            throw new CalloutException('Error al obtener tasa: HTTP ' + res.getStatusCode());
        }
    }

    public static Decimal obtenerTasaCambioComoNumero(String moneda) {
        String json = obtenerTasaCambio(moneda);
        // Parsear JSON simple
        Map<String, Object> resultado = (Map<String, Object>)JSON.deserializeUntyped(json);
        return (Decimal)resultado.get('tasa');
    }
}
```

2. Crea el mock `ApiClienteMock.cls`:
```apex
@isTest
public class ApiClienteMock implements HttpCalloutMock {

    public HttpResponse respond(HttpRequest request) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setStatusCode(200);

        String jsonMock = JSON.serialize(new Map<String, Object>{
            'moneda' => 'USD',
            'tasa' => 17.85,
            'fecha' => Date.today().format(),
            'fuente' => 'Banxico Mock'
        });

        res.setBody(jsonMock);
        return res;
    }
}
```

3. Crea el mock de error `ApiClienteErrorMock.cls`:
```apex
@isTest
public class ApiClienteErrorMock implements HttpCalloutMock {

    public HttpResponse respond(HttpRequest request) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setStatusCode(422);
        res.setBody('{"error": "Moneda no soportada"}');
        return res;
    }
}
```

4. Crea el mock de timeout `ApiClienteTimeoutMock.cls`:
```apex
@isTest
public class ApiClienteTimeoutMock implements HttpCalloutMock {

    public HttpResponse respond(HttpRequest request) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        // Simular timeout no estableciendo body
        return res;
    }
}
```

5. Crea la clase de test `ApiClienteTest.cls`:
```apex
@isTest
private class ApiClienteTest {

    @isTest
    static void testObtenerTasaCambioExitosa() {
        Test.setMock(HttpCalloutMock.class, new ApiClienteMock());

        String json = ApiCliente.obtenerTasaCambio('USD');
        System.assert(json.contains('17.85'));
        System.assert(json.contains('Banxico Mock'));
    }

    @isTest
    static void testObtenerTasaCambioComoNumero() {
        Test.setMock(HttpCalloutMock.class, new ApiClienteMock());

        Decimal tasa = ApiCliente.obtenerTasaCambioComoNumero('USD');
        System.assertEquals(17.85, tasa);
    }

    @isTest
    static void testError422() {
        Test.setMock(HttpCalloutMock.class, new ApiClienteErrorMock());

        try {
            ApiCliente.obtenerTasaCambio('XYZ');
            System.assert(false, 'Debió lanzar excepción');
        } catch (CalloutException e) {
            System.assert(e.getMessage().contains('422'));
        }
    }

    @isTest
    static void testMultiplesCallouts() {
        // Verificar que el mock retorna consistentemente
        Test.setMock(HttpCalloutMock.class, new ApiClienteMock());

        Decimal tasa1 = ApiCliente.obtenerTasaCambioComoNumero('USD');
        Decimal tasa2 = ApiCliente.obtenerTasaCambioComoNumero('EUR');
        System.assertEquals(tasa1, tasa2); // Mock siempre retorna 17.85
    }
}
```

6. Ejecuta los tests:
```bash
sf apex run test --class-names ApiClienteTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Sincronización con API Bancaria — Clase batch que envía clientes nuevos al core bancario y mock que prueba escenarios de éxito, rechazo (422) y timeout

**Instrucciones:**

1. Crea la clase `SyncClientesBatch.cls` que envía clientes a un core bancario:
```apex
public class SyncClientesBatch implements Database.Batchable<SObject> {

    public String apiEndpoint = 'https://core-bancario.banco.com/api/v1/clientes';
    public List<Cliente__c> clientesFallidos = new List<Cliente__c>();

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name, RFC__c, Ingresos_Anuales__c, Categoria__c, Limite_de_Credito__c,
                   Sincronizado__c, Fecha_Sincronizacion__c, Error_Sincronizacion__c
            FROM Cliente__c
            WHERE Sincronizado__c = false
            LIMIT 100
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Cliente__c> scope) {
        for (Cliente__c cliente : scope) {
            try {
                enviarClienteACore(cliente);
                cliente.Sincronizado__c = true;
                cliente.Fecha_Sincronizacion__c = DateTime.now();
                cliente.Error_Sincronizacion__c = null;
            } catch (CalloutException e) {
                cliente.Error_Sincronizacion__c = e.getMessage();
                clientesFallidos.add(cliente);
            }
        }
        update scope;
    }

    public void finish(Database.BatchableContext bc) {
        if (!clientesFallidos.isEmpty()) {
            // Notificar a admin sobre fallos
            System.debug('Clientes fallidos: ' + clientesFallidos.size());
            for (Cliente__c c : clientesFallidos) {
                System.debug('Fallo: ' + c.Name + ' - ' + c.Error_Sincronizacion__c);
            }
        }
    }

    private void enviarClienteACore(Cliente__c cliente) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(apiEndpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('x-api-key', 'banco-key-mock');
        req.setTimeout(10000);

        Map<String, Object> body = new Map<String, Object>{
            'externalId' => cliente.Id,
            'nombre' => cliente.Name,
            'rfc' => cliente.RFC__c,
            'ingresosAnuales' => cliente.Ingresos_Anuales__c,
            'categoria' => cliente.Categoria__c
        };
        req.setBody(JSON.serialize(body));

        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 201) {
            throw new CalloutException(
                'Error sincronizando cliente ' + cliente.Name +
                ': HTTP ' + res.getStatusCode() + ' - ' + res.getBody()
            );
        }
    }
}
```

2. Agrega el campo `Sincronizado__c` y campos relacionados a `Cliente__c`:

**`objects/Cliente__c/fields/Sincronizado__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Sincronizado__c</fullName>
    <label>Sincronizado</label>
    <type>Checkbox</type>
    <defaultValue>false</defaultValue>
</CustomField>
```

**`objects/Cliente__c/fields/Fecha_Sincronizacion__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Fecha_Sincronizacion__c</fullName>
    <label>Fecha de Sincronización</label>
    <type>DateTime</type>
</CustomField>
```

**`objects/Cliente__c/fields/Error_Sincronizacion__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Error_Sincronizacion__c</fullName>
    <label>Error de Sincronización</label>
    <type>LongTextArea</type>
    <length>255</length>
    <visibleLines>3</visibleLines>
</CustomField>
```

3. Crea los mocks para los diferentes escenarios:

**`classes/CoreBancarioMock.cls`:**
```apex
@isTest
public class CoreBancarioMock implements HttpCalloutMock {

    private Integer statusCode;
    private String responseBody;

    public CoreBancarioMock(Integer statusCode, String responseBody) {
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }

    public HttpResponse respond(HttpRequest request) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setStatusCode(statusCode);
        res.setBody(responseBody);
        return res;
    }
}
```

**`classes/CoreBancarioRechazoMock.cls`:**
```apex
@isTest
public class CoreBancarioRechazoMock implements HttpCalloutMock {

    public HttpResponse respond(HttpRequest request) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setStatusCode(422);
        res.setBody('{"codigo": "RFC_DUPLICADO", "mensaje": "El RFC ya existe en el core bancario"}');
        return res;
    }
}
```

**`classes/CoreBancarioTimeoutMock.cls`:**
```apex
@isTest
public class CoreBancarioTimeoutMock implements HttpCalloutMock {

    public HttpResponse respond(HttpRequest request) {
        // Simular timeout: no establecer body, status 0
        HttpResponse res = new HttpResponse();
        res.setStatusCode(0);
        return res;
    }
}
```

4. Crea la clase de test `SyncClientesBatchTest.cls`:
```apex
@isTest
private class SyncClientesBatchTest {

    @TestSetup
    static void setup() {
        List<Cliente__c> clientes = new List<Cliente__c>();
        for (Integer i = 0; i < 5; i++) {
            clientes.add(new Cliente__c(
                Name = 'Cliente Sync ' + i,
                RFC__c = 'SYN' + String.valueOf(i + 100).leftPad(3, '0') + '456XYZ',
                Ingresos_Anuales__c = 1000000 * (i + 1),
                Categoria__c = 'Silver',
                Sincronizado__c = false
            ));
        }
        insert clientes;
    }

    @isTest
    static void testBatchSincronizacionExitosa() {
        Test.setMock(HttpCalloutMock.class, new CoreBancarioMock(
            201,
            '{"id": "core-123", "estatus": "creado"}'
        ));

        Test.startTest();
        Database.executeBatch(new SyncClientesBatch());
        Test.stopTest();

        List<Cliente__c> clientes = [SELECT Id, Sincronizado__c, Error_Sincronizacion__c
                                     FROM Cliente__c];
        for (Cliente__c c : clientes) {
            System.assertEquals(true, c.Sincronizado__c, 'Cliente debe estar sincronizado');
            System.assertEquals(null, c.Error_Sincronizacion__c);
        }
    }

    @isTest
    static void testBatchRechazo422() {
        Test.setMock(HttpCalloutMock.class, new CoreBancarioRechazoMock());

        Test.startTest();
        Database.executeBatch(new SyncClientesBatch());
        Test.stopTest();

        List<Cliente__c> clientes = [SELECT Id, Sincronizado__c, Error_Sincronizacion__c
                                     FROM Cliente__c];
        for (Cliente__c c : clientes) {
            System.assertEquals(false, c.Sincronizado__c, 'No debe marcar sincronizado');
            System.assertNotEquals(null, c.Error_Sincronizacion__c);
            System.assert(c.Error_Sincronizacion__c.contains('422'));
        }
    }

    @isTest
    static void testBatchTimeout() {
        Test.setMock(HttpCalloutMock.class, new CoreBancarioTimeoutMock());

        Test.startTest();
        Database.executeBatch(new SyncClientesBatch());
        Test.stopTest();

        List<Cliente__c> clientes = [SELECT Id, Sincronizado__c FROM Cliente__c];
        for (Cliente__c c : clientes) {
            System.assertEquals(false, c.Sincronizado__c);
        }
    }

    @isTest
    static void testClientesYaSincronizadosNoSeReenvian() {
        // Marcar algunos como ya sincronizados
        List<Cliente__c> clientes = [SELECT Id FROM Cliente__c LIMIT 2];
        for (Cliente__c c : clientes) {
            c.Sincronizado__c = true;
        }
        update clientes;

        Test.setMock(HttpCalloutMock.class, new CoreBancarioMock(
            201,
            '{"id": "core-456"}'
        ));

        Test.startTest();
        Database.executeBatch(new SyncClientesBatch());
        Test.stopTest();

        // Los que ya estaban sincronizados no se tocaron
        List<Cliente__c> sincronizados = [SELECT Id FROM Cliente__c WHERE Sincronizado__c = true];
        System.assertEquals(5, sincronizados.size());
    }

    @isTest
    static void testVerificarRequestPayload() {
        // Mock que captura y verifica el payload
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMock() {
            public HttpResponse respond(HttpRequest request) {
                System.assert(request.getMethod() == 'POST');
                System.assert(request.getEndpoint().contains('core-bancario'));
                String body = request.getBody();
                System.assert(body.contains('externalId'));
                System.assert(body.contains('rfc'));
                System.assert(body.contains('ingresosAnuales'));

                HttpResponse res = new HttpResponse();
                res.setStatusCode(201);
                res.setBody('{"id": "core-789"}');
                return res;
            }
        });

        Test.startTest();
        Database.executeBatch(new SyncClientesBatch());
        Test.stopTest();
    }
}
```

5. Despliega los campos nuevos y ejecuta los tests:
```bash
sf project deploy start --source-dir force-app/main/default --target-org TestOrg

sf apex run test --class-names SyncClientesBatchTest --target-org TestOrg --test-level RunSpecifiedTests --wait 3
```
