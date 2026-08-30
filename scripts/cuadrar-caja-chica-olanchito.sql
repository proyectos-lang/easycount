-- =========================================================================
-- ONE-OFF (NO commitear): cuadra SOLO la CAJA CHICA de Inversiones Mi
-- Olanchito (razon_social_id = 14).
--
-- Problema: `saldo_resultante` es una foto que quedaba OBSOLETA al borrar/
-- editar una venta (se borraba su movimiento pero el saldo de los posteriores
-- no se recalculaba -> saldo inflado por las ventas borradas). El codigo ya
-- calcula el saldo como SUMA de `monto`; esto limpia los valores YA guardados.
--
-- Convencion de signos: Apertura=+saldo_inicial, Ingreso=+, Salida=-, Cierre=0.
-- Saldo correcto de cada movimiento = suma acumulada de `monto` por sesion (id).
--
-- Ejecutar en el SQL editor de Supabase: PASO 1 (revisar) -> 2 y 3 -> 4.
-- =========================================================================

-- PASO 1 — Impacto por sesion (saldo guardado vs saldo real).
SELECT s.id AS sesion_id, s.fecha, s.estado,
       s.saldo_inicial,
       s.saldo_final_calculado           AS calc_guardado,
       calc.saldo                        AS saldo_real,
       (calc.saldo - COALESCE(s.saldo_final_calculado, 0)) AS diferencia_vs_guardado
FROM public.caja_chica_sesiones s
JOIN (
  SELECT sesion_id, SUM(monto) AS saldo
  FROM public.caja_chica_movimientos
  GROUP BY sesion_id
) calc ON calc.sesion_id = s.id
WHERE s.razon_social_id = 14
ORDER BY s.id DESC;

-- PASO 2 — Recalcular el saldo_resultante de CADA movimiento (suma acumulada
-- de monto por sesion, en orden de id) + re-cuadrar las sesiones CERRADAS.
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

-- Sesiones cerradas: re-cuadra el calculado y la diferencia contra el conteo
-- fisico (saldo_final_real NO se toca).
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

-- PASO 3 — Verificar: saldo final por sesion (debe ser la suma real).
SELECT s.id AS sesion_id, s.fecha, s.estado, s.saldo_inicial,
       calc.saldo AS saldo_actual_real,
       s.saldo_final_real, s.saldo_final_calculado, s.diferencia
FROM public.caja_chica_sesiones s
JOIN (
  SELECT sesion_id, SUM(monto) AS saldo
  FROM public.caja_chica_movimientos
  GROUP BY sesion_id
) calc ON calc.sesion_id = s.id
WHERE s.razon_social_id = 14
ORDER BY s.id DESC;
