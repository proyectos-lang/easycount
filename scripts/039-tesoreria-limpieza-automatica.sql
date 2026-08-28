-- =========================================================================
-- 039 - Red de seguridad: limpieza automatica de tesoreria al borrar el "padre"
-- =========================================================================
-- ADITIVO: crea 1 funcion + triggers NUEVOS. No hace ALTER/DROP de tablas.
--
-- Problema que blinda: cuando se borra una venta/gasto/devolucion, sus
-- movimientos de caja chica / cuenta bancaria (ref_tipo/ref_id) deben irse
-- tambien. El codigo de la app ya lo hace, pero este trigger lo GARANTIZA a
-- nivel de BD pase lo que pase (app, SQL manual, codigo futuro): jamas quedan
-- movimientos "huerfanos" que inflen Cierre Diario o descuadren el saldo.
--
-- Ademas recalcula la cadena saldo_resultante de las cuentas afectadas y su
-- cache cuentas_config.saldo. La caja chica NO necesita recalculo: su saldo se
-- computa como SUMA de montos en la app (inmune a borrados).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.tg_limpiar_tesoreria_ref()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref_tipo text := TG_ARGV[0];
  v_cuentas  bigint[];
BEGIN
  -- Cuentas bancarias afectadas ANTES de borrar (para recalcular su saldo).
  SELECT array_agg(DISTINCT cuenta_id::bigint) INTO v_cuentas
  FROM public.cuenta_movimientos
  WHERE ref_tipo = v_ref_tipo AND ref_id = OLD.id;

  -- Borra la tesoreria del padre eliminado (efectivo + banco).
  DELETE FROM public.caja_chica_movimientos
  WHERE ref_tipo = v_ref_tipo AND ref_id = OLD.id;

  DELETE FROM public.cuenta_movimientos
  WHERE ref_tipo = v_ref_tipo AND ref_id = OLD.id;

  -- Recalcula la cadena de saldos + cache de las cuentas bancarias afectadas.
  IF v_cuentas IS NOT NULL THEN
    WITH r AS (
      SELECT cm.id,
             SUM(CASE WHEN cm.tipo = 'Ingreso' THEN cm.monto ELSE -cm.monto END)
               OVER (PARTITION BY cm.cuenta_id ORDER BY cm.id
                     ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS s
      FROM public.cuenta_movimientos cm
      WHERE cm.cuenta_id = ANY(v_cuentas)
    )
    UPDATE public.cuenta_movimientos cm
    SET saldo_resultante = ROUND(r.s, 2)
    FROM r
    WHERE cm.id = r.id
      AND cm.saldo_resultante IS DISTINCT FROM ROUND(r.s, 2);

    UPDATE public.cuentas_config c
    SET saldo = COALESCE((
      SELECT ROUND(SUM(CASE WHEN m.tipo = 'Ingreso' THEN m.monto ELSE -m.monto END), 2)
      FROM public.cuenta_movimientos m WHERE m.cuenta_id = c.id
    ), 0)
    WHERE c.id = ANY(v_cuentas);
  END IF;

  RETURN OLD;
END;
$$;

-- Un trigger por cada entidad padre que genera tesoreria. El 2do argumento es
-- el ref_tipo con el que se guardaron sus movimientos.
DROP TRIGGER IF EXISTS trg_tesoreria_gasto ON public.gastos;
CREATE TRIGGER trg_tesoreria_gasto
  AFTER DELETE ON public.gastos
  FOR EACH ROW EXECUTE FUNCTION public.tg_limpiar_tesoreria_ref('gasto');

DROP TRIGGER IF EXISTS trg_tesoreria_venta ON public.ventas_encabezado;
CREATE TRIGGER trg_tesoreria_venta
  AFTER DELETE ON public.ventas_encabezado
  FOR EACH ROW EXECUTE FUNCTION public.tg_limpiar_tesoreria_ref('venta');

-- Devoluciones: solo si la tabla existe (la feature puede estar pendiente).
DO $$
BEGIN
  IF to_regclass('public.devoluciones_encabezado') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_tesoreria_devolucion ON public.devoluciones_encabezado;
    CREATE TRIGGER trg_tesoreria_devolucion
      AFTER DELETE ON public.devoluciones_encabezado
      FOR EACH ROW EXECUTE FUNCTION public.tg_limpiar_tesoreria_ref('devolucion');
  END IF;
END $$;
