-- =========================================================================
-- Diagnostico: error "Sesion invalida, no se pudo registrar la empresa o usuario"
-- al generar una venta. Ese error salta cuando, al guardar, no se resuelve el
-- sello de tenant: el usuario logueado debe tener en la tabla `usuarios` un
-- razon_social_id y un nombre. Ejecutar en el SQL editor de Supabase (service role).
-- =========================================================================

-- 1) Usuarios con perfil INCOMPLETO (sin empresa o sin nombre): esos, aunque
--    inicien sesion, no pueden registrar ventas (dispara "Sesion invalida").
SELECT u.id, u.nombre, u.razon_social_id, au.email, au.last_sign_in_at
FROM public.usuarios u
LEFT JOIN auth.users au ON au.id = u.id
WHERE u.razon_social_id IS NULL
   OR u.nombre IS NULL
   OR btrim(u.nombre) = '';
--   -> Si el usuario afectado aparece aqui, la causa es el PERFIL (no la sesion).

-- 2) Perfil de un usuario puntual por correo (cambia el correo):
SELECT u.id, u.nombre, u.razon_social_id, rs.nombre_empresa, au.email, au.last_sign_in_at
FROM public.usuarios u
JOIN auth.users au ON au.id = u.id
LEFT JOIN public.razon_social rs ON rs.id = u.razon_social_id
WHERE lower(au.email) = lower('CORREO_DEL_USUARIO');
--   -> razon_social_id y nombre deben venir con valor. Si razon_social_id es
--      NULL, hay que asignarle la empresa correcta.
