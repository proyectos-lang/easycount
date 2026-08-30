-- =========================================================================
-- ONE-OFF (NO commitear): limpia los movimientos de tesoreria HUERFANOS de
-- gastos ya borrados de Inversiones Mi Olanchito (razon_social_id = 14).
--
-- Causa: antes, al borrar un gasto NO se borraban sus movimientos de caja/banco
-- (ref_tipo='gasto'). Quedaban "pagados" en Cierre Diario y descuadraban el
-- saldo. El codigo ya se corrigio (deleteGasto los borra); esto limpia los que
-- ya quedaron sueltos. Luego recalcula los saldos.
--
-- Ejecutar en el SQL editor de Supabase: PASO 1 (revisar) -> 2 -> 3 -> 4.
-- =========================================================================

-- PASO 1 — Ver los movimientos huerfanos (ref a un gasto que ya no existe).
SELECT 'caja' AS origen, m.id, m.tipo, m.monto, m.concepto, m.ref_id, m.fecha
FROM public.caja_chica_movimientos m
WHERE m.razon_social_id = 14
  AND m.ref_tipo = 'gasto'
  AND NOT EXISTS (SELECT 1 FROM public.gastos g WHERE g.id = m.ref_id)
UNION ALL
SELECT 'banco' AS origen, m.id, m.tipo, m.monto, m.concepto, m.ref_id, m.fecha
FROM public.cuenta_movimientos m
WHERE m.razon_social_id = 14
  AND m.ref_tipo = 'gasto'
  AND NOT EXISTS (SELECT 1 FROM public.gastos g WHERE g.id = m.ref_id)
ORDER BY ref_id;

-- PASO 2 — Borrar esos movimientos huerfanos + recalcular TODAS las cadenas de
-- saldo (caja por sesion, banco por cuenta) y reconciliar cuentas_config.saldo.
BEGIN;

DELETE FROM public.caja_chica_movimientos m
WHERE m.razon_social_id = 14
  AND m.ref_tipo = 'gasto'
  AND NOT EXISTS (SELECT 1 FROM public.gastos g WHERE g.id = m.ref_id);

DELETE FROM public.cuenta_movimientos m
WHERE m.razon_social_id = 14
  AND m.ref_tipo = 'gasto'
  AND NOT EXISTS (SELECT 1 FROM public.gastos g WHERE g.id = m.ref_id);

-- Recalcular saldo_resultante de la CAJA (suma acumulada de monto por sesion).
WITH recomputo AS (
  SELECT m.id,
         SUM(m.monto) OVER (
           PARTITION BY m.sesion_id ORDER BY m.id
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         ) AS nuevo_saldo
  FROM public.caja_chica_movimientos m
  WHERE m.sesion_id IN (
    SELECT id FROM public.caja_chica_sesiones WHERE razon_social_id = 14
  )
)
UPDATE public.caja_chica_movimientos m
SET saldo_resultante = ROUND(r.nuevo_saldo, 2)
FROM recomputo r
WHERE m.id = r.id
  AND m.saldo_resultante IS DISTINCT FROM ROUND(r.nuevo_saldo, 2);

-- Re-cuadrar sesiones de caja CERRADAS.
UPDATE public.caja_chica_sesiones s
SET saldo_final_calculado = calc.saldo,
    diferencia = ROUND(COALESCE(s.saldo_final_real, 0) - calc.saldo, 2)
FROM (
  SELECT sesion_id, SUM(monto) AS saldo
  FROM public.caja_chica_movimientos
  GROUP BY sesion_id
) calc
WHERE s.id = calc.sesion_id
  AND s.razon_social_id = 14
  AND s.estado = 'Cerrada'
  AND s.saldo_final_real IS NOT NULL;

-- Recalcular saldo_resultante de BANCO (Ingreso +, Egreso -, por cuenta).
WITH recomputo AS (
  SELECT cm.id,
         SUM(CASE WHEN cm.tipo = 'Ingreso' THEN cm.monto ELSE -cm.monto END)
           OVER (PARTITION BY cm.cuenta_id ORDER BY cm.id
                 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS nuevo_saldo
  FROM public.cuenta_movimientos cm
  WHERE cm.razon_social_id = 14
)
UPDATE public.cuenta_movimientos cm
SET saldo_resultante = ROUND(r.nuevo_saldo, 2)
FROM recomputo r
WHERE cm.id = r.id
  AND cm.saldo_resultante IS DISTINCT FROM ROUND(r.nuevo_saldo, 2);

-- Reconciliar el cache cuentas_config.saldo.
UPDATE public.cuentas_config c
SET saldo = calc.saldo
FROM (
  SELECT cuenta_id,
         ROUND(SUM(CASE WHEN tipo = 'Ingreso' THEN monto ELSE -monto END), 2) AS saldo
  FROM public.cuenta_movimientos
  WHERE razon_social_id = 14
  GROUP BY cuenta_id
) calc
WHERE c.id = calc.cuenta_id
  AND c.razon_social_id = 14
  AND c.saldo IS DISTINCT FROM calc.saldo;

COMMIT;

-- PASO 3 — Verificar: ya no deben quedar huerfanos.
SELECT COUNT(*) AS huerfanos_restantes
FROM (
  SELECT m.id FROM public.caja_chica_movimientos m
  WHERE m.razon_social_id = 14 AND m.ref_tipo = 'gasto'
    AND NOT EXISTS (SELECT 1 FROM public.gastos g WHERE g.id = m.ref_id)
  UNION ALL
  SELECT m.id FROM public.cuenta_movimientos m
  WHERE m.razon_social_id = 14 AND m.ref_tipo = 'gasto'
    AND NOT EXISTS (SELECT 1 FROM public.gastos g WHERE g.id = m.ref_id)
) x;

-- PASO 4 — Total pagado en efectivo por gastos HOY (debe cuadrar con "Gastos
-- del dia" del Cierre Diario). Ajusta la fecha si corres esto otro dia.
SELECT ROUND(SUM(ABS(m.monto)), 2) AS gastos_efectivo_hoy
FROM public.caja_chica_movimientos m
WHERE m.razon_social_id = 14
  AND m.ref_tipo = 'gasto'
  AND m.tipo = 'Salida'
  AND (m.fecha AT TIME ZONE 'UTC')::date = DATE '2026-08-27';
