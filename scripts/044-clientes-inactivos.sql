-- =========================================================================
-- 044 - Clientes inactivos (soft-delete de clientes con transacciones)
-- =========================================================================
-- ADITIVO: crea 1 tabla mapa nueva + su RLS. NO toca la tabla `clientes`
-- (regla del proyecto: nunca ALTER/DROP sobre tablas existentes). El estado
-- "inactivo" vive aqui, igual que `cliente_lista_precio` para las listas.
--
--   clientes_inactivos -> clientes desactivados (tienen ventas y no se borran)
--
-- Un cliente con ventas NO se puede borrar (rompe el historial: el nombre en el
-- registro de ventas viene por join a `clientes`). En su lugar se marca aqui y
-- deja de aparecer en los selectores (Nueva Venta, etc.), pero SIGUE existiendo
-- para el historial de ventas. Un cliente sin ventas si se borra fisico.
-- Requiere el script 017 (funcion app_current_tenant).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.clientes_inactivos (
  cliente_id      bigint  PRIMARY KEY,
  razon_social_id bigint  NOT NULL,
  motivo          text,
  usuario         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes_inactivos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clientes_inactivos_tenant ON public.clientes_inactivos;
CREATE POLICY clientes_inactivos_tenant ON public.clientes_inactivos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());
