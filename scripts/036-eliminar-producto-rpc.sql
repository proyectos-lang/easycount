-- =========================================================================
-- 036 - RPC eliminar_producto_en_cascada (borrado seguro de productos)
-- =========================================================================
-- ADITIVO: solo crea una funcion. No hace ALTER/DROP sobre tablas.
--
-- Problema: al borrar un producto desde el cliente, el DELETE de
-- `transacciones_inventario` pasa por RLS. Si existen movimientos con
-- `razon_social_id` mal sellado (NULL o de otra empresa por datos viejos), el
-- cliente NO los ve ni los borra, pero el FK (que se evalua a nivel de BD,
-- ignorando RLS) SI los cuenta -> "update or delete on table productos violates
-- foreign key ... on table transacciones_inventario".
--
-- Solucion: esta funcion corre como SECURITY DEFINER (ignora RLS), acotada al
-- tenant actual (`app_current_tenant`), y hace la validacion + cascada del lado
-- servidor. Devuelve NULL si borro, o un mensaje si esta bloqueado / falla.
--
-- Reglas:
--   * Con ventas (ventas_detalle) o compras (compras_detalle) -> NO se borra.
--   * En otro caso: borra transacciones_inventario + bitacoras
--     (ajustes_inventario, ajustes_costo, pedidos_detalle, si existen) y el
--     producto. `catalogo_link_productos` cae solo (ON DELETE CASCADE).
--
-- Requiere el script 017 (funcion app_current_tenant).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.eliminar_producto_en_cascada(p_producto_id bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant       bigint := public.app_current_tenant();
  v_prod_tenant  bigint;
  v_ventas       bigint;
  v_compras      bigint;
BEGIN
  IF v_tenant IS NULL THEN
    RETURN 'Sesion sin empresa activa.';
  END IF;

  -- El producto debe existir y pertenecer al tenant que llama.
  SELECT razon_social_id INTO v_prod_tenant FROM productos WHERE id = p_producto_id;
  IF NOT FOUND THEN
    RETURN 'El producto no existe.';
  END IF;
  IF v_prod_tenant IS DISTINCT FROM v_tenant THEN
    RETURN 'El producto pertenece a otra empresa.';
  END IF;

  -- Proteccion: no borrar si tiene historial de ventas o compras.
  SELECT count(*) INTO v_ventas FROM ventas_detalle WHERE producto_id = p_producto_id;
  IF v_ventas > 0 THEN
    RETURN format(
      'No se puede eliminar: el producto tiene %s venta(s) registrada(s). No se borra para conservar el historial de ventas.',
      v_ventas
    );
  END IF;

  SELECT count(*) INTO v_compras FROM compras_detalle WHERE producto_id = p_producto_id;
  IF v_compras > 0 THEN
    RETURN format(
      'No se puede eliminar: el producto tiene %s compra(s)/recepcion(es) registrada(s).',
      v_compras
    );
  END IF;

  -- Cascada (SECURITY DEFINER -> ignora RLS y alcanza filas mal selladas que
  -- bloquearian el FK). Las bitacoras son opcionales (guarda de existencia).
  DELETE FROM transacciones_inventario WHERE producto_id = p_producto_id;

  IF to_regclass('public.ajustes_inventario') IS NOT NULL THEN
    DELETE FROM ajustes_inventario WHERE producto_id = p_producto_id;
  END IF;
  IF to_regclass('public.ajustes_costo') IS NOT NULL THEN
    DELETE FROM ajustes_costo WHERE producto_id = p_producto_id;
  END IF;
  IF to_regclass('public.pedidos_detalle') IS NOT NULL THEN
    DELETE FROM pedidos_detalle WHERE producto_id = p_producto_id;
  END IF;

  DELETE FROM productos WHERE id = p_producto_id;

  RETURN NULL; -- ok
END;
$$;

-- Solo usuarios autenticados pueden ejecutarla (la funcion ya se acota al tenant).
REVOKE ALL ON FUNCTION public.eliminar_producto_en_cascada(bigint) FROM public;
GRANT EXECUTE ON FUNCTION public.eliminar_producto_en_cascada(bigint) TO authenticated;
