-- =========================================================================
-- 027 - Homologar total_venta a BRUTO (correccion de datos, una sola vez)
-- =========================================================================
--
-- OPCIONAL y de UNA SOLA VEZ. No crea ni altera tablas: solo corrige DATOS
-- existentes en `ventas_encabezado`.
--
-- PROBLEMA: hasta ahora `total_venta` se guardaba NETO de comisiones
-- bancarias (lo que le queda al comercio tras la retencion del banco en
-- tarjeta/link). En cambio el "Detalle por Producto" suma las lineas
-- (cantidad * precio, con ISV) = el BRUTO que factura/paga el cliente. Por
-- eso el "Total" del Resumen de Facturas no cuadraba con el del Detalle en
-- las ventas con comision.
--
-- SOLUCION: el total de venta real = BRUTO (subtotal - descuento + ISV). La
-- comision bancaria es un costo del comercio, no reduce la venta ni la deuda
-- del cliente. Este script reescribe, por cada factura CON lineas:
--   * subtotal        = suma de sus lineas (cantidad * precio)
--   * impuesto_total  = base_neta * ISV%
--   * total_venta     = base_neta * (1 + ISV%)            (BRUTO)
--   * valorpago       = se re-escala para conservar la fraccion pagada
--                       (asi una venta pagada sigue pagada, una pendiente
--                        sigue pendiente; el saldo queda en bruto)
--   * estado_pago     = recalculado contra el nuevo total/valorpago
-- donde base_neta = subtotal_lineas * (1 - descuento%).
--
-- El codigo de la app ya guarda el BRUTO en ventas nuevas; este script alinea
-- el historico. IDEMPOTENTE: correrlo dos veces no cambia nada la segunda vez.
--
-- LIMITE conocido: en ventas PARCIALMENTE pagadas con tarjeta/link, el
-- `valorpago` re-escalado puede quedar corto por la comision de la porcion
-- pagada (diferencia pequena en el saldo). Ventas de contado, credito puro y
-- totalmente pagadas quedan exactas.
--
-- Solo afecta facturas que tienen lineas en `ventas_detalle` (no toca
-- facturas sin detalle). Nota: en el SQL Editor de Supabase corre sin RLS,
-- asi que homologa TODAS las empresas.
--
-- ---------------------------------------------------------------------------
-- 1) VISTA PREVIA (opcional): cuanto cambiaria el total por empresa.
-- ---------------------------------------------------------------------------
-- WITH agg AS (
--   SELECT venta_id, SUM(cantidad * precio_unitario) AS sub_lineas
--   FROM public.ventas_detalle GROUP BY venta_id
-- )
-- SELECT ve.razon_social_id,
--        COUNT(*) AS facturas,
--        ROUND(SUM(ve.total_venta), 2) AS total_actual,
--        ROUND(SUM(agg.sub_lineas * (1 - COALESCE(ve.descuento,0)/100.0)
--              * (1 + (CASE WHEN ve.aplica_impuesto THEN COALESCE(ve.porcentaje_impuesto,15) ELSE 0 END)/100.0)), 2) AS total_bruto
-- FROM public.ventas_encabezado ve
-- JOIN agg ON agg.venta_id = ve.id
-- GROUP BY ve.razon_social_id
-- ORDER BY ve.razon_social_id;

-- ---------------------------------------------------------------------------
-- 2) HOMOLOGACION (transaccional: todo o nada).
-- ---------------------------------------------------------------------------
BEGIN;

WITH agg AS (
  SELECT venta_id, SUM(cantidad * precio_unitario) AS sub_lineas
  FROM public.ventas_detalle
  GROUP BY venta_id
),
calc AS (
  SELECT
    ve.id,
    ROUND(agg.sub_lineas, 2) AS nuevo_subtotal,
    ROUND(agg.sub_lineas * (1 - COALESCE(ve.descuento,0)/100.0)
          * (CASE WHEN ve.aplica_impuesto THEN COALESCE(ve.porcentaje_impuesto,15) ELSE 0 END)/100.0, 2) AS nuevo_impuesto,
    ROUND(agg.sub_lineas * (1 - COALESCE(ve.descuento,0)/100.0)
          * (1 + (CASE WHEN ve.aplica_impuesto THEN COALESCE(ve.porcentaje_impuesto,15) ELSE 0 END)/100.0), 2) AS nuevo_total,
    ve.total_venta AS old_total,
    COALESCE(ve.valorpago, 0) AS old_valorpago
  FROM public.ventas_encabezado ve
  JOIN agg ON agg.venta_id = ve.id
),
calc2 AS (
  SELECT
    id, nuevo_subtotal, nuevo_impuesto, nuevo_total,
    -- valorpago re-escalado a bruto conservando la fraccion pagada,
    -- acotado a [0, nuevo_total].
    LEAST(
      nuevo_total,
      COALESCE(ROUND(nuevo_total * (old_valorpago / NULLIF(old_total, 0)), 2), 0)
    ) AS nuevo_valorpago
  FROM calc
)
UPDATE public.ventas_encabezado ve
SET
  subtotal       = c.nuevo_subtotal,
  impuesto_total = c.nuevo_impuesto,
  total_venta    = c.nuevo_total,
  valorpago      = c.nuevo_valorpago,
  estado_pago    = CASE
                     WHEN c.nuevo_valorpago <= 0 THEN 'Pendiente'
                     WHEN c.nuevo_valorpago >= c.nuevo_total - 0.005 THEN 'Pagado'
                     ELSE 'Parcial'
                   END
FROM calc2 c
WHERE ve.id = c.id;

COMMIT;

-- ---------------------------------------------------------------------------
-- 3) VERIFICACION (opcional): el total del encabezado debe igualar la suma
--    de lineas (bruto). No deberia devolver filas con diferencia > 0.01.
-- ---------------------------------------------------------------------------
-- WITH agg AS (
--   SELECT venta_id, SUM(cantidad * precio_unitario) AS sub_lineas
--   FROM public.ventas_detalle GROUP BY venta_id
-- )
-- SELECT ve.id, ve.numero_factura, ve.total_venta,
--        ROUND(agg.sub_lineas * (1 - COALESCE(ve.descuento,0)/100.0)
--              * (1 + (CASE WHEN ve.aplica_impuesto THEN COALESCE(ve.porcentaje_impuesto,15) ELSE 0 END)/100.0), 2) AS bruto_lineas
-- FROM public.ventas_encabezado ve
-- JOIN agg ON agg.venta_id = ve.id
-- WHERE ABS(ve.total_venta - ROUND(agg.sub_lineas * (1 - COALESCE(ve.descuento,0)/100.0)
--       * (1 + (CASE WHEN ve.aplica_impuesto THEN COALESCE(ve.porcentaje_impuesto,15) ELSE 0 END)/100.0), 2)) > 0.01;
