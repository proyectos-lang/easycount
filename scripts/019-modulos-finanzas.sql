-- =========================================================================
-- 019 - Modulos nuevos de Finanzas (Fase 2)
-- =========================================================================
--
-- ADITIVO: solo INSERTA filas en la tabla `modulos`. No altera estructura,
-- no toca otras tablas.
--
-- Registra los 2 modulos nuevos para que aparezcan en el sistema de permisos.
-- Los `nombre` DEBEN calzar EXACTO con el constante MODULOS de
-- lib/constants/modulos.ts:
--   - "Dashboard Finanzas"      -> /finanzas/dashboard
--   - "Movimientos de Cuentas"  -> /finanzas/movimientos
--
-- Tras aplicar, otorga el permiso a los usuarios que lo necesiten desde
-- /configuracion/usuarios (los administradores ya ven todo).
-- =========================================================================

INSERT INTO public.modulos (nombre)
VALUES
  ('Dashboard Finanzas'),
  ('Movimientos de Cuentas')
ON CONFLICT (nombre) DO NOTHING;
