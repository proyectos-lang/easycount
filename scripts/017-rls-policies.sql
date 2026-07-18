-- =========================================================================
-- 017 - Politicas RLS de aislamiento multi-empresa (multi-tenant)
-- =========================================================================
--
-- OBJETIVO
--   Versionar en el repositorio las politicas Row Level Security que aislan
--   los datos por `razon_social_id`. Hasta ahora las politicas vivian solo
--   en el panel de Supabase (sin control de versiones): recrear el proyecto
--   o migrar de entorno perdia TODO el aislamiento sin aviso.
--
-- QUE HACE
--   1. Crea la funcion `app_current_tenant()` que devuelve el
--      `razon_social_id` del usuario autenticado (SECURITY DEFINER para
--      poder leer `usuarios` sin recursion de RLS).
--   2. Activa RLS en todas las tablas de negocio.
--   3. Crea una politica de aislamiento por tabla: un usuario solo ve y
--      modifica filas de SU empresa.
--
-- IDEMPOTENTE
--   Usa DROP POLICY IF EXISTS + CREATE, asi que se puede correr varias veces.
--
-- ANTES DE APLICAR (recomendado): respalda las politicas actuales para poder
-- comparar / revertir. En el SQL Editor de Supabase:
--
--     SELECT schemaname, tablename, policyname, cmd, qual, with_check
--     FROM pg_policies
--     WHERE schemaname = 'public'
--     ORDER BY tablename, policyname;
--
-- Guarda ese resultado antes de continuar.
--
-- NOTA SOBRE FILAS CON razon_social_id NULL
--   Una fila con `razon_social_id` NULL no sera visible para ningun usuario
--   (NULL = X es NULL, no true). Se verifico que hoy NO existen filas asi en
--   productos ni ventas. Si tuvieras datos legacy sin empresa, asignales una
--   `razon_social_id` ANTES de aplicar este script o quedaran ocultos.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Funcion helper: razon_social_id del usuario logueado
-- -------------------------------------------------------------------------
-- SECURITY DEFINER: corre con los privilegios del owner, saltandose RLS al
-- leer `usuarios`. Esto evita la recursion (la policy de `usuarios` usa esta
-- misma funcion) y permite que el tenant se resuelva en una sola consulta.
CREATE OR REPLACE FUNCTION public.app_current_tenant()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT razon_social_id
  FROM public.usuarios
  WHERE id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.app_current_tenant() FROM public;
GRANT EXECUTE ON FUNCTION public.app_current_tenant() TO authenticated;

-- -------------------------------------------------------------------------
-- 2. Helper interno: aplica RLS + politica de aislamiento a una tabla que
--    tiene columna `razon_social_id`.
--
--    Se implementa como bloque DO por tabla mas abajo para mantener el SQL
--    explicito y facil de auditar. La politica cubre las 4 operaciones
--    (SELECT/INSERT/UPDATE/DELETE) con USING + WITH CHECK.
-- -------------------------------------------------------------------------

-- ====== Tablas con columna `razon_social_id` ======
-- gastos
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_gastos ON public.gastos;
CREATE POLICY tenant_isolation_gastos ON public.gastos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- marcas
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_marcas ON public.marcas;
CREATE POLICY tenant_isolation_marcas ON public.marcas
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clientes ON public.clientes;
CREATE POLICY tenant_isolation_clientes ON public.clientes
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- almacenes
ALTER TABLE public.almacenes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_almacenes ON public.almacenes;
CREATE POLICY tenant_isolation_almacenes ON public.almacenes
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_productos ON public.productos;
CREATE POLICY tenant_isolation_productos ON public.productos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- categorias
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_categorias ON public.categorias;
CREATE POLICY tenant_isolation_categorias ON public.categorias
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- subcategorias
ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_subcategorias ON public.subcategorias;
CREATE POLICY tenant_isolation_subcategorias ON public.subcategorias
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- proveedores
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_proveedores ON public.proveedores;
CREATE POLICY tenant_isolation_proveedores ON public.proveedores
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- conceptos_gastos
ALTER TABLE public.conceptos_gastos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_conceptos_gastos ON public.conceptos_gastos;
CREATE POLICY tenant_isolation_conceptos_gastos ON public.conceptos_gastos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- cuentas_config
ALTER TABLE public.cuentas_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cuentas_config ON public.cuentas_config;
CREATE POLICY tenant_isolation_cuentas_config ON public.cuentas_config
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- localizaciones (razon_social_id es smallint; la comparacion con bigint es valida)
ALTER TABLE public.localizaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_localizaciones ON public.localizaciones;
CREATE POLICY tenant_isolation_localizaciones ON public.localizaciones
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- ventas_encabezado
ALTER TABLE public.ventas_encabezado ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ventas_encabezado ON public.ventas_encabezado;
CREATE POLICY tenant_isolation_ventas_encabezado ON public.ventas_encabezado
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- ventas_detalle
ALTER TABLE public.ventas_detalle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ventas_detalle ON public.ventas_detalle;
CREATE POLICY tenant_isolation_ventas_detalle ON public.ventas_detalle
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- pagos_ventas (razon_social_id es smallint)
ALTER TABLE public.pagos_ventas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pagos_ventas ON public.pagos_ventas;
CREATE POLICY tenant_isolation_pagos_ventas ON public.pagos_ventas
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- ventas_pagos_detalle
ALTER TABLE public.ventas_pagos_detalle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ventas_pagos_detalle ON public.ventas_pagos_detalle;
CREATE POLICY tenant_isolation_ventas_pagos_detalle ON public.ventas_pagos_detalle
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- compras_encabezado
ALTER TABLE public.compras_encabezado ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_compras_encabezado ON public.compras_encabezado;
CREATE POLICY tenant_isolation_compras_encabezado ON public.compras_encabezado
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- compras_detalle
ALTER TABLE public.compras_detalle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_compras_detalle ON public.compras_detalle;
CREATE POLICY tenant_isolation_compras_detalle ON public.compras_detalle
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- transacciones_inventario
ALTER TABLE public.transacciones_inventario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_transacciones_inventario ON public.transacciones_inventario;
CREATE POLICY tenant_isolation_transacciones_inventario ON public.transacciones_inventario
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- caja_chica_sesiones
ALTER TABLE public.caja_chica_sesiones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_caja_chica_sesiones ON public.caja_chica_sesiones;
CREATE POLICY tenant_isolation_caja_chica_sesiones ON public.caja_chica_sesiones
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- caja_chica_movimientos
ALTER TABLE public.caja_chica_movimientos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_caja_chica_movimientos ON public.caja_chica_movimientos;
CREATE POLICY tenant_isolation_caja_chica_movimientos ON public.caja_chica_movimientos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- cuenta_movimientos
ALTER TABLE public.cuenta_movimientos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cuenta_movimientos ON public.cuenta_movimientos;
CREATE POLICY tenant_isolation_cuenta_movimientos ON public.cuenta_movimientos
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- gastos_pagos_detalle
ALTER TABLE public.gastos_pagos_detalle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_gastos_pagos_detalle ON public.gastos_pagos_detalle;
CREATE POLICY tenant_isolation_gastos_pagos_detalle ON public.gastos_pagos_detalle
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- -------------------------------------------------------------------------
-- 3. Casos especiales
-- -------------------------------------------------------------------------

-- razon_social: la tabla tenant misma. Un usuario solo ve/edita SU empresa.
-- (La comparacion es contra `id`, no `razon_social_id`.)
ALTER TABLE public.razon_social ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_razon_social ON public.razon_social;
CREATE POLICY tenant_isolation_razon_social ON public.razon_social
  FOR ALL TO authenticated
  USING (id = public.app_current_tenant())
  WITH CHECK (id = public.app_current_tenant());

-- usuarios: cada usuario ve a los usuarios de SU empresa. Puede leer su
-- propia fila aunque (por algun motivo) su tenant no coincida, para que el
-- login/tenant-stamp siempre resuelva.
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_usuarios ON public.usuarios;
CREATE POLICY tenant_isolation_usuarios ON public.usuarios
  FOR ALL TO authenticated
  USING (razon_social_id = public.app_current_tenant() OR id = auth.uid())
  WITH CHECK (razon_social_id = public.app_current_tenant());

-- permisos_usuarios: no tiene razon_social_id; se aisla por el usuario dueno,
-- que a su vez pertenece a la empresa del caller.
ALTER TABLE public.permisos_usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_permisos_usuarios ON public.permisos_usuarios;
CREATE POLICY tenant_isolation_permisos_usuarios ON public.permisos_usuarios
  FOR ALL TO authenticated
  USING (
    usuario_id IN (
      SELECT id FROM public.usuarios
      WHERE razon_social_id = public.app_current_tenant() OR id = auth.uid()
    )
  )
  WITH CHECK (
    usuario_id IN (
      SELECT id FROM public.usuarios
      WHERE razon_social_id = public.app_current_tenant()
    )
  );

-- modulos: catalogo global compartido por todas las empresas. Solo lectura
-- para usuarios autenticados; la escritura queda para admins via service role.
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS modulos_read_all ON public.modulos;
CREATE POLICY modulos_read_all ON public.modulos
  FOR SELECT TO authenticated
  USING (true);

-- -------------------------------------------------------------------------
-- 4. Verificacion posterior (ejecutar aparte para confirmar)
-- -------------------------------------------------------------------------
--   -- Tablas con RLS activo:
--   SELECT relname, relrowsecurity
--   FROM pg_class
--   WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
--   ORDER BY relname;
--
--   -- Politicas creadas:
--   SELECT tablename, policyname, cmd
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename;
--
-- Prueba funcional: inicia sesion con un usuario de la Empresa A y confirma
-- que /ventas/historial NO muestra ventas de la Empresa B.
-- =========================================================================
