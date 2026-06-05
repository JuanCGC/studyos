# 📘 03. @isTest y @TestSetup

- **Concepto Clave Asimilado:** Anotaciones `@isTest` para clases de prueba, `@TestSetup` para datos reutilizables entre tests, aserciones con `System.assert`, `System.assertEquals`, `System.assertNotEquals`.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Test Hello World — Clase de test con método que prueba suma de 2 números y assert básico

**Instrucciones:**

1. Crea la clase bajo prueba `Calculadora.cls`:
```apex
public class Calculadora {
    public static Integer sumar(Integer a, Integer b) {
        return a + b;
    }

    public static Integer restar(Integer a, Integer b) {
        return a - b;
    }

    public static Integer multiplicar(Integer a, Integer b) {
        return a * b;
    }

    public static Decimal dividir(Integer a, Integer b) {
        if (b == 0) {
            throw new IllegalArgumentException('No se puede dividir por cero');
        }
        return (Decimal)a / (Decimal)b;
    }
}
```

2. Crea la clase de test `CalculadoraTest.cls`:
```apex
@isTest
private class CalculadoraTest {

    @isTest
    static void testSumar() {
        Integer resultado = Calculadora.sumar(5, 3);
        System.assertEquals(8, resultado, '5 + 3 debe ser 8');
    }

    @isTest
    static void testRestar() {
        Integer resultado = Calculadora.restar(10, 4);
        System.assertEquals(6, resultado);
    }

    @isTest
    static void testMultiplicar() {
        Integer resultado = Calculadora.multiplicar(6, 7);
        System.assertEquals(42, resultado);
    }

    @isTest
    static void testDividir() {
        Decimal resultado = Calculadora.dividir(10, 3);
        // Verificar valor aproximado
        System.assertEquals(3.33, resultado.setScale(2));
    }

    @isTest
    static void testDividirPorCero() {
        try {
            Calculadora.dividir(5, 0);
            System.assert(false, 'Debió lanzar excepción');
        } catch (IllegalArgumentException e) {
            System.assert(e.getMessage().contains('cero'));
        }
    }

    @isTest
    static void testSumarNegativos() {
        System.assertEquals(-2, Calculadora.sumar(-5, 3));
    }

    @isTest
    static void testAsercionesMultiples() {
        Integer suma = Calculadora.sumar(100, 200);
        System.assert(suma > 0, 'La suma debe ser positiva');
        System.assertEquals(300, suma);
        System.assertNotEquals(0, suma);
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names CalculadoraTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** @TestSetup de Contratos — TestSetup que crea 5 contratos en diferentes estados y tests que verifican consultas por estado, fechas de expiración y montos

**Instrucciones:**

1. Crea la clase de test para ContratoService con `@TestSetup`:

**`classes/ContratoServiceTest.cls`:**
```apex
@isTest
private class ContratoServiceTest {

    @TestSetup
    static void setup() {
        // Crear cliente de prueba
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Test Setup',
            RFC__c = 'TST123456XYZ',
            Ingresos_Anuales__c = 5000000,
            Categoria__c = 'Silver'
        );
        insert cliente;

        // Crear vendedor de prueba
        Profile perfil = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User vendedor = new User(
            Alias = 'vtest',
            Email = 'vendedor.test@example.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Vendedor Test',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfil.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'vendedor.test.' + DateTime.now().getTime() + '@example.com'
        );
        insert vendedor;

        // Crear 5 contratos en diferentes estados
        List<Contrato__c> contratos = new List<Contrato__c>();

        // Contrato 1: Borrador (vigente)
        contratos.add(new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = vendedor.Id,
            Monto__c = 50000,
            Fecha_Inicio__c = Date.today(),
            Fecha_Expiracion__c = Date.today().addMonths(12),
            Estado__c = 'Borrador'
        ));

        // Contrato 2: Activo
        contratos.add(new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = vendedor.Id,
            Monto__c = 150000,
            Fecha_Inicio__c = Date.today().addMonths(-6),
            Fecha_Expiracion__c = Date.today().addMonths(6),
            Estado__c = 'Activo'
        ));

        // Contrato 3: En Renovación (a punto de vencer)
        contratos.add(new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = vendedor.Id,
            Monto__c = 200000,
            Fecha_Inicio__c = Date.today().addMonths(-11),
            Fecha_Expiracion__c = Date.today().addDays(15),
            Estado__c = 'En_Renovacion'
        ));

        // Contrato 4: Vencido
        contratos.add(new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = vendedor.Id,
            Monto__c = 75000,
            Fecha_Inicio__c = Date.today().addMonths(-18),
            Fecha_Expiracion__c = Date.today().addMonths(-6),
            Estado__c = 'Vencido'
        ));

        // Contrato 5: Cancelado
        contratos.add(new Contrato__c(
            Cliente__c = cliente.Id,
            Vendedor__c = vendedor.Id,
            Monto__c = 30000,
            Fecha_Inicio__c = Date.today().addMonths(-24),
            Fecha_Expiracion__c = Date.today().addMonths(-12),
            Estado__c = 'Cancelado'
        ));

        insert contratos;
    }

    @isTest
    static void testConsultarContratosPorEstadoActivo() {
        List<Contrato__c> activos = [SELECT Id, Estado__c, Monto__c
                                     FROM Contrato__c WHERE Estado__c = 'Activo'];
        System.assertEquals(1, activos.size(), 'Debe haber 1 contrato activo');
        System.assertEquals(150000, activos[0].Monto__c);
    }

    @isTest
    static void testConsultarContratosPorEstadoBorrador() {
        List<Contrato__c> borradores = [SELECT Id, Estado__c FROM Contrato__c WHERE Estado__c = 'Borrador'];
        System.assertEquals(1, borradores.size());
    }

    @isTest
    static void testConsultarContratosNoCancelados() {
        List<Contrato__c> activos = [SELECT Id, Estado__c FROM Contrato__c
                                     WHERE Estado__c != 'Cancelado'];
        System.assertEquals(4, activos.size());
    }

    @isTest
    static void testContratosPorVencer() {
        Date hoy = Date.today();
        Date dentroDe30Dias = hoy.addDays(30);

        List<Contrato__c> porVencer = [SELECT Id, Fecha_Expiracion__c, Estado__c
                                       FROM Contrato__c
                                       WHERE Fecha_Expiracion__c >= :hoy
                                       AND Fecha_Expiracion__c <= :dentroDe30Dias];
        System.assertEquals(1, porVencer.size());
        System.assertEquals('En_Renovacion', porVencer[0].Estado__c);
    }

    @isTest
    static void testContratosVencidos() {
        List<Contrato__c> vencidos = [SELECT Id, Fecha_Expiracion__c FROM Contrato__c
                                      WHERE Fecha_Expiracion__c < :Date.today()];
        System.assertEquals(2, vencidos.size(), 'Debe haber 2 contratos vencidos');
    }

    @isTest
    static void testMontoTotalActivos() {
        AggregateResult resultado = [SELECT SUM(Monto__c) total
                                     FROM Contrato__c WHERE Estado__c = 'Activo'];
        Decimal total = (Decimal)resultado.get('total');
        System.assertEquals(150000, total);
    }

    @isTest
    static void testContratosDelVendedor() {
        User vendedor = [SELECT Id FROM User WHERE Email = 'vendedor.test@example.com' LIMIT 1];

        List<Contrato__c> contratos = [SELECT Id, Vendedor__c FROM Contrato__c
                                       WHERE Vendedor__c = :vendedor.Id];
        System.assertEquals(5, contratos.size());
    }

    @isTest
    static void testActivarContrato() {
        Contrato__c borrador = [SELECT Id, Estado__c FROM Contrato__c WHERE Estado__c = 'Borrador' LIMIT 1];

        Test.startTest();
        ContratoService.activarContrato(borrador.Id);
        Test.stopTest();

        Contrato__c activado = [SELECT Estado__c FROM Contrato__c WHERE Id = :borrador.Id];
        System.assertEquals('Activo', activado.Estado__c);
    }

    @isTest
    static void testActivarContratoYaActivoFalla() {
        Contrato__c activo = [SELECT Id, Estado__c FROM Contrato__c WHERE Estado__c = 'Activo' LIMIT 1];

        try {
            ContratoService.activarContrato(activo.Id);
            System.assert(false, 'Debió lanzar excepción');
        } catch (IllegalArgumentException e) {
            System.assert(e.getMessage().contains('Borrador'));
        }
    }
}
```

2. Ejecuta los tests:
```bash
sf apex run test --class-names ContratoServiceTest --target-org TestOrg --test-level RunSpecifiedTests --wait 2
```

3. Verifica que los tests pasan. Observa cómo `@TestSetup` ejecuta el método `setup()` una sola vez y cada `@isTest` obtiene una copia limpia de esos datos.

4. Puntos clave sobre `@TestSetup`:
   - El método `setup()` se ejecuta una vez por clase, no por método.
   - Los datos están disponibles en todos los `@isTest` methods.
   - Si modificas datos en un test, otros tests no se ven afectados (cada test tiene su propia transacción).
   - Los datos creados en `@TestSetup` no cuentan para límites de DML en cada test individual.
