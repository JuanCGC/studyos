# 📘 05. System.runAs y FLS

- **Concepto Clave Asimilado:** `System.runAs` para ejecutar código en contexto de otro usuario y verificación de Field-Level Security (FLS) usando `Schema.DescribeFieldResult` y `isAccessible/isUpdateable`.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** runAs Demo — Test que usa `System.runAs(usuarioSinPermisos)` y verifica que un DML falle por falta de permisos

**Instrucciones:**

1. Crea la clase `SeguridadService.cls`:
```apex
public class SeguridadService {

    public static Account crearCuenta(String nombre) {
        Account acc = new Account(Name = nombre);
        insert acc;
        return acc;
    }

    public static void actualizarTelefono(Id accountId, String telefono) {
        Account acc = [SELECT Id, Phone FROM Account WHERE Id = :accountId LIMIT 1];
        acc.Phone = telefono;
        update acc;
    }

    public static Boolean verificarAccesoObjeto(String objetoApiName) {
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objetoApiName);
        if (targetType == null) {
            return false;
        }
        return targetType.getDescribe().isAccessible();
    }

    public static Boolean verificarAccesoCampo(String objetoApiName, String campoApiName) {
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objetoApiName);
        if (targetType == null) return false;

        Schema.DescribeSObjectResult objDescribe = targetType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();
        Schema.SObjectField field = fieldMap.get(campoApiName);
        if (field == null) return false;

        return field.getDescribe().isAccessible();
    }
}
```

2. Crea la clase de test `SeguridadServiceTest.cls`:
```apex
@isTest
private class SeguridadServiceTest {

    @isTest
    static void testAdminPuedeCrearCuenta() {
        // El usuario por defecto (admin) puede crear cuentas
        Account acc = SeguridadService.crearCuenta('Cuenta Admin');
        System.assertNotEquals(null, acc.Id);
    }

    @isTest
    static void testRunAsUsuarioSinPermisos() {
        Profile perfilSinAccount = [SELECT Id FROM Profile WHERE Name = 'Minimum Access - Salesforce' LIMIT 1];

        User usuarioRestringido = new User(
            Alias = 'restric',
            Email = 'restringido@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Restringido',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfilSinAccount.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'restringido.' + DateTime.now().getTime() + '@test.com'
        );
        insert usuarioRestringido;

        System.runAs(usuarioRestringido) {
            try {
                Account acc = new Account(Name = 'Cuenta Sin Permiso');
                insert acc;
                System.assert(false, 'Debió fallar el insert');
            } catch (Exception e) {
                System.assert(e.getMessage().contains('INSUFFICIENT_ACCESS'));
            }
        }
    }

    @isTest
    static void testVerificarAccesoObjeto() {
        System.assertEquals(true, SeguridadService.verificarAccesoObjeto('Account'));
    }

    @isTest
    static void testVerificarAccesoCampo() {
        System.assertEquals(true, SeguridadService.verificarAccesoCampo('Account', 'Name'));
    }

    @isTest
    static void testVerificarAccesoObjetoInexistente() {
        System.assertEquals(false, SeguridadService.verificarAccesoObjeto('ObjetoInexistente__c'));
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names SeguridadServiceTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** FLS en Contratos — Tests que verifican permisos de campo: usuario sin permiso a `Monto__c` no puede verlo, admin sí puede, usuario con permiso parcial solo edita campos permitidos

**Instrucciones:**

1. Crea la clase `ContratoFLSService.cls` con verificación FLS explícita:
```apex
public class ContratoFLSService {

    public static Map<String, Boolean> verificarPermisosCamposContrato() {
        Map<String, Boolean> permisos = new Map<String, Boolean>();

        Schema.DescribeSObjectResult describe = Contrato__c.SObjectType.getDescribe();
        Map<String, Schema.SObjectField> fields = describe.fields.getMap();

        for (String campo : fields.keySet()) {
            Schema.DescribeFieldResult fieldDescribe = fields.get(campo).getDescribe();
            permisos.put(campo, fieldDescribe.isAccessible());
        }

        return permisos;
    }

    public static Boolean campoEsAccessible(String campoApiName) {
        Schema.SObjectField field = Contrato__c.SObjectType.getDescribe().fields.getMap().get(campoApiName);
        if (field == null) return false;
        return field.getDescribe().isAccessible();
    }

    public static Boolean campoEsActualizable(String campoApiName) {
        Schema.SObjectField field = Contrato__c.SObjectType.getDescribe().fields.getMap().get(campoApiName);
        if (field == null) return false;
        return field.getDescribe().isUpdateable();
    }

    public static List<Contrato__c> obtenerContratosConFLS() {
        if (!Contrato__c.SObjectType.getDescribe().isAccessible()) {
            throw new SecurityException('El usuario no tiene acceso al objeto Contrato__c');
        }

        List<String> camposAccesibles = new List<String>();
        Map<String, Schema.SObjectField> campos = Contrato__c.SObjectType.getDescribe().fields.getMap();

        for (String campo : campos.keySet()) {
            if (campos.get(campo).getDescribe().isAccessible()) {
                camposAccesibles.add(campo);
            }
        }

        if (camposAccesibles.isEmpty()) {
            return new List<Contrato__c>();
        }

        String query = 'SELECT ' + String.join(camposAccesibles, ', ') + ' FROM Contrato__c';
        return Database.query(query);
    }

    public static void actualizarMontoContratoSeguro(Id contratoId, Decimal nuevoMonto) {
        if (!campoEsActualizable('Monto__c')) {
            throw new SecurityException('No tiene permiso para actualizar Monto__c');
        }

        Contrato__c contrato = new Contrato__c(Id = contratoId, Monto__c = nuevoMonto);
        update contrato;
    }

    public static Contrato__c obtenerContratoConCampoSeguro(Id contratoId, String campo) {
        if (!campoEsAccessible(campo)) {
            return null;
        }

        String query = 'SELECT Id, ' + campo + ' FROM Contrato__c WHERE Id = :contratoId LIMIT 1';
        List<Contrato__c> resultados = Database.query(query);
        return resultados.isEmpty() ? null : resultados[0];
    }
}
```

2. Crea perfiles personalizados para las pruebas de permisos:

**`classes/PerfilContratosTestUtil.cls`:**
```apex
@isTest
public class PerfilContratosTestUtil {

    public static User crearUsuarioConPerfil(String perfilName) {
        Profile perfil = [SELECT Id FROM Profile WHERE Name = :perfilName LIMIT 1];

        User usr = new User(
            Alias = perfilName.left(8),
            Email = perfilName + '.' + DateTime.now().getTime() + '@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = perfilName + ' User',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfil.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = perfilName + '.' + DateTime.now().getTime() + '@test.com'
        );
        insert usr;
        return usr;
    }

    public static void crearDatosPrueba() {
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente FLS Test',
            RFC__c = 'FLS123456XYZ',
            Ingresos_Anuales__c = 1000000,
            Categoria__c = 'Bronze'
        );
        insert cliente;

        User admin = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];

        Contrato__c contrato = new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = admin.Id,
            Monto__c = 50000,
            Fecha_Inicio__c = Date.today(),
            Fecha_Expiracion__c = Date.today().addMonths(12),
            Estado__c = 'Activo'
        );
        insert contrato;
    }
}
```

3. Crea la clase de test `ContratoFLSServiceTest.cls`:
```apex
@isTest
private class ContratoFLSServiceTest {

    @TestSetup
    static void setup() {
        PerfilContratosTestUtil.crearDatosPrueba();
    }

    @isTest
    static void testAdminPuedeVerTodosLosCampos() {
        User admin = PerfilContratosTestUtil.crearUsuarioConPerfil('System Administrator');

        System.runAs(admin) {
            Map<String, Boolean> permisos = ContratoFLSService.verificarPermisosCamposContrato();

            System.assert(permisos.containsKey('Monto__c'));
            System.assertEquals(true, permisos.get('Monto__c'));
            System.assert(permisos.containsKey('Estado__c'));
            System.assertEquals(true, permisos.get('Estado__c'));
        }
    }

    @isTest
    static void testUsuarioSinPermisoNoPuedeVerMonto() {
        // Usuario con perfil mínimo no tiene acceso a objetos personalizados
        User usuarioMinimo = PerfilContratosTestUtil.crearUsuarioConPerfil('Minimum Access - Salesforce');

        System.runAs(usuarioMinimo) {
            // El objeto Contrato__c puede no ser accesible en absoluto
            if (!Contrato__c.SObjectType.getDescribe().isAccessible()) {
                try {
                    ContratoFLSService.obtenerContratosConFLS();
                    System.assert(false, 'Debió fallar');
                } catch (SecurityException e) {
                    System.assert(e.getMessage().contains('no tiene acceso'));
                }
            } else {
                // Verificar campo específico
                Boolean montoAccesible = ContratoFLSService.campoEsAccessible('Monto__c');
                System.assertEquals(false, montoAccesible);
            }
        }
    }

    @isTest
    static void testStripInaccessibleEnInserts() {
        User usuarioMinimo = PerfilContratosTestUtil.crearUsuarioConPerfil('Minimum Access - Salesforce');

        System.runAs(usuarioMinimo) {
            Cliente__c cliente = [SELECT Id FROM Cliente__c LIMIT 1];

            Contrato__c contrato = new Contrato__c(
                Cliente__c = cliente.Id,
                Vendedor__c = UserInfo.getUserId(),
                Monto__c = 99999,
                Fecha_Inicio__c = Date.today(),
                Estado__c = 'Borrador'
            );

            try {
                // Usar stripInaccessible para campos no accesibles
                SObjectAccessDecision decision = Security.stripInaccessible(
                    AccessType.CREATABLE,
                    new List<SObject>{contrato}
                );

                for (Contrato__c c : (List<Contrato__c>)decision.getRecords()) {
                    System.assertEquals(null, c.Monto__c, 'Monto debe ser null si no es accesible');
                }

                System.assert(!decision.getRemovedFields().isEmpty());
                System.assert(decision.getRemovedFields().get('Contrato__c').contains('Monto__c'));

            } catch (Exception e) {
                // Si el usuario no tiene acceso al objeto completo, es válido
                System.assert(e.getMessage().contains('INSUFFICIENT_ACCESS') ||
                              e.getMessage().contains('no tiene acceso'));
            }
        }
    }

    @isTest
    static void testAdminPuedeActualizarMonto() {
        User admin = PerfilContratosTestUtil.crearUsuarioConPerfil('System Administrator');
        Contrato__c contrato = [SELECT Id, Monto__c FROM Contrato__c LIMIT 1];

        System.runAs(admin) {
            ContratoFLSService.actualizarMontoContratoSeguro(contrato.Id, 99999);

            Contrato__c actualizado = [SELECT Monto__c FROM Contrato__c WHERE Id = :contrato.Id];
            System.assertEquals(99999, actualizado.Monto__c);
        }
    }

    @isTest
    static void testObtenerContratoConCampoSeguro() {
        User admin = PerfilContratosTestUtil.crearUsuarioConPerfil('System Administrator');
        Contrato__c contrato = [SELECT Id FROM Contrato__c LIMIT 1];

        System.runAs(admin) {
            Contrato__c resultado = ContratoFLSService.obtenerContratoConCampoSeguro(contrato.Id, 'Monto__c');
            System.assertNotEquals(null, resultado);
            System.assertEquals(50000, resultado.Monto__c);
        }
    }

    @isTest
    static void testObtenerContratoConCampoSinPermisoRetornaNull() {
        User usuarioMinimo = PerfilContratosTestUtil.crearUsuarioConPerfil('Minimum Access - Salesforce');
        Contrato__c contrato = [SELECT Id FROM Contrato__c LIMIT 1];

        System.runAs(usuarioMinimo) {
            Contrato__c resultado = ContratoFLSService.obtenerContratoConCampoSeguro(contrato.Id, 'Monto__c');
            System.assertEquals(null, resultado,
                'Si no tiene acceso a Monto__c, debe retornar null');
        }
    }

    @isTest
    static void testSecurityStripInaccessibleEnUpdates() {
        User admin = PerfilContratosTestUtil.crearUsuarioConPerfil('System Administrator');
        Contrato__c contrato = [SELECT Id, Monto__c FROM Contrato__c LIMIT 1];

        Contrato__c contratoModificado = new Contrato__c(
            Id = contrato.Id,
            Monto__c = 88888,
            Estado__c = 'Cancelado'
        );

        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.UPDATABLE,
            new List<SObject>{contratoModificado}
        );

        System.assertNotEquals(null, decision);
    }
}
```

4. Despliega y ejecuta los tests:
```bash
sf project deploy start --source-dir force-app/main/default --target-org TestOrg

sf apex run test --class-names ContratoFLSServiceTest --target-org TestOrg --test-level RunSpecifiedTests --wait 2
```

5. Puntos clave sobre FLS en Apex:
   - **Sin FLS check**: Apex code ejecutado como admin (o sin `with sharing`) omite FLS.
   - **Con FLS check**: Debes explícitamente verificar `isAccessible()`/`isUpdateable()` antes de leer/escribir.
   - **Security.stripInaccessible()**: Método de Salesforce que automáticamente remueve campos a los que el usuario no tiene acceso.
   - **System.runAs**: Cambia el contexto de usuario para pruebas de permisos.
   - **with sharing vs without sharing**: Las clases `with sharing` respetan FLS pero no lo verifican automáticamente para acceso a campos en queries.
