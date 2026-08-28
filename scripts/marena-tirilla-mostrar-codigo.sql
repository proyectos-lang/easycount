-- =========================================================================
-- Marena (razon social 13): habilitar el flag "tirilla_mostrar_codigo".
-- Imprime el codigo del producto debajo de su nombre en la tirilla termica.
--
-- Merge SEGURO: preserva cualquier otro flag ya guardado para la empresa
-- (jsonb `config || nuevo`). Requiere el script 038 aplicado.
-- Ejecutar en el SQL editor de Supabase (service role).
-- Equivale a activar el switch "Codigo en tirilla" de Marena en /plataforma.
-- =========================================================================

INSERT INTO public.razon_social_config (razon_social_id, config, usuario, updated_at)
VALUES (13, '{"tirilla_mostrar_codigo": true}'::jsonb, 'script-marena-codigo', now())
ON CONFLICT (razon_social_id)
DO UPDATE SET
  config     = public.razon_social_config.config || EXCLUDED.config,
  usuario    = EXCLUDED.usuario,
  updated_at = now();

-- Verificar:
SELECT razon_social_id, config, updated_at
FROM public.razon_social_config
WHERE razon_social_id = 13;
