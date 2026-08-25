-- =========================================================================
-- 033 - Producto: campo opcional "talla"
-- =========================================================================
--
-- Agrega una columna OPCIONAL `talla` (texto) a `productos`. Es aditivo y no
-- destructivo: `ADD COLUMN IF NOT EXISTS` con NULL permitido (mismo patron que
-- los scripts 003/004/028). No cambia ni renombra columnas existentes.
--
-- La talla se puede capturar al crear/editar un producto (modulo Productos) y
-- en la creacion rapida desde Recepcion por Factura. Se muestra en el catalogo
-- de ventas solo cuando el producto la tiene.
-- =========================================================================

ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS talla text;
