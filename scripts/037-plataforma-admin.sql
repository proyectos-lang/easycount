-- =========================================================================
-- 037 - Portal de Administrador de Plataforma (super-admin)
-- =========================================================================
-- ADITIVO: crea 1 tabla nueva + 2 funciones (RPC). No toca tablas existentes.
--
-- El "super-admin" es el dueno de la app (tu), un nivel POR ENCIMA del
-- rol='Admin' de cada empresa. El portal vive en /plataforma, corre 100%
-- server-side con el service role y valida contra esta tabla. El service role
-- ignora RLS; por eso la tabla queda BLOQUEADA para usuarios normales.
--
-- Requiere el script 017 (RLS base) aplicado.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Lista de super-admins de plataforma (allow-list en BD).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plataforma_admins (
  user_id     UUID PRIMARY KEY,           -- = auth.users.id
  email       TEXT,
  nombre      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS ENCENDIDO y SIN politica para authenticated: nadie (salvo el service
-- role, que bypassa RLS) puede leer/escribir esta tabla desde la app.
ALTER TABLE public.plataforma_admins ENABLE ROW LEVEL SECURITY;

-- Sembrar al dueno de la app (ajusta el email si tu cuenta usa otro).
INSERT INTO public.plataforma_admins (user_id, email, nombre)
SELECT au.id, au.email,
       COALESCE((SELECT u.nombre FROM public.usuarios u WHERE u.id = au.id), au.email)
FROM auth.users au
WHERE lower(au.email) = lower('proyectos@sebastianpbi.org')
ON CONFLICT (user_id) DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. RPC: resumen de todas las empresas (cross-tenant, SECURITY DEFINER).
--    Solo ejecutable por el service role (server-side).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.plataforma_resumen_empresas()
RETURNS TABLE (
  id                bigint,
  nombre            text,
  comercial         text,
  rtn               text,
  usuarios          bigint,
  usuarios_activos  bigint,
  productos         bigint,
  ventas            bigint,
  ingreso_mes       numeric,
  ingreso_total     numeric,
  ultima_venta      timestamptz,
  valor_inventario  numeric,
  creada            timestamptz,
  ultima_conexion   timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    rs.id,
    rs.nombre_empresa,
    rs.nombre_comercial,
    rs.documento,
    (SELECT count(*) FROM usuarios u WHERE u.razon_social_id = rs.id),
    (SELECT count(*) FROM usuarios u WHERE u.razon_social_id = rs.id AND u.activo IS NOT FALSE),
    (SELECT count(*) FROM productos p WHERE p.razon_social_id = rs.id),
    (SELECT count(*) FROM ventas_encabezado v WHERE v.razon_social_id = rs.id),
    (SELECT COALESCE(sum(v.total_venta), 0) FROM ventas_encabezado v
       WHERE v.razon_social_id = rs.id AND v.fecha_venta >= date_trunc('month', now())),
    (SELECT COALESCE(sum(v.total_venta), 0) FROM ventas_encabezado v WHERE v.razon_social_id = rs.id),
    (SELECT max(v.fecha_venta) FROM ventas_encabezado v WHERE v.razon_social_id = rs.id),
    (SELECT COALESCE(sum(p.stock_total * p.costo_promedio), 0) FROM productos p WHERE p.razon_social_id = rs.id),
    (SELECT min(u.created_at) FROM usuarios u WHERE u.razon_social_id = rs.id),
    (SELECT max(au.last_sign_in_at) FROM usuarios u JOIN auth.users au ON au.id = u.id WHERE u.razon_social_id = rs.id)
  FROM razon_social rs
  ORDER BY rs.id;
$$;

-- -------------------------------------------------------------------------
-- 3. RPC: salud de la base de datos (tamano, conexiones).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.plataforma_db_stats()
RETURNS TABLE (
  db_bytes         bigint,
  conexiones       bigint,
  conexiones_max   integer,
  empresas         bigint,
  usuarios         bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pg_database_size(current_database()),
    (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()),
    current_setting('max_connections')::int,
    (SELECT count(*) FROM razon_social),
    (SELECT count(*) FROM usuarios);
$$;

-- -------------------------------------------------------------------------
-- 4. Candado de ejecucion: solo el service role (server-side) puede llamarlas.
--    (Por defecto Postgres concede EXECUTE a PUBLIC en funciones nuevas.)
-- -------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.plataforma_resumen_empresas() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.plataforma_db_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plataforma_resumen_empresas() TO service_role;
GRANT EXECUTE ON FUNCTION public.plataforma_db_stats() TO service_role;
