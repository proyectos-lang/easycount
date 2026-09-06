-- =========================================================================
-- 043 - Grupo de tallas (agrupar productos hermanos por talla)
-- =========================================================================
-- ADITIVO: crea 1 tabla mapa nueva + su RLS. NO toca la tabla `productos`
-- (regla del proyecto: nunca ALTER/DROP sobre tablas existentes). El vinculo
-- producto -> grupo vive aqui, igual que `cliente_lista_precio` para clientes.
--
--   producto_grupo_tallas -> a que grupo de tallas pertenece cada producto
--
-- Un `grupo_id` agrupa a todos los productos que son la misma prenda en
-- distintas tallas (mismo nombre, cada uno con su propio stock/codigo/precio).
-- Un producto pertenece a lo sumo a un grupo (producto_id es PK).
-- Requiere el script 017 (funcion app_current_tenant).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.producto_grupo_tallas (
  producto_id     bigint  PRIMARY KEY,
  razon_social_id bigint  NOT NULL,
  -- Mismo grupo_id = misma prenda en distintas tallas. Lo genera la app al
  -- crear el grupo (comparten un valor unico dentro del tenant).
  grupo_id        bigint  NOT NULL,
  -- Nombre comun del grupo (para mostrarlo una sola vez en las listas).
  nombre_grupo    text,
  usuario         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Buscar rapido todos los productos de un grupo dentro del tenant.
CREATE INDEX IF NOT EXISTS idx_producto_grupo_tallas_grupo
  ON public.producto_grupo_tallas (razon_social_id, grupo_id);

ALTER TABLE public.producto_grupo_tallas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS producto_grupo_tallas_tenant ON public.producto_grupo_tallas;
CREATE POLICY producto_grupo_tallas_tenant ON public.producto_grupo_tallas
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());
