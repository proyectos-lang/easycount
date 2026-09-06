-- =========================================================================
-- ONE-OFF: agrupar tallas existentes de CORAL SWIMWEAR (razon_social_id = 10)
-- =========================================================================
-- Los productos "tallados" ya creados de Coral son productos independientes con
-- `talla` asignada pero SIN grupo. Este script los vincula: los que comparten
-- (nombre, marca_id) y tienen talla se juntan bajo un mismo grupo_id, para que
-- en Productos/Inventario aparezcan una sola vez y se desplieguen en sus tallas.
--
-- Requiere el script 043 (tabla producto_grupo_tallas). Es idempotente: usa
-- ON CONFLICT (producto_id) DO NOTHING, asi que reejecutarlo no duplica.
-- Solo agrupa conjuntos con 2+ productos (una prenda con una sola talla no
-- necesita grupo). No toca la tabla `productos`.
-- =========================================================================

DO $$
DECLARE
  v_razon  INT := 10;
  v_grupos INT := 0;
BEGIN
  -- Un grupo por cada (nombre, marca_id) con 2+ productos tallados en razon 10.
  -- El grupo_id se genera con nextval de una secuencia temporal por seguridad
  -- de unicidad; usamos un offset alto para no chocar con ids que la app genere
  -- via Date.now() (milisegundos ~ 1.7e12); aqui usamos 1..N + 900000000000.
  WITH grupos AS (
    SELECT
      nombre,
      marca_id,
      row_number() OVER (ORDER BY nombre, marca_id) + 900000000000 AS grupo_id
    FROM public.productos
    WHERE razon_social_id = v_razon
      AND talla IS NOT NULL
      AND btrim(talla) <> ''
    GROUP BY nombre, marca_id
    HAVING COUNT(*) >= 2
  )
  INSERT INTO public.producto_grupo_tallas (producto_id, razon_social_id, grupo_id, nombre_grupo, usuario)
  SELECT
    p.id,
    v_razon,
    g.grupo_id,
    p.nombre,
    'agrupar-tallas-coral'
  FROM public.productos p
  JOIN grupos g
    ON g.nombre = p.nombre
   AND g.marca_id IS NOT DISTINCT FROM p.marca_id
  WHERE p.razon_social_id = v_razon
    AND p.talla IS NOT NULL
    AND btrim(p.talla) <> ''
  ON CONFLICT (producto_id) DO NOTHING;

  SELECT COUNT(DISTINCT grupo_id) INTO v_grupos
  FROM public.producto_grupo_tallas
  WHERE razon_social_id = v_razon;

  RAISE NOTICE 'Grupos de tallas para razon %: % grupo(s).', v_razon, v_grupos;
END $$;

-- Verificacion: cuantas tallas quedaron en cada grupo.
SELECT g.grupo_id, g.nombre_grupo, COUNT(*) AS tallas
FROM public.producto_grupo_tallas g
WHERE g.razon_social_id = 10
GROUP BY g.grupo_id, g.nombre_grupo
ORDER BY g.nombre_grupo;
