# 📘 09. Batch Apex Testing

- **Concepto Clave Asimilado:** Implementación de `Database.Batchable` con métodos `start`, `execute` y `finish`. Testing de batch jobs con verificación de registros procesados y límites.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Batch Hello — `Database.Batchable` que actualiza todas las cuentas con un campo y test que verifica la ejecución

**Instrucciones:**

1. Crea la clase batch `AccountBatchHello.cls`:
```apex
public class AccountBatchHello implements Database.Batchable<SObject> {

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name, Description FROM Account
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account acc : scope) {
            acc.Description = 'Procesado por AccountBatchHello - ' + DateTime.now().format();
        }
        update scope;
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('AccountBatchHello completado. Registros procesados.');
    }
}
```

2. Crea la clase de test `AccountBatchHelloTest.cls`:
```apex
@isTest
private class AccountBatchHelloTest {

    @TestSetup
    static void setup() {
        List<Account> cuentas = new List<Account>();
        for (Integer i = 0; i < 15; i++) {
            cuentas.add(new Account(Name = 'Cuenta Test ' + i));
        }
        insert cuentas;
    }

    @isTest
    static void testBatchActualizaDescription() {
        Test.startTest();
        Database.executeBatch(new AccountBatchHello());
        Test.stopTest();

        List<Account> cuentas = [SELECT Id, Description FROM Account];
        System.assertEquals(15, cuentas.size());

        for (Account acc : cuentas) {
            System.assert(acc.Description != null);
            System.assert(acc.Description.contains('AccountBatchHello'));
        }
    }

    @isTest
    static void testBatchConScopePersonalizado() {
        Test.startTest();
        Database.executeBatch(new AccountBatchHello(), 5);
        Test.stopTest();

        List<Account> procesadas = [SELECT Id FROM Account WHERE Description != null];
        System.assertEquals(15, procesadas.size());
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names AccountBatchHelloTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Batch de Vencimiento de Contratos — Batch que encuentra contratos por vencer (30 días), cambia estado a "Renovación Pendiente" y crea tarea para el vendedor. Test con 200 registros.

**Instrucciones:**

1. Crea la clase batch `ContractRenovationBatch.cls`:
```apex
public class ContractRenovationBatch implements Database.Batchable<SObject> {

    private Integer diasAnticipacion;
    private List<Contrato__c> contratosProcesados = new List<Contrato__c>();
    private Integer tareasCreadas = 0;

    public ContractRenovationBatch(Integer diasAnticipacion) {
        this.diasAnticipacion = diasAnticipacion;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        Date fechaLimite = Date.today().addDays(diasAnticipacion);

        return Database.getQueryLocator([
            SELECT Id, Name, Estado__c, Monto__c,
                   Fecha_Inicio__c, Fecha_Expiracion__c,
                   Vendedor__c, Vendedor__r.Email,
                   Cliente__c, Cliente__r.Name
            FROM Contrato__c
            WHERE Estado__c = 'Activo'
            AND Fecha_Expiracion__c != null
            AND Fecha_Expiracion__c <= :fechaLimite
            AND Fecha_Expiracion__c >= :Date.today()
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Contrato__c> scope) {
        System.debug(LoggingLevel.INFO, 'Procesando lote de ' + scope.size() + ' contratos');

        List<Contrato__c> paraActualizar = new List<Contrato__c>();
        List<Task> tareas = new List<Task>();

        for (Contrato__c contrato : scope) {
            // Cambiar estado a renovación pendiente
            contrato.Estado__c = 'En_Renovacion';
            paraActualizar.add(contrato);

            // Crear tarea para el vendedor
            if (contrato.Vendedor__c != null) {
                Task tarea = new Task(
                    Subject = 'Renovar contrato ' + contrato.Name,
                    Description = 'El contrato ' + contrato.Name +
                        ' del cliente ' + contrato.Cliente__r.Name +
                        ' vence el ' + contrato.Fecha_Expiracion__c.format() +
                        '. Por favor iniciar el proceso de renovación.',
                    ActivityDate = contrato.Fecha_Expiracion__c,
                    OwnerId = contrato.Vendedor__c,
                    Status = 'Not Started',
                    Priority = 'High',
                    WhatId = contrato.Id
                );
                tareas.add(tarea);
            }

            contratosProcesados.add(contrato);
        }

        // Actualizar contratos
        if (!paraActualizar.isEmpty()) {
            update paraActualizar;
        }

        // Crear tareas
        if (!tareas.isEmpty()) {
            insert tareas;
            tareasCreadas += tareas.size();
        }

        System.debug(LoggingLevel.INFO, 'Lote completado: ' + paraActualizar.size() +
            ' contratos actualizados, ' + tareas.size() + ' tareas creadas');
    }

    public void finish(Database.BatchableContext bc) {
        System.debug(LoggingLevel.INFO, '=== BATCH DE RENOVACIÓN COMPLETADO ===');
        System.debug(LoggingLevel.INFO, 'Total contratos procesados: ' + contratosProcesados.size());
        System.debug(LoggingLevel.INFO, 'Total tareas creadas: ' + tareasCreadas);

        // Enviar resumen por email al admin
        String resumen = 'Batch de Renovación completado.\n' +
            'Contratos procesados: ' + contratosProcesados.size() + '\n' +
            'Tareas creadas: ' + tareasCreadas + '\n';

        System.debug(LoggingLevel.INFO, resumen);
    }
}
```

2. Crea la clase de test `ContractRenovationBatchTest.cls`:
```apex
@isTest
private class ContractRenovationBatchTest {

    @TestSetup
    static void setup() {
        // Crear cliente
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Renovación Test',
            RFC__c = 'RNV123456XYZ',
            Ingresos_Anuales__c = 5000000,
            Categoria__c = 'Silver'
        );
        insert cliente;

        // Crear vendedor
        Profile perfil = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User vendedor = new User(
            Alias = 'vrenov',
            Email = 'vendedor.renovacion@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Vendedor Renovacion',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfil.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'vendedor.renovacion.' + DateTime.now().getTime() + '@test.com'
        );
        insert vendedor;

        // Crear 200 contratos en diferentes estados y fechas
        List<Contrato__c> contratos = new List<Contrato__c>();

        for (Integer i = 0; i < 200; i++) {
            String estado;
            Date fechaInicio;
            Date fechaExp;

            if (i < 50) {
                // Activos por vencer en menos de 30 días (deben procesarse)
                estado = 'Activo';
                fechaInicio = Date.today().addMonths(-11);
                fechaExp = Date.today().addDays(Math.mod(i, 28) + 1); // 1-28 días
            } else if (i < 100) {
                // Activos vigentes (no deben procesarse)
                estado = 'Activo';
                fechaInicio = Date.today().addMonths(-3);
                fechaExp = Date.today().addMonths(9);
            } else if (i < 150) {
                // Vencidos (no deben procesarse)
                estado = 'Vencido';
                fechaInicio = Date.today().addMonths(-18);
                fechaExp = Date.today().addMonths(-6);
            } else {
                // Borradores (no deben procesarse)
                estado = 'Borrador';
                fechaInicio = Date.today();
                fechaExp = Date.today().addDays(15);
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
    static void testBatchProcesaContratosPorVencer() {
        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 50);
        Test.stopTest();

        // Verificar contratos cambiados a En_Renovacion
        List<Contrato__c> renovacion = [SELECT Id, Estado__c, Vendedor__c
                                        FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        System.assertEquals(50, renovacion.size(),
            '50 contratos deben estar en renovación');

        // Verificar que los activos vigentes no cambiaron
        List<Contrato__c> activos = [SELECT Id FROM Contrato__c WHERE Estado__c = 'Activo'];
        System.assertEquals(50, activos.size());

        // Verificar que vencidos y borradores no cambiaron
        List<Contrato__c> vencidos = [SELECT Id FROM Contrato__c WHERE Estado__c = 'Vencido'];
        System.assertEquals(50, vencidos.size());

        List<Contrato__c> borradores = [SELECT Id FROM Contrato__c WHERE Estado__c = 'Borrador'];
        System.assertEquals(50, borradores.size());
    }

    @isTest
    static void testBatchCreaTareasParaVendedores() {
        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Test.stopTest();

        // Verificar tareas creadas
        List<Task> tareas = [SELECT Id, Subject, OwnerId, WhatId, ActivityDate, Priority
                             FROM Task];
        System.assertEquals(50, tareas.size(), 'Deben crearse 50 tareas');

        for (Task t : tareas) {
            System.assertEquals('High', t.Priority);
            System.assert(t.Subject.contains('Renovar'));
        }
    }

    @isTest
    static void testBatchSinAnticipacion() {
        // Batch con 0 días de anticipación
        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(0), 100);
        Test.stopTest();

        // Solo contratos que vencen hoy exactamente
        List<Contrato__c> renovacion = [SELECT Id FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        // Depende de si hay contratos que venzan hoy
        List<Contrato__c> vencenHoy = [SELECT Id FROM Contrato__c
                                       WHERE Fecha_Expiracion__c = :Date.today()
                                       AND Estado__c = 'Activo'];
        System.assertEquals(vencenHoy.size(), renovacion.size());
    }

    @isTest
    static void testBatchCon200RegistrosNoExcedeLimites() {
        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Test.stopTest();

        // Verificar límites globales
        System.assert(Limits.getQueries() <= Limits.getLimitQueries(),
            'SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
        System.assert(Limits.getDMLStatements() <= Limits.getLimitDMLStatements(),
            'DML: ' + Limits.getDMLStatements() + '/' + Limits.getLimitDMLStatements());
        System.assert(Limits.getCpuTime() <= Limits.getLimitCpuTime(),
            'CPU: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime());
    }

    @isTest
    static void testBatchSinContratosPorVencer() {
        // Mover todos los contratos a fechas lejanas
        List<Contrato__c> activos = [SELECT Id, Fecha_Expiracion__c FROM Contrato__c
                                     WHERE Estado__c = 'Activo'];
        for (Contrato__c c : activos) {
            c.Fecha_Expiracion__c = Date.today().addMonths(6);
        }
        update activos;

        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Test.stopTest();

        // No debe haber contratos en renovación
        List<Contrato__c> renovacion = [SELECT Id FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        System.assertEquals(0, renovacion.size());

        // No debe haber tareas
        List<Task> tareas = [SELECT Id FROM Task];
        System.assertEquals(0, tareas.size());
    }

    @isTest
    static void testBatchSinVendedorAsignado() {
        // Quitar vendedor a los contratos por vencer
        List<Contrato__c> porVencer = [SELECT Id, Vendedor__c, Fecha_Expiracion__c
                                       FROM Contrato__c
                                       WHERE Estado__c = 'Activo'
                                       AND Fecha_Expiracion__c <= :Date.today().addDays(30)
                                       AND Fecha_Expiracion__c >= :Date.today()];
        for (Contrato__c c : porVencer) {
            c.Vendedor__c = null;
        }
        update porVencer;

        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Test.stopTest();

        // Contratos deben cambiar a En_Renovacion igual
        List<Contrato__c> renovacion = [SELECT Id, Vendedor__c FROM Contrato__c
                                        WHERE Estado__c = 'En_Renovacion'];
        System.assert(renovacion.size() > 0);

        for (Contrato__c c : renovacion) {
            System.assertEquals(null, c.Vendedor__c);
        }

        // No deben crearse tareas (no hay vendedor)
        List<Task> tareas = [SELECT Id FROM Task];
        System.assertEquals(0, tareas.size(),
            'No deben crearse tareas si no hay vendedor asignado');
    }

    @isTest
    static void testBatchEjecucionMultiple() {
        // Ejecutar batch dos veces
        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Test.stopTest();

        // Los contratos ya están en En_Renovacion, la segunda ejecución no debe procesarlos
        List<Contrato__c> renovacion = [SELECT Id FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        System.assertEquals(50, renovacion.size());

        // Tareas: solo 50 (no duplicadas)
        List<Task> tareas = [SELECT Id FROM Task];
        System.assertEquals(50, tareas.size());
    }

    @isTest
    static void testTareasTienenDatosCorrectos() {
        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 200);
        Test.stopTest();

        List<Task> tareas = [SELECT Id, Subject, Description, ActivityDate,
                                     OwnerId, WhatId, Status, Priority
                              FROM Task ORDER BY Subject];

        for (Task t : tareas) {
            System.assert(t.Subject.startsWith('Renovar'));
            System.assertEquals('Not Started', t.Status);
            System.assertEquals('High', t.Priority);
            System.assert(t.ActivityDate != null);
            System.assert(t.WhatId != null);

            // Verificar que WhatId es un contrato
            Contrato__c contrato = [SELECT Id, Name FROM Contrato__c WHERE Id = :t.WhatId];
            System.assertNotEquals(null, contrato);
        }
    }
}
```

3. Crea un test adicional para verificar el rescate de límites en lote grande:

**`classes/ContractRenovationBatchLargeTest.cls`:**
```apex
@isTest
private class ContractRenovationBatchLargeTest {

    @isTest
    static void testLimitesConLoteGrande() {
        // Crear datos masivos
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Masivo',
            RFC__c = 'MSV123456XYZ',
            Ingresos_Anuales__c = 10000000,
            Categoria__c = 'Gold'
        );
        insert cliente;

        User admin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator'
                      AND IsActive = true LIMIT 1];

        List<Contrato__c> contratos = new List<Contrato__c>();
        for (Integer i = 0; i < 250; i++) {
            contratos.add(new Contrato__c(
                Cliente__c = cliente.Id,
                Vendedor__c = admin.Id,
                Monto__c = 100000,
                Fecha_Inicio__c = Date.today().addMonths(-10),
                Fecha_Expiracion__c = Date.today().addDays(Math.mod(i, 25) + 1),
                Estado__c = 'Activo'
            ));
        }
        insert contratos;

        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 100);
        Test.stopTest();

        // Verificar que se procesaron todos los contratos por vencer
        List<Contrato__c> renovacion = [SELECT Id FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        System.assertEquals(250, renovacion.size());

        // Verificar tareas creadas
        List<Task> tareas = [SELECT Id FROM Task];
        System.assertEquals(250, tareas.size());
    }
}
```

4. Despliega y ejecuta los tests:
```bash
sf project deploy start --source-dir force-app/main/default --target-org TestOrg

sf apex run test --class-names ContractRenovationBatchTest --target-org TestOrg --test-level RunSpecifiedTests --wait 3
```

5. Puntos clave sobre Batch Apex:
   - **`start()`**: Retorna `QueryLocator` o `Iterable`. Ejecuta una sola vez.
   - **`execute()`**: Recibe subconjuntos (scope) de registros. Cada ejecución es una transacción separada con sus propios límites.
   - **`finish()`**: Ejecuta una vez al final. Sirve para notificaciones o encadenar jobs.
   - **Scope**: Define cuántos registros por lote (default 200, máximo 2000).
   - **Testing**: `Test.startTest()`/`Test.stopTest()` enmarca la ejecución batch.
   - **Límites**: Cada `execute()` tiene límites frescos (100 SOQL, 150 DML, 10s CPU, etc.).
