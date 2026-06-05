# 📘 01. Dev Org Setup con SF CLI

- **Concepto Clave Asimilado:** Creación y configuración de entornos de desarrollo Salesforce mediante Salesforce CLI, scratch orgs despliegue de metadatos.

---

### 🧪 PARTE A: Laboratorio Express (Mini-Proyecto Aislado)

- **Desafío:** Crear Scratch Org y desplegar código fuente básico

**Instrucciones:**

1. Abre una terminal y verifica que SF CLI está instalado:
```bash
sf version
```

2. Crea un archivo de configuración para la scratch org en `config/dev-scratch.json`:
```json
{
  "orgName": "Test Org",
  "edition": "Developer",
  "features": ["API", "DebugApex"],
  "settings": {
    "orgPreferenceSettings": {
      "s1DesktopEnabled": true,
      "selfSetPasswordInApi": true
    }
  }
}
```

3. Autentica contra un Dev Hub:
```bash
sf org login web --set-default-dev-hub
```

4. Crea la scratch org:
```bash
sf org create scratch --definition-file config/dev-scratch.json --alias TestOrg --duration-days 7
```

5. Crea un directorio `force-app/main/default/classes/` y dentro un archivo `Utilidades.cls`:
```apex
public class Utilidades {
    public static String saludar(String nombre) {
        return 'Hola, ' + nombre + '! Bienvenido a Salesforce.';
    }
}
```

6. Despliega el código fuente a la scratch org:
```bash
sf project deploy start --source-dir force-app/main/default/classes --target-org TestOrg
```

7. Abre la org y verifica que la clase existe:
```bash
sf org open --target-org TestOrg
```

8. Elimina la scratch org al terminar:
```bash
sf org delete scratch --target-org TestOrg
```

---

### 🏗️ PARTE B: Evolución del Proyecto Principal de la Materia

- **Evolución del Software:** Setup del ERP — Configuración inicial del proyecto con Dev Hub, scratch org y modelo de datos personalizado

**Instrucciones:**

1. Crea el directorio del proyecto ERP:
```bash
mkdir erp-clientes-contratos
cd erp-clientes-contratos
sf project generate --name erp-clientes-contratos
```

2. Crea el archivo `config/dev-scratch.json` con las características necesarias:
```json
{
  "orgName": "ERP Clientes",
  "edition": "Enterprise",
  "features": [
    "API",
    "DebugApex",
    "BusinessProcessAutomation",
    "PlatformEvents",
    "FieldService:1"
  ],
  "settings": {
    "orgPreferenceSettings": {
      "s1DesktopEnabled": true,
      "selfSetPasswordInApi": true
    },
    "mobileSettings": {
      "enableS1EncryptedStoragePref2": true
    }
  }
}
```

3. Genera los objetos personalizados usando `sf schema generate` o créalos manualmente en `force-app/main/default/objects/`:

**`objects/Cliente__c/Cliente__c.object-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Cliente</label>
    <pluralLabel>Clientes</pluralLabel>
    <nameField>
        <label>Nombre del Cliente</label>
        <type>Text</type>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ReadWrite</sharingModel>
</CustomObject>
```

**`objects/Cliente__c/fields/RFC__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>RFC__c</fullName>
    <label>RFC</label>
    <type>Text</type>
    <length>13</length>
    <required>true</required>
    <unique>true</unique>
</CustomField>
```

**`objects/Cliente__c/fields/Ingresos_Anuales__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Ingresos_Anuales__c</fullName>
    <label>Ingresos Anuales</label>
    <type>Currency</type>
    <precision>18</precision>
    <scale>2</scale>
</CustomField>
```

**`objects/Cliente__c/fields/Limite_de_Credito__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Limite_de_Credito__c</fullName>
    <label>Límite de Crédito</label>
    <type>Currency</type>
    <precision>18</precision>
    <scale>2</scale>
</CustomField>
```

**`objects/Cliente__c/fields/Categoria__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Categoria__c</fullName>
    <label>Categoría</label>
    <type>Picklist</type>
    <valueSet>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value>
                <fullName>Bronze</fullName>
                <default>true</default>
                <label>Bronze</label>
            </value>
            <value>
                <fullName>Silver</fullName>
                <default>false</default>
                <label>Silver</label>
            </value>
            <value>
                <fullName>Gold</fullName>
                <default>false</default>
                <label>Gold</label>
            </value>
            <value>
                <fullName>Platinum</fullName>
                <default>false</default>
                <label>Platinum</label>
            </value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

**`objects/Contrato__c/Contrato__c.object-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Contrato</label>
    <pluralLabel>Contratos</pluralLabel>
    <nameField>
        <label>Número de Contrato</label>
        <type>AutoNumber</type>
        <displayFormat>CTR-{0000}</displayFormat>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ReadWrite</sharingModel>
</CustomObject>
```

**`objects/Contrato__c/fields/Monto__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Monto__c</fullName>
    <label>Monto</label>
    <type>Currency</type>
    <precision>18</precision>
    <scale>2</scale>
    <required>true</required>
</CustomField>
```

**`objects/Contrato__c/fields/Estado__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Estado__c</fullName>
    <label>Estado</label>
    <type>Picklist</type>
    <valueSet>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value>
                <fullName>Borrador</fullName>
                <default>true</default>
                <label>Borrador</label>
            </value>
            <value>
                <fullName>Activo</fullName>
                <default>false</default>
                <label>Activo</label>
            </value>
            <value>
                <fullName>En_Renovacion</fullName>
                <default>false</default>
                <label>En Renovación</label>
            </value>
            <value>
                <fullName>Vencido</fullName>
                <default>false</default>
                <label>Vencido</label>
            </value>
            <value>
                <fullName>Cancelado</fullName>
                <default>false</default>
                <label>Cancelado</label>
            </value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

**`objects/Contrato__c/fields/Fecha_Inicio__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Fecha_Inicio__c</fullName>
    <label>Fecha de Inicio</label>
    <type>Date</type>
    <required>true</required>
</CustomField>
```

**`objects/Contrato__c/fields/Fecha_Expiracion__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Fecha_Expiracion__c</fullName>
    <label>Fecha de Expiración</label>
    <type>Date</type>
</CustomField>
```

**`objects/Contrato__c/fields/Vendedor__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Vendedor__c</fullName>
    <label>Vendedor</label>
    <type>Lookup</type>
    <referenceTo>User</referenceTo>
    <required>true</required>
</CustomField>
```

**`objects/Contrato__c/fields/Cliente__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Cliente__c</fullName>
    <label>Cliente</label>
    <type>MasterDetail</type>
    <referenceTo>Cliente__c</referenceTo>
    <required>true</required>
</CustomField>
```

**`objects/Comision__c/Comision__c.object-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Comisión</label>
    <pluralLabel>Comisiones</pluralLabel>
    <nameField>
        <label>Número de Comisión</label>
        <type>AutoNumber</type>
        <displayFormat>COM-{0000}</displayFormat>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ReadWrite</sharingModel>
</CustomObject>
```

**`objects/Comision__c/fields/Monto_Comision__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Monto_Comision__c</fullName>
    <label>Monto Comisión</label>
    <type>Currency</type>
    <precision>18</precision>
    <scale>2</scale>
</CustomField>
```

**`objects/Comision__c/fields/Porcentaje__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Porcentaje__c</fullName>
    <label>Porcentaje</label>
    <type>Percent</type>
    <precision>5</precision>
    <scale>2</scale>
</CustomField>
```

**`objects/Comision__c/fields/Estado__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Estado__c</fullName>
    <label>Estado</label>
    <type>Picklist</type>
    <valueSet>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value>
                <fullName>Pendiente</fullName>
                <default>true</default>
                <label>Pendiente</label>
            </value>
            <value>
                <fullName>Pagada</fullName>
                <default>false</default>
                <label>Pagada</label>
            </value>
            <value>
                <fullName>Cancelada</fullName>
                <default>false</default>
                <label>Cancelada</label>
            </value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

**`objects/Comision__c/fields/Contrato__c.field-meta.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Contrato__c</fullName>
    <label>Contrato</label>
    <type>MasterDetail</type>
    <referenceTo>Contrato__c</referenceTo>
    <required>true</required>
</CustomField>
```

4. Despliega los objetos a la scratch org:
```bash
sf project deploy start --source-dir force-app/main/default --target-org TestOrg
```

5. Abre la org y verifica los objetos creados en Setup → Objects:
```bash
sf org open --target-org TestOrg
```

6. Crea algunos registros de prueba manualmente desde la UI de Salesforce para validar el modelo de datos.

7. Confirma los archivos en git:
```bash
git init
git add .
git commit -m "feat: setup inicial del ERP con objetos Cliente, Contrato y Comision"
```
