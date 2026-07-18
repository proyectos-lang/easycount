# Migraciones SQL — EasyCount

Estos scripts construyen el esquema de Supabase. Se ejecutan **en orden** en el
SQL Editor de Supabase. Son en su mayoría idempotentes (`IF NOT EXISTS` /
`DROP ... IF EXISTS`), pero conviene aplicarlos en secuencia sobre una base nueva.

## Orden de ejecución

| # | Script | Qué hace |
|---|---|---|
| 001 | `001-create-marcas-categorias.sql` | Tablas `marcas`, `categorias`; FKs en `productos` |
| 002 | `002-create-auth-tables.sql` | `modulos`, `usuarios`, `permisos_usuarios` |
| 003 | `003-add-logo-and-storage.sql` | `logo_url`, bucket de Storage + políticas de logos |
| 004 | `004-multitenant-refactor.sql` | Agrega `razon_social_id` a las tablas de negocio |
| 005 | `005-supabase-auth-refactor.sql` | Enlace con Supabase Auth (`auth_user_id`) |
| 009 | `009-add-valorpago-to-ventas.sql` | Columna `valorpago` en ventas |
| 010 | `010-add-cliente-telefono-fecha-nacimiento.sql` | Teléfono y cumpleaños de clientes |
| 011 | `011-tesoreria-caja-chica.sql` | Tesorería: cuentas, caja chica, pagos multi-método |
| 012 | `012-create-gastos.sql` | `conceptos_gastos`, `gastos` |
| 013 | `013-vista-cierre-diario.sql` | Vista `vista_cierre_diario` |
| 014 | `014-cuentas-por-pagar.sql` | Cuentas por pagar + `gastos_pagos_detalle` |
| 015 | `015-subcategorias.sql` | `subcategorias` |
| 016 | `016-vista-historico-caja-chica.sql` | Vista `vista_historico_caja_chica` |
| 017 | `017-rls-policies.sql` | **Políticas RLS de aislamiento multi-empresa** |
| — | `add-almacen-to-ventas-encabezado.sql` | Agrega `almacen_id` a ventas (aplicar tras 011) |

> **Huecos 006–008:** la numeración salta de 005 a 009. No faltan migraciones;
> los números simplemente no se usaron. El orden de arriba es el completo.

## Seguridad (RLS)

El aislamiento entre empresas depende de las políticas del script **017**.
Si recreas el proyecto o migras de entorno, **ejecuta 017** o los datos de
todas las empresas quedarán mezclados. Antes de aplicarlo, respalda las
políticas actuales (la consulta está documentada dentro del propio script).
