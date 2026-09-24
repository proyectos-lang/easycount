-- =========================================================================
-- 068 - Aislamiento multi-tenant de catálogos: UNIQUE por empresa (no global)
-- =========================================================================
-- PROBLEMA QUE CORRIGE
--   Hoy `categorias` y `marcas` tienen un UNIQUE GLOBAL sobre `nombre`
--   (constraint tipo `categorias_nombre_key`). Eso rompe el aislamiento entre
--   empresas: si la empresa A ya tiene una categoría "Acero", la empresa B NO
--   puede crear la suya, y la carga masiva/creación al vuelo falla en silencio
--   (el producto queda sin categoría). Cada empresa debe poder nombrar sus
--   catálogos como quiera, sin chocar con otras.
--
-- QUÉ HACE
--   Cambia la unicidad a POR EMPRESA e insensible a mayúsculas/espacios:
--   UNIQUE (razon_social_id, lower(btrim(nombre))). Así, dentro de una misma
--   empresa "Acero"/"acero"/"Acero " son el mismo (evita duplicados reales),
--   pero dos empresas SÍ pueden tener cada una su "Acero".
--
--   `subcategorias` ya está aislada por empresa/categoría (no tiene UNIQUE
--   global sobre nombre), por eso NO se toca aquí.
--
-- ORDEN SEGURO (dentro de una transacción):
--   1) Limpia duplicados EXACTOS por empresa que NO estén en uso (sin productos
--      ni subcategorías), conservando el de menor id. Necesario para que el
--      índice único nuevo pueda crearse.
--   2) Crea el índice único compuesto nuevo.
--   3) Suelta el/los constraint(s) e índice(s) UNIQUE global(es) sobre `nombre`.
--
-- SOBRE EL BLOQUEO / REESCRITURA
--   Este script hace DROP de un constraint y CREATE de un índice único. NO
--   reescribe filas (no cambia tipos ni defaults). El CREATE UNIQUE INDEX toma
--   un lock breve de escritura sobre la tabla mientras construye el índice; con
--   los volúmenes actuales (decenas/cientos de filas) es cuestión de
--   milisegundos. Aun así se ejecuta en una transacción para que sea atómico:
--   si algo falla, no queda a medias.
--
--   Es idempotente: si el índice nuevo ya existe, lo salta; si el constraint
--   viejo ya no está, no falla.
--
-- Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

BEGIN;

-- ── 1) Limpiar duplicados EXACTOS por empresa que NO estén en uso ──────────
--    (misma empresa + mismo nombre normalizado). Conserva el id más bajo.
--    Solo borra los que no tienen productos ni subcategorías colgando: así el
--    índice único puede crearse sin perder datos referenciados.
DELETE FROM public.categorias c
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY razon_social_id, lower(btrim(nombre))
           ORDER BY id
         ) AS rn
  FROM public.categorias
) d
WHERE c.id = d.id
  AND d.rn > 1                                            -- no es el "primero"
  AND NOT EXISTS (SELECT 1 FROM public.productos     p WHERE p.categoria_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM public.subcategorias s WHERE s.categoria_id = c.id);

DELETE FROM public.marcas m
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY razon_social_id, lower(btrim(nombre))
           ORDER BY id
         ) AS rn
  FROM public.marcas
) d
WHERE m.id = d.id
  AND d.rn > 1
  AND NOT EXISTS (SELECT 1 FROM public.productos p WHERE p.marca_id = m.id);

-- ── 2) Índice único NUEVO por empresa (case/space-insensitive) ─────────────
CREATE UNIQUE INDEX IF NOT EXISTS ux_categorias_tenant_nombre
  ON public.categorias (razon_social_id, lower(btrim(nombre)));

CREATE UNIQUE INDEX IF NOT EXISTS ux_marcas_tenant_nombre
  ON public.marcas (razon_social_id, lower(btrim(nombre)));

-- ── 3) Soltar el UNIQUE GLOBAL viejo sobre `nombre` ────────────────────────
--    Descubre dinámicamente cualquier constraint UNIQUE que sea EXACTAMENTE
--    sobre (nombre) y lo elimina. Cubre nombres autogenerados
--    (`categorias_nombre_key`, `marcas_nombre_key`) sin depender del literal.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT con.conrelid::regclass::text AS tabla, con.conname AS nombre_constraint
    FROM pg_constraint con
    JOIN pg_class      rel ON rel.oid = con.conrelid
    JOIN pg_namespace  nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname IN ('categorias', 'marcas')
      AND con.contype = 'u'                               -- UNIQUE
      AND (
        SELECT array_agg(att.attname ORDER BY att.attname)
        FROM unnest(con.conkey) AS k(attnum)
        JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k.attnum
      ) = ARRAY['nombre']::name[]                          -- SOLO la columna nombre
  LOOP
    -- r.tabla puede venir como 'categorias' o 'public.categorias'; quita el esquema.
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I',
                   regexp_replace(r.tabla, '^.*\.', ''), r.nombre_constraint);
    RAISE NOTICE 'Soltado UNIQUE global % en %', r.nombre_constraint, r.tabla;
  END LOOP;

  -- Por si el UNIQUE global existiera como ÍNDICE suelto (no como constraint):
  FOR r IN
    SELECT indexrelid::regclass::text AS idx, indrelid::regclass::text AS tabla
    FROM pg_index i
    JOIN pg_class ic ON ic.oid = i.indexrelid
    JOIN pg_class tc ON tc.oid = i.indrelid
    JOIN pg_namespace nsp ON nsp.oid = tc.relnamespace
    WHERE nsp.nspname = 'public'
      AND tc.relname IN ('categorias', 'marcas')
      AND i.indisunique
      AND ic.relname NOT IN ('ux_categorias_tenant_nombre', 'ux_marcas_tenant_nombre')
      AND (
        SELECT array_agg(a.attname ORDER BY a.attname)
        FROM unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
        WHERE k.attnum <> 0                                -- ignora expresiones
      ) = ARRAY['nombre']::name[]
      AND i.indnkeyatts = 1                                -- una sola columna
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', regexp_replace(r.idx, '^.*\.', ''));
    RAISE NOTICE 'Soltado índice UNIQUE global % en %', r.idx, r.tabla;
  END LOOP;
END $$;

COMMIT;

-- VERIFICACIÓN (opcional, corre por separado tras el COMMIT):
--   Debe existir el índice nuevo y NO debe quedar UNIQUE global sobre (nombre).
-- SELECT indexname, indexdef FROM pg_indexes
--   WHERE schemaname='public' AND tablename IN ('categorias','marcas')
--   ORDER BY tablename, indexname;
