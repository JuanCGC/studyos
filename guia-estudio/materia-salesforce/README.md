# Sistema ERP de Gestión de Clientes, Contratos y Comisiones en Apex

## Descripción General

Este proyecto unificado atraviesa todos los capítulos de la materia **Apex/Salesforce**. Cada capítulo construye una pieza del mismo sistema: un **ERP corporativo** para la gestión de clientes, contratos de servicio y comisiones de vendedores.

## Objetivo del Sistema

Construir un ERP modular sobre Salesforce que permita:

- **Registro y clasificación de clientes corporativos** con validación RFC, límites de crédito y categorización por ingresos.
- **Gestión de contratos** con múltiples estados (Borrador, Activo, En_Renovacion, Vencido, Cancelado), control de fechas de expiración y montos asociados.
- **Cálculo y liquidación de comisiones** para la fuerza de ventas basado en contratos activos y renovaciones.
- **Integración con sistemas externos** como API bancaria para sincronización de clientes y buró de crédito.
- **Automatización mediante Platform Events** para flujos reactivos (renovación de contratos, eventos de orden).
- **Pipeline CI/CD completo** con despliegue automatizado, pruebas Apex, tests Jest para LWC y gate de cobertura.

## Modelo de Datos

| Objeto | Propósito |
|--------|-----------|
| `Cliente__c` | Clientes corporativos con RFC, ingresos, límite de crédito, categoría |
| `Contrato__c` | Contratos vinculados a un cliente con monto, estado, fechas, vendedor |
| `Comision__c` | Comisiones generadas por contratos con porcentaje, monto, estado de pago |
| `Contract_Renewed__e` | Platform Event disparado al renovar un contrato |
| `Order_Event__e` | Platform Event para órdenes externas |

## Estructura del Curso

| # | Capítulo | Lab Express | Proyecto Principal |
|---|----------|-------------|-------------------|
| 01 | Dev Org Setup con SF CLI | Crear Scratch Org | Setup del ERP |
| 02 | Apex Basics y Sintaxis | Calculadora de Descuentos | Modelo de Clientes Corporativos |
| 03 | isTest y TestSetup | Test Hello World | TestSetup de Contratos |
| 04 | HttpCalloutMock | Callout Mock Simple | Sincronización con API Bancaria |
| 05 | System.runAs y FLS | runAs Demo | FLS en Contratos |
| 06 | Governor Limits Testing | Limits Inspector | Bulk Contract Processing |
| 07 | Debug Logs Reading | Logger con System.debug | Debug del Pipeline de Comisiones |
| 08 | LWC Jest Tests | Jest para HelloWorld | Jest para ContractList |
| 09 | Batch Apex Testing | Batch Hello | Batch de Vencimiento de Contratos |
| 10 | Platform Events Testing | Event Pub/Sub | Evento de Contrato Renovado |
| 11 | Flow + Apex Testing | Flow Email Validator | Flow de Aprobación de Crédito |
| 12 | SF CLI + CI/CD Pipeline | GHA Mínimo | Pipeline ERP Completo |
| 13 | Multi-Org Regression | Multi-Org básico | Regression Multi-Org ERP |
| 14 | Copado Basics | Copado Fundamentals | Estrategia de Deploy con Copado |
| 15 | Examen Final | Mini-Suite Apex | Cierre ERP |
