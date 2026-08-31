-- =========================================================================
-- Diagnostico (solo lectura): por que la carga masiva dice que el producto
-- con codigo 151PLAC001 "ya existe" si al buscar ese codigo no aparece.
-- Razon social 13 (Marena). Ejecutar en el SQL editor de Supabase.
-- =========================================================================

-- 1) ¿Existe EXACTAMENTE ese codigo? (normalizado: sin espacios, minusculas)
SELECT id, nombre, codigo_barras
FROM public.productos
WHERE razon_social_id = 13
  AND lower(trim(codigo_barras)) = lower(trim('151PLAC001'));
--   -> Si NO devuelve filas, el codigo NO existe: el "ya existe" era por NOMBRE.

-- 2) Codigos PARECIDOS (por si hay un guion, espacio o cero de mas/menos).
SELECT id, nombre, codigo_barras
FROM public.productos
WHERE razon_social_id = 13
  AND codigo_barras ILIKE '%151%PLAC%001%';

-- 3) Para ver el choque de NOMBRE: reemplaza NOMBRE_DE_LA_FILA por el nombre
--    exacto que trae esa fila del Excel. Si aparece un producto con OTRO codigo,
--    ese es el que disparaba el "ya existe".
-- SELECT id, nombre, codigo_barras
-- FROM public.productos
-- WHERE razon_social_id = 13
--   AND lower(trim(nombre)) = lower(trim('NOMBRE_DE_LA_FILA'));
