-- =========================================================================
-- 025 - Corregir signo de movimientos 'Salida Venta' (correccion de datos)
-- =========================================================================
--
-- OPCIONAL y de UNA SOLA VEZ. No crea ni altera tablas: solo corrige el
-- SIGNO de datos ya existentes en `transacciones_inventario`.
--
-- PROBLEMA: hasta la version anterior, cada venta guardaba su movimiento
-- 'Salida Venta' con `cantidad` POSITIVA. Pero el stock por localizacion y
-- por almacen se calcula SUMANDO `cantidad`, igual que 'Traslado Salida'
-- (que ya se guarda en NEGATIVO). Por eso una venta SUMABA al inventario en
-- vez de restarlo (se veia "+1" en el kardex y el saldo por almacen quedaba
-- inflado). `productos.stock_total` (el cache global) SIEMPRE estuvo bien,
-- porque se mantiene aparte con ajustarStock(-cantidad); el desajuste solo
-- afectaba a las sumas por ubicacion y al kardex.
--
-- El codigo ya se corrigio: las ventas NUEVAS guardan 'Salida Venta' con
-- cantidad NEGATIVA. Este script alinea las ventas ANTIGUAS (positivas) para
-- que el stock por almacen coincida con `stock_total`.
--
-- IDEMPOTENTE: solo voltea las filas que aun estan en positivo
-- (`cantidad > 0`). Si lo corres dos veces, la segunda no cambia nada.
--
-- ---------------------------------------------------------------------------
-- 1) VISTA PREVIA (opcional) - cuantas filas se van a corregir, por empresa.
--    Corre esto primero para ver el alcance antes de aplicar el UPDATE.
-- ---------------------------------------------------------------------------
-- SELECT razon_social_id,
--        COUNT(*)                 AS filas_a_corregir,
--        SUM(cantidad)            AS suma_positiva_actual
-- FROM public.transacciones_inventario
-- WHERE tipo_movimiento = 'Salida Venta'
--   AND cantidad > 0
-- GROUP BY razon_social_id
-- ORDER BY razon_social_id;

-- ---------------------------------------------------------------------------
-- 2) CORRECCION - voltea el signo de las salidas de venta positivas.
--    Envuelto en transaccion: si algo falla, no deja datos a medias.
-- ---------------------------------------------------------------------------
BEGIN;

UPDATE public.transacciones_inventario
SET cantidad = -cantidad
WHERE tipo_movimiento = 'Salida Venta'
  AND cantidad > 0;

COMMIT;

-- ---------------------------------------------------------------------------
-- 3) VERIFICACION (opcional) - no deben quedar 'Salida Venta' en positivo.
-- ---------------------------------------------------------------------------
-- SELECT COUNT(*) AS salidas_positivas_restantes
-- FROM public.transacciones_inventario
-- WHERE tipo_movimiento = 'Salida Venta'
--   AND cantidad > 0;   -- debe devolver 0
