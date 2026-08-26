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
| 018 | `018-funciones-stock-atomico.sql` | **Funciones atómicas de stock y costo promedio** |
| 019 | `019-modulos-finanzas.sql` | Módulos Dashboard Finanzas y Movimientos de Cuentas |
| 020 | `020-devoluciones.sql` | Devoluciones (notas de crédito): 2 tablas + RLS + módulo |
| 021 | `021-pedidos-catalogo.sql` | Pedidos por Catálogo: 4 tablas + RLS + módulo |
| 022 | `022-errores-log.sql` | Log de errores de la app (monitoreo, solo service role) |
| 023 | `023-ajustes-inventario.sql` | Ajustes de Inventario: bitácora + RLS + módulo |
| 024 | `024-ventas-ediciones.sql` | Bitácora de ediciones de ventas + RLS (opcional) |
| 025 | `025-corregir-signo-salida-venta.sql` | Corrige el signo de `Salida Venta` en datos viejos (opcional, 1 vez) |
| 026 | `026-ajuste-costo.sql` | Ajuste de Costo: bitácora + RPC `fijar_costo_promedio`/`recalcular_costo_ventas` + RLS + módulo |
| 027 | `027-homologar-total-venta-bruto.sql` | Reescribe `total_venta` a BRUTO (= suma de líneas + ISV) en el histórico (opcional, 1 vez) |
| 028 | `028-ventas-pagos-detalle-columnas.sql` | Repara `ventas_pagos_detalle`: agrega `porcentaje_comision`/`usuario` y default a `monto_recibido` (bases con esquema viejo) |
| 029 | `029-reconstruir-desglose-pago.sql` | Reconstruye método + comisión de ventas viejas desde tesorería (preview + insert, opcional) |
| 030 | `030-recalcular-recepcion.sql` | Recalcular Recepción: registra el módulo (solo INSERT; reutiliza tablas/RPC del 026) |
| 031 | `031-analisis-financiero.sql` | Análisis Financiero: registra el módulo (solo INSERT; analítica de lectura sobre datos existentes) |
| 032 | `032-fix-rls-permisos-usuarios.sql` | Reactiva y corrige el RLS de `permisos_usuarios` (lectura directa `usuario_id = auth.uid()`; escrituras solo por service role) |
| 033 | `033-producto-talla.sql` | Agrega columna opcional `talla` (text) a `productos` |
| 034 | `034-caja-movimientos-fecha.sql` | Agrega `fecha` (timestamptz) a `caja_chica_movimientos` en bases que se crearon sin ella (aditivo + backfill); sin ella la caja chica no registra movimientos y el Flujo de Caja ignora el efectivo |
| 035 | `035-consolidacion-bancaria.sql` | Consolidación Bancaria: tabla `consolidacion_saldos_iniciales` (override manual del saldo inicial del mes por cuenta) + RLS + módulo |
| — | `add-almacen-to-ventas-encabezado.sql` | Agrega `almacen_id` a ventas (aplicar tras 011) |

> **Huecos 006–008:** la numeración salta de 005 a 009. No faltan migraciones;
> los números simplemente no se usaron. El orden de arriba es el completo.

> **Nota sobre el script 014:** en la base actual las _columnas_ de cuentas
> por pagar (`fecha_vencimiento`, `monto_pagado`, `estado_pago` en `gastos`)
> sí existen, pero la tabla `gastos_pagos_detalle` **no** se creó. La app no
> la necesita (los abonos a gastos se reconstruyen desde
> `caja_chica_movimientos` y `cuenta_movimientos`), y el script 017 la omite
> si no existe. Si en el futuro quieres el historial de abonos en su propia
> tabla, aplica la parte `CREATE TABLE gastos_pagos_detalle` del script 014 y
> vuelve a correr el 017 (que entonces sí le pondrá RLS).

## Seguridad (RLS)

El aislamiento entre empresas depende de las políticas del script **017**.
Si recreas el proyecto o migras de entorno, **ejecuta 017** o los datos de
todas las empresas quedarán mezclados. Antes de aplicarlo, respalda las
políticas actuales (la consulta está documentada dentro del propio script).

## Consistencia de stock (RPC)

El script **018** crea las funciones `ajustar_stock` y `aplicar_entrada_compra`
que actualizan `stock_total` y `costo_promedio` de forma atómica, evitando la
pérdida de actualizaciones cuando dos ventas o recepciones del mismo producto
ocurren a la vez. Mientras no lo apliques, la app usa una ruta de respaldo
(lee-modifica-escribe, no concurrency-safe) que funciona igual pero sin la
garantía atómica. En cuanto ejecutes el 018, la app empieza a usar las
funciones automáticamente (sin cambios de código).

El script **026** agrega `fijar_costo_promedio` (SET absoluto del costo, para el
módulo Ajuste de Costo) y `recalcular_costo_ventas` (reescribe el costo
congelado de las ventas de un producto en un rango, de forma **transaccional**:
los tres UPDATE —`ventas_detalle`, `transacciones_inventario`,
`devoluciones_detalle`— corren todo-o-nada en el servidor). Sin el 026, el
módulo funciona en modo degradado: fallback JS best-effort (no atómico) y sin
bitácora.
