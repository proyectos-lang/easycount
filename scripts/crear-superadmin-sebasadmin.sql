-- ============================================================================
-- Crea el super-admin de plataforma "Sebasadmin"
--   Login (email):  sebasadmin@easycount.app
--   Contrasena:     Forceshielder2
-- One-off (NO es migracion). Requiere el script 037 aplicado (plataforma_admins).
--
-- Crea la cuenta en auth.users (+ auth.identities) con pgcrypto y la agrega a
-- plataforma_admins. Es una cuenta SOLO-PLATAFORMA: no tiene perfil en
-- `usuarios` ni razon_social; al hacer login la app la enruta a /plataforma.
--
-- ALTERNATIVA RECOMENDADA (mas robusta): crea el usuario desde el Dashboard de
-- Supabase (Authentication -> Users -> Add user, marcando "Auto Confirm User")
-- y luego corre SOLO el INSERT en plataforma_admins del final de este script.
-- ============================================================================

DO $$
DECLARE
  v_email text := 'sebasadmin@easycount.app';
  v_pass  text := 'Forceshielder2';
  v_uid   uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt(v_pass, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );

    -- Identidad de email (necesaria para el login por email/password).
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );

    RAISE NOTICE 'Auth user creado: %', v_uid;
  ELSE
    RAISE NOTICE 'El auth user ya existia: %', v_uid;
  END IF;

  -- Alta como super-admin de plataforma.
  INSERT INTO public.plataforma_admins (user_id, email, nombre)
  VALUES (v_uid, v_email, 'Sebasadmin')
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- Si creaste el usuario por el Dashboard, corre SOLO esto:
-- INSERT INTO public.plataforma_admins (user_id, email, nombre)
-- SELECT id, email, 'Sebasadmin'
-- FROM auth.users WHERE lower(email) = lower('sebasadmin@easycount.app')
-- ON CONFLICT (user_id) DO NOTHING;
