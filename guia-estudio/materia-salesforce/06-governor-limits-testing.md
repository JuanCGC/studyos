# 📘 06. Governor Limits Testing

- **Concepto Clave Asimilado:** Límites del gobernador de Salesforce (SOQL, DML, CPU time, heap) y cómo probar que el código los maneja correctamente capturando `System.LimitException`.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Limits Inspector — Test que hace 101 consultas SOQL en loop y captura la excepción `System.LimitException`

**Instrucciones:**

1. Crea la clase `LimitsInspector.cls`:
```apex
public class LimitsInspector {

    public static void excederLimiteSOQL() {
        for (Integer i = 0; i < 150; i++) {
            List<Account> cuentas = [SELECT Id FROM Account LIMIT 1];
            System.debug('Consulta SOQL #' + (i + 1));
        }
    }

    public static void excederLimiteDML() {
        List<Account> cuentas = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            cuentas.add(new Account(Name = 'Test ' + i));
        }
        insert cuentas; // 200 registros en 1 DML está bien
        // Pero hacer 200 inserts individuales no
    }

    public static void excederLimiteDMLindividual() {
        for (Integer i = 0; i < 200; i++) {
            insert new Account(Name = 'Test Individual ' + i);
        }
    }

    public static void monitorearLimites() {
        Limits.startAsyncUsage();

        for (Integer i = 0; i < 5; i++) {
            List<Account> cuentas = [SELECT Id, Name FROM Account LIMIT 10];
        }

        System.debug('=== REPORTE DE LIMITES ===');
        System.debug('SOQL Queries usados: ' + Limits.getQueries());
        System.debug('SOQL Queries restantes: ' + Limits.getLimitQueries() - Limits.getQueries());
        System.debug('DML Statements: ' + Limits.getDMLStatements());
        System.debug('DML Rows: ' + Limits.getDMLRows());
        System.debug('CPU Time usado: ' + Limits.getCpuTime() + ' ms');
        System.debug('Heap Size usado: ' + Limits.getHeapSize() + ' bytes');
        System.debug('Callouts realizados: ' + Limits.getCallouts());
    }

    public static void procesarConLimitesSeguros(Integer cantidadRegistros) {
        Integer soqlRestantes = Limits.getLimitQueries() - Limits.getQueries();
        Integer dmlRestantes = Limits.getLimitDMLStatements() - Limits.getDMLStatements();

        System.debug('SOQL disponibles: ' + soqlRestantes);
        System.debug('DML disponibles: ' + dmlRestantes);

        // Procesar en lotes seguros
        Integer batchSize = 10;
        List<Account> cuentas = [SELECT Id, Name FROM Account LIMIT :batchSize];

        for (Account c : cuentas) {
            c.Description = 'Procesado';
        }

        if (!cuentas.isEmpty()) {
            update cuentas;
        }
    }
}
```

2. Crea la clase de test `LimitsInspectorTest.cls`:
```apex
@isTest
private class LimitsInspectorTest {

    @isTest
    static void testExcederLimiteSOQL() {
        try {
            LimitsInspector.excederLimiteSOQL();
            System.assert(false, 'Debió lanzar LimitException');
        } catch (System.LimitException e) {
            System.assert(e.getMessage().contains('SOQL'));
            System.debug('LimitException capturada correctamente: ' + e.getMessage());
        }
    }

    @isTest
    static void testExcederLimiteDMLIndividual() {
        try {
            LimitsInspector.excederLimiteDMLindividual();
            System.assert(false, 'Debió lanzar LimitException');
        } catch (System.LimitException e) {
            System.assert(e.getMessage().contains('DML'));
        }
    }

    @isTest
    static void testDMLAgrupadoNoExcedeLimite() {
        // 200 registros en 1 DML statement está bien
        Test.startTest();
        LimitsInspector.excederLimiteDML();
        Test.stopTest();

        List<Account> cuentas = [SELECT Id FROM Account];
        System.assertEquals(200, cuentas.size());
    }

    @isTest
    static void testMonitorearLimites() {
        LimitsInspector.monitorearLimites();

        System.assert(Limits.getQueries() <= Limits.getLimitQueries());
        System.assert(Limits.getDMLStatements() <= Limits.getLimitDMLStatements());
    }

    @isTest
    static void testProcesarConLimitesSeguros() {
        // Crear datos de prueba
        List<Account> cuentas = new List<Account>();
        for (Integer i = 0; i < 5; i++) {
            cuentas.add(new Account(Name = 'Cuenta ' + i));
        }
        insert cuentas;

        Test.startTest();
        LimitsInspector.procesarConLimitesSeguros(5);
        Test.stopTest();

        // Verificar que no se excedieron límites
        System.assert(Limits.getQueries() <= Limits.getLimitQueries());
        System.assert(Limits.getDMLStatements() <= Limits.getLimitDMLStatements());
    }

    @isTest
    static void testVerificarLimitesEspecificos() {
        Test.startTest();

        List<Account> cuentas = [SELECT Id FROM Account];

        Test.stopTest();

        System.assertEquals(1, Limits.getQueries());
        System.assertEquals(0, Limits.getDMLStatements());
        System.debug('CPU Time: ' + Limits.getCpuTime() + ' ms');
        System.debug('Heap Size: ' + Limits.getHeapSize() + ' bytes');
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names LimitsInspectorTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Bulk Contract Processing — Batch que procesa 10,000 contratos y test que verifica límites de SOQL (100 por transacción), DML (150), CPU time y heap size

**Instrucciones:**

1. Crea la clase batch `BulkContractProcessor.cls` que procesa contratos masivamente sin violar límites:
```apex
public class BulkContractProcessor implements Database.Batchable<SObject> {

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name, Estado__c, Monto__c, Fecha_Expiracion__c,
                   Vendedor__c, Cliente__c
            FROM Contrato__c
            WHERE Estado__c = 'Activo'
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Contrato__c> scope) {
        // Monitorear límites al inicio
        Integer soqlInicial = Limits.getQueries();
        Integer dmlInicial = Limits.getDMLStatements();
        Long heapInicial = Limits.getHeapSize();
        Long cpuInicial = Limits.getCpuTime();

        System.debug('=== INICIO EXECUTE ===');
        System.debug('Scope size: ' + scope.size());
        System.debug('SOQL inicial: ' + soqlInicial);
        System.debug('DML inicial: ' + dmlInicial);
        System.debug('Heap inicial: ' + heapInicial + ' bytes');
        System.debug('CPU inicial: ' + cpuInicial + ' ms');

        // 1. Consultar vendedores relacionados (1 SOQL)
        Set<Id> vendedorIds = new Set<Id>();
        for (Contrato__c c : scope) {
            if (c.Vendedor__c != null) {
                vendedorIds.add(c.Vendedor__c);
            }
        }

        Map<Id, User> vendedores = new Map<Id, User>(
            [SELECT Id, Name, Email FROM User WHERE Id IN :vendedorIds]
        );
        System.debug('SOQL después de consulta vendedores: ' + Limits.getQueries());

        // 2. Consultar clientes relacionados (1 SOQL)
        Set<Id> clienteIds = new Set<Id>();
        for (Contrato__c c : scope) {
            if (c.Cliente__c != null) {
                clienteIds.add(c.Cliente__c);
            }
        }

        Map<Id, Cliente__c> clientes = new Map<Id, Cliente__c>(
            [SELECT Id, Name, Categoria__c, Ingresos_Anuales__c FROM Cliente__c WHERE Id IN :clienteIds]
        );
        System.debug('SOQL después de consulta clientes: ' + Limits.getQueries());

        // 3. Procesar contratos (sin más SOQL)
        List<Contrato__c> paraActualizar = new List<Contrato__c>();
        Map<Id, Comision__c> comisionesACrear = new Map<Id, Comision__c>();

        for (Contrato__c contrato : scope) {
            // Calcular días restantes
            Integer diasRestantes = contrato.Fecha_Expiracion__c != null ?
                contrato.Fecha_Expiracion__c.daysBetween(Date.today()) : 0;

            // Contratos próximos a vencer
            if (contrato.Fecha_Expiracion__c != null &&
                contrato.Fecha_Expiracion__c <= Date.today().addDays(30) &&
                contrato.Fecha_Expiracion__c >= Date.today()) {
                contrato.Estado__c = 'En_Renovacion';
                paraActualizar.add(contrato);

                // Crear comisión por renovación
                if (contrato.Vendedor__c != null && !comisionesACrear.containsKey(contrato.Id)) {
                    Comision__c comision = new Comision__c(
                        Contrato__c = contrato.Id,
                        Monto_Comision__c = contrato.Monto__c * 0.05, // 5% comisión
                        Porcentaje__c = 5.00,
                        Estado__c = 'Pendiente'
                    );
                    comisionesACrear.put(contrato.Id, comision);
                }
            }

            // Contratos vencidos
            if (contrato.Fecha_Expiracion__c != null &&
                contrato.Fecha_Expiracion__c < Date.today()) {
                contrato.Estado__c = 'Vencido';
                paraActualizar.add(contrato);
            }
        }

        // 4. DML: Actualizar contratos (1 DML)
        if (!paraActualizar.isEmpty()) {
            update paraActualizar;
        }
        System.debug('DML después de update: ' + Limits.getDMLStatements());

        // 5. DML: Insertar comisiones (1 DML)
        if (!comisionesACrear.isEmpty()) {
            insert comisionesACrear.values();
        }
        System.debug('DML después de insert: ' + Limits.getDMLStatements());

        // Reporte final de límites
        System.debug('=== FIN EXECUTE ===');
        System.debug('SOQL total: ' + (Limits.getQueries() - soqlInicial));
        System.debug('DML total: ' + (Limits.getDMLStatements() - dmlInicial));
        System.debug('Heap usado: ' + (Limits.getHeapSize() - heapInicial) + ' bytes');
        System.debug('CPU usado: ' + (Limits.getCpuTime() - cpuInicial) + ' ms');
        System.debug('Registros actualizados: ' + paraActualizar.size());
        System.debug('Comisiones creadas: ' + comisionesACrear.size());
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('=== BATCH COMPLETADO ===');
        System.debug('Total registros procesados');

        // Enviar email de notificación al admin
        // (código de notificación aquí)
    }
}
```

2. Crea la clase de test `BulkContractProcessorTest.cls`:
```apex
@isTest
private class BulkContractProcessorTest {

    @TestSetup
    static void setup() {
        // Crear cliente
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Bulk Test',
            RFC__c = 'BLK123456XYZ',
            Ingresos_Anuales__c = 10000000,
            Categoria__c = 'Gold'
        );
        insert cliente;

        // Crear vendedor
        Profile perfil = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User vendedor = new User(
            Alias = 'vendedor',
            Email = 'vendedor.bulk@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Vendedor Bulk',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfil.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'vendedor.bulk.' + DateTime.now().getTime() + '@test.com'
        );
        insert vendedor;

        // Crear 200 contratos en diferentes estados
        List<Contrato__c> contratos = new List<Contrato__c>();
        for (Integer i = 0; i < 200; i++) {
            String estado;
            Date fechaInicio;
            Date fechaExp;

            if (i < 50) {
                // Activos por vencer pronto
                estado = 'Activo';
                fechaInicio = Date.today().addMonths(-11);
                fechaExp = Date.today().addDays(15);
            } else if (i < 100) {
                // Activos vigentes
                estado = 'Activo';
                fechaInicio = Date.today().addMonths(-3);
                fechaExp = Date.today().addMonths(9);
            } else if (i < 150) {
                // Vencidos
                estado = 'Activo';
                fechaInicio = Date.today().addMonths(-18);
                fechaExp = Date.today().addMonths(-6);
            } else {
                // Borradores (no se procesan)
                estado = 'Borrador';
                fechaInicio = Date.today();
                fechaExp = Date.today().addMonths(12);
            }

            contratos.add(new Contrato__c(
                Cliente__c = cliente.Id,
                Vendedor__c = vendedor.Id,
                Monto__c = 100000 * (i + 1),
                Fecha_Inicio__c = fechaInicio,
                Fecha_Expiracion__c = fechaExp,
                Estado__c = estado
            ));
        }
        insert contratos;
    }

    @isTest
    static void testBatchProcesaLimitesCorrectamente() {
        Test.startTest();
        Database.executeBatch(new BulkContractProcessor(), 100);
        Test.stopTest();

        // Verificar contratos cambiados a En_Renovacion
        List<Contrato__c> renovacion = [SELECT Id FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        System.assertEquals(50, renovacion.size(), '50 contratos deben estar en renovación');

        // Verificar contratos cambiados a Vencido
        List<Contrato__c> vencidos = [SELECT Id FROM Contrato__c WHERE Estado__c = 'Vencido'];
        System.assertEquals(50, vencidos.size(), '50 contratos deben estar vencidos');

        // Borradores no deben cambiar
        List<Contrato__c> borradores = [SELECT Id FROM Contrato__c WHERE Estado__c = 'Borrador'];
        System.assertEquals(50, borradores.size(), '50 contratos deben seguir en borrador');

        // Verificar comisiones creadas (solo para renovación)
        List<Comision__c> comisiones = [SELECT Id, Monto_Comision__c, Porcentaje__c FROM Comision__c];
        System.assertEquals(50, comisiones.size(), 'Deben crearse 50 comisiones');
    }

    @isTest
    static void testLimitesNoExcedidos() {
        Test.startTest();
        Database.executeBatch(new BulkContractProcessor(), 100);
        Test.stopTest();

        // Verificar que no se excedieron límites (en cada execute individual)
        System.assert(Limits.getQueries() <= Limits.getLimitQueries(),
            'SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
        System.assert(Limits.getDMLStatements() <= Limits.getLimitDMLStatements(),
            'DML: ' + Limits.getDMLStatements() + '/' + Limits.getLimitDMLStatements());
        System.assert(Limits.getCpuTime() <= Limits.getLimitCpuTime(),
            'CPU: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime());
        System.assert(Limits.getHeapSize() <= Limits.getLimitHeapSize(),
            'Heap: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());
    }

    @isTest
    static void testBatchConZeroRegistros() {
        // Eliminar todos los contratos activos
        delete [SELECT Id FROM Contrato__c WHERE Estado__c = 'Activo'];

        Test.startTest();
        Database.executeBatch(new BulkContractProcessor(), 100);
        Test.stopTest();

        // No deben crearse comisiones
        Integer totalComisiones = [SELECT COUNT() FROM Comision__c];
        System.assertEquals(0, totalComisiones);
    }

    @isTest
    static void testLimitesPorExecute() {
        // Verificar límites dentro de cada ejecución del batch
        Test.startTest();

        // El batch se ejecuta con scope de 100
        BulkContractProcessor processor = new BulkContractProcessor();

        // Obtener query locator
        Database.QueryLocator ql = processor.start(null);
        Database.BatchableContext bc = null;

        // Ejecutar con scope
        List<SObject> scope = new List<SObject>();
        Database.QueryLocatorIterator iter = ql.iterator();

        while (iter.hasNext()) {
            scope.add(iter.next());
            if (scope.size() == 100) {
                processor.execute(bc, scope);
                scope.clear();
            }
        }

        if (!scope.isEmpty()) {
            processor.execute(bc, scope);
        }

        Test.stopTest();

        // Verificaciones globales
        System.assert(Limits.getQueries() <= Limits.getLimitQueries());
    }

    @isTest
    static void testComisionesCalculadasCorrectamente() {
        Test.startTest();
        Database.executeBatch(new BulkContractProcessor(), 200);
        Test.stopTest();

        List<Comision__c> comisiones = [SELECT Id, Monto_Comision__c, Porcentaje__c,
                                                Contrato__r.Monto__c
                                         FROM Comision__c];

        for (Comision__c comision : comisiones) {
            Decimal esperado = comision.Contrato__r.Monto__c * 0.05;
            System.assertEquals(5.00, comision.Porcentaje__c);
            System.assertEquals(esperado, comision.Monto_Comision__c);
        }
    }

    @isTest
    static void testDebugLogsSeGeneran() {
        Test.startTest();
        Database.executeBatch(new BulkContractProcessor(), 100);
        Test.stopTest();

        // Verificar que se generaron logs (no hay assert directo, pero verificar que el batch corre)
        List<Contrato__c> procesados = [SELECT Id, Estado__c FROM Contrato__c
                                        WHERE Estado__c IN ('En_Renovacion', 'Vencido')];
        System.assert(procesados.size() > 0);
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names BulkContractProcessorTest --target-org TestOrg --test-level RunSpecifiedTests --wait 3
```

4. Puntos clave sobre Governor Limits:
   - **SOQL**: 100 por transacción (200 síncrono con Async Limits habilitado).
   - **DML**: 150 statements por transacción, 10,000 registros totales.
   - **CPU Time**: 10,000 ms (60,000 ms síncrono con límites asíncronos).
   - **Heap Size**: 6 MB (12 MB con Async Limits).
   - **Query rows**: 50,000 registros retornados por SOQL (se duplica con Async).
   - **Los batches ejecutan en transacciones separadas**, cada `execute()` tiene sus propios límites.
   - **Usa `Limits.getX()`, `Limits.getLimitX()`** para monitorear en runtime.
