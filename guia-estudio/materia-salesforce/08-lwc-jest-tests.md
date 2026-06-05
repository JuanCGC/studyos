# 📘 08. LWC Jest Tests

- **Concepto Clave Asimilado:** Pruebas unitarias para componentes Lightning Web Components (LWC) usando Jest, simulación de datos mock, renderizado condicional y verificación de eventos.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Jest para LWC Hello — Inicializar Jest en proyecto LWC, test que renderiza componente `helloWorld` y verifica texto

**Instrucciones:**

1. Asegúrate de tener Jest configurado en el proyecto Salesforce. Si no existe, inicializa:
```bash
cd erp-clientes-contratos
npm init -y
npm install --save-dev @salesforce/lwc-jest jest
```

2. Crea el componente LWC `helloWorld` en `force-app/main/default/lwc/helloWorld/`:

**`helloWorld/helloWorld.html`:**
```html
<template>
    <div class="container">
        <h1>{saludo}</h1>
        <p>{mensaje}</p>
        <template if:true={mostrarDetalle}>
            <p class="detalle">Detalle adicional aquí</p>
        </template>
    </div>
</template>
```

**`helloWorld/helloWorld.js`:**
```javascript
import { LightningElement, track } from 'lwc';

export default class HelloWorld extends LightningElement {
    @track saludo = '¡Hola, Bienvenido al ERP!';
    @track mensaje = 'Sistema de Gestión de Clientes y Contratos';
    @track mostrarDetalle = false;

    connectedCallback() {
        console.log('HelloWorld montado');
    }

    toggleDetalle() {
        this.mostrarDetalle = !this.mostrarDetalle;
    }

    actualizarSaludo(nuevoSaludo) {
        this.saludo = nuevoSaludo;
    }
}
```

**`helloWorld/helloWorld.js-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
    </targets>
</LightningComponentBundle>
```

3. Crea el directorio de tests y el archivo de prueba:

**`force-app/main/default/lwc/helloWorld/__tests__/helloWorld.test.js`:**
```javascript
import { createElement } from 'lwc';
import HelloWorld from 'c/helloWorld';

describe('c-hello-world', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renderiza saludo por defecto', () => {
        const element = createElement('c-hello-world', {
            is: HelloWorld
        });
        document.body.appendChild(element);

        const h1 = element.shadowRoot.querySelector('h1');
        expect(h1.textContent).toBe('¡Hola, Bienvenido al ERP!');
    });

    it('renderiza mensaje por defecto', () => {
        const element = createElement('c-hello-world', {
            is: HelloWorld
        });
        document.body.appendChild(element);

        const p = element.shadowRoot.querySelector('p');
        expect(p.textContent).toBe('Sistema de Gestión de Clientes y Contratos');
    });

    it('detalle no visible inicialmente', () => {
        const element = createElement('c-hello-world', {
            is: HelloWorld
        });
        document.body.appendChild(element);

        const detalle = element.shadowRoot.querySelector('.detalle');
        expect(detalle).toBeNull();
    });

    it('toggleDetalle muestra el detalle', () => {
        const element = createElement('c-hello-world', {
            is: HelloWorld
        });
        document.body.appendChild(element);

        element.toggleDetalle();

        return Promise.resolve().then(() => {
            const detalle = element.shadowRoot.querySelector('.detalle');
            expect(detalle).not.toBeNull();
            expect(detalle.textContent).toBe('Detalle adicional aquí');
        });
    });

    it('actualizarSaludo cambia el texto', () => {
        const element = createElement('c-hello-world', {
            is: HelloWorld
        });
        document.body.appendChild(element);

        element.actualizarSaludo('Nuevo Saludo ERP');

        return Promise.resolve().then(() => {
            const h1 = element.shadowRoot.querySelector('h1');
            expect(h1.textContent).toBe('Nuevo Saludo ERP');
        });
    });
});
```

4. Ejecuta los tests Jest:
```bash
npx jest force-app/main/default/lwc/helloWorld/__tests__/helloWorld.test.js
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Jest para ContractList LWC — Componente que lista contratos del cliente con tests para: render con datos mock, render vacío, click en contrato abre detalle y formato de moneda correcto

**Instrucciones:**

1. Crea el componente LWC `contractList`:

**`lwc/contractList/contractList.html`:**
```html
<template>
    <lightning-card title="Contratos del Cliente" icon-name="standard:contract">
        <div class="slds-m-around_medium">
            <!-- Loader -->
            <template if:true={cargando}>
                <lightning-spinner alternative-text="Cargando contratos..." size="medium">
                </lightning-spinner>
            </template>

            <!-- Error -->
            <template if:true={error}>
                <div class="slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_error" role="alert">
                    <p>{error}</p>
                </div>
            </template>

            <!-- Lista vacía -->
            <template if:true={vacio}>
                <div class="slds-align_absolute-center slds-m-vertical_medium">
                    <p>No se encontraron contratos para este cliente.</p>
                </div>
            </template>

            <!-- Tabla de contratos -->
            <template if:true={hayContratos}>
                <table class="slds-table slds-table_cell-buffer slds-table_bordered">
                    <thead>
                        <tr>
                            <th scope="col">Número</th>
                            <th scope="col">Monto</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Inicio</th>
                            <th scope="col">Expiración</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template for:each={contratos} for:item="ctr">
                            <tr key={ctr.Id}
                                class="slds-hint-parent"
                                data-id={ctr.Id}
                                onclick={handleClickContrato}>
                                <td>
                                    <a href="#" onclick={handleClickContrato}
                                       data-id={ctr.Id}>
                                        {ctr.Name}
                                    </a>
                                </td>
                                <td>{ctr.MontoFormateado}</td>
                                <td>
                                    <lightning-badge
                                        label={ctr.Estado__c}
                                        variant={ctr.EstadoVariant}>
                                    </lightning-badge>
                                </td>
                                <td>{ctr.FechaInicioFormateada}</td>
                                <td>{ctr.FechaExpiracionFormateada}</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </template>
        </div>
    </lightning-card>
</template>
```

**`lwc/contractList/contractList.js`:**
```javascript
import { LightningElement, api, track, wire } from 'lwc';
import getContratosByCliente from '@salesforce/apex/ContratoController.getContratosByCliente';

export default class ContractList extends LightningElement {
    @api clienteId;
    @track contratos = [];
    @track cargando = false;
    @track error;
    @track vacio = false;

    get hayContratos() {
        return this.contratos && this.contratos.length > 0;
    }

    @wire(getContratosByCliente, { clienteId: '$clienteId' })
    wiredContratos({ error, data }) {
        this.cargando = false;

        if (data) {
            this.contratos = data.map(ctr => ({
                ...ctr,
                MontoFormateado: this.formatearMoneda(ctr.Monto__c),
                FechaInicioFormateada: this.formatearFecha(ctr.Fecha_Inicio__c),
                FechaExpiracionFormateada: this.formatearFecha(ctr.Fecha_Expiracion__c),
                EstadoVariant: this.obtenerVariantEstado(ctr.Estado__c)
            }));
            this.vacio = this.contratos.length === 0;
            this.error = undefined;
        } else if (error) {
            this.error = 'Error al cargar contratos: ' + error.body.message;
            this.contratos = [];
            this.vacio = false;
        }
    }

    handleClickContrato(event) {
        event.preventDefault();
        const contratoId = event.currentTarget.dataset.id;

        const selectedEvent = new CustomEvent('seleccionarcontrato', {
            detail: { contratoId }
        });
        this.dispatchEvent(selectedEvent);
    }

    formatearMoneda(valor) {
        if (!valor) return '$0.00';

        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    formatearFecha(fechaStr) {
        if (!fechaStr) return '—';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    obtenerVariantEstado(estado) {
        const mapVariant = {
            'Activo': 'success',
            'Borrador': 'default',
            'En_Renovacion': 'warning',
            'Vencido': 'inverse',
            'Cancelado': 'error'
        };
        return mapVariant[estado] || 'default';
    }
}
```

**`lwc/contractList/contractList.js-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
    </targets>
</LightningComponentBundle>
```

2. Crea la clase Apex que provee los datos:

**`classes/ContratoController.cls`:**
```apex
public with sharing class ContratoController {

    @AuraEnabled(cacheable=true)
    public static List<Contrato__c> getContratosByCliente(Id clienteId) {
        if (clienteId == null) {
            throw new AuraHandledException('clienteId es requerido');
        }

        return [
            SELECT Id, Name, Monto__c, Estado__c,
                   Fecha_Inicio__c, Fecha_Expiracion__c
            FROM Contrato__c
            WHERE Cliente__c = :clienteId
            ORDER BY Fecha_Inicio__c DESC
        ];
    }
}
```

3. Instala las dependencias de Jest si no lo has hecho:
```bash
cd erp-clientes-contratos
npm install --save-dev @salesforce/lwc-jest jest
```

4. Crea el archivo de configuración de Jest si no existe:

**`jest.config.js`:**
```javascript
const { jestConfig } = require('@salesforce/lwc-jest');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        '^c/(.+)$': '<rootDir>/force-app/main/default/lwc/$1/$1'
    },
    testPathIgnorePatterns: [
        'node_modules',
        '.history'
    ],
    collectCoverageFrom: [
        'force-app/main/default/lwc/**/*.js',
        '!**/__tests__/**'
    ]
};
```

5. Crea el mock de Apex para tests:

**`force-app/main/default/lwc/contractList/__tests__/mockData.js`:**
```javascript
export const contratosMock = [
    {
        Id: 'a0Q5g00000ABCDE1',
        Name: 'CTR-0001',
        Monto__c: 150000,
        Estado__c: 'Activo',
        Fecha_Inicio__c: '2025-06-01',
        Fecha_Expiracion__c: '2026-06-01'
    },
    {
        Id: 'a0Q5g00000ABCDE2',
        Name: 'CTR-0002',
        Monto__c: 2500000,
        Estado__c: 'Activo',
        Fecha_Inicio__c: '2024-01-15',
        Fecha_Expiracion__c: '2027-01-15'
    },
    {
        Id: 'a0Q5g00000ABCDE3',
        Name: 'CTR-0003',
        Monto__c: 75000,
        Estado__c: 'En_Renovacion',
        Fecha_Inicio__c: '2025-03-01',
        Fecha_Expiracion__c: '2026-06-05'
    }
];

export const contratosVacios = [];
```

6. Crea los tests Jest:

**`force-app/main/default/lwc/contractList/__tests__/contractList.test.js`:**
```javascript
import { createElement } from 'lwc';
import ContractList from 'c/contractList';
import { registerApexTestWireAdapter } from '@salesforce/lwc-jest';
import getContratosByCliente from '@salesforce/apex/ContratoController.getContratosByCliente';
import { contratosMock, contratosVacios } from './mockData';

// Registrar wire adapter mock
const getContratosByClienteAdapter = registerApexTestWireAdapter(
    getContratosByCliente
);

describe('c-contract-list', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    const createComponent = () => {
        const element = createElement('c-contract-list', {
            is: ContractList
        });
        document.body.appendChild(element);
        return element;
    };

    it('renderiza spinner mientras carga', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        const spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull();
    });

    it('renderiza contratos correctamente con datos mock', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        // Emitir datos desde el wire adapter
        getContratosByClienteAdapter.emit(contratosMock);

        return Promise.resolve().then(() => {
            const filas = element.shadowRoot.querySelectorAll('tbody tr');
            expect(filas.length).toBe(3);

            // Verificar primer contrato
            const primeraFila = filas[0];
            expect(primeraFila.textContent).toContain('CTR-0001');
            expect(primeraFila.textContent).toContain('Activo');

            // Verificar que no hay spinner después de carga
            const spinner = element.shadowRoot.querySelector('lightning-spinner');
            expect(spinner).toBeNull();
        });
    });

    it('formatea moneda correctamente', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        getContratosByClienteAdapter.emit(contratosMock);

        return Promise.resolve().then(() => {
            const element2 = createComponent();
            element2.clienteId = 'a0Q5g00000TEST11';

            getContratosByClienteAdapter.emit(contratosMock);

            return Promise.resolve().then(() => {
                // Verificar formato de moneda en el segundo contrato ($2,500,000.00)
                // El mock tiene 2500000 como monto
                const celdasMonto = element2.shadowRoot.querySelectorAll('tbody tr td:nth-child(2)');
                expect(celdasMonto.length).toBe(3);

                // El orden depende del map, pero verificamos formato
                celdasMonto.forEach(celda => {
                    expect(celda.textContent).toMatch(/^\$[\d,]+\.\d{2}$/);
                });
            });
        });
    });

    it('renderiza estado vacío cuando no hay contratos', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        getContratosByClienteAdapter.emit(contratosVacios);

        return Promise.resolve().then(() => {
            const mensajeVacio = element.shadowRoot.querySelector('.slds-align_absolute-center');
            expect(mensajeVacio).not.toBeNull();
            expect(mensajeVacio.textContent).toContain('No se encontraron contratos');

            const tabla = element.shadowRoot.querySelector('table');
            expect(tabla).toBeNull();
        });
    });

    it('dispara evento al hacer click en contrato', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        getContratosByClienteAdapter.emit(contratosMock);

        const handler = jest.fn();
        element.addEventListener('seleccionarcontrato', handler);

        return Promise.resolve().then(() => {
            const primerLink = element.shadowRoot.querySelector('tbody tr a');
            primerLink.click();

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0].detail.contratoId).toBe('a0Q5g00000ABCDE1');
        });
    });

    it('renderiza error cuando falla wire', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        const mockError = {
            body: { message: 'Error al consultar contratos' },
            status: 400,
            ok: false
        };
        getContratosByClienteAdapter.error(mockError);

        return Promise.resolve().then(() => {
            const errorDiv = element.shadowRoot.querySelector('.slds-theme_error');
            expect(errorDiv).not.toBeNull();
            expect(errorDiv.textContent).toContain('Error al cargar contratos');
        });
    });

    it('renderiza badge con variant correcto según estado', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        getContratosByClienteAdapter.emit(contratosMock);

        return Promise.resolve().then(() => {
            const badges = element.shadowRoot.querySelectorAll('lightning-badge');

            expect(badges.length).toBe(3);
            expect(badges[0].label).toBe('Activo');
            expect(badges[0].variant).toBe('success');
            expect(badges[2].label).toBe('En_Renovacion');
            expect(badges[2].variant).toBe('warning');
        });
    });

    it('no renderiza nada si clienteId no está definido', () => {
        const element = createComponent();

        // Sin definir clienteId, wire no se activa
        const spinner = element.shadowRoot.querySelector('lightning-spinner');
        const tabla = element.shadowRoot.querySelector('table');

        expect(spinner).not.toBeNull();
        expect(tabla).toBeNull();
    });

    it('formatea fechas correctamente', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';

        getContratosByClienteAdapter.emit(contratosMock);

        return Promise.resolve().then(() => {
            // Verificar formato de fecha (dd/mm/aaaa)
            const celdasFecha = element.shadowRoot.querySelectorAll('tbody tr td:nth-child(4)');
            celdasFecha.forEach(celda => {
                expect(celda.textContent).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
            });
        });
    });

    it('actualiza contratos cuando cambia clienteId', () => {
        const element = createComponent();
        element.clienteId = 'a0Q5g00000TEST11';
        getContratosByClienteAdapter.emit(contratosMock);

        return Promise.resolve()
            .then(() => {
                // Cambiar clienteId
                element.clienteId = 'a0Q5g00000TEST22';
                getContratosByClienteAdapter.emit([contratosMock[0]]);

                return Promise.resolve();
            })
            .then(() => {
                const filas = element.shadowRoot.querySelectorAll('tbody tr');
                expect(filas.length).toBe(1);
            });
    });
});
```

7. Ejecuta los tests Jest:
```bash
cd erp-clientes-contratos
npx jest force-app/main/default/lwc/contractList/__tests__/contractList.test.js --coverage
```

8. Verifica el reporte de cobertura generado en `coverage/`.
