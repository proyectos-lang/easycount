-- =========================================================================
-- 066 - Índices de rendimiento (columnas de JOIN/filtro más calientes)
-- =========================================================================
-- Optimización preventiva: agrega índices en las columnas que más se filtran y
-- ordenan en reportes/joins y que HOY no los tenían (provocaban seq-scan). No
-- cambia datos, ni comportamiento, ni UI: solo acelera las consultas. El efecto
-- es inmediato para TODAS las empresas; los clientes no deben actualizar nada.
--
-- `CREATE INDEX IF NOT EXISTS` es idempotente: si un índice ya existe (por otro
-- script o creado a mano), lo SALTA sin fallar. Con los volúmenes actuales
-- (miles de filas) la creación es casi instantánea y el lock es de milisegundos.
-- `IF to_regclass(...)` salta las tablas que no existan en tu base.
--
-- ADITIVO: solo CREATE INDEX. No toca datos, tablas ni columnas.
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

DO $$
BEGIN
  -- ── ventas_detalle: se filtra con .in('venta_id',...) en casi todo reporte
  --    (dashboard, cierre, estado de resultados, detalle de venta, edición/borrado).
  IF to_regclass('public.ventas_detalle') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_ventas_detalle_venta       ON public.ventas_detalle (venta_id);
    CREATE INDEX IF NOT EXISTS idx_ventas_detalle_producto    ON public.ventas_detalle (producto_id);
  END IF;

  -- ── ventas_encabezado: filtros de rango por fecha en TODOS los reportes de
  --    período, y por cliente (cuentas por cobrar, límite de crédito). Índice
  --    compuesto (tenant, fecha) para el patrón dominante razon+rango.
  IF to_regclass('public.ventas_encabezado') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_ventas_enc_razon_fecha     ON public.ventas_encabezado (razon_social_id, fecha_venta);
    CREATE INDEX IF NOT EXISTS idx_ventas_enc_cliente         ON public.ventas_encabezado (cliente_id);
  END IF;

  -- ── transacciones_inventario: kardex por producto (.eq('producto_id')),
  --    y referencia polimórfica (.in('referencia_id') + tipo) al borrar/editar
  --    ventas y en el dashboard. Índice compuesto para el segundo caso.
  IF to_regclass('public.transacciones_inventario') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_trans_inv_producto         ON public.transacciones_inventario (producto_id);
    CREATE INDEX IF NOT EXISTS idx_trans_inv_ref_tipo         ON public.transacciones_inventario (referencia_id, tipo_movimiento);
  END IF;

  -- ── pagos_ventas: .in('venta_id') en cuentas por cobrar y métodos de pago.
  --    (ventas_pagos_detalle ya tiene su índice; esta es otra tabla.)
  IF to_regclass('public.pagos_ventas') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_pagos_ventas_venta         ON public.pagos_ventas (venta_id);
  END IF;

  -- ── ventas_detalle_descripcion: .in('detalle_id') al resolver el nombre de
  --    las líneas de Venta Rápida (script 045 la creó sin índice).
  IF to_regclass('public.ventas_detalle_descripcion') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_vdd_detalle                ON public.ventas_detalle_descripcion (detalle_id);
  END IF;

  -- ── compras_detalle: .in/eq('compra_id') al recibir y ver el historial.
  IF to_regclass('public.compras_detalle') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_compras_detalle_compra     ON public.compras_detalle (compra_id);
  END IF;

  RAISE NOTICE 'Índices de rendimiento (066) aplicados/verificados.';
END $$;
