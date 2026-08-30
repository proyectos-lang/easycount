-- =========================================================================
-- DIAGNOSTICO (solo lectura): fecha de transacciones de inventario de
-- Inversiones Mi Olanchito (razon 14). transacciones_inventario NO tiene
-- created_at; solo `fecha`.
-- =========================================================================

-- A) Las 4 que quedaron en el 28 + las ultimas del 27 (por id). Mira la hora
--    de `fecha` (ya interpretada como Honduras) y el tipo/referencia.
SELECT
  t.id,
  t.tipo_movimiento,
  t.referencia_id,
  t.fecha,
  to_char(t.fecha AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS fecha_hn
FROM public.transacciones_inventario t
WHERE t.razon_social_id = 14
  AND t.fecha >= '2026-08-27T15:00:00Z'   -- desde media tarde HN del 27 en adelante
ORDER BY t.id DESC
LIMIT 40;

-- B) Cruce con la venta de esas transacciones del 28 (para ver a que hora se
--    hizo realmente la venta, por su fecha_venta que YA guardamos en HN).
SELECT t.id AS trans_id, t.tipo_movimiento, t.referencia_id,
       to_char(t.fecha AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS trans_fecha_hn,
       v.numero_factura,
       to_char(v.fecha_venta AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS venta_fecha_hn
FROM public.transacciones_inventario t
LEFT JOIN public.ventas_encabezado v ON v.id = t.referencia_id AND t.tipo_movimiento = 'Salida Venta'
WHERE t.razon_social_id = 14
  AND (t.fecha AT TIME ZONE 'UTC')::date = DATE '2026-08-28'
ORDER BY t.id;
