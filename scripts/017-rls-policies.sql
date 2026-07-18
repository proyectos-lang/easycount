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
--   2. Activa RLS y crea la politica de aislamiento SOLO en las tablas que
--      existen y que tienen columna `razon_social_id`. Las tablas ausentes
--      se saltan con un NOTICE (no fallan el script).
--   3. Maneja los casos especiales (razon_social, usuarios,
--      permisos_usuarios, modulos).
--
-- DEFENSIVO E IDEMPOTENTE
--   - Comprueba existencia de tabla y columna antes de actuar: si tu esquema
--     no tiene alguna tabla (p. ej. `gastos_pagos_detalle`), simplemente la
--     omite en vez de abortar.
--   - Usa DROP POLICY IF EXISTS + CREATE, asi que se puede correr N veces.
--
-- ANTES DE APLICAR (recomendado): respalda las politicas actuales para poder
-- comparar / revertir. En el SQL Editor de Supabase:
--
--     SELECT schemaname, tablename, policyname, cmd, qual, with_check
--     FROM pg_policies
--     WHERE schemaname = 'public'
--     ORDER BY tablename, policyname;
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
-- 2. Aislamiento generico para todas las tablas con `razon_social_id`
-- -------------------------------------------------------------------------
-- Recorre la lista de tablas candidatas. Para cada una:
--   - Si la tabla NO existe -> NOTICE y continua.
--   - Si existe pero NO tiene columna `razon_social_id` -> NOTICE y continua.
--   - Si todo esta bien -> ENABLE RLS + (re)crea la politica.
-- La politica cubre las 4 operaciones (FOR ALL) con USING + WITH CHECK.
DO $$
DECLARE
  t text;
  tablas text[] := ARRAY[
    'gastos',
    'marcas',
    'clientes',
    'almacenes',
    'productos',
    'categorias',
    'subcategorias',
    'proveedores',
    'conceptos_gastos',
    'cuentas_config',
    'localizaciones',
    'ventas_encabezado',
    'ventas_detalle',
    'pagos_ventas',
    'ventas_pagos_detalle',
    'compras_encabezado',
    'compras_detalle',
    'transacciones_inventario',
    'caja_chica_sesiones',
    'caja_chica_movimientos',
    'cuenta_movimientos',
    'gastos_pagos_detalle'   -- opcional: solo existe si se aplico el script 014
  ];
BEGIN
  FOREACH t IN ARRAY tablas LOOP
    -- Tabla inexistente: saltar sin fallar.
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      RAISE NOTICE 'Omitida (no existe): %', t;
      CONTINUE;
    END IF;

    -- Sin columna razon_social_id: saltar sin fallar.
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t
        AND column_name = 'razon_social_id'
    ) THEN
      RAISE NOTICE 'Omitida (sin razon_social_id): %', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I;', t, t);
    EXECUTE format($f$
      CREATE POLICY tenant_isolation_%I ON public.%I
        FOR ALL TO authenticated
        USING (razon_social_id = public.app_current_tenant())
        WITH CHECK (razon_social_id = public.app_current_tenant());
    $f$, t, t);

    RAISE NOTICE 'RLS aplicado: %', t;
  END LOOP;
END $$;

-- -------------------------------------------------------------------------
-- 3. Casos especiales (con guarda de existencia)
-- -------------------------------------------------------------------------
DO $$
BEGIN
  -- razon_social: la tabla tenant misma. Un usuario solo ve/edita SU empresa.
  -- (La comparacion es contra `id`, no `razon_social_id`.)
  IF to_regclass('public.razon_social') IS NOT NULL THEN
    ALTER TABLE public.razon_social ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_razon_social ON public.razon_social;
    CREATE POLICY tenant_isolation_razon_social ON public.razon_social
      FOR ALL TO authenticated
      USING (id = public.app_current_tenant())
      WITH CHECK (id = public.app_current_tenant());
    RAISE NOTICE 'RLS aplicado: razon_social';
  END IF;

  -- usuarios: cada usuario ve a los usuarios de SU empresa. Puede leer su
  -- propia fila aunque su tenant no coincida, para que login/tenant-stamp
  -- siempre resuelva.
  IF to_regclass('public.usuarios') IS NOT NULL THEN
    ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_usuarios ON public.usuarios;
    CREATE POLICY tenant_isolation_usuarios ON public.usuarios
      FOR ALL TO authenticated
      USING (razon_social_id = public.app_current_tenant() OR id = auth.uid())
      WITH CHECK (razon_social_id = public.app_current_tenant());
    RAISE NOTICE 'RLS aplicado: usuarios';
  END IF;

  -- permisos_usuarios: no tiene razon_social_id; se aisla por el usuario
  -- dueno, que a su vez pertenece a la empresa del caller.
  IF to_regclass('public.permisos_usuarios') IS NOT NULL THEN
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
    RAISE NOTICE 'RLS aplicado: permisos_usuarios';
  END IF;

  -- modulos: catalogo global compartido por todas las empresas. Solo lectura
  -- para autenticados; la escritura queda para admins via service role.
  IF to_regclass('public.modulos') IS NOT NULL THEN
    ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS modulos_read_all ON public.modulos;
    CREATE POLICY modulos_read_all ON public.modulos
      FOR SELECT TO authenticated
      USING (true);
    RAISE NOTICE 'RLS aplicado: modulos (solo lectura)';
  END IF;
END $$;

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
