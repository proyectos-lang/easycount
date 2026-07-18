# EasyCount

Sistema ERP / Punto de Venta **multi-empresa** para pequeños y medianos negocios (orientado a Honduras: RTN, Lempiras, zona horaria de Honduras). Cubre el ciclo completo: ventas, compras, inventario, finanzas (caja chica, gastos, cierre diario, estado de resultados) y configuración de catálogos.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (Radix), lucide-react, Recharts, sonner |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage) |
| IA | Google Gemini (`@google/generative-ai`) — lectura automática de facturas |
| Reportes | jsPDF + jspdf-autotable (PDF), xlsx (Excel) |
| Hosting | Vercel (con `@vercel/analytics`) |

## Arquitectura

- **App Router con grupo `(dashboard)`**: [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx) monta el sidebar ([components/erp-sidebar.tsx](components/erp-sidebar.tsx)), el `AuthProvider` y el `RouteGuard`.
- **Multi-tenant por `razon_social_id`**: casi todas las tablas llevan la columna `razon_social_id`. El servicio [lib/services/tenant-stamp.ts](lib/services/tenant-stamp.ts) "estampa" cada insert con el tenant del usuario logueado y los queries filtran por él.
- **Autenticación**: Supabase Auth. El perfil vive en la tabla `usuarios` (uuid = id de `auth.users`) con rol y empresa. Contexto en [lib/contexts/auth-context.tsx](lib/contexts/auth-context.tsx).
- **Permisos granulares**: 23 módulos definidos en [lib/constants/modulos.ts](lib/constants/modulos.ts) (fuente única de verdad, espejo de la tabla `modulos`). La tabla `permisos_usuarios` define qué módulo puede ver cada usuario; [components/route-guard.tsx](components/route-guard.tsx) protege las rutas.
- **Capa de servicios**: toda la lógica de datos vive en [lib/services/](lib/services/) (un archivo por dominio: ventas, compras, inventario, caja-chica, gastos, etc.). Los componentes de página son clientes que consumen estos servicios.
- **Modo demo sin Supabase**: si faltan las variables de entorno, los servicios caen a `localStorage` para poder probar la UI sin backend.
- **Server Actions / API**: creación de usuarios con la service-role key ([app/(dashboard)/configuracion/usuarios/actions.ts](app/(dashboard)/configuracion/usuarios/actions.ts)), subida de imágenes a Supabase Storage ([app/api/upload-imagen/route.ts](app/api/upload-imagen/route.ts)) y extracción de facturas con Gemini ([app/api/procesar-factura/route.ts](app/api/procesar-factura/route.ts)) — la API key de Gemini vive solo en el servidor.

## Módulos funcionales

### Ventas
- **Nueva Venta** (`/ventas/nueva`): POS con catálogo de productos, descuento, impuesto (15% por defecto), correlativo de factura y **pago multi-método** (efectivo, banco, link de pago, crédito) con snapshot de comisión bancaria por cuenta. El pago en efectivo ingresa a la caja chica abierta; el pago por banco genera movimiento en la cuenta.
- **Historial Ventas** (`/ventas/historial`): consulta, detalle y factura PDF.
- **Cuentas por Cobrar / Pagos** (`/ventas/pagos`, `/ventas/cuentas-por-cobrar`): abonos a ventas al crédito (`pagos_ventas`), actualizando `valorpago` y `estado_pago`.
- **Dashboard Ventas** (`/ventas/dashboard`): analítica de ventas (Recharts).

### Compras
- **Orden de Compra** (`/compras/orden`): órdenes en LPS o USD con tasa de cambio, costos de importación, impuestos y otros costos que se prorratean al costo final local.
- **Recepción por OC** (`/compras/recepcion`): recibe cantidades contra la orden, genera transacciones de inventario tipo "Entrada Compra" y recalcula el **costo promedio ponderado** del producto.
- **Recepción por Factura (IA)** (`/compras/recepcion-ia`): sube una foto/PDF de factura y Gemini extrae proveedor y líneas para ingresarlas al inventario.

### Inventario
- Modelo **kardex**: la tabla `transacciones_inventario` es el libro mayor; el stock es la suma de cantidades (positivas/negativas) por producto, almacén y localización (vista `vista_stock_por_localizacion`).
- **Kardex** (`/inventario/kardex`), **Ingreso Manual** (`/inventario/ingreso`), **Traslados** entre almacenes/localizaciones (`/inventario/traslados`) y **Valoración** al costo promedio (`/inventario/valoracion`).

### Finanzas
- **Caja Chica** (`/finanzas/caja-chica`): sesiones de apertura/cierre (una abierta por empresa, garantizada por índice único parcial), movimientos con saldo corriente, transferencias a banco y arqueo con diferencia.
- **Gastos / Cuentas por Pagar** (`/finanzas/gastos`): gastos por concepto (con categoría macro: Servicios, Publicidad, Nómina, Arriendo, Otros), facturas de proveedor con vencimiento y abonos parciales (`gastos_pagos_detalle`).
- **Cierre Diario** (`/finanzas/cierre-diario`): resumen del día — ventas, cobros por método, comisiones bancarias y estado de la caja (vista `vista_cierre_diario`).
- **Estado de Resultados** (`/finanzas/estado-resultados`): P&L mensual — ventas, CMV (costo promedio al momento de la venta), utilidad bruta, gastos por categoría y utilidad neta (vista `vista_estado_resultados_mensual`).

### Configuración
Razón Social (empresa, logo), Usuarios y Permisos, Productos (marca/categoría/subcategoría, código de barras, foto), Almacenes y localizaciones, Clientes (con cumpleaños — [lib/utils/cumpleanos.ts](lib/utils/cumpleanos.ts)), Proveedores, Cuentas Bancarias (con % comisión) y Previsualización de PDFs.

## Base de datos

El esquema completo (tablas, vistas, relaciones) está documentado en [docs/DATABASE.md](docs/DATABASE.md). Los scripts SQL de migración están en [scripts/](scripts/) y se ejecutan en orden en el SQL Editor de Supabase.

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local   # completar con tus llaves de Supabase / Gemini
pnpm dev                     # http://localhost:3000
```

Variables de entorno (ver [.env.example](.env.example)):

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server-side: crear usuarios desde Configuración |
| `GEMINI_API_KEY` | Solo server-side: recepción de facturas con IA (`/api/procesar-factura`) |

Sin variables configuradas la app corre en **modo demo** con `localStorage`.

## Despliegue en Vercel

1. Subir el repo a GitHub/GitLab (`git push`).
2. En [vercel.com](https://vercel.com) → **Add New Project** → importar el repo. Vercel detecta Next.js automáticamente (no requiere configuración extra; usa pnpm por el `pnpm-lock.yaml`).
3. Agregar las 4 variables de entorno en **Settings → Environment Variables** (Production y Preview).
4. Deploy. Cada `git push` a `main` genera un deploy de producción; los branches generan previews.
