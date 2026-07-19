-- =========================================================================
-- 018 - Funciones atomicas de stock y costo promedio
-- =========================================================================
--
-- PROBLEMA QUE RESUELVE
--   El codigo actualizaba `productos.stock_total` y `productos.costo_promedio`
--   con un patron LEE-MODIFICA-ESCRIBE en TypeScript:
--       SELECT stock_total ...            (lee)
--       nuevoStock = stock - cantidad     (calcula en JS)
--       UPDATE productos SET stock_total  (escribe)
--   Si dos ventas o dos recepciones del mismo producto ocurren casi a la vez,
--   ambas leen el mismo valor y la segunda escritura pisa a la primera: el
--   stock/costo queda mal (perdida de actualizaciones).
--
-- SOLUCION
--   Mover el calculo a un UNICO `UPDATE ... SET col = col +/- x` dentro de una
--   funcion. Postgres toma un row lock durante el UPDATE, asi la operacion es
--   atomica y las actualizaciones concurrentes se serializan correctamente.
--
-- SEGURIDAD (multi-tenant)
--   Las funciones son SECURITY INVOKER (por defecto): corren con los permisos
--   del usuario que llama, de modo que la RLS de `productos` (script 017)
--   sigue aplicando y solo pueden tocar productos de SU empresa. Si el
--   producto no pertenece al tenant, el UPDATE afecta 0 filas y la funcion
--   devuelve vacio (el codigo cae a su ruta de respaldo o reporta error).
--
-- IDEMPOTENTE: CREATE OR REPLACE. Se puede correr varias veces.
-- =========================================================================

-- -------------------------------------------------------------------------
-- ajustar_stock: suma p_delta (positivo o negativo) al stock del producto.
-- Uso: ventas (delta negativo), reversion de venta (delta positivo),
--      ajustes manuales que solo tocan cantidad.
-- Devuelve el nuevo stock_total (NULL si el producto no es visible/tenant).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ajustar_stock(
  p_producto_id bigint,
  p_delta       numeric
)
RETURNS numeric
LANGUAGE sql
AS $$
  UPDATE public.productos
  SET stock_total = COALESCE(stock_total, 0) + p_delta,
      updated_at  = now()
  WHERE id = p_producto_id
  RETURNING stock_total;
$$;

REVOKE ALL ON FUNCTION public.ajustar_stock(bigint, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.ajustar_stock(bigint, numeric) TO authenticated;

-- -------------------------------------------------------------------------
-- aplicar_entrada_compra: entrada de mercancia (recepcion de compra o ingreso
-- manual con costo). Recalcula el costo promedio ponderado y suma el stock en
-- un solo UPDATE atomico.
--
--   nuevo_costo = (stock*costo + cantidad*costo_entrada) / (stock + cantidad)
--
-- Las expresiones del SET usan los valores ANTERIORES de la fila (semantica
-- estandar de UPDATE), por eso el calculo es correcto sin variables temporales.
-- Devuelve el nuevo stock y costo (vacio si el producto no es del tenant).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.aplicar_entrada_compra(
  p_producto_id     bigint,
  p_cantidad        numeric,
  p_costo_unitario  numeric
)
RETURNS TABLE (stock_total numeric, costo_promedio numeric)
LANGUAGE sql
AS $$
  UPDATE public.productos p
  SET
    costo_promedio = CASE
      WHEN COALESCE(p.stock_total, 0) + p_cantidad > 0
        THEN ((COALESCE(p.stock_total, 0) * COALESCE(p.costo_promedio, 0))
              + (p_cantidad * p_costo_unitario))
             / (COALESCE(p.stock_total, 0) + p_cantidad)
      ELSE p_costo_unitario
    END,
    stock_total = COALESCE(p.stock_total, 0) + p_cantidad,
    updated_at  = now()
  WHERE p.id = p_producto_id
  RETURNING p.stock_total, p.costo_promedio;
$$;

REVOKE ALL ON FUNCTION public.aplicar_entrada_compra(bigint, numeric, numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.aplicar_entrada_compra(bigint, numeric, numeric) TO authenticated;

-- -------------------------------------------------------------------------
-- Verificacion (opcional):
--   SELECT public.ajustar_stock(<id>, 0);          -- devuelve el stock actual
--   SELECT * FROM public.aplicar_entrada_compra(<id>, 0, 0); -- no cambia nada
-- =========================================================================
