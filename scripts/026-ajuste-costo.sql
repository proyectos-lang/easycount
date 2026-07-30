-- =========================================================================
-- 026 - Ajuste de Costo (cambio manual de costo unitario + recalculo)
-- =========================================================================
--
-- ESTRICTAMENTE ADITIVO: solo CREATE TABLE de 1 tabla nueva, CREATE POLICY
-- sobre ella, CREATE OR REPLACE de 2 funciones (patron del script 018) e
-- INSERT de 1 fila en `modulos`. NO hace ALTER ni DROP sobre ninguna tabla
-- existente ni renombra columnas.
--
-- El modulo permite fijar manualmente el costo unitario (`costo_promedio`) de
-- UN producto y, opcionalmente, recalcular el costo CONGELADO de sus ventas
-- pasadas en un intervalo de fechas (costo PLANO: todas quedan con el nuevo
-- costo). Al cambiar el costo, la valoracion de inventario se actualiza sola
-- (lee `productos.costo_promedio`). El recalculo reescribe el CMV/margen
-- historico (`ventas_detalle`, `transacciones_inventario`,
-- `devoluciones_detalle`). Esta tabla guarda la bitacora (antes/despues) para
-- auditoria; es una bitacora PLANA (una fila por operacion).
--
-- Las funciones `fijar_costo_promedio` y `recalcular_costo_ventas` son
-- SECURITY INVOKER (default), asi que respetan la RLS del script 017: solo
-- tocan filas del tenant logueado. El recalculo corre los 3 UPDATE en una
-- sola transaccion de servidor (todo-o-nada) porque supabase-js no permite
-- transacciones multi-statement desde el cliente.
--
-- Requiere el script 017 (funcion app_current_tenant) ya aplicado.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Bitacora de ajustes de costo (tabla nueva)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ajustes_costo (
  id                  SERIAL PRIMARY KEY,
  razon_social_id     INTEGER NOT NULL REFERENCES public.razon_social(id) ON DELETE CASCADE,
  producto_id         INTEGER NOT NULL REFERENCES public.productos(id),
  costo_anterior      NUMERIC(14,4) NOT NULL DEFAULT 0,
  costo_nuevo         NUMERIC(14,4) NOT NULL DEFAULT 0,
  stock_al_momento    NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_inv_anterior  NUMERIC(16,2) NOT NULL DEFAULT 0,
  valor_inv_nuevo     NUMERIC(16,2) NOT NULL DEFAULT 0,
  recalculo_ventas    BOOLEAN NOT NULL DEFAULT false,
  rango_desde         DATE,
  rango_hasta         DATE,
  ventas_afectadas    INTEGER NOT NULL DEFAULT 0,
  cmv_anterior        NUMERIC(16,2) NOT NULL DEFAULT 0,
  cmv_nuevo           NUMERIC(16,2) NOT NULL DEFAULT 0,
  motivo              TEXT,
  usuario             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ajustes_costo_razon_social
  ON public.ajustes_costo(razon_social_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ajustes_costo_producto
  ON public.ajustes_costo(producto_id);

-- RLS de aislamiento por tenant (patron del script 017).
ALTER TABLE public.ajustes_costo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ajustes_costo ON public.ajustes_costo;
CREATE POLICY tenant_isolation_ajustes_costo ON public.ajustes_costo
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- -------------------------------------------------------------------------
-- 2. RPC: fijar el costo promedio (SET absoluto, no promedio ponderado)
--    Analoga a ajustar_stock del 018 pero para el costo. SECURITY INVOKER:
--    la RLS de `productos` (017) impide tocar productos de otro tenant.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fijar_costo_promedio(
  p_producto_id bigint,
  p_costo       numeric
)
RETURNS numeric
LANGUAGE sql
AS $$
  UPDATE public.productos
  SET costo_promedio = p_costo,
      updated_at     = now()
  WHERE id = p_producto_id
  RETURNING costo_promedio;
$$;

REVOKE ALL ON FUNCTION public.fijar_costo_promedio(bigint, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.fijar_costo_promedio(bigint, numeric) TO authenticated;

-- -------------------------------------------------------------------------
-- 3. RPC: recalculo retroactivo del costo congelado de ventas (transaccional)
--    Resuelve los venta_id del rango desde ventas_encabezado.fecha_venta y
--    aplica el nuevo costo PLANO a las ventas, su kardex y sus devoluciones,
--    todo del producto indicado. Los 3 UPDATE corren en la misma transaccion
--    (una funcion plpgsql es atomica: si algo falla, revierte todo).
--    SECURITY INVOKER: cada tabla filtra por su RLS (017); ademas el alcance
--    queda acotado al tenant porque los ids salen de ventas/devoluciones ya
--    filtradas por RLS. Devuelve cuantas lineas de venta se afectaron.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalcular_costo_ventas(
  p_producto_id bigint,
  p_costo       numeric,
  p_desde       timestamptz,
  p_hasta       timestamptz
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_ids bigint[];
  v_n   integer := 0;
BEGIN
  -- Ventas del rango (RLS limita al tenant logueado).
  SELECT array_agg(id) INTO v_ids
  FROM public.ventas_encabezado
  WHERE fecha_venta >= p_desde AND fecha_venta <= p_hasta;

  IF v_ids IS NULL THEN
    RETURN 0;
  END IF;

  -- 1) Costo congelado + utilidad de las lineas de venta del producto.
  UPDATE public.ventas_detalle
  SET costo_promedio_momento = p_costo,
      utilidad_linea = (COALESCE(precio_unitario, 0) - p_costo) * COALESCE(cantidad, 0)
  WHERE producto_id = p_producto_id
    AND venta_id = ANY(v_ids);
  GET DIAGNOSTICS v_n = ROW_COUNT;

  -- 2) Costo en el kardex (fila 'Salida Venta' de esas ventas).
  UPDATE public.transacciones_inventario
  SET costo_o_precio_unitario = p_costo
  WHERE producto_id = p_producto_id
    AND tipo_movimiento = 'Salida Venta'
    AND referencia_id = ANY(v_ids);

  -- 3) Costo congelado de las devoluciones del rango (neteo de CMV).
  UPDATE public.devoluciones_detalle dd
  SET costo_promedio_momento = p_costo
  WHERE dd.producto_id = p_producto_id
    AND dd.devolucion_id IN (
      SELECT de.id FROM public.devoluciones_encabezado de
      WHERE de.fecha >= p_desde AND de.fecha <= p_hasta
    );

  RETURN v_n;
END;
$$;

REVOKE ALL ON FUNCTION public.recalcular_costo_ventas(bigint, numeric, timestamptz, timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.recalcular_costo_ventas(bigint, numeric, timestamptz, timestamptz) TO authenticated;

-- -------------------------------------------------------------------------
-- 4. Modulo nuevo (dato). Debe calzar EXACTO con lib/constants/modulos.ts.
-- -------------------------------------------------------------------------
INSERT INTO public.modulos (nombre)
VALUES ('Ajuste de Costo')
ON CONFLICT (nombre) DO NOTHING;
