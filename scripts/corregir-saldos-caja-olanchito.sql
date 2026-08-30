-- =========================================================================
-- ONE-OFF (NO commitear): recalcula los saldos de CAJA CHICA y BANCOS de
-- Inversiones Mi Olanchito (razon_social_id = 14).
--
-- Causa: `saldo_resultante` es una foto que quedaba OBSOLETA al borrar/editar
-- una venta (se eliminaba su movimiento de caja pero el saldo de los
-- posteriores no se recalculaba -> saldo inflado por las ventas borradas).
-- El codigo ya se corrigio (el saldo se calcula como SUMA de `monto`). Este
-- script limpia los valores YA guardados para que la BD y las sesiones
-- cerradas queden consistentes.
--
-- Convencion de signos: Apertura=+saldo_inicial, Ingreso=+, Salida=-, Cierre=0.
-- Saldo correcto de cada movimiento = suma acumulada de `monto` por sesion (id).
--
-- Ejecutar en el SQL editor de Supabase. Corre PASO 1 (revisar), luego 2, 3 y 4.
-- =========================================================================

-- PASO 1 — Revisar el impacto por sesion (saldo guardado vs recalculado).
SELECT s.id AS sesion_id, s.fecha, s.estado,
       s.saldo_final_calculado AS calc_guardado,
       calc.saldo AS calc_correcto,
       (calc.saldo - COALESCE(s.saldo_final_calculado, 0)) AS diff_calc
FROM public.caja_chica_sesiones s
JOIN (
  SELECT sesion_id, SUM(monto) AS saldo
  FROM public.caja_chica_movimientos
  GROUP BY sesion_id
) calc ON calc.sesion_id = s.id
WHERE s.razon_social_id = 14
ORDER BY s.id DESC;

-- PASO 2 — Recalcular el saldo_resultante de CADA movimiento (suma acumulada).
BEGIN;

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

-- PASO 3 — Corregir el saldo calculado y la diferencia de las sesiones CERRADAS
-- (el saldo_final_real = conteo fisico NO se toca; solo se re-cuadra el calc).
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

COMMIT;

-- PASO 4 — Verificar: ultimo saldo por sesion (debe cuadrar con lo real).
SELECT m.sesion_id,
       MAX(m.saldo_resultante) FILTER (WHERE m.id = ult.max_id) AS saldo_final,
       s.estado, s.saldo_final_real, s.saldo_final_calculado, s.diferencia
FROM public.caja_chica_movimientos m
JOIN public.caja_chica_sesiones s ON s.id = m.sesion_id
JOIN (
  SELECT sesion_id, MAX(id) AS max_id
  FROM public.caja_chica_movimientos
  GROUP BY sesion_id
) ult ON ult.sesion_id = m.sesion_id
WHERE s.razon_social_id = 14
GROUP BY m.sesion_id, s.estado, s.saldo_final_real, s.saldo_final_calculado, s.diferencia
ORDER BY m.sesion_id DESC;

-- =========================================================================
-- BANCOS (cuenta_movimientos) de la empresa 14: mismo problema de "foto".
-- La CONSOLIDACION ya usa la suma cruda (no se afecta), pero la lista de
-- Movimientos y el cache cuentas_config.saldo pueden traer valores viejos.
-- =========================================================================

-- PASO 5 — Recalcular la cadena saldo_resultante de cada cuenta (Ingreso +,
-- Egreso -, acumulado por id) y reconciliar cuentas_config.saldo.
BEGIN;

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

-- PASO 6 — Verificar saldos de banco (cache vs suma real).
SELECT c.id AS cuenta_id, c.nombre, c.saldo AS saldo_cache,
       ROUND(SUM(CASE WHEN m.tipo = 'Ingreso' THEN m.monto ELSE -m.monto END), 2) AS saldo_real
FROM public.cuentas_config c
LEFT JOIN public.cuenta_movimientos m ON m.cuenta_id = c.id
WHERE c.razon_social_id = 14
GROUP BY c.id, c.nombre, c.saldo
ORDER BY c.id;
