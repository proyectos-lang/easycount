-- =========================================================================
-- DIAGNOSTICO 2 (solo lectura): caja chica de Inversiones Mi Olanchito (14).
-- La venta #328 esta fechada 2026-08-27 y NO hay sesion con fecha 2026-08-28,
-- asi que la sesion que ves es del 27 (posiblemente aun abierta). Buscamos la
-- sesion POR la venta #328, sin depender de la fecha, y listamos TODO.
-- No modifica nada.
-- =========================================================================

-- A) El/los movimiento(s) de caja de la venta #328 + datos de su sesion.
SELECT m.id, m.sesion_id, m.tipo, m.monto, m.saldo_resultante, m.concepto,
       m.ref_tipo, m.ref_id, m.created_at,
       s.fecha AS sesion_fecha, s.estado AS sesion_estado
FROM public.caja_chica_movimientos m
JOIN public.caja_chica_sesiones s ON s.id = m.sesion_id
WHERE s.razon_social_id = 14
  AND m.ref_tipo = 'venta' AND m.ref_id = 328;

-- B) TODOS los movimientos de la(s) sesion(es) que contienen la venta #328,
--    en orden. Aqui se ve exactamente de donde sale el +650.
SELECT m.id, m.sesion_id, m.tipo, m.monto, m.saldo_resultante, m.concepto,
       m.ref_tipo, m.ref_id, m.created_at
FROM public.caja_chica_movimientos m
WHERE m.sesion_id IN (
  SELECT DISTINCT m2.sesion_id
  FROM public.caja_chica_movimientos m2
  WHERE m2.ref_tipo = 'venta' AND m2.ref_id = 328
)
ORDER BY m.id;

-- C) Ultimas sesiones de caja de la empresa 14 (para ver cual esta abierta y
--    con que fecha quedo guardada cada una).
SELECT *
FROM public.caja_chica_sesiones
WHERE razon_social_id = 14
ORDER BY id DESC
LIMIT 10;

-- D) Duplicados de cualquier venta en esa sesion (no solo la 328).
SELECT m.ref_id, COUNT(*) AS veces, SUM(m.monto) AS suma
FROM public.caja_chica_movimientos m
WHERE m.sesion_id IN (
  SELECT DISTINCT m2.sesion_id
  FROM public.caja_chica_movimientos m2
  WHERE m2.ref_tipo = 'venta' AND m2.ref_id = 328
)
  AND m.ref_tipo = 'venta'
GROUP BY m.ref_id
HAVING COUNT(*) > 1;
