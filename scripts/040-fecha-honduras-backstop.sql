-- =========================================================================
-- 040 - Backstop de hora de Honduras en los movimientos "de ahora"
-- =========================================================================
-- ADITIVO: crea 2 funciones + triggers BEFORE INSERT. No hace ALTER/DROP.
--
-- Problema que blinda: si un cliente con la app CACHEADA vieja (o un insert
-- que omite la fecha) inserta un movimiento, la fecha caia al DEFAULT `now()`
-- (UTC real) -> quedaba +6h y hasta se corria al dia siguiente en el kardex /
-- historial. La convencion del proyecto es guardar la hora de Honduras
-- codificada como UTC (= now() - 6h, Honduras es UTC-6 sin horario de verano).
--
-- Estos triggers, para movimientos que SIEMPRE son "de ahora" (transacciones
-- de inventario, movimientos de caja/banco, abonos, devoluciones), fuerzan la
-- fecha a la hora de Honduras cuando viene NULL o "en UTC real". Una fecha ya
-- correcta (HN, ~6h antes de now()) NO se toca. Estas entidades no se
-- fechan a futuro ni al pasado, asi que el umbral es 100% seguro.
--
-- NOTA: ventas_encabezado.fecha_venta y gastos.fecha_gasto NO se tocan aqui:
-- el usuario puede elegir su fecha (pasada/futura) y la app ya las maneja.
-- =========================================================================

-- Para columnas llamadas `fecha` (timestamptz).
CREATE OR REPLACE FUNCTION public.tg_forzar_fecha_hn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- HN = now() - 6h. Una fecha correcta esta ~6h antes de now(); una en UTC
  -- real (default/app vieja) esta a menos de ~3h. El umbral de 3h los separa.
  IF NEW.fecha IS NULL OR NEW.fecha > now() - INTERVAL '3 hours' THEN
    NEW.fecha := now() - INTERVAL '6 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- Para pagos_ventas (columna `fecha_pago`).
CREATE OR REPLACE FUNCTION public.tg_forzar_fecha_pago_hn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.fecha_pago IS NULL OR NEW.fecha_pago > now() - INTERVAL '3 hours' THEN
    NEW.fecha_pago := now() - INTERVAL '6 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- ---- Triggers BEFORE INSERT ----------------------------------------------

DROP TRIGGER IF EXISTS trg_fecha_hn_transacciones ON public.transacciones_inventario;
CREATE TRIGGER trg_fecha_hn_transacciones
  BEFORE INSERT ON public.transacciones_inventario
  FOR EACH ROW EXECUTE FUNCTION public.tg_forzar_fecha_hn();

DROP TRIGGER IF EXISTS trg_fecha_hn_cuenta_mov ON public.cuenta_movimientos;
CREATE TRIGGER trg_fecha_hn_cuenta_mov
  BEFORE INSERT ON public.cuenta_movimientos
  FOR EACH ROW EXECUTE FUNCTION public.tg_forzar_fecha_hn();

DROP TRIGGER IF EXISTS trg_fecha_hn_caja_mov ON public.caja_chica_movimientos;
CREATE TRIGGER trg_fecha_hn_caja_mov
  BEFORE INSERT ON public.caja_chica_movimientos
  FOR EACH ROW EXECUTE FUNCTION public.tg_forzar_fecha_hn();

DROP TRIGGER IF EXISTS trg_fecha_hn_pagos ON public.pagos_ventas;
CREATE TRIGGER trg_fecha_hn_pagos
  BEFORE INSERT ON public.pagos_ventas
  FOR EACH ROW EXECUTE FUNCTION public.tg_forzar_fecha_pago_hn();

-- Devoluciones: solo si la tabla existe (feature puede estar pendiente).
DO $$
BEGIN
  IF to_regclass('public.devoluciones_encabezado') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_fecha_hn_devolucion ON public.devoluciones_encabezado;
    CREATE TRIGGER trg_fecha_hn_devolucion
      BEFORE INSERT ON public.devoluciones_encabezado
      FOR EACH ROW EXECUTE FUNCTION public.tg_forzar_fecha_hn();
  END IF;
END $$;
