# EasyCount — Qué puede y qué no puede hacer

> Análisis de capacidades del sistema, verificado contra el código.
> Actualizado: 2026-09-16.

EasyCount es un **ERP/POS multi-empresa en la nube** (Next.js + Supabase),
pensado para Honduras (Lempiras, RTN, ISV 15 %). Cada empresa (razón social)
es un **tenant aislado**, y sus módulos se **habilitan/deshabilitan por empresa**
desde el panel de super-admin. Hoy hay **44 módulos** en 7 categorías.

Leyenda: **✅ Sí** · **⚠️ Parcial** · **❌ No**

---

## Lo esencial (arquitectura)

| Capacidad | Estado | Nota |
|---|---|---|
| Multi-empresa / multi-tenant | ✅ Sí | Aislamiento por `razon_social_id` + RLS. Puedes operar 2+ empresas separadas (Lettra, Office Mart, IACO…). |
| Todo en la nube | ✅ Sí | Supabase; sin instalación local. |
| Habilitar/deshabilitar módulos por empresa | ✅ Sí | Desde super-admin (`/plataforma → Módulos`). Muchos módulos nacen **deshabilitados** (opt-in). |
| Usuarios y permisos por módulo | ✅ Sí | Permisos por usuario dentro de cada empresa. |
| Sistema modular pero sincronizado (sin doble ingreso) | ⚠️ Parcial | **Ventas** está totalmente integrado (ver abajo). **Compras** actualiza inventario, pero el pago al proveedor va aparte por Gastos. |

---

## Ventas

| Capacidad | Estado | Nota |
|---|---|---|
| Facturar (POS): cliente, productos, descuento, ISV, multi-método de pago | ✅ Sí | Efectivo + banco/tarjeta + link + crédito en una misma venta. |
| Numeración de factura correlativa y sin duplicados | ✅ Sí | Correlativo **atómico** server-side (no repite números; puede dejar huecos si se borra una factura — es normal). |
| Historial de facturas con filtros | ✅ Sí | Por fecha, cliente, almacén, estado de pago. Muestra método y **cuenta destino** del cobro por banco. |
| Devoluciones (parciales por ítem o factura completa) | ✅ Sí | Genera nota de crédito, repone stock y reembolsa a caja/banco. |
| Editar una venta ya hecha | ✅ Sí | Propaga a inventario, caja, banco y CxC; conserva el número. |
| Eliminar una venta con trazabilidad | ✅ Sí | Pide **motivo obligatorio** y guarda copia en pestaña "Eliminadas". Revierte stock/caja/banco. |
| Recepción de pagos: completo y parcial (abonos) | ✅ Sí | Abono factura por factura. |
| Pago de **múltiples facturas** en un solo movimiento | ❌ No | Se abona una factura a la vez. |
| Cuentas por cobrar + antigüedad de saldos (aging) | ✅ Sí | Aging 0-30/31-60/61-90/90+. |
| Estado de cuenta consolidado por cliente | ⚠️ Parcial | Hay CxC por factura con aging; no un documento único por cliente. |
| Rentabilidad por producto (costo vs precio, utilidad, margen) | ✅ Sí | En Productos y en el detalle de ventas. |
| Reportes: más vendidos, top clientes, por almacén, por fecha | ✅ Sí | En Dashboard de Ventas. |
| Reportes: sin movimiento, **por vendedor, por zona, por línea** | ❌ No | No existe el concepto de vendedor ni zona. |
| **3 puntos de facturación** en 2 ciudades con series independientes | ❌ No | Correlativo global; no hay serie por punto/ciudad. |
| **Cotizaciones** (crear, guardar, reabrir, convertir a factura) | ❌ No | Existe "Pedidos por Catálogo" (el cliente pide por link), no cotizaciones internas. |
| **Comisiones de vendedor** por políticas | ❌ No | La única "comisión" es la bancaria de tarjeta. |
| Listas de precios + asignar lista a un cliente | ✅ Sí | Por porcentaje o precio individual por producto. |
| Precio **por categoría** de producto | ❌ No | Solo global o por producto. |
| Clientes: dirección, RTN | ✅ Sí | |
| Clientes: **notas, límite de crédito, días de crédito, co-cliente** | ❌ No | No existen esos campos. |
| **CRM** (oportunidades, pipeline, seguimiento) | ❌ No | Solo maestro de clientes básico. |

---

## Compras

| Capacidad | Estado | Nota |
|---|---|---|
| Crear Orden de Compra y recibirla a inventario | ✅ Sí | Con **prorrateo de gastos de importación/embarque** entre productos. |
| Recepción por factura (con IA) | ✅ Sí | |
| Estadísticas de **tránsito / mínimos críticos / punto de reorden** | ❌ No | |
| **Pagos parciales a la OC** + saldos por proveedor | ❌ No | Las cuentas por pagar existen, pero atadas a **Gastos**, no a la OC. |
| **Backorder** (recibir incompleto, monitorear faltantes) | ❌ No | La recepción marca la OC completa. |
| Estadísticas de OC colocadas | ❌ No | |
| **Estado de cuenta de proveedores** | ❌ No | El maestro de proveedores es mínimo. |

---

## Inventario

| Capacidad | Estado | Nota |
|---|---|---|
| Multi-almacén con localizaciones/bodegas | ✅ Sí | Stock por almacén y localización. |
| Kardex / cardex por producto | ✅ Sí | Historial de transacciones. |
| Valoración de inventario | ✅ Sí | Stock, costo y valor. |
| Traslados entre localizaciones | ✅ Sí | |
| Ajustes de inventario (por conteo) | ✅ Sí | |
| Ajuste de costo | ✅ Sí | |
| Categorizar por categoría / subcategoría / marca | ✅ Sí | 2 niveles (categoría → subcategoría) + marca. |
| Categorizar por "línea" (como concepto propio) | ⚠️ Parcial | No hay campo "línea"; se cubre con categoría/subcategoría. |
| Rastreabilidad producto → OC | ⚠️ Parcial | Cada entrada de kardex referencia su OC, pero no hay pantalla/lote/serie. |
| **Congelar inventario** para toma física (freeze) | ❌ No | Hay ajuste por conteo, pero el stock sigue moviéndose. |
| Prorrateo de gastos de embarque al ingresar | ✅ Sí | (En Compras.) |

---

## Producción (manufactura por etapas)

> Todos los módulos de Producción son **opt-in por empresa**. Cada empresa activa
> solo lo que necesite. Cubre desde materia prima hasta el flujo por operaciones.

| Capacidad | Estado | Nota |
|---|---|---|
| Materiales (materia prima) con inventario y costo propio | ✅ Sí | Catálogo separado de productos. |
| Carga inicial de materiales (stock + costo) al crearlos | ✅ Sí | Con movimiento en el kardex. |
| Importar materiales por Excel (plantilla) | ✅ Sí | |
| Compra de materiales con prorrateo de importación | ✅ Sí | |
| Compra de materiales **contado/crédito + gestión de saldo** | ✅ Sí | Abonos con estado Pendiente/Parcial/Pagado (control de saldo, no mueve banco). |
| Recetas / BOM por producto fabricado + costo estimado | ✅ Sí | Con estándar de producción, energía, mano de obra, overhead. |
| Órdenes de producción | ✅ Sí | Congela la receta; con número OP-####. |
| **Planeador tipo Gantt** de un día (arrastrar, horario configurable) | ✅ Sí | Hora de inicio por arrastre; % fabricado en cada barra. |
| Control de piso: corridas (unidades, operador, **paros con motivo**, defectos) | ✅ Sí | Con preview del consumo de materia prima al capturar unidades. |
| Vista "En vivo" (por día) y "Consolidado" (por rango) de producción | ✅ Sí | |
| Descuento automático de materiales al ejecutar la corrida | ✅ Sí | Valida stock; calcula costo real. |
| Recepción de producto terminado a inventario + historial | ✅ Sí | Con costo real (promedio ponderado). |
| Dashboard de producción / OEE | ✅ Sí | Disponibilidad × Rendimiento × Calidad. |
| **Operaciones/etapas configurables por empresa** | ✅ Sí | Cada empresa define su secuencia (Op.1 → 2 → 3…). |
| **Flujo por etapas** de cada orden (recibir → trabajar → entregar) | ✅ Sí | Secuencia congelada por orden; cierra la orden al completar. |
| **Reporte de flujo** (tiempo por etapa, carga, cuellos de botella) | ✅ Sí | |

---

## Bancos / Finanzas

| Capacidad | Estado | Nota |
|---|---|---|
| Múltiples cuentas bancarias, movimientos, saldos | ✅ Sí | |
| Transferencias entre cuentas | ✅ Sí | |
| Caja chica (arqueo, apertura/cierre, conteo por denominación) | ✅ Sí | Cierre puede fecharse a un día anterior. |
| Cierre diario (con desglose por método de cobro) | ✅ Sí | Efectivo + banco bruto − comisiones = neto. |
| Gastos + cuentas por pagar (con vencimiento y abonos) | ✅ Sí | Atado a Gastos (no a la OC). |
| Estado de Resultados (P&L) mensual | ✅ Sí | |
| Flujo de caja | ✅ Sí | |
| Análisis financiero (rentabilidad, anomalías de gasto) | ✅ Sí | |
| Consolidación bancaria | ✅ Sí | Saldo día a día por cuenta. |
| **Conciliación bancaria** (contra estado de cuenta del banco) | ❌ No | Solo recalcula el saldo interno; no importa ni cruza contra el banco. |
| **Balance General** (activos/pasivos/patrimonio) | ❌ No | Hay P&L y flujo, no balance contable. |

---

## General (otros)

| Capacidad | Estado | Nota |
|---|---|---|
| Reportes estadísticos por área | ⚠️ Parcial | Ventas, Finanzas, Producción, Inventario sí; Compras/proveedores no. |
| Exports a Excel (.xlsx) | ✅ Sí | En todo el sistema. |
| **RRHH / nómina / empleados** | ❌ No | "Nómina" solo como categoría de gasto. |
| **Firma digital de documentos** | ❌ No | Solo líneas para firmar a mano en PDFs. |

---

## Resumen para decidir

**EasyCount hoy es fuerte en:** operación diaria multi-empresa en la nube, POS/ventas
totalmente integrado (inventario + tesorería + CxC), inventario con prorrateo de
importación, y un **módulo de producción por etapas configurable por empresa**
(operaciones → flujo → reportes) — que cubre el caso de imprenta/confección con
distinto número de procesos por empresa.

**Los mayores faltantes** (según el requerimiento original): ciclo de cuentas por
pagar **atado a la OC** (pagos parciales, saldo y estado de cuenta por proveedor),
**backorder / recepción parcial**, **cotizaciones formales**, **series de
facturación por punto**, **comisiones de vendedor**, **límite de crédito/notas en
clientes**, **conciliación bancaria**, **balance general**, **RRHH** y **firma
digital** — ninguno existe todavía.
