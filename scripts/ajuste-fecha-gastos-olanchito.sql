-- =========================================================================
-- ONE-OFF (no aditivo, NO commitear): corrige gastos de Inversiones Mi
-- Olanchito (razon_social_id = 14) que se registraron AYER (26/08/2026) pero
-- quedaron con fecha 27/08/2026 por el bug de zona horaria (la fecha por
-- defecto se tomaba en UTC y de noche adelantaba un dia).
--
-- fecha_gasto es tipo DATE (no timestamptz): solo hay que mover el dia.
--
-- Ejecutar en el SQL editor de Supabase. Corre PASO 1 (revisar), luego PASO 2
-- (aplicar) y PASO 3 (verificar).
--
-- OJO: mueve TODOS los gastos de la empresa 14 con fecha 2026-08-27 al
-- 2026-08-26. Si registraste algun gasto que SI es de hoy (27), revisalo en el
-- PASO 1 y excluilo agregando su id en el "AND id <> ..." del PASO 2.
-- =========================================================================

-- PASO 1 — Revisar los gastos del 27 (no modifica nada) ---------------------
SELECT id, fecha_gasto, monto, metodo_pago, estado_pago, concepto_id, descripcion
FROM public.gastos
WHERE razon_social_id = 14
  AND fecha_gasto = DATE '2026-08-27'
ORDER BY id;

-- PASO 2 — Aplicar la correccion --------------------------------------------
BEGIN;

UPDATE public.gastos
SET fecha_gasto = DATE '2026-08-26'
WHERE razon_social_id = 14
  AND fecha_gasto = DATE '2026-08-27'
  -- AND id <> 123   -- <- descomenta y ajusta si algun gasto del 27 SI es de hoy
;

COMMIT;

-- PASO 3 — Verificar (no deben quedar gastos del 27, salvo los que excluiste) --
SELECT fecha_gasto, COUNT(*) AS cantidad, SUM(monto) AS total
FROM public.gastos
WHERE razon_social_id = 14
  AND fecha_gasto BETWEEN DATE '2026-08-26' AND DATE '2026-08-27'
GROUP BY fecha_gasto
ORDER BY fecha_gasto;
