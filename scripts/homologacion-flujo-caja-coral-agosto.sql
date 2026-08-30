-- ============================================================================
-- Homologacion FLUJO DE CAJA - CORAL SWIMWEAR (razon_social_id = 10)
-- Refleja las ventas de AGOSTO 2026 (las cargadas con usuario 'carga-agosto')
-- como INGRESOS de EFECTIVO en caja chica, para que aparezcan en el Flujo de
-- Caja del dashboard de Finanzas.
--
--  * TODAS las ventas se tratan como EFECTIVO (sin comision) -> monto = total_venta.
--  * Se crea UNA sesion de caja CERRADA por dia con ventas; un 'Ingreso_Venta'
--    por cada venta, fechado en su dia (para que caiga en agosto).
--  * Las ventas de agosto se marcan Pagado/Contado (consistencia: el dinero se
--    cobro en efectivo; evita que sigan como cuentas por cobrar).
--  * NO toca inventario. NO toca las cuentas bancarias (BAC/Banpais/POS/Link).
--  * Deriva los montos de ventas_encabezado (no hay valores hardcodeados), asi
--    que el total del flujo cuadra exacto con las ventas cargadas.
--  * Depende de haber corrido antes: scripts/carga-coral-ventas-agosto.sql.
--  * Guarda anti doble-carga por usuario_apertura = 'homologacion-agosto'.
-- ============================================================================

DO $$
DECLARE
  v_sesion  int;
  v_run     numeric;
  v_total   numeric := 0;
  v_nmov    int := 0;
  v_nses    int := 0;
  v_count   int;
  d         record;
  r         record;
BEGIN
  -- 0) Requiere las ventas de agosto ya cargadas.
  SELECT COUNT(*) INTO v_count FROM ventas_encabezado
    WHERE razon_social_id = 10 AND usuario = 'carga-agosto';
  IF v_count = 0 THEN
    RAISE EXCEPTION 'No hay ventas carga-agosto en rs 10. Corre scripts/carga-coral-ventas-agosto.sql primero.';
  END IF;

  -- Guarda anti doble-carga.
  SELECT COUNT(*) INTO v_count FROM caja_chica_sesiones
    WHERE razon_social_id = 10 AND usuario_apertura = 'homologacion-agosto';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Abortado: ya existe la homologacion de caja de agosto (% sesiones).', v_count;
  END IF;

  -- 1) Todas las ventas de agosto = cobradas en efectivo (Pagado).
  UPDATE ventas_encabezado
    SET estado_pago = 'Pagado', valorpago = total_venta, tipo_pago = 'Contado'
    WHERE razon_social_id = 10 AND usuario = 'carga-agosto' AND total_venta > 0;

  -- 2) Una sesion de caja CERRADA por dia con ventas.
  FOR d IN
    SELECT fecha_venta::date AS dia, SUM(total_venta) AS total_dia
      FROM ventas_encabezado
      WHERE razon_social_id = 10 AND usuario = 'carga-agosto' AND total_venta > 0
      GROUP BY fecha_venta::date
      ORDER BY dia
  LOOP
    -- OJO: la tabla real de caja_chica_sesiones NO tiene fecha_apertura ni
    -- fecha_cierre; tiene `fecha` (date, dia operativo) + `created_at`.
    INSERT INTO caja_chica_sesiones
      (razon_social_id, fecha, created_at, saldo_inicial,
       saldo_final_real, saldo_final_calculado, diferencia, estado,
       usuario_apertura, usuario_cierre)
      VALUES (10, d.dia, d.dia + time '08:00', 0,
              d.total_dia, d.total_dia, 0, 'Cerrada',
              'homologacion-agosto', 'homologacion-agosto')
      RETURNING id INTO v_sesion;
    v_nses := v_nses + 1;
    v_run := 0;

    -- 3) Un Ingreso_Venta por cada venta de ese dia (saldo corriente por sesion).
    FOR r IN
      SELECT id, numero_factura, total_venta, fecha_venta
        FROM ventas_encabezado
        WHERE razon_social_id = 10 AND usuario = 'carga-agosto'
          AND total_venta > 0 AND fecha_venta::date = d.dia
        ORDER BY id
    LOOP
      v_run   := v_run + r.total_venta;
      v_total := v_total + r.total_venta;
      v_nmov  := v_nmov + 1;
      INSERT INTO caja_chica_movimientos
        (razon_social_id, sesion_id, fecha, tipo, monto, concepto,
         ref_tipo, ref_id, saldo_resultante, usuario, created_at)
        VALUES (10, v_sesion, r.fecha_venta, 'Ingreso_Venta', r.total_venta,
                'Venta ' || COALESCE(r.numero_factura, '') || ' (homologacion agosto)',
                'venta', r.id, v_run, 'homologacion-agosto', r.fecha_venta);
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Flujo caja agosto Coral OK: % sesiones, % ingresos, L % en efectivo.',
    v_nses, v_nmov, v_total;
END
$$;
