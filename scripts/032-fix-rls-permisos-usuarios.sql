-- =========================================================================
-- 032 - Fix RLS de permisos_usuarios (cada usuario lee SOLO lo suyo)
-- =========================================================================
--
-- PROBLEMA: la politica del script 017 usaba una subconsulta ANIDADA a
-- `usuarios` (que a su vez tiene RLS y llama app_current_tenant()). En el
-- cliente esa subconsulta terminaba filtrando incluso las filas propias del
-- usuario, asi que `loadProfile` recibia 0 permisos y (con deny-by-default) el
-- usuario no veia ningun modulo. Para "arreglarlo" se habia DESACTIVADO RLS en
-- la tabla, lo que es inseguro (cualquier autenticado veria/editaria permisos
-- de todos los tenants).
--
-- SOLUCION: reactivar RLS y reemplazar la politica por una comparacion DIRECTA
-- `usuario_id = auth.uid()` (sin subconsultas anidadas -> robusta). El unico
-- lugar que lee esta tabla desde el cliente es `loadProfile`, que solo necesita
-- los permisos del PROPIO usuario. La lectura de la matriz de administracion y
-- TODAS las escrituras (asignar permisos) se hacen desde Server Actions con
-- service role, que bypasea RLS. Al no crear politica de escritura para
-- `authenticated`, un usuario NO puede auto-otorgarse modulos (hueco que si
-- tenia la politica anterior via su WITH CHECK por tenant).
--
-- Estrictamente sobre `permisos_usuarios`: no toca su estructura (no ALTER de
-- columnas, no DROP de la tabla); solo (re)activa RLS y reescribe la politica,
-- mismo patron del script 017.
-- =========================================================================

DO $$
BEGIN
  IF to_regclass('public.permisos_usuarios') IS NULL THEN
    RAISE NOTICE 'Omitido: la tabla public.permisos_usuarios no existe.';
    RETURN;
  END IF;

  -- Reactivar RLS (por si fue desactivado manualmente).
  ALTER TABLE public.permisos_usuarios ENABLE ROW LEVEL SECURITY;

  -- Quitar la politica anterior (subconsulta anidada) y cualquier variante.
  DROP POLICY IF EXISTS tenant_isolation_permisos_usuarios ON public.permisos_usuarios;
  DROP POLICY IF EXISTS permisos_usuarios_self_read ON public.permisos_usuarios;

  -- Lectura: cada usuario ve UNICAMENTE sus propios permisos.
  CREATE POLICY permisos_usuarios_self_read ON public.permisos_usuarios
    FOR SELECT TO authenticated
    USING (usuario_id = auth.uid());

  -- (Sin politica de INSERT/UPDATE/DELETE para authenticated: las escrituras
  --  van por service role, que bypasea RLS. Esto impide el auto-otorgamiento.)

  RAISE NOTICE 'RLS corregido: permisos_usuarios (lectura solo de lo propio).';
END $$;

-- -------------------------------------------------------------------------
-- Verificacion (opcional): correr como el usuario para confirmar que ve sus
-- permisos. Reemplaza el UUID por el del usuario a probar.
-- -------------------------------------------------------------------------
--   begin;
--   set local role authenticated;
--   select set_config('request.jwt.claims',
--     '{"sub":"<UUID-DEL-USUARIO>","role":"authenticated"}', true);
--   select modulo_id, puede_ver from public.permisos_usuarios
--   where usuario_id = '<UUID-DEL-USUARIO>' and puede_ver = true;
--   rollback;
