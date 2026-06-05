# 📘 11. Flow + Apex Testing

- **Concepto Clave Asimilado:** Integración de Flows de Salesforce con Apex Invocable Actions. Testing de acciones Apex invocadas desde Flows, cubriendo múltiples caminos lógicos.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Flow + Apex — Flow simple que llama a Apex action que valida email y test del Apex

**Instrucciones:**

1. Crea la clase invocable `EmailValidator.cls`:
```apex
public class EmailValidator {

    @InvocableMethod(label='Validar Email' description='Valida una dirección de correo electrónico')
    public static List<ValidationResult> validarEmail(List<ValidationRequest> requests) {
        List<ValidationResult> resultados = new List<ValidationResult>();

        for (ValidationRequest req : requests) {
            ValidationResult res = new ValidationResult();
            res.email = req.email;
            res.valido = false;
            res.mensaje = '';

            if (String.isBlank(req.email)) {
                res.mensaje = 'El email no puede estar vacío';
                resultados.add(res);
                continue;
            }

            // Validación básica de formato
            String patron = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
            Pattern p = Pattern.compile(patron);
            Matcher m = p.matcher(req.email);

            if (m.matches()) {
                res.valido = true;
                res.mensaje = 'Email válido';
            } else {
                res.mensaje = 'El formato del email no es válido';
            }

            resultados.add(res);
        }

        return resultados;
    }

    public class ValidationRequest {
        @InvocableVariable(label='Email' description='Dirección de correo a validar' required=true)
        public String email;
    }

    public class ValidationResult {
        @InvocableVariable(label='Email' description='Email validado')
        public String email;

        @InvocableVariable(label='Válido' description='Indica si el email es válido')
        public Boolean valido;

        @InvocableVariable(label='Mensaje' description='Mensaje del resultado de validación')
        public String mensaje;
    }
}
```

2. Crea la clase de test `EmailValidatorTest.cls`:
```apex
@isTest
private class EmailValidatorTest {

    @isTest
    static void testEmailValido() {
        EmailValidator.ValidationRequest req = new EmailValidator.ValidationRequest();
        req.email = 'usuario@dominio.com';

        List<EmailValidator.ValidationResult> resultados = EmailValidator.validarEmail(
            new List<EmailValidator.ValidationRequest>{req}
        );

        System.assertEquals(1, resultados.size());
        System.assertEquals(true, resultados[0].valido);
        System.assertEquals('Email válido', resultados[0].mensaje);
    }

    @isTest
    static void testEmailInvalidoSinArroba() {
        EmailValidator.ValidationRequest req = new EmailValidator.ValidationRequest();
        req.email = 'usuariodominio.com';

        List<EmailValidator.ValidationResult> resultados = EmailValidator.validarEmail(
            new List<EmailValidator.ValidationRequest>{req}
        );

        System.assertEquals(false, resultados[0].valido);
    }

    @isTest
    static void testEmailVacio() {
        EmailValidator.ValidationRequest req = new EmailValidator.ValidationRequest();
        req.email = '';

        List<EmailValidator.ValidationResult> resultados = EmailValidator.validarEmail(
            new List<EmailValidator.ValidationRequest>{req}
        );

        System.assertEquals(false, resultados[0].valido);
        System.assert(resultados[0].mensaje.contains('vacío'));
    }

    @isTest
    static void testEmailNull() {
        EmailValidator.ValidationRequest req = new EmailValidator.ValidationRequest();
        req.email = null;

        List<EmailValidator.ValidationResult> resultados = EmailValidator.validarEmail(
            new List<EmailValidator.ValidationRequest>{req}
        );

        System.assertEquals(false, resultados[0].valido);
    }

    @isTest
    static void testMultiplesEmails() {
        List<EmailValidator.ValidationRequest> requests = new List<EmailValidator.ValidationRequest>();

        EmailValidator.ValidationRequest r1 = new EmailValidator.ValidationRequest();
        r1.email = 'valido@test.com';
        requests.add(r1);

        EmailValidator.ValidationRequest r2 = new EmailValidator.ValidationRequest();
        r2.email = 'invalido';
        requests.add(r2);

        List<EmailValidator.ValidationResult> resultados = EmailValidator.validarEmail(requests);

        System.assertEquals(2, resultados.size());
        System.assertEquals(true, resultados[0].valido);
        System.assertEquals(false, resultados[1].valido);
    }
}
```

3. Ejecuta los tests:
```bash
sf apex run test --class-names EmailValidatorTest --target-org TestOrg --test-level RunSpecifiedTests
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Flow de Aprobación de Crédito — Flow que evalúa solicitud de crédito, llama a Apex para verificar buró de crédito y test que cubre: aprobación automática, rechazo y revisión manual

**Instrucciones:**

1. Crea la clase invocable `BuroCreditoService.cls`:
```apex
public class BuroCreditoService {

    @InvocableMethod(
        label='Verificar Buró de Crédito'
        description='Evalúa solicitud de crédito contra buró externo. Retorna decisión: Aprobado, Rechazado o Revisión_Manual'
    )
    public static List<DecisionCredito> verificarBuro(List<SolicitudCredito> solicitudes) {
        List<DecisionCredito> decisiones = new List<DecisionCredito>();

        for (SolicitudCredito sol : solicitudes) {
            DecisionCredito decision = new DecisionCredito();
            decision.clienteId = sol.clienteId;
            decision.montoSolicitado = sol.montoSolicitado;
            decision.ingresosAnuales = sol.ingresosAnuales;

            // Simular llamada a buró de crédito
            BuroResult buro = simularConsultaBuro(
                sol.rfc, sol.montoSolicitado, sol.ingresosAnuales
            );

            decision.scoreBuro = buro.score;
            decision.deudaActual = buro.deudaActual;

            // Evaluar decisión
            if (buro.score < 500) {
                decision.decision = 'Rechazado';
                decision.mensaje = 'Score de buró demasiado bajo (' + buro.score + '). Crédito rechazado.';
                decision.montoAprobado = 0;
            } else if (buro.score >= 700 && sol.montoSolicitado <= sol.ingresosAnuales * 0.5) {
                decision.decision = 'Aprobado';
                decision.montoAprobado = sol.montoSolicitado;
                decision.mensaje = 'Crédito aprobado automáticamente.';
            } else if (buro.score >= 600) {
                // Zona gris: requiere revisión manual
                Decimal montoMaximo = sol.ingresosAnuales * 0.3;
                decision.decision = 'Revision_Manual';
                decision.montoAprobado = Math.min(sol.montoSolicitado, montoMaximo);
                decision.mensaje = 'Requiere revisión manual. Score: ' + buro.score + ', Deuda: $' + buro.deudaActual;
            } else {
                decision.decision = 'Rechazado';
                decision.montoAprobado = 0;
                decision.mensaje = 'No cumple criterios mínimos de crédito.';
            }

            decisiones.add(decision);
        }

        return decisiones;
    }

    private static BuroResult simularConsultaBuro(String rfc, Decimal montoSolicitado, Decimal ingresos) {
        // Simular respuesta de buró basada en datos del cliente
        BuroResult res = new BuroResult();

        if (String.isBlank(rfc)) {
            res.score = 400;
            res.deudaActual = 0;
            return res;
        }

        // Lógica simulada: mejor score si tiene ingresos altos y RFC válido
        if (ingresos > 10000000) {
            res.score = 750;
            res.deudaActual = ingresos * 0.1;
        } else if (ingresos > 5000000) {
            res.score = 680;
            res.deudaActual = ingresos * 0.2;
        } else if (ingresos > 1000000) {
            res.score = 580;
            res.deudaActual = ingresos * 0.3;
        } else {
            res.score = 450;
            res.deudaActual = ingresos * 0.5;
        }

        return res;
    }

    public class SolicitudCredito {
        @InvocableVariable(label='Cliente ID' description='ID del cliente' required=true)
        public String clienteId;

        @InvocableVariable(label='RFC' description='RFC del cliente')
        public String rfc;

        @InvocableVariable(label='Monto Solicitado' description='Monto de crédito solicitado')
        public Decimal montoSolicitado;

        @InvocableVariable(label='Ingresos Anuales' description='Ingresos anuales del cliente')
        public Decimal ingresosAnuales;
    }

    public class DecisionCredito {
        @InvocableVariable(label='Cliente ID')
        public String clienteId;

        @InvocableVariable(label='Decisión' description='Aprobado, Rechazado, Revision_Manual')
        public String decision;

        @InvocableVariable(label='Monto Aprobado')
        public Decimal montoAprobado;

        @InvocableVariable(label='Monto Solicitado')
        public Decimal montoSolicitado;

        @InvocableVariable(label='Ingresos Anuales')
        public Decimal ingresosAnuales;

        @InvocableVariable(label='Score Buró')
        public Integer scoreBuro;

        @InvocableVariable(label='Deuda Actual')
        public Decimal deudaActual;

        @InvocableVariable(label='Mensaje')
        public String mensaje;
    }

    public class BuroResult {
        public Integer score;
        public Decimal deudaActual;
    }
}
```

2. Crea otro servicio invocable para actualizar el límite de crédito desde el Flow:

**`classes/ActualizarLimiteCreditoAction.cls`:**
```apex
public class ActualizarLimiteCreditoAction {

    @InvocableMethod(
        label='Actualizar Límite de Crédito'
        description='Actualiza el límite de crédito de un cliente en Salesforce'
    )
    public static List<ActualizacionResult> actualizarLimite(List<ActualizacionRequest> requests) {
        List<ActualizacionResult> resultados = new List<ActualizacionResult>();

        for (ActualizacionRequest req : requests) {
            ActualizacionResult res = new ActualizacionResult();
            res.clienteId = req.clienteId;
            res.exito = false;

            try {
                Cliente__c cliente = new Cliente__c(
                    Id = req.clienteId,
                    Limite_de_Credito__c = req.nuevoLimite
                );
                update cliente;
                res.exito = true;
                res.mensaje = 'Límite de crédito actualizado a $' + req.nuevoLimite;
            } catch (Exception e) {
                res.mensaje = 'Error: ' + e.getMessage();
            }

            resultados.add(res);
        }

        return resultados;
    }

    public class ActualizacionRequest {
        @InvocableVariable(label='Cliente ID' description='ID del registro de Cliente__c' required=true)
        public String clienteId;

        @InvocableVariable(label='Nuevo Límite' description='Nuevo límite de crédito')
        public Decimal nuevoLimite;
    }

    public class ActualizacionResult {
        @InvocableVariable(label='Cliente ID')
        public String clienteId;

        @InvocableVariable(label='Éxito')
        public Boolean exito;

        @InvocableVariable(label='Mensaje')
        public String mensaje;
    }
}
```

3. Crea la clase de test `BuroCreditoServiceTest.cls`:
```apex
@isTest
private class BuroCreditoServiceTest {

    @isTest
    static void testAprobacionAutomatica() {
        // Cliente con ingresos altos → score 750 → aprobación automática
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'a0Q5g00000TEST01';
        sol.rfc = 'APR123456XYZ';
        sol.montoSolicitado = 2000000; // 20% de 10M
        sol.ingresosAnuales = 10000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        System.assertEquals(1, decisiones.size());
        System.assertEquals('Aprobado', decisiones[0].decision);
        System.assertEquals(2000000, decisiones[0].montoAprobado);
        System.assertEquals(750, decisiones[0].scoreBuro);
    }

    @isTest
    static void testRechazoPorScoreBajo() {
        // Cliente con ingresos bajos → score 450 → rechazo
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'a0Q5g00000TEST02';
        sol.rfc = 'RCH123456XYZ';
        sol.montoSolicitado = 500000;
        sol.ingresosAnuales = 500000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        System.assertEquals('Rechazado', decisiones[0].decision);
        System.assertEquals(0, decisiones[0].montoAprobado);
        System.assertEquals(450, decisiones[0].scoreBuro);
    }

    @isTest
    static void testRevisionManual() {
        // Cliente con ingresos medios → score 580 → revisión manual
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'a0Q5g00000TEST03';
        sol.rfc = 'REV123456XYZ';
        sol.montoSolicitado = 500000;
        sol.ingresosAnuales = 3000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        System.assertEquals('Revision_Manual', decisiones[0].decision);
        System.assert(decisiones[0].montoAprobado > 0);
        System.assert(decisiones[0].mensaje.contains('revisión manual'));
    }

    @isTest
    static void testRechazoPorMontoExcesivoYSocreMedio() {
        // Score 580, solicita más del 50% de ingresos → rechazo
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'a0Q5g00000TEST04';
        sol.rfc = 'EXC123456XYZ';
        sol.montoSolicitado = 8000000;
        sol.ingresosAnuales = 3000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        // Score 580 < 600, no cumple criterios mínimos
        System.assertEquals('Rechazado', decisiones[0].decision);
    }

    @isTest
    static void testSolicitudSinRFC() {
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'a0Q5g00000TEST05';
        sol.rfc = '';
        sol.montoSolicitado = 100000;
        sol.ingresosAnuales = 1000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        System.assertEquals('Rechazado', decisiones[0].decision);
        System.assertEquals(400, decisiones[0].scoreBuro);
    }

    @isTest
    static void testMultiplesSolicitudesSimultaneas() {
        List<BuroCreditoService.SolicitudCredito> solicitudes = new List<BuroCreditoService.SolicitudCredito>();

        // Solicitud 1: Aprobación (ingresos altos)
        BuroCreditoService.SolicitudCredito s1 = new BuroCreditoService.SolicitudCredito();
        s1.clienteId = 'c1'; s1.rfc = 'AAA123456XYZ';
        s1.montoSolicitado = 1000000; s1.ingresosAnuales = 15000000;
        solicitudes.add(s1);

        // Solicitud 2: Rechazo (ingresos bajos)
        BuroCreditoService.SolicitudCredito s2 = new BuroCreditoService.SolicitudCredito();
        s2.clienteId = 'c2'; s2.rfc = 'BBB123456XYZ';
        s2.montoSolicitado = 50000; s2.ingresosAnuales = 300000;
        solicitudes.add(s2);

        // Solicitud 3: Revisión manual (ingresos medios)
        BuroCreditoService.SolicitudCredito s3 = new BuroCreditoService.SolicitudCredito();
        s3.clienteId = 'c3'; s3.rfc = 'CCC123456XYZ';
        s3.montoSolicitado = 300000; s3.ingresosAnuales = 6000000;
        solicitudes.add(s3);

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(solicitudes);

        System.assertEquals(3, decisiones.size());
        System.assertEquals('Aprobado', decisiones[0].decision);
        System.assertEquals('Rechazado', decisiones[1].decision);
        System.assertEquals('Revision_Manual', decisiones[2].decision);
    }

    @isTest
    static void testAprobadoCuandoMontoNoExcede50Porciento() {
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'c-test';
        sol.rfc = 'MITAD123456XYZ';
        sol.montoSolicitado = 2500000; // 50% exacto de 5M
        sol.ingresosAnuales = 5000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        // Score 680 >= 600 pero < 700, monto es exactamente 50% de ingresos
        // cae en revisión manual (no es <= 50%, es = 50%, condición es <=)
        // monto 2500000 <= 5000000 * 0.5 = 2500000 → TRUE, score 680 < 700 → no entra en aprobado automático
        // Entra en score >= 600 → revisión manual
        System.assertEquals('Revision_Manual', decisiones[0].decision);
    }

    @isTest
    static void testValorLimiteFrontera() {
        // Score exactamente 700, monto exactamente 50% de ingresos
        BuroCreditoService.SolicitudCredito sol = new BuroCreditoService.SolicitudCredito();
        sol.clienteId = 'c-front';
        sol.rfc = 'FRN123456XYZ';
        sol.montoSolicitado = 5000000;
        sol.ingresosAnuales = 10000000;

        List<BuroCreditoService.DecisionCredito> decisiones = BuroCreditoService.verificarBuro(
            new List<BuroCreditoService.SolicitudCredito>{sol}
        );

        // score 750, monto 5000000 <= 5000000 → Aprobado
        System.assertEquals('Aprobado', decisiones[0].decision);
    }
}
```

4. Crea la clase de test para la acción de actualización:

**`classes/ActualizarLimiteCreditoActionTest.cls`:**
```apex
@isTest
private class ActualizarLimiteCreditoActionTest {

    @TestSetup
    static void setup() {
        Cliente__c cliente = new Cliente__c(
            Name = 'Cliente Test Credito',
            RFC__c = 'CRD123456XYZ',
            Ingresos_Anuales__c = 5000000,
            Categoria__c = 'Silver',
            Limite_de_Credito__c = 500000
        );
        insert cliente;
    }

    @isTest
    static void testActualizarLimiteExitoso() {
        Cliente__c cliente = [SELECT Id FROM Cliente__c LIMIT 1];

        ActualizarLimiteCreditoAction.ActualizacionRequest req =
            new ActualizarLimiteCreditoAction.ActualizacionRequest();
        req.clienteId = cliente.Id;
        req.nuevoLimite = 1000000;

        List<ActualizarLimiteCreditoAction.ActualizacionResult> resultados =
            ActualizarLimiteCreditoAction.actualizarLimite(
                new List<ActualizarLimiteCreditoAction.ActualizacionRequest>{req}
            );

        System.assertEquals(1, resultados.size());
        System.assertEquals(true, resultados[0].exito);

        Cliente__c actualizado = [SELECT Limite_de_Credito__c FROM Cliente__c WHERE Id = :cliente.Id];
        System.assertEquals(1000000, actualizado.Limite_de_Credito__c);
    }

    @isTest
    static void testActualizarLimiteClienteInexistente() {
        ActualizarLimiteCreditoAction.ActualizacionRequest req =
            new ActualizarLimiteCreditoAction.ActualizacionRequest();
        req.clienteId = 'a0Q5g00000INVALID00';
        req.nuevoLimite = 999999;

        List<ActualizarLimiteCreditoAction.ActualizacionResult> resultados =
            ActualizarLimiteCreditoAction.actualizarLimite(
                new List<ActualizarLimiteCreditoAction.ActualizacionRequest>{req}
            );

        System.assertEquals(1, resultados.size());
        System.assertEquals(false, resultados[0].exito);
    }
}
```

5. Despliega y ejecuta todos los tests:
```bash
sf project deploy start --source-dir force-app/main/default --target-org TestOrg

sf apex run test --class-names BuroCreditoServiceTest,ActualizarLimiteCreditoActionTest --target-org TestOrg --test-level RunSpecifiedTests --wait 3
```

6. Puntos clave sobre Flow + Apex:
   - **@InvocableMethod**: Método que puede ser llamado desde Flow. Debe ser `static` y retornar `List<Resultado>`.
   - **@InvocableVariable**: Variables de entrada/salida visibles en el Flow Designer.
   - **Naming**: El label y description aparecen en Flow Builder como ayuda.
   - **Testing**: Los tests de Apex Invocable Actions se escriben como tests Apex normales, probando cada camino lógico.
   - **Flujo de decisión**: El Flow llama al Apex, recibe la decisión y según el resultado ejecuta diferentes rutas (aprobación, rechazo, revisión manual).
