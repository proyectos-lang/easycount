-- =========================================================================
-- ONE-OFF (NO commitear): corrige la `fecha` de los movimientos de inventario
-- de Inversiones Mi Olanchito (razon 14) que se guardaron en UTC real (+6h)
-- por una app cacheada vieja. La `fecha_venta` de la venta SI esta en hora de
-- Honduras, asi que alineamos el movimiento 'Salida Venta' a su venta.
-- =========================================================================

-- PASO 1 — Ver los 'Salida Venta' cuya fecha NO coincide con la de su venta.
--   trans_actual = lo guardado en el kardex (mal).  venta_hn = lo correcto.
SELECT t.id, t.referencia_id, v.numero_factura,
       to_char(t.fecha AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS trans_actual,
       to_char(v.fecha_venta AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS venta_hn
FROM public.transacciones_inventario t
JOIN public.ventas_encabezado v ON v.id = t.referencia_id
WHERE t.razon_social_id = 14
  AND t.tipo_movimiento = 'Salida Venta'
  AND t.fecha <> v.fecha_venta
ORDER BY t.id DESC
LIMIT 200;

-- PASO 2 — Alinear cada 'Salida Venta' a la fecha (hora HN) de su venta.
BEGIN;

UPDATE public.transacciones_inventario t
SET fecha = v.fecha_venta
FROM public.ventas_encabezado v
WHERE v.id = t.referencia_id
  AND t.razon_social_id = 14
  AND t.tipo_movimiento = 'Salida Venta'
  AND t.fecha <> v.fecha_venta;

COMMIT;

-- PASO 3 — Verificar: ya no debe quedar ningun 'Salida Venta' desalineado, y
--   el conteo por dia debe cuadrar (sin filas corridas al 28 por ventas de la
--   tarde del 27).
SELECT (t.fecha AT TIME ZONE 'UTC')::date AS dia, COUNT(*) AS cantidad
FROM public.transacciones_inventario t
WHERE t.razon_social_id = 14
  AND t.tipo_movimiento = 'Salida Venta'
  AND t.fecha >= '2026-08-27T00:00:00Z'
GROUP BY (t.fecha AT TIME ZONE 'UTC')::date
ORDER BY dia;

-- ------------------------------------------------------------------------
-- OPCIONAL — Movimientos MANUALES de hoy (Ingreso/Salida Manual, Ajuste) NO
-- tienen venta de referencia; si se hicieron en el mismo equipo cacheado,
-- tambien quedaron +6h. Primero REVISALOS (PASO 4). Si confirmas que estan
-- +6h, corre el PASO 5 para restarles 6 horas. Ajusta la ventana de fecha.
-- ------------------------------------------------------------------------

-- PASO 4 — Revisar los manuales recientes (sin venta).
SELECT t.id, t.tipo_movimiento,
       to_char(t.fecha AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS fecha_actual
FROM public.transacciones_inventario t
WHERE t.razon_social_id = 14
  AND t.tipo_movimiento IN ('Ingreso Manual','Salida Manual','Ajuste')
  AND t.fecha >= '2026-08-27T00:00:00Z'
ORDER BY t.id DESC;

-- PASO 5 — (Solo si el PASO 4 confirma +6h) restarles 6 horas.
-- BEGIN;
-- UPDATE public.transacciones_inventario t
-- SET fecha = t.fecha - INTERVAL '6 hours'
-- WHERE t.razon_social_id = 14
--   AND t.tipo_movimiento IN ('Ingreso Manual','Salida Manual','Ajuste')
--   AND t.fecha >= '2026-08-27T00:00:00Z';
-- COMMIT;
