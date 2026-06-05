# 📘 15. Examen Final

- **Concepto Clave Asimilado:** Integración de todos los conceptos del curso en una suite de pruebas completa que cubre @TestSetup, HttpCalloutMock y System.runAs, más el cierre del proyecto ERP con coverage > 75% y documentación.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Mini-Suite Apex — 3 tests que cubran: @TestSetup, HttpCalloutMock y System.runAs

**Instrucciones:**

1. Crea la clase `MiniSuiteTests.cls` que demuestre dominio de los 3 conceptos clave:

```apex
@isTest
private class MiniSuiteTests {

    // =============================================
    // TEST 1: @TestSetup - Datos reutilizables
    // =============================================
    @TestSetup
    static void setup() {
        List<Account> cuentas = new List<Account>();
        for (Integer i = 0; i < 5; i++) {
            cuentas.add(new Account(
                Name = 'Cuenta TestSetup ' + i,
                AnnualRevenue = 100000 * (i + 1)
            ));
        }
        insert cuentas;

        List<Contact> contactos = new List<Contact>();
        for (Integer i = 0; i < 5; i++) {
            contactos.add(new Contact(
                LastName = 'Contacto ' + i,
                AccountId = cuentas[i].Id,
                Email = 'contacto' + i + '@test.com'
            ));
        }
        insert contactos;
    }

    @isTest
    static void testSetupProporcionaDatos() {
        List<Account> cuentas = [SELECT Id, Name, AnnualRevenue FROM Account];
        System.assertEquals(5, cuentas.size(), 'Deben existir 5 cuentas del TestSetup');

        List<Contact> contactos = [SELECT Id, LastName, Email FROM Contact];
        System.assertEquals(5, contactos.size(), 'Deben existir 5 contactos del TestSetup');
    }

    @isTest
    static void testDatosSonIndependientesEntreTests() {
        // Modificar datos en este test
        List<Account> cuentas = [SELECT Id FROM Account LIMIT 2];
        delete cuentas;

        // Verificar que la eliminación solo afecta este test
        List<Account> restantes = [SELECT Id FROM Account];
        System.assertEquals(3, restantes.size());
    }

    @isTest
    static void testVerificarDatosCreados() {
        List<Account> cuentas = [SELECT Id, AnnualRevenue FROM Account ORDER BY AnnualRevenue];
        System.assertEquals(100000, cuentas[0].AnnualRevenue);
        System.assertEquals(500000, cuentas[4].AnnualRevenue);
    }

    // =============================================
    // TEST 2: HttpCalloutMock - Llamadas externas
    // =============================================
    @isTest
    static void testCalloutMockExitoso() {
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMock() {
            public HttpResponse respond(HttpRequest request) {
                HttpResponse res = new HttpResponse();
                res.setStatusCode(200);
                res.setBody('{"status": "ok", "data": {"id": 123, "name": "Mock Test"}}');
                return res;
            }
        });

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.test.com/v1/endpoint');
        req.setMethod('GET');

        HttpResponse res = http.send(req);

        System.assertEquals(200, res.getStatusCode());
        System.assert(res.getBody().contains('Mock Test'));
    }

    @isTest
    static void testCalloutMockError() {
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMock() {
            public HttpResponse respond(HttpRequest request) {
                HttpResponse res = new HttpResponse();
                res.setStatusCode(500);
                res.setBody('{"error": "Internal server error"}');
                return res;
            }
        });

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.test.com/v1/endpoint');
        req.setMethod('GET');

        HttpResponse res = http.send(req);

        System.assertEquals(500, res.getStatusCode());
        System.assert(res.getBody().contains('error'));
    }

    @isTest
    static void testCalloutMockTimeout() {
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMock() {
            public HttpResponse respond(HttpRequest request) {
                HttpResponse res = new HttpResponse();
                res.setStatusCode(200);
                return res;
            }
        });

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.test.com/v1/endpoint');
        req.setMethod('GET');
        req.setTimeout(1000);

        HttpResponse res = http.send(req);
        System.assertEquals(200, res.getStatusCode());
    }

    @isTest
    static void testCalloutMockVerificaRequest() {
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMock() {
            public HttpResponse respond(HttpRequest request) {
                System.assertEquals('POST', request.getMethod());
                System.assert(request.getEndpoint().contains('api.test.com'));
                System.assert(request.getBody().contains('test-data'));

                HttpResponse res = new HttpResponse();
                res.setStatusCode(201);
                res.setBody('{"id": "created"}');
                return res;
            }
        });

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.test.com/v1/create');
        req.setMethod('POST');
        req.setBody('{"data": "test-data"}');

        HttpResponse res = http.send(req);
        System.assertEquals(201, res.getStatusCode());
    }

    // =============================================
    // TEST 3: System.runAs - Permisos y FLS
    // =============================================
    @isTest
    static void testRunAsAdministrador() {
        Profile adminProfile = [SELECT Id FROM Profile WHERE Name = 'System Administrator' LIMIT 1];
        User admin = new User(
            Alias = 'adminX',
            Email = 'admin.examen@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Admin Examen',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = adminProfile.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'admin.examen.' + DateTime.now().getTime() + '@test.com'
        );
        insert admin;

        System.runAs(admin) {
            Account acc = new Account(Name = 'Cuenta Admin Test');
            insert acc;

            Account inserted = [SELECT Id, Name FROM Account WHERE Id = :acc.Id];
            System.assertEquals('Cuenta Admin Test', inserted.Name);
        }
    }

    @isTest
    static void testRunAsUsuarioSinPermisos() {
        Profile perfilMinimo = [SELECT Id FROM Profile WHERE Name = 'Minimum Access - Salesforce' LIMIT 1];
        User usuarioSinPermisos = new User(
            Alias = 'minimo',
            Email = 'minimo.examen@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Minimo Examen',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfilMinimo.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'minimo.examen.' + DateTime.now().getTime() + '@test.com'
        );
        insert usuarioSinPermisos;

        System.runAs(usuarioSinPermisos) {
            try {
                // Intentar crear un Account (el perfil mínimo no tiene permisos)
                Account acc = new Account(Name = 'Cuenta Sin Permiso');
                insert acc;
                System.assert(false, 'El usuario no debería poder insertar Account');
            } catch (Exception e) {
                System.assert(e.getMessage().contains('INSUFFICIENT_ACCESS'));
            }
        }
    }

    @isTest
    static void testRunAsConFLS() {
        // Usar Standard User que tiene permisos básicos
        Profile standardProfile = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User standardUser = new User(
            Alias = 'stduser',
            Email = 'standard.examen@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Standard Examen',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = standardProfile.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'standard.examen.' + DateTime.now().getTime() + '@test.com'
        );
        insert standardUser;

        System.runAs(standardUser) {
            Account acc = new Account(Name = 'Cuenta Standard');
            insert acc;

            Account inserted = [SELECT Id, Name, Phone FROM Account WHERE Id = :acc.Id];
            System.assertEquals('Cuenta Standard', inserted.Name);
            System.assertEquals(null, inserted.Phone); // No se asignó Phone
        }
    }

    @isTest
    static void testRunAsConDiferentesUsuarios() {
        Profile adminProfile = [SELECT Id FROM Profile WHERE Name = 'System Administrator' LIMIT 1];

        // Crear 2 usuarios con diferentes permisos
        User user1 = new User(
            Alias = 'user1x',
            Email = 'user1.examen@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'User One',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = adminProfile.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'user1.examen.' + DateTime.now().getTime() + '@test.com'
        );
        insert user1;

        User user2 = new User(
            Alias = 'user2x',
            Email = 'user2.examen@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'User Two',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = adminProfile.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'user2.examen.' + DateTime.now().getTime() + '@test.com'
        );
        insert user2;

        System.runAs(user1) {
            Account acc = new Account(Name = 'Cuenta de User1');
            insert acc;
        }

        System.runAs(user2) {
            List<Account> cuentas = [SELECT Id, Name FROM Account];
            System.assertEquals(1, cuentas.size());
            System.assertEquals('Cuenta de User1', cuentas[0].Name);
        }
    }

    // =============================================
    // TEST COMBINADO: Los 3 conceptos juntos
    // =============================================
    @isTest
    static void testConceptosCombinados() {
        // 1. @TestSetup - Usar datos existentes
        List<Account> cuentas = [SELECT Id, Name FROM Account];
        System.assert(!cuentas.isEmpty(), 'Debe haber datos del TestSetup');

        // 2. HttpCalloutMock - Simular llamada externa
        Test.setMock(HttpCalloutMock.class, new HttpCalloutMock() {
            public HttpResponse respond(HttpRequest request) {
                HttpResponse res = new HttpResponse();
                res.setStatusCode(200);
                res.setBody('{"verified": true}');
                return res;
            }
        });

        // 3. runAs - Cambiar contexto de usuario
        Profile adminProfile = [SELECT Id FROM Profile WHERE Name = 'System Administrator' LIMIT 1];
        User admin = new User(
            Alias = 'combo',
            Email = 'combo.examen@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Combo Examen',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = adminProfile.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'combo.examen.' + DateTime.now().getTime() + '@test.com'
        );
        insert admin;

        System.runAs(admin) {
            // Ejecutar callout
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.test.com/verify');
            req.setMethod('GET');
            HttpResponse res = http.send(req);

            System.assertEquals(200, res.getStatusCode());
            System.assert(res.getBody().contains('verified'));
        }
    }
}
```

2. Ejecuta la mini-suite:
```bash
sf apex run test --class-names MiniSuiteTests --target-org TestOrg --test-level RunSpecifiedTests --wait 2
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Cierre ERP — Suite completa pasando en CI/CD, coverage > 75%, documentación de objetos del modelo de datos y actualización del README del proyecto

**Instrucciones:**

1. Crea la clase `ERPSuiteCompletaTests.cls` que ejecute tests integrados de todos los módulos:

```apex
@isTest
private class ERPSuiteCompletaTests {

    // =============================================
    // MÓDULO: Cliente Service (02 - Apex Basics)
    // =============================================
    @isTest
    static void testClienteServiceCompleto() {
        // Crear cliente
        Cliente__c cliente = ClienteService.crearCliente(
            'Examen Final SA',
            'EXM123456XYZ',
            7500000
        );

        System.assertNotEquals(null, cliente.Id);
        System.assertEquals('Gold', cliente.Categoria__c);
        System.assertEquals(2250000, cliente.Limite_de_Credito__c); // 30% de 7.5M

        // Buscar por categoría
        List<Cliente__c> golds = ClienteService.buscarClientesPorCategoria('Gold');
        System.assert(golds.size() >= 1);

        // Validar RFC
        System.assert(ClienteService.validarRFC('EXM123456XYZ'));
        System.assert(!ClienteService.validarRFC('INVALIDO'));
    }

    // =============================================
    // MÓDULO: Contrato Service (03 - TestSetup)
    // =============================================
    @isTest
    static void testContratoServiceCompleto() {
        // Setup de datos
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Contrato Test',
            RFC__c = 'CTT123456XYZ',
            Ingresos_Anuales__c = 5000000,
            Categoria__c = 'Silver'
        );
        insert cliente;

        User admin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator'
                      AND IsActive = true LIMIT 1];

        // Crear contrato
        Contrato__c contrato = ContratoService.crearContrato(
            cliente.Id, admin.Id, 300000, Date.today(), 12
        );

        System.assertNotEquals(null, contrato.Id);
        System.assertEquals('Borrador', contrato.Estado__c);

        // Activar contrato
        ContratoService.activarContrato(contrato.Id);
        Contrato__c activado = [SELECT Estado__c FROM Contrato__c WHERE Id = :contrato.Id];
        System.assertEquals('Activo', activado.Estado__c);

        // Consultar contratos del vendedor
        List<Contrato__c> contratosVendedor = ContratoService.obtenerContratosActivosPorVendedor(admin.Id);
        System.assert(contratosVendedor.size() >= 1);
    }

    // =============================================
    // MÓDULO: Sync Bancaria (04 - HttpCalloutMock)
    // =============================================
    @isTest
    static void testSyncBancariaCompleto() {
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Sync Final',
            RFC__c = 'SYN123456XYZ',
            Ingresos_Anuales__c = 3000000,
            Categoria__c = 'Silver',
            Sincronizado__c = false
        );
        insert cliente;

        Test.setMock(HttpCalloutMock.class, new CoreBancarioMock(
            201,
            '{"id": "core-final-001", "estatus": "creado"}'
        ));

        Test.startTest();
        Database.executeBatch(new SyncClientesBatch());
        Test.stopTest();

        Cliente__c sincronizado = [SELECT Sincronizado__c, Error_Sincronizacion__c
                                   FROM Cliente__c WHERE Id = :cliente.Id];
        System.assertEquals(true, sincronizado.Sincronizado__c);
        System.assertEquals(null, sincronizado.Error_Sincronizacion__c);
    }

    // =============================================
    // MÓDULO: FLS (05 - System.runAs)
    // =============================================
    @isTest
    static void testFLSEnContratos() {
        User admin = PerfilContratosTestUtil.crearUsuarioConPerfil('System Administrator');

        System.runAs(admin) {
            Boolean montoAccesible = ContratoFLSService.campoEsAccessible('Monto__c');
            System.assertEquals(true, montoAccesible);
        }
    }

    // =============================================
    // MÓDULO: Governor Limits (06)
    // =============================================
    @isTest
    static void testLimitesNoExcedidos() {
        // Crear datos de prueba
        List<Account> cuentas = new List<Account>();
        for (Integer i = 0; i < 50; i++) {
            cuentas.add(new Account(Name = 'Account Limit Test ' + i));
        }
        insert cuentas;

        Test.startTest();
        Database.executeBatch(new AccountBatchHello(), 25);
        Test.stopTest();

        System.assert(Limits.getQueries() <= Limits.getLimitQueries());
        System.assert(Limits.getDMLStatements() <= Limits.getLimitDMLStatements());
    }

    // =============================================
    // MÓDULO: Batch Renovación (09)
    // =============================================
    @isTest
    static void testBatchRenovacionCompleto() {
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Batch Final',
            RFC__c = 'BAT123456XYZ',
            Ingresos_Anuales__c = 8000000,
            Categoria__c = 'Gold'
        );
        insert cliente;

        User admin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator'
                      AND IsActive = true LIMIT 1];

        List<Contrato__c> contratos = new List<Contrato__c>();
        for (Integer i = 0; i < 10; i++) {
            contratos.add(new Contrato__c(
                Cliente__c = cliente.Id,
                Vendedor__c = admin.Id,
                Monto__c = 100000,
                Fecha_Inicio__c = Date.today().addMonths(-10),
                Fecha_Expiracion__c = Date.today().addDays(10),
                Estado__c = 'Activo'
            ));
        }
        insert contratos;

        Test.startTest();
        Database.executeBatch(new ContractRenovationBatch(30), 10);
        Test.stopTest();

        List<Contrato__c> renovacion = [SELECT Id FROM Contrato__c WHERE Estado__c = 'En_Renovacion'];
        System.assertEquals(10, renovacion.size());

        List<Task> tareas = [SELECT Id FROM Task];
        System.assertEquals(10, tareas.size());
    }

    // =============================================
    // MÓDULO: Platform Events (10)
    // =============================================
    @isTest
    static void testPlatformEventCompleto() {
        Test.startTest();
        Id eventId = OrderEventPublisher.publicarOrdenCreada('ORD-FINAL-001', 50000);
        Test.stopTest();

        System.assertNotEquals(null, eventId);
    }

    // =============================================
    // MÓDULO: Flow + Apex (11)
    // =============================================
    @isTest
    static void testFlowApexCompleto() {
        // Aprobación automática
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'test-cliente';
        sol.rfc = 'FLOW123456XYZ';
        sol.montoSolicitado = 2000000;
        sol.ingresosAnuales = 15000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        System.assertEquals('Aprobado', decisiones[0].decision);

        // Rechazo
        sol.ingresosAnuales = 300000;
        sol.montoSolicitado = 100000;
        decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        System.assertEquals('Rechazado', decisiones[0].decision);
    }

    // =============================================
    // MÓDULO: Comisiones (07 - Debug + cálculos)
    // =============================================
    @isTest
    static void testComisionesCompletas() {
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Comision Final',
            RFC__c = 'COM123456XYZ',
            Ingresos_Anuales__c = 10000000,
            Categoria__c = 'Platinum'
        );
        insert cliente;

        User admin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator'
                      AND IsActive = true LIMIT 1];

        Contrato__c contrato = new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = admin.Id,
            Monto__c = 5000000,
            Fecha_Inicio__c = Date.today().addMonths(-12),
            Fecha_Expiracion__c = Date.today().addMonths(12),
            Estado__c = 'Activo'
        );
        insert contrato;

        Test.startTest();
        Map<Id, Decimal> comisiones = ComisionCalculator.calcularComisionesPorVendedor();
        Test.stopTest();

        System.assert(!comisiones.isEmpty());
    }

    // =============================================
    // TESTS DE ESQUINA Y ERRORES
    // =============================================
    @isTest
    static void testValidacionesRFC() {
        System.assert(ClienteService.validarRFC('ABCD123456XYZ'));
        System.assert(!ClienteService.validarRFC(''));
        System.assert(!ClienteService.validarRFC('ABC123'));
        System.assert(!ClienteService.validarRFC(null));
    }

    @isTest
    static void testExcepcionesClienteService() {
        try {
            ClienteService.calcularCategoria(null);
            System.assert(false);
        } catch (IllegalArgumentException e) {
            System.assert(true);
        }

        try {
            ClienteService.asignarLimiteCredito(null);
            System.assert(false);
        } catch (IllegalArgumentException e) {
            System.assert(true);
        }
    }
}
```

2. Crea el archivo de documentación final del modelo de datos:

**`docs/MODELO-DATOS.md`:**
```markdown
# Modelo de Datos - ERP de Clientes y Contratos

## Objeto: Cliente__c

Representa un cliente corporativo del sistema ERP.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Name | Text (80) | Nombre del cliente |
| RFC__c | Text (13) | Registro Federal de Contribuyentes (único) |
| Ingresos_Anuales__c | Currency (18,2) | Ingresos anuales del cliente |
| Categoria__c | Picklist | Categoría: Bronze, Silver, Gold, Platinum |
| Limite_de_Credito__c | Currency (18,2) | Límite de crédito asignado |
| Sincronizado__c | Checkbox | Indica si se sincronizó con core bancario |
| Fecha_Sincronizacion__c | DateTime | Fecha de última sincronización |
| Error_Sincronizacion__c | LongTextArea (255) | Mensaje de error si falló la sincronización |

**Reglas de negocio:**
- RFC debe tener formato válido (12 o 13 caracteres alfanuméricos)
- Categoría se calcula automáticamente según ingresos anuales
- Límite de crédito = Ingresos * % según categoría (10%-40%)
- RFC debe ser único en el sistema

## Objeto: Contrato__c

Representa un contrato de servicio vinculado a un cliente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Name | AutoNumber | Número de contrato (CTR-{0000}) |
| Cliente__c | MasterDetail (Cliente__c) | Cliente asociado |
| Monto__c | Currency (18,2) | Monto del contrato |
| Estado__c | Picklist | Borrador, Activo, En_Renovacion, Vencido, Cancelado |
| Fecha_Inicio__c | Date | Fecha de inicio del contrato |
| Fecha_Expiracion__c | Date | Fecha de expiración |
| Vendedor__c | Lookup (User) | Vendedor responsable |

**Reglas de negocio:**
- Solo contratos en Borrador pueden activarse
- Contratos próximos a vencer (30 días) pasan a En_Renovacion
- Contratos vencidos no pueden reactivarse (deben renovarse)
- Un contrato activo genera comisiones para el vendedor

## Objeto: Comision__c

Representa una comisión generada por un contrato.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Name | AutoNumber | Número de comisión (COM-{0000}) |
| Contrato__c | MasterDetail (Contrato__c) | Contrato que genera la comisión |
| Monto_Comision__c | Currency (18,2) | Monto de la comisión |
| Porcentaje__c | Percent (5,2) | Porcentaje aplicado |
| Estado__c | Picklist | Pendiente, Pagada, Cancelada |

**Reglas de negocio:**
- Comisión = Monto del contrato * Porcentaje según categoría del cliente
- Porcentajes: Bronze=3%, Silver=5%, Gold=7%, Platinum=10%
- Ajuste adicional: +0.5% si monto > $1M, +1% si antigüedad > 6 meses
- Las comisiones de renovación usan 3% fijo

## Platform Events

| Evento | Campos | Propósito |
|--------|--------|-----------|
| Order_Event__e | Order_Id__c, Order_Total__c | Órdenes externas |
| Contract_Renewed__e | Contrato_Id__c, Vendedor_Id__c, Monto_Renovacion__c, Comision_Generada__c | Renovación de contratos |

## Relaciones

```
Cliente__c (1) ────< (N) Contrato__c
  │                              │
  │                              │
  └── Sincronizado con Core     └── (N) Comision__c
       bancario via HttpCallout       (cálculo automático)

Contrato__c ──── Vendedor__c (Lookup a User)

Platform Events:
  Contract_Renewed__e ──── disparado por ──── ContractRenewalService
  Order_Event__e      ──── disparado por ──── OrderEventPublisher
```

## Permisos y Seguridad

| Perfil | Cliente__c | Contrato__c | Comision__c |
|--------|:----------:|:-----------:|:-----------:|
| System Administrator | CRUD | CRUD | CRUD |
| Standard User | Read | Read, Create | Read |
| Minimum Access | — | — | — |
| Sales Manager | CRUD | CRUD | Read |

**Nota:** FLS debe verificarse explícitamente en Apex usando `Schema.DescribeFieldResult.isAccessible()` y `Security.stripInaccessible()`.
```

3. Actualiza el `README.md` del proyecto principal (en `force-app/`) con información del ERP:

**`force-app/README.md`:**
```markdown
# ERP de Gestión de Clientes, Contratos y Comisiones

## Descripción

Sistema ERP corporativo construido en Salesforce para la gestión integral de clientes,
contratos de servicio y comisiones de vendedores.

## Módulos

### 1. Gestión de Clientes (`ClienteService`)
- Creación y categorización automática por ingresos (Bronze/Silver/Gold/Platinum)
- Validación de RFC con expresión regular
- Asignación automática de límite de crédito según categoría
- Sincronización con API bancaria externa vía batch

### 2. Gestión de Contratos (`ContratoService`)
- Creación con fechas de inicio/expiración y cálculo de duración
- Ciclo de vida: Borrador → Activo → En_Renovacion → Vencido/Cancelado
- Batch de renovación automática (30 días antes del vencimiento)
- Creación de tareas para vendedores al renovar

### 3. Comisiones (`ComisionCalculator`)
- Cálculo automático basado en categoría del cliente
- Ajustes por alto monto y antigüedad del contrato
- Logging detallado para depuración de errores de redondeo
- Platform Events para notificación de renovaciones

### 4. Integraciones
- Sincronización batch con core bancario (HttpCalloutMock)
- Verificación de buró de crédito (Flow + Apex Invocable)
- Platform Events para arquitectura event-driven

## Stack Técnico

- **Lenguaje:** Apex (clases, triggers, batch, platform events)
- **Frontend:** LWC (Lightning Web Components)
- **Testing:** Apex tests con @TestSetup, HttpCalloutMock, runAs
- **CI/CD:** GitHub Actions + Salesforce CLI + Copado
- **Cobertura mínima:** 75%

## Requisitos

- Salesforce CLI instalado
- Dev Hub habilitado
- Node.js 18+ (para tests Jest)
- Acceso a Connected App con JWT (para CI/CD)

## Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd erp-clientes-contratos

# 2. Crear scratch org
sf org create scratch --definition-file config/dev-scratch.json --alias ERPLocal --duration-days 7

# 3. Desplegar código
sf project deploy start --source-dir force-app/main/default --target-org ERPLocal

# 4. Ejecutar tests
sf apex run test --target-org ERPLocal --test-level RunLocalTests --wait 5

# 5. Abrir org
sf org open --target-org ERPLocal
```

## Tests

```bash
# Tests Apex
sf apex run test --target-org ERPLocal --test-level RunLocalTests --code-coverage --wait 10

# Tests Jest LWC
npx jest force-app/main/default/lwc --coverage
```

## Licencia

Proyecto educativo - Salesforce Developer Training
```
```

4. Ejecuta la suite completa de tests y verifica la cobertura:

```bash
# Ejecutar todos los tests del proyecto
sf apex run test --target-org TestOrg --test-level RunLocalTests --code-coverage --wait 5 --result-format human

# Verificar cobertura específica
sf apex get test --class-names ERPSuiteCompletaTests --target-org TestOrg --code-coverage
```

5. Verifica que la cobertura total supera el 75%. Si no, agrega más tests hasta alcanzar el umbral.

6. Realiza el commit final de cierre del proyecto:
```bash
git add .
git commit -m "feat: final ERP complete - suite tests, documentation, 75%+ coverage"
git tag v1.0.0
git push origin main --tags
```

7. Criterios de aprobación del examen final:
   - [ ] Suite completa de tests pasa sin errores
   - [ ] Cobertura de código Apex > 75%
   - [ ] Tests Jest para LWC pasan
   - [ ] Modelo de datos documentado
   - [ ] README del proyecto actualizado
   - [ ] CI/CD pipeline configurado y funcional
   - [ ] Documentación de estrategia Copado completada
