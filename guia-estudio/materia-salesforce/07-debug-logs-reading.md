# 📘 07. Debug Logs y Lectura

- **Concepto Clave Asimilado:** Uso de `System.debug()` en múltiples niveles (DEBUG, INFO, WARN, ERROR), generación y análisis de debug logs en Setup → Logs para depurar errores en tiempo de ejecución.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** System.debug Logger — Clase con `System.debug()` en varios niveles, test que la ejecuta y revisión de logs en Setup → Logs

**Instrucciones:**

1. Crea la clase `LoggerDemo.cls`:
```apex
public class LoggerDemo {

    public static void demoNivelesDebug() {
        System.debug('=== DEMO DE NIVELES DE DEBUG ===');

        // Nivel DEBUG (más detallado, menos severo)
        System.debug(LoggingLevel.DEBUG, 'DEBUG: Valor de variable X = 42');

        // Nivel INFO
        System.debug(LoggingLevel.INFO, 'INFO: Procesando registro 123');

        // Nivel WARN
        System.debug(LoggingLevel.WARN, 'WARN: Límite de crédito cercano al tope para cliente C-001');

        // Nivel ERROR
        System.debug(LoggingLevel.ERROR, 'ERROR: Falló la validación RFC para el registro ABC');

        // Sin nivel específico (usa el default)
        System.debug('Mensaje sin nivel específico');
    }

    public static Decimal procesarPago(Decimal monto, Decimal saldoDisponible) {
        System.debug(LoggingLevel.INFO, 'Iniciando procesamiento de pago');
        System.debug(LoggingLevel.DEBUG, 'Monto recibido: ' + monto);
        System.debug(LoggingLevel.DEBUG, 'Saldo disponible: ' + saldoDisponible);

        if (monto <= 0) {
            System.debug(LoggingLevel.ERROR, 'Monto inválido: ' + monto);
            throw new IllegalArgumentException('Monto debe ser positivo');
        }

        if (monto > saldoDisponible) {
            System.debug(LoggingLevel.WARN, 'Fondos insuficientes. Solicitado: ' + monto + ', Disponible: ' + saldoDisponible);
            return 0;
        }

        Decimal nuevoSaldo = saldoDisponible - monto;
        System.debug(LoggingLevel.INFO, 'Pago exitoso. Nuevo saldo: ' + nuevoSaldo);
        System.debug(LoggingLevel.DEBUG, 'Transacción completada sin errores');

        return nuevoSaldo;
    }

    public static void procesarListaPrecios(List<Decimal> precios) {
        System.debug(LoggingLevel.INFO, 'Procesando lista de ' + precios.size() + ' precios');

        for (Integer i = 0; i < precios.size(); i++) {
            System.debug(LoggingLevel.DEBUG, 'Precio[' + i + '] = ' + precios[i]);

            if (precios[i] < 0) {
                System.debug(LoggingLevel.WARN, 'Precio negativo encontrado en índice ' + i);
            }
        }

        System.debug(LoggingLevel.INFO, 'Procesamiento completado');
    }

    public static void simularErrorComplejo() {
        try {
            System.debug(LoggingLevel.INFO, 'Iniciando operación compleja');

            // Paso 1
            System.debug(LoggingLevel.DEBUG, 'Paso 1: Validando datos de entrada');
            List<Account> cuentas = [SELECT Id, Name FROM Account LIMIT 5];
            System.debug(LoggingLevel.DEBUG, 'Cuentas encontradas: ' + cuentas.size());

            // Paso 2
            System.debug(LoggingLevel.DEBUG, 'Paso 2: Procesando cuentas');
            for (Account c : cuentas) {
                System.debug(LoggingLevel.DEBUG, 'Procesando: ' + c.Name);
            }

            // Paso 3 (falla intencionalmente)
            System.debug(LoggingLevel.DEBUG, 'Paso 3: Actualizando registros');
            Integer division = 10 / 0; // Esto lanza ArithmeticException

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error en operación compleja: ' + e.getMessage());
            System.debug(LoggingLevel.ERROR, 'Stack trace: ' + e.getStackTraceString());
            System.debug(LoggingLevel.ERROR, 'Línea: ' + e.getLineNumber());
        }
    }
}
```

2. Crea la clase de test `LoggerDemoTest.cls`:
```apex
@isTest
private class LoggerDemoTest {

    @isTest
    static void testDemoNivelesDebug() {
        LoggerDemo.demoNivelesDebug();
        System.assert(true, 'Debe ejecutarse sin errores');
    }

    @isTest
    static void testProcesarPagoExitoso() {
        Decimal resultado = LoggerDemo.procesarPago(500, 1000);
        System.assertEquals(500, resultado);
    }

    @isTest
    static void testProcesarPagoFondosInsuficientes() {
        Decimal resultado = LoggerDemo.procesarPago(1500, 1000);
        System.assertEquals(0, resultado);
    }

    @isTest
    static void testProcesarPagoMontoInvalido() {
        try {
            LoggerDemo.procesarPago(-100, 1000);
            System.assert(false, 'Debió lanzar excepción');
        } catch (IllegalArgumentException e) {
            System.assert(true, 'Excepción capturada correctamente');
        }
    }

    @isTest
    static void testProcesarListaPrecios() {
        List<Decimal> precios = new List<Decimal>{100, 200, -50, 300, -10};
        LoggerDemo.procesarListaPrecios(precios);

        // El test pasa si no hay excepciones
        System.assert(true);
    }

    @isTest
    static void testSimularErrorComplejo() {
        LoggerDemo.simularErrorComplejo();
        System.assert(true, 'El error debe ser capturado por el try-catch');
    }

    @isTest
    static void testVerificarLogsGenerados() {
        // Este test genera logs que se pueden revisar en Setup → Debug Logs
        Test.startTest();

        LoggerDemo.procesarPago(1000, 2000);
        LoggerDemo.procesarListaPrecios(new List<Decimal>{50, 75, 100});
        LoggerDemo.simularErrorComplejo();

        Test.stopTest();

        // Verificar que se generó actividad
        System.debug(LoggingLevel.INFO, '=== FIN DE TEST ===');
        System.assert(true);
    }
}
```

3. Ejecuta el test y revisa los logs:
```bash
sf apex run test --class-names LoggerDemoTest --target-org TestOrg --test-level RunSpecifiedTests --wait 2

# Para ver logs desde CLI:
sf apex get log --target-org TestOrg --number 5
```

4. Accede a Setup → Debug Logs en la org para ver los logs generados. Busca los mensajes con cada nivel de severidad.

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Debug del Pipeline de Comisiones — Método complejo que calcula comisiones, logs en cada paso y test que genera logs para analizar error de redondeo

**Instrucciones:**

1. Crea la clase `ComisionCalculator.cls` con logging detallado:
```apex
public class ComisionCalculator {

    // Configuración de comisiones por categoría
    private static final Map<String, Decimal> COMISIONES_POR_CATEGORIA = new Map<String, Decimal>{
        'Bronze' => 0.03,
        'Silver' => 0.05,
        'Gold' => 0.07,
        'Platinum' => 0.10
    };

    public static Map<Id, Decimal> calcularComisionesPorVendedor() {
        System.debug(LoggingLevel.INFO, '=== INICIO: Cálculo de Comisiones ===');
        System.debug(LoggingLevel.DEBUG, 'Timestamp: ' + DateTime.now());

        Map<Id, Decimal> comisionesPorVendedor = new Map<Id, Decimal>();

        // Paso 1: Obtener contratos activos
        System.debug(LoggingLevel.INFO, 'Paso 1: Consultando contratos activos');
        List<Contrato__c> contratosActivos = [
            SELECT Id, Name, Monto__c, Vendedor__c, Cliente__c, Fecha_Inicio__c,
                   Cliente__r.Categoria__c, Cliente__r.Ingresos_Anuales__c
            FROM Contrato__c
            WHERE Estado__c = 'Activo'
        ];
        System.debug(LoggingLevel.DEBUG, 'Contratos activos encontrados: ' + contratosActivos.size());

        if (contratosActivos.isEmpty()) {
            System.debug(LoggingLevel.WARN, 'No hay contratos activos para calcular comisiones');
            return comisionesPorVendedor;
        }

        // Paso 2: Agrupar contratos por vendedor
        System.debug(LoggingLevel.INFO, 'Paso 2: Agrupando contratos por vendedor');
        Map<Id, List<Contrato__c>> contratosPorVendedor = new Map<Id, List<Contrato__c>>();

        for (Contrato__c contrato : contratosActivos) {
            if (contrato.Vendedor__c == null) {
                System.debug(LoggingLevel.WARN, 'Contrato ' + contrato.Name + ' no tiene vendedor asignado');
                continue;
            }

            if (!contratosPorVendedor.containsKey(contrato.Vendedor__c)) {
                contratosPorVendedor.put(contrato.Vendedor__c, new List<Contrato__c>());
            }
            contratosPorVendedor.get(contrato.Vendedor__c).add(contrato);

            System.debug(LoggingLevel.DEBUG, 'Contrato ' + contrato.Name +
                ' -> Vendedor: ' + contrato.Vendedor__c +
                ' | Monto: ' + contrato.Monto__c +
                ' | Categoría Cliente: ' + contrato.Cliente__r.Categoria__c);
        }

        System.debug(LoggingLevel.DEBUG, 'Vendedores con contratos: ' + contratosPorVendedor.size());

        // Paso 3: Calcular comisión por vendedor
        System.debug(LoggingLevel.INFO, 'Paso 3: Calculando comisiones individuales');

        for (Id vendedorId : contratosPorVendedor.keySet()) {
            System.debug(LoggingLevel.DEBUG, '--- Procesando Vendedor: ' + vendedorId + ' ---');

            List<Contrato__c> contratos = contratosPorVendedor.get(vendedorId);
            Decimal comisionTotalVendedor = 0;

            for (Contrato__c contrato : contratos) {
                // Obtener porcentaje según categoría del cliente
                Decimal porcentajeComision = COMISIONES_POR_CATEGORIA.get(contrato.Cliente__r.Categoria__c);
                if (porcentajeComision == null) {
                    System.debug(LoggingLevel.WARN, 'Categoría no reconocida: ' + contrato.Cliente__r.Categoria__c);
                    porcentajeComision = 0.02; // Default 2%
                }

                // Calcular comisión base
                Decimal comisionBase = contrato.Monto__c * porcentajeComision;

                // Ajuste por monto: contratos > 1M tienen 0.5% adicional
                Decimal ajuste = 0;
                if (contrato.Monto__c > 1000000) {
                    ajuste = contrato.Monto__c * 0.005;
                    System.debug(LoggingLevel.DEBUG, 'Ajuste por alto monto aplicado: ' + ajuste);
                }

                // Ajuste por antigüedad: contratos con más de 6 meses activos +1%
                Decimal ajusteAntiguedad = 0;
                if (contrato.Fecha_Inicio__c != null &&
                    contrato.Fecha_Inicio__c <= Date.today().addMonths(-6)) {
                    ajusteAntiguedad = contrato.Monto__c * 0.01;
                    System.debug(LoggingLevel.DEBUG, 'Ajuste por antigüedad aplicado: ' + ajusteAntiguedad);
                }

                Decimal comisionFinal = comisionBase + ajuste + ajusteAntiguedad;

                System.debug(LoggingLevel.DEBUG, 'Contrato: ' + contrato.Name +
                    ' | Monto: ' + contrato.Monto__c +
                    ' | %Comisión: ' + (porcentajeComision * 100) + '%' +
                    ' | Base: ' + comisionBase.setScale(2) +
                    ' | Ajuste: ' + ajuste.setScale(2) +
                    ' | Antigüedad: ' + ajusteAntiguedad.setScale(2) +
                    ' | TOTAL: ' + comisionFinal.setScale(2));

                comisionTotalVendedor += comisionFinal;
            }

            System.debug(LoggingLevel.INFO, 'Comisión total del vendedor ' + vendedorId + ': ' +
                comisionTotalVendedor.setScale(2));

            // Redondear a 2 decimales para evitar errores de redondeo
            comisionTotalVendedor = comisionTotalVendedor.setScale(2, System.RoundingMode.HALF_UP);
            comisionesPorVendedor.put(vendedorId, comisionTotalVendedor);
        }

        // Paso 4: Resumen final
        System.debug(LoggingLevel.INFO, '=== RESUMEN DE COMISIONES ===');
        for (Id vendedorId : comisionesPorVendedor.keySet()) {
            System.debug(LoggingLevel.INFO, 'Vendedor: ' + vendedorId +
                ' | Comisión Total: $' + comisionesPorVendedor.get(vendedorId));
        }

        System.debug(LoggingLevel.INFO, '=== FIN: Cálculo de Comisiones ===');
        System.debug(LoggingLevel.DEBUG, 'Total vendedores procesados: ' + comisionesPorVendedor.size());

        return comisionesPorVendedor;
    }

    public static void crearComisionesEnSalesforce(Map<Id, Decimal> comisionesPorVendedor) {
        System.debug(LoggingLevel.INFO, 'Creando registros de Comision__c en Salesforce');

        // Obtener contratos activos con sus vendedores
        List<Contrato__c> contratos = [
            SELECT Id, Vendedor__c, Monto__c, Cliente__r.Categoria__c, Fecha_Inicio__c
            FROM Contrato__c WHERE Estado__c = 'Activo'
        ];

        List<Comision__c> comisionesACrear = new List<Comision__c>();

        for (Contrato__c contrato : contratos) {
            Decimal porcentaje = COMISIONES_POR_CATEGORIA.get(contrato.Cliente__r.Categoria__c);
            if (porcentaje == null) porcentaje = 0.02;

            Decimal montoComision = contrato.Monto__c * porcentaje;

            // Ajustes
            if (contrato.Monto__c > 1000000) {
                montoComision += contrato.Monto__c * 0.005;
            }
            if (contrato.Fecha_Inicio__c != null &&
                contrato.Fecha_Inicio__c <= Date.today().addMonths(-6)) {
                montoComision += contrato.Monto__c * 0.01;
            }

            montoComision = montoComision.setScale(2, System.RoundingMode.HALF_UP);

            comisionesACrear.add(new Comision__c(
                Contrato__c = contrato.Id,
                Monto_Comision__c = montoComision,
                Porcentaje__c = porcentaje * 100,
                Estado__c = 'Pendiente'
            ));

            System.debug(LoggingLevel.DEBUG, 'Comisión creada: Contrato=' + contrato.Id +
                ' | Monto=$' + montoComision + ' | %=' + (porcentaje * 100));
        }

        if (!comisionesACrear.isEmpty()) {
            insert comisionesACrear;
            System.debug(LoggingLevel.INFO, 'Comisiones insertadas: ' + comisionesACrear.size());
        } else {
            System.debug(LoggingLevel.WARN, 'No se crearon comisiones');
        }
    }
}
```

2. Crea la clase de test `ComisionCalculatorTest.cls`:
```apex
@isTest
private class ComisionCalculatorTest {

    @TestSetup
    static void setup() {
        Cliente__c clienteBronze = new Cliente__c(
            Name = 'Cliente Bronze', RFC__c = 'BRZ123456XYZ',
            Ingresos_Anuales__c = 500000, Categoria__c = 'Bronze'
        );
        insert clienteBronze;

        Cliente__c clienteGold = new Cliente__c(
            Name = 'Cliente Gold', RFC__c = 'GLD123456XYZ',
            Ingresos_Anuales__c = 5000000, Categoria__c = 'Gold'
        );
        insert clienteGold;

        Profile perfil = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User vendedor = new User(
            Alias = 'vcomi',
            Email = 'vendedor.comision@test.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'Vendedor Comision',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = perfil.Id,
            TimeZoneSidKey = 'America/Mexico_City',
            UserName = 'vendedor.comision.' + DateTime.now().getTime() + '@test.com'
        );
        insert vendedor;

        List<Contrato__c> contratos = new List<Contrato__c>();
        // Contrato Bronze
        contratos.add(new Contrato__c(
            Cliente__c = clienteBronze.Id, Vendedor__c = vendedor.Id,
            Monto__c = 50000, Fecha_Inicio__c = Date.today().addMonths(-8),
            Fecha_Expiracion__c = Date.today().addMonths(4), Estado__c = 'Activo'
        ));
        // Contrato Gold
        contratos.add(new Contrato__c(
            Cliente__c = clienteGold.Id, Vendedor__c = vendedor.Id,
            Monto__c = 2000000, Fecha_Inicio__c = Date.today().addMonths(-12),
            Fecha_Expiracion__c = Date.today().addMonths(12), Estado__c = 'Activo'
        ));
        // Contrato inactivo (no debe contar)
        contratos.add(new Contrato__c(
            Cliente__c = clienteBronze.Id, Vendedor__c = vendedor.Id,
            Monto__c = 100000, Fecha_Inicio__c = Date.today(),
            Fecha_Expiracion__c = Date.today().addMonths(6), Estado__c = 'Borrador'
        ));
        insert contratos;
    }

    @isTest
    static void testCalcularComisionesPorVendedor() {
        Test.startTest();
        Map<Id, Decimal> comisiones = ComisionCalculator.calcularComisionesPorVendedor();
        Test.stopTest();

        // Debe haber 1 vendedor con comisiones
        System.assertEquals(1, comisiones.size());

        // Verificar cálculo manual:
        // Contrato Bronze: 50000 * 3% = 1500 + ajuste antigüedad (50000 * 1% = 500) = 2000
        // Contrato Gold:   2000000 * 7% = 140000 + ajuste monto (2000000 * 0.5% = 10000) + antigüedad (2000000 * 1% = 20000) = 170000
        // Total: 2000 + 170000 = 172000
        for (Id vendedorId : comisiones.keySet()) {
            Decimal total = comisiones.get(vendedorId);
            System.assertEquals(172000, total,
                'Comisión total debe ser 172,000. Obtenido: ' + total);
        }
    }

    @isTest
    static void testCrearComisionesEnSalesforce() {
        Test.startTest();

        Map<Id, Decimal> comisiones = ComisionCalculator.calcularComisionesPorVendedor();
        ComisionCalculator.crearComisionesEnSalesforce(comisiones);

        Test.stopTest();

        // Verificar que se crearon comisiones
        List<Comision__c> comisionesCreadas = [SELECT Id, Monto_Comision__c, Porcentaje__c,
                                                       Estado__c, Contrato__c
                                                FROM Comision__c];
        System.assertEquals(2, comisionesCreadas.size(), 'Deben crearse 2 comisiones');

        for (Comision__c c : comisionesCreadas) {
            System.assertEquals('Pendiente', c.Estado__c);
            System.assert(c.Monto_Comision__c > 0);
        }
    }

    @isTest
    static void testDebugLogsSeGeneranCorrectamente() {
        // Este test se enfoca en verificar que los logs se generan
        Test.startTest();

        LoggerDemo.demoNivelesDebug();
        Map<Id, Decimal> comisiones = ComisionCalculator.calcularComisionesPorVendedor();
        ComisionCalculator.crearComisionesEnSalesforce(comisiones);

        Test.stopTest();

        // Verificar los logs generados
        // 1. Niveles debug
        // 2. Cálculos detallados
        // 3. Resumen final
        System.assert(true, 'Logs generados correctamente');
    }

    @isTest
    static void testErrorRedondeoControlado() {
        // Probar con valores que causan errores de redondeo
        Test.startTest();

        Cliente__c cliente = [SELECT Id FROM Cliente__c LIMIT 1];
        User vendedor = [SELECT Id FROM User WHERE Email LIKE 'vendedor.comision%' LIMIT 1];

        // Crear contratos con montos problemáticos
        List<Contrato__c> contratos = new List<Contrato__c>();
        for (Integer i = 0; i < 10; i++) {
            Decimal monto = 333333.33 * (i + 1);
            contratos.add(new Contrato__c(
                Cliente__c = cliente.Id, Vendedor__c = vendedor.Id,
                Monto__c = monto, Fecha_Inicio__c = Date.today().addMonths(-6),
                Fecha_Expiracion__c = Date.today().addMonths(6), Estado__c = 'Activo'
            ));
        }
        insert contratos;

        Map<Id, Decimal> comisiones = ComisionCalculator.calcularComisionesPorVendedor();
        System.assert(!comisiones.isEmpty());

        Test.stopTest();

        // Verificar que los montos tienen solo 2 decimales
        for (Id vid : comisiones.keySet()) {
            String montoStr = String.valueOf(comisiones.get(vid));
            Integer posPunto = montoStr.indexOf('.');
            if (posPunto > 0) {
                Integer decimales = montoStr.length() - posPunto - 1;
                System.assert(decimales <= 2,
                    'Monto con ' + decimales + ' decimales: ' + montoStr);
            }
        }
    }

    @isTest
    static void testSinContratosActivos() {
        delete [SELECT Id FROM Contrato__c WHERE Estado__c = 'Activo'];

        Test.startTest();
        Map<Id, Decimal> comisiones = ComisionCalculator.calcularComisionesPorVendedor();
        Test.stopTest();

        System.assertEquals(0, comisiones.size());
    }
}
```

3. Despliega y ejecuta los tests:
```bash
sf project deploy start --source-dir force-app/main/default --target-org TestOrg

sf apex run test --class-names ComisionCalculatorTest --target-org TestOrg --test-level RunSpecifiedTests --wait 3
```

4. Revisa los logs generados:

Desde la UI de Salesforce:
- Setup → Debug Logs → View
- Busca logs del test `ComisionCalculatorTest`
- Analiza cada paso del pipeline de comisiones

Desde CLI:
```bash
sf apex get log --target-org TestOrg --number 3
```

5. Busca específicamente el error de redondeo simulando el cálculo manual:

```apex
// Verificación manual de redondeo
@isTest
static void testVerificarRedondeoManual() {
    Decimal monto = 333333.33;
    Decimal porcentaje = 0.03; // Bronze
    Decimal comision = monto * porcentaje; // 9999.9999

    System.debug(LoggingLevel.DEBUG, 'Comisión sin redondeo: ' + comision);
    System.debug(LoggingLevel.DEBUG, 'Comisión con setScale: ' + comision.setScale(2, System.RoundingMode.HALF_UP));

    // Verificar que el redondeo es correcto
    System.assertEquals(10000.00, comision.setScale(2, System.RoundingMode.HALF_UP));
}
```
