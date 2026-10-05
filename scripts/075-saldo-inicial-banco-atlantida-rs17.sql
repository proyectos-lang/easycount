-- =========================================================================
-- 075 - ONE-OFF: restaurar el saldo inicial de BANCO ATLANTIDA (rs 17)
-- =========================================================================
-- Caso: la cuenta id 27 "BANCO ATLANTIDA" de la razón social 17 ("El Super")
-- se creó con saldo inicial L 15,823.09, pero la limpieza transaccional del
-- script 073 borró TODOS los cuenta_movimientos de la rs 17 (incluido el
-- movimiento 'Saldo inicial', ref_tipo 'apertura') y dejó los saldos en 0.
-- Después se registró un egreso de L 7,800 (pago del gasto #190) y la cuenta
-- quedó en -7,800.
--
-- Este script:
--   1) Inserta el Ingreso 'Saldo inicial' (ref_tipo 'apertura') por 15,823.09
--      con fecha 2026-09-30 00:00 (HN-as-UTC): saldo al cierre de septiembre.
--      NO se fecha en octubre porque el usuario ya escribió 15,823.09 como
--      saldo inicial de OCTUBRE en Consolidación Bancaria (override en
--      consolidacion_saldos_iniciales): un Ingreso en octubre se sumaría
--      encima y la consolidación mostraría 23,846.18. Con fecha de septiembre,
--      el saldo inicial calculado de octubre (15,823.09) coincide con el
--      override y todas las pantallas dan 8,023.09.
--   2) Recalcula la cadena saldo_resultante de la cuenta en orden (fecha, id).
--   3) Recalcula cuentas_config.saldo = SUMA de movimientos (convención de
--      tesorería). Resultado esperado: 15,823.09 − 7,800 = 8,023.09.
--
-- Candados: aborta si la cuenta 27 no es BANCO ATLANTIDA de la rs 17, y NO
-- inserta otra apertura si ya existe una (idempotente). BEGIN/COMMIT.
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.cuentas_config
    WHERE id = 27 AND razon_social_id = 17 AND upper(nombre) LIKE '%ATLANTIDA%' AND tipo = 'Banco'
      AND upper(nombre) NOT LIKE '%POS%'
  ) THEN
    RAISE EXCEPTION 'La cuenta 27 no es BANCO ATLANTIDA de la razón social 17: se aborta.';
  END IF;
END $$;

-- 1) Saldo inicial (solo si la cuenta no tiene ya una apertura).
INSERT INTO public.cuenta_movimientos
  (razon_social_id, cuenta_id, fecha, tipo, monto, concepto, ref_tipo, ref_id, usuario)
SELECT 17, 27, '2026-09-30T00:00:00+00', 'Ingreso', 15823.09, 'Saldo inicial', 'apertura', NULL,
       'Soporte (script 075)'
WHERE NOT EXISTS (
  SELECT 1 FROM public.cuenta_movimientos
  WHERE cuenta_id = 27 AND ref_tipo = 'apertura'
);

-- 2) Cadena de saldo_resultante en orden cronológico.
WITH r AS (
  SELECT cm.id,
         SUM(CASE WHEN cm.tipo = 'Ingreso' THEN cm.monto ELSE -cm.monto END)
           OVER (ORDER BY cm.fecha, cm.id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS s
  FROM public.cuenta_movimientos cm
  WHERE cm.cuenta_id = 27
)
UPDATE public.cuenta_movimientos cm
SET saldo_resultante = ROUND(r.s, 2)
FROM r
WHERE cm.id = r.id
  AND cm.saldo_resultante IS DISTINCT FROM ROUND(r.s, 2);

-- 3) Saldo cacheado = suma de movimientos.
UPDATE public.cuentas_config c
SET saldo = COALESCE((
  SELECT ROUND(SUM(CASE WHEN m.tipo = 'Ingreso' THEN m.monto ELSE -m.monto END), 2)
  FROM public.cuenta_movimientos m WHERE m.cuenta_id = c.id
), 0)
WHERE c.id = 27;

COMMIT;

-- Verificación (debe dar saldo 8023.09 y 2 movimientos: apertura +15823.09
-- con saldo 15823.09, y el egreso de 7800 con saldo 8023.09):
-- SELECT id, nombre, saldo FROM public.cuentas_config WHERE id = 27;
-- SELECT id, fecha, tipo, monto, concepto, saldo_resultante
--   FROM public.cuenta_movimientos WHERE cuenta_id = 27 ORDER BY fecha, id;
