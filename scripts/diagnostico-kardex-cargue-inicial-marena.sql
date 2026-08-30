-- =========================================================================
-- DIAGNOSTICO (solo lectura): revisa el "cargue inicial" (primera transaccion)
-- de un producto de Marena (razon 13) y su fecha, para entender por que cae
-- en "Saldo inicial (antes del rango)" del kardex.
-- Cambia el CODIGO por el del producto que estas viendo.
-- =========================================================================

-- A) Todas las transacciones del producto, en orden, con su fecha (HN).
SELECT t.id, t.tipo_movimiento, t.cantidad,
       t.fecha,
       to_char(t.fecha AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS fecha_hn,
       t.usuario
FROM public.transacciones_inventario t
JOIN public.productos p ON p.id = t.producto_id
WHERE t.razon_social_id = 13
  AND p.codigo_barras = '397AROR001'   -- <-- cambia por tu codigo
ORDER BY t.id;

-- B) ¿Hay transacciones con fecha NULL en Marena? (esas siempre caen "antes").
SELECT COUNT(*) AS transacciones_sin_fecha
FROM public.transacciones_inventario
WHERE razon_social_id = 13 AND fecha IS NULL;

-- C) Rango de fechas de TODAS las transacciones de Marena (para ubicar el cargue).
SELECT MIN(t.fecha) AS primera, MAX(t.fecha) AS ultima,
       to_char(MIN(t.fecha) AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS primera_hn,
       to_char(MAX(t.fecha) AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') AS ultima_hn
FROM public.transacciones_inventario t
WHERE t.razon_social_id = 13;
