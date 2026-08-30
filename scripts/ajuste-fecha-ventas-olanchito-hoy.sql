-- =========================================================================
-- ONE-OFF (no aditivo, NO commitear): corrige la fecha de las ventas de
-- prueba de la razon social 14 (Inversiones Mi Olanchito) que quedaron
-- corridas a 27/28-08-2026 por el bug de zona horaria (UTC vs UTC-6).
--
-- Mueve TODAS las ventas de la empresa 14 que NO esten en 2026-08-26 al
-- 2026-08-26, conservando la hora de cada una (resta exactamente los dias de
-- diferencia). La empresa arranco hoy: todas sus ventas son de hoy.
--
-- La fecha objetivo esta hardcodeada a 2026-08-26 (hoy en Honduras). Si lo
-- corres otro dia, cambia el literal en los 3 lugares.
--
-- Ejecutar en el SQL editor de Supabase. Corre primero el PASO 1 (revisar),
-- luego el PASO 2 (aplicar) y por ultimo el PASO 3 (verificar).
-- =========================================================================

-- PASO 1 — Revisar que se va a cambiar (no modifica nada) --------------------
SELECT
  id,
  numero_factura,
  fecha_venta,
  (fecha_venta AT TIME ZONE 'UTC')::date AS dia_actual
FROM public.ventas_encabezado
WHERE razon_social_id = 14
ORDER BY fecha_venta;

-- PASO 2 — Aplicar la correccion --------------------------------------------
-- Resta, por fila, los dias que su fecha (en UTC) supera al 2026-08-26, de
-- modo que todas caigan en 2026-08-26 conservando su hora.
BEGIN;

UPDATE public.ventas_encabezado
SET fecha_venta = fecha_venta
      - ( ((fecha_venta AT TIME ZONE 'UTC')::date - DATE '2026-08-26') * INTERVAL '1 day' )
WHERE razon_social_id = 14
  AND (fecha_venta AT TIME ZONE 'UTC')::date <> DATE '2026-08-26';

COMMIT;

-- PASO 3 — Verificar (todas deben mostrar 2026-08-26) -----------------------
SELECT
  id,
  numero_factura,
  fecha_venta,
  (fecha_venta AT TIME ZONE 'UTC')::date AS dia_corregido
FROM public.ventas_encabezado
WHERE razon_social_id = 14
ORDER BY fecha_venta;
