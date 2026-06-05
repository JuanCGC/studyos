# 📘 02. Apex Basics y Sintaxis

- **Concepto Clave Asimilado:** Sintaxis fundamental de Apex: clases, métodos estáticos, colecciones (List, Map, Set), control de flujo, manejo de excepciones.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Calculadora de Descuentos — Clase Apex estática con métodos que procesan colecciones de precios, aplican descuentos y retornan totales

**Instrucciones:**

1. Crea la clase `CalculadoraDescuentos.cls` en `force-app/main/default/classes/`:
```apex
public class CalculadoraDescuentos {

    public static Decimal aplicarDescuento(Decimal precio, Decimal porcentaje) {
        if (precio == null || porcentaje == null) {
            throw new IllegalArgumentException('Los valores no pueden ser nulos');
        }
        if (porcentaje < 0 || porcentaje > 100) {
            throw new IllegalArgumentException('El porcentaje debe estar entre 0 y 100');
        }
        Decimal descuento = precio * (porcentaje / 100);
        return precio - descuento;
    }

    public static Decimal aplicarDescuentoPorTope(Decimal precio, Decimal porcentaje, Decimal topeDescuento) {
        Decimal descuento = precio * (porcentaje / 100);
        if (descuento > topeDescuento) {
            descuento = topeDescuento;
        }
        return precio - descuento;
    }

    public static List<Decimal> aplicarDescuentoALista(List<Decimal> precios, Decimal porcentaje) {
        List<Decimal> totales = new List<Decimal>();
        for (Decimal precio : precios) {
            totales.add(aplicarDescuento(precio, porcentaje));
        }
        return totales;
    }

    public static Map<Integer, Decimal> procesarPorIndice(Map<Integer, Decimal> preciosPorIndice, Decimal porcentaje) {
        Map<Integer, Decimal> resultados = new Map<Integer, Decimal>();
        for (Integer indice : preciosPorIndice.keySet()) {
            Decimal precio = preciosPorIndice.get(indice);
            resultados.put(indice, aplicarDescuento(precio, porcentaje));
        }
        return resultados;
    }

    public static Decimal calcularTotalConDescuentosEscalonados(List<Decimal> precios) {
        Decimal total = 0;
        Integer contador = 0;
        for (Decimal precio : precios) {
            contador++;
            Decimal porcentaje;
            if (contador <= 3) {
                porcentaje = 5;
            } else if (contador <= 6) {
                porcentaje = 10;
            } else {
                porcentaje = 15;
            }
            total += aplicarDescuento(precio, porcentaje);
        }
        return total;
    }
}
```

2. Crea la clase de test `CalculadoraDescuentosTest.cls`:
```apex
@isTest
private class CalculadoraDescuentosTest {

    @isTest
    static void testAplicarDescuento() {
        Decimal resultado = CalculadoraDescuentos.aplicarDescuento(1000, 10);
        System.assertEquals(900, resultado, 'El descuento del 10% a 1000 debe ser 900');
    }

    @isTest
    static void testAplicarDescuentoValorNulo() {
        try {
            CalculadoraDescuentos.aplicarDescuento(null, 10);
            System.assert(false, 'Debió lanzar excepción');
        } catch (IllegalArgumentException e) {
            System.assert(e.getMessage().contains('nulos'));
        }
    }

    @isTest
    static void testAplicarDescuentoALista() {
        List<Decimal> precios = new List<Decimal>{100, 200, 300};
        List<Decimal> resultados = CalculadoraDescuentos.aplicarDescuentoALista(precios, 10);
        System.assertEquals(3, resultados.size());
        System.assertEquals(90, resultados[0]);
        System.assertEquals(180, resultados[1]);
        System.assertEquals(270, resultados[2]);
    }

    @isTest
    static void testDescuentoEscalonado() {
        List<Decimal> precios = new List<Decimal>{100, 100, 100, 100, 100, 100, 100};
        Decimal total = CalculadoraDescuentos.calcularTotalConDescuentosEscalonados(precios);
        // 3 items al 5% = 95*3 = 285
        // 3 items al 10% = 90*3 = 270
        // 1 item al 15% = 85
        // Total = 640
        System.assertEquals(640, total);
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names CalculadoraDescuentosTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Modelo de Clientes Corporativos — Clases de dominio para el ERP: servicio de clientes con categorización, validación RFC y asignación de límite de crédito

**Instrucciones:**

1. Crea la clase `ClienteService.cls` en `force-app/main/default/classes/`:
```apex
public class ClienteService {

    public static String calcularCategoria(Decimal ingresosAnuales) {
        if (ingresosAnuales == null) {
            throw new IllegalArgumentException('Los ingresos no pueden ser nulos');
        }
        if (ingresosAnuales < 0) {
            throw new IllegalArgumentException('Los ingresos no pueden ser negativos');
        }
        if (ingresosAnuales <= 1000000) {
            return 'Bronze';
        } else if (ingresosAnuales <= 5000000) {
            return 'Silver';
        } else if (ingresosAnuales <= 20000000) {
            return 'Gold';
        } else {
            return 'Platinum';
        }
    }

    public static Boolean validarRFC(String rfc) {
        if (String.isBlank(rfc)) {
            return false;
        }
        if (rfc.length() != 12 && rfc.length() != 13) {
            return false;
        }
        String patronRFC = '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{2,3}$';
        Pattern p = Pattern.compile(patronRFC);
        Matcher m = p.matcher(rfc.toUpperCase());
        return m.matches();
    }

    public static Decimal asignarLimiteCredito(Id clienteId) {
        if (clienteId == null) {
            throw new IllegalArgumentException('El ID del cliente no puede ser nulo');
        }

        List<Cliente__c> clientes = [SELECT Id, Ingresos_Anuales__c, Categoria__c FROM Cliente__c WHERE Id = :clienteId LIMIT 1];

        if (clientes.isEmpty()) {
            throw new IllegalArgumentException('Cliente no encontrado: ' + clienteId);
        }

        Cliente__c cliente = clientes[0];
        Decimal limite;

        switch on cliente.Categoria__c {
            when 'Bronze' {
                limite = cliente.Ingresos_Anuales__c * 0.10;
            }
            when 'Silver' {
                limite = cliente.Ingresos_Anuales__c * 0.20;
            }
            when 'Gold' {
                limite = cliente.Ingresos_Anuales__c * 0.30;
            }
            when 'Platinum' {
                limite = cliente.Ingresos_Anuales__c * 0.40;
            }
            when else {
                limite = 0;
            }
        }

        cliente.Limite_de_Credito__c = limite;
        update cliente;

        return limite;
    }

    public static Cliente__c crearCliente(String nombre, String rfc, Decimal ingresos) {
        if (!validarRFC(rfc)) {
            throw new IllegalArgumentException('RFC inválido: ' + rfc);
        }

        String categoria = calcularCategoria(ingresos);

        Cliente__c cliente = new Cliente__c(
            Name = nombre,
            RFC__c = rfc.toUpperCase(),
            Ingresos_Anuales__c = ingresos,
            Categoria__c = categoria
        );
        insert cliente;

        asignarLimiteCredito(cliente.Id);

        return [SELECT Id, Name, RFC__c, Ingresos_Anuales__c, Categoria__c, Limite_de_Credito__c
                FROM Cliente__c WHERE Id = :cliente.Id];
    }

    public static List<Cliente__c> buscarClientesPorCategoria(String categoria) {
        return [SELECT Id, Name, RFC__c, Ingresos_Anuales__c, Categoria__c, Limite_de_Credito__c
                FROM Cliente__c WHERE Categoria__c = :categoria];
    }
}
```

2. Crea la clase `ContratoService.cls` (empezamos a construir el siguiente servicio):
```apex
public class ContratoService {

    public static Contrato__c crearContrato(
        Id clienteId, Id vendedorId, Decimal monto,
        Date fechaInicio, Integer duracionMeses
    ) {
        if (clienteId == null || vendedorId == null) {
            throw new IllegalArgumentException('Cliente y vendedor son obligatorios');
        }
        if (monto <= 0) {
            throw new IllegalArgumentException('El monto debe ser positivo');
        }

        Date fechaExpiracion = fechaInicio.addMonths(duracionMeses);

        Contrato__c contrato = new Contrato__c(
            Cliente__c = clienteId,
            Vendedor__c = vendedorId,
            Monto__c = monto,
            Fecha_Inicio__c = fechaInicio,
            Fecha_Expiracion__c = fechaExpiracion,
            Estado__c = 'Borrador'
        );
        insert contrato;

        return [SELECT Id, Name, Monto__c, Estado__c, Fecha_Inicio__c, Fecha_Expiracion__c,
                       Vendedor__c, Cliente__c, Cliente__r.Name
                FROM Contrato__c WHERE Id = :contrato.Id];
    }

    public static void activarContrato(Id contratoId) {
        Contrato__c contrato = [SELECT Id, Estado__c FROM Contrato__c WHERE Id = :contratoId LIMIT 1];

        if (contrato.Estado__c != 'Borrador') {
            throw new IllegalArgumentException('Solo contratos en Borrador pueden activarse');
        }

        contrato.Estado__c = 'Activo';
        update contrato;
    }

    public static List<Contrato__c> obtenerContratosActivosPorVendedor(Id vendedorId) {
        return [SELECT Id, Name, Monto__c, Fecha_Inicio__c, Fecha_Expiracion__c,
                       Cliente__r.Name
                FROM Contrato__c
                WHERE Vendedor__c = :vendedorId AND Estado__c = 'Activo'];
    }
}
```

3. Crea la clase de test `ClienteServiceTest.cls`:
```apex
@isTest
private class ClienteServiceTest {

    @isTest
    static void testCalcularCategoriaBronze() {
        String categoria = ClienteService.calcularCategoria(500000);
        System.assertEquals('Bronze', categoria);
    }

    @isTest
    static void testCalcularCategoriaSilver() {
        String categoria = ClienteService.calcularCategoria(3000000);
        System.assertEquals('Silver', categoria);
    }

    @isTest
    static void testCalcularCategoriaGold() {
        String categoria = ClienteService.calcularCategoria(10000000);
        System.assertEquals('Gold', categoria);
    }

    @isTest
    static void testCalcularCategoriaPlatinum() {
        String categoria = ClienteService.calcularCategoria(50000000);
        System.assertEquals('Platinum', categoria);
    }

    @isTest
    static void testValidarRFCValido() {
        System.assert(ClienteService.validarRFC('ABCD123456XYZ'));
    }

    @isTest
    static void testValidarRFCInvalidoCorto() {
        System.assert(!ClienteService.validarRFC('ABC123'));
    }

    @isTest
    static void testValidarRFCVacio() {
        System.assert(!ClienteService.validarRFC(''));
    }

    @isTest
    static void testCrearClienteCompleto() {
        Cliente__c cliente = ClienteService.crearCliente(
            'Empresa Demo S.A.',
            'DEMO123456XYZ',
            5000000
        );

        System.assertNotEquals(null, cliente.Id);
        System.assertEquals('Silver', cliente.Categoria__c);
        System.assertEquals(1000000, cliente.Limite_de_Credito__c); // 20% de 5M
    }

    @isTest
    static void testCrearClienteRFCInvalido() {
        try {
            ClienteService.crearCliente('Test', 'INVALID', 1000);
            System.assert(false, 'Debió lanzar excepción por RFC inválido');
        } catch (IllegalArgumentException e) {
            System.assert(e.getMessage().contains('RFC'));
        }
    }

    @isTest
    static void testBuscarClientesPorCategoria() {
        ClienteService.crearCliente('Cliente1', 'AAA123456XYZ', 500000);
        ClienteService.crearCliente('Cliente2', 'BBB123456XYZ', 500000);

        List<Cliente__c> bronzes = ClienteService.buscarClientesPorCategoria('Bronze');
        System.assertEquals(2, bronzes.size());
    }

    @isTest
    static void testAsignarLimiteCredito() {
        Cliente__c c = ClienteService.crearCliente('Test', 'RFC123456XYZ', 10000000);
        Cliente__c actualizado = [SELECT Limite_de_Credito__c FROM Cliente__c WHERE Id = :c.Id];
        System.assertEquals(3000000, actualizado.Limite_de_Credito__c); // 30% Gold
    }
}
```

4. Ejecuta los tests:
```bash
sf apex run test --class-names ClienteServiceTest --target-org TestOrg --test-level RunSpecifiedTests --wait 2
```

5. Verifica la cobertura:
```bash
sf apex get test --class-names ClienteServiceTest --target-org TestOrg --code-coverage
```
