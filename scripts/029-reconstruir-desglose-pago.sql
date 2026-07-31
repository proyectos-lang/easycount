-- =========================================================================
-- 029 - Reconstruir el desglose de pago de ventas viejas (metodo + comision)
-- =========================================================================
--
-- Reconstruye filas en `ventas_pagos_detalle` para las ventas que NO tienen
-- desglose (se perdio por el esquema viejo, ver script 028), usando lo que
-- SI quedo registrado en tesoreria:
--
--   * Banco / Link de pago -> `cuenta_movimientos` del PAGO INICIAL de la venta
--     (concepto "Venta ... (neto)", guardan el NETO que entro al banco). El
--     metodo sale de `cuentas_config.tipo` y el % de `cuentas_config
--     .porcentaje_comision`. Se reconstruye el bruto: bruto = neto/(1-%/100),
--     comision = bruto - neto.
--   * Efectivo -> `caja_chica_movimientos` tipo 'Ingreso_Venta' (guardan el
--     BRUTO; sin comision).
--
-- Se EXCLUYEN los abonos posteriores (concepto "Abono venta #...").
--
-- REQUISITOS:
--   1. Aplicar ANTES el script 028 (agrega porcentaje_comision/usuario y el
--      default de monto_recibido).
--
-- LIMITES (aproximacion):
--   - Usa el % de comision ACTUAL de la cuenta (`cuentas_config`). Si el % de
--     una cuenta cambio con el tiempo, las ventas viejas quedan con el % de
--     hoy (revisa el PREVIEW: el bruto reconstruido deberia parecerse al
--     total_venta de la factura si se pago completa con ese metodo).
--   - Ventas a credito puro (sin movimiento de dinero al crearse) o pagadas
--     con 'Otro' sin movimiento no se pueden reconstruir -> quedan sin metodo.
--   - Idempotente: solo reconstruye ventas SIN desglose; correrlo dos veces no
--     duplica.
--
-- Corre PRIMERO la seccion 1 (PREVIEW, no escribe). Si te cuadra, corre la
-- seccion 2 (INSERT).
-- =========================================================================


-- -------------------------------------------------------------------------
-- SECCION 1 - PREVIEW (solo lectura, no escribe nada)
--   Muestra, por venta a reconstruir, las lineas que se crearian y compara
--   la suma del bruto reconstruido contra el total_venta de la factura.
-- -------------------------------------------------------------------------
WITH recon AS (
  -- Banco / Link (neto -> bruto)
  SELECT cm.ref_id           AS venta_id,
         cm.razon_social_id  AS razon_social_id,
         cc.tipo             AS metodo_pago,
         cm.cuenta_id        AS cuenta_id,
         ROUND(cm.monto / (1 - LEAST(cc.porcentaje_comision, 99.99) / 100.0), 2) AS monto_bruto,
         cc.porcentaje_comision AS porcentaje_comision,
         cm.monto            AS monto_neto
  FROM public.cuenta_movimientos cm
  JOIN public.cuentas_config cc ON cc.id = cm.cuenta_id
  WHERE cm.ref_tipo = 'venta'
    AND cm.tipo = 'Ingreso'
    AND COALESCE(cm.concepto, '') LIKE '%(neto)%'

  UNION ALL

  -- Efectivo (bruto = neto, sin comision)
  SELECT km.ref_id, km.razon_social_id, 'Efectivo', NULL,
         km.monto, 0, km.monto
  FROM public.caja_chica_movimientos km
  WHERE km.ref_tipo = 'venta'
    AND km.tipo = 'Ingreso_Venta'
    AND COALESCE(km.concepto, '') NOT LIKE 'Abono%'
)
SELECT r.venta_id,
       ve.numero_factura,
       ve.total_venta,
       r.metodo_pago,
       cc.nombre AS cuenta,
       r.monto_neto,
       r.porcentaje_comision AS pct,
       r.monto_bruto,
       ROUND(r.monto_bruto - r.monto_neto, 2) AS comision
FROM recon r
JOIN public.ventas_encabezado ve ON ve.id = r.venta_id
LEFT JOIN public.cuentas_config cc ON cc.id = r.cuenta_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.ventas_pagos_detalle p WHERE p.venta_id = r.venta_id
)
ORDER BY r.venta_id DESC
LIMIT 200;


-- -------------------------------------------------------------------------
-- SECCION 2 - INSERT (escribe). Corre esto SOLO si el PREVIEW te cuadra.
--   Requiere el script 028 aplicado (columnas porcentaje_comision/usuario y
--   default de monto_recibido). Transaccional: todo o nada.
-- -------------------------------------------------------------------------
BEGIN;

WITH recon AS (
  SELECT cm.ref_id           AS venta_id,
         cm.razon_social_id  AS razon_social_id,
         cc.tipo             AS metodo_pago,
         cm.cuenta_id        AS cuenta_id,
         ROUND(cm.monto / (1 - LEAST(cc.porcentaje_comision, 99.99) / 100.0), 2) AS monto_bruto,
         cc.porcentaje_comision AS porcentaje_comision,
         cm.monto            AS monto_neto
  FROM public.cuenta_movimientos cm
  JOIN public.cuentas_config cc ON cc.id = cm.cuenta_id
  WHERE cm.ref_tipo = 'venta'
    AND cm.tipo = 'Ingreso'
    AND COALESCE(cm.concepto, '') LIKE '%(neto)%'

  UNION ALL

  SELECT km.ref_id, km.razon_social_id, 'Efectivo', NULL,
         km.monto, 0, km.monto
  FROM public.caja_chica_movimientos km
  WHERE km.ref_tipo = 'venta'
    AND km.tipo = 'Ingreso_Venta'
    AND COALESCE(km.concepto, '') NOT LIKE 'Abono%'
)
INSERT INTO public.ventas_pagos_detalle
  (venta_id, razon_social_id, metodo_pago, cuenta_id, monto_bruto, porcentaje_comision, monto_neto, usuario)
SELECT r.venta_id, r.razon_social_id, r.metodo_pago, r.cuenta_id,
       r.monto_bruto, r.porcentaje_comision, r.monto_neto, 'reconstruido'
FROM recon r
WHERE NOT EXISTS (
  SELECT 1 FROM public.ventas_pagos_detalle p WHERE p.venta_id = r.venta_id
);

COMMIT;

-- -------------------------------------------------------------------------
-- SECCION 3 - VERIFICACION (opcional)
-- -------------------------------------------------------------------------
-- SELECT count(*) AS filas_desglose FROM public.ventas_pagos_detalle;
-- SELECT venta_id, string_agg(metodo_pago || ' ' || porcentaje_comision || '%', ', ') AS desglose
-- FROM public.ventas_pagos_detalle GROUP BY venta_id ORDER BY venta_id DESC LIMIT 20;
