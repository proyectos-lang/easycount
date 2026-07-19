# EasyCount — Guía para el desarrollo

ERP/POS multi-empresa: Next.js 16 (App Router) + Supabase. Español de Honduras
(Lempiras, RTN, ISV 15 %). Detalles de arquitectura en `README.md` y esquema de
BD en `docs/DATABASE.md`.

## Reglas del proyecto

- **Multi-tenant**: toda query filtra por `razon_social_id`; todo insert lleva
  el sello de `getTenantStamp` (`lib/services/tenant-stamp.ts`). Toda tabla
  nueva recibe política RLS (patrón de `scripts/017-rls-policies.sql`).
- **Scripts SQL estrictamente aditivos**: solo `CREATE TABLE` de tablas nuevas,
  `CREATE POLICY` sobre ellas e `INSERT` de datos. **Nunca `ALTER`/`DROP`
  sobre tablas existentes** ni renombrar columnas.
- **Stock/costo**: nunca leer-modificar-escribir `productos.stock_total` o
  `costo_promedio`; usar `ajustarStock` / `aplicarEntradaCompra`
  (`lib/services/stock.ts`).
- **Exports**: siempre `.xlsx` vía `exportToXlsx` (`lib/utils/export.ts`).
  Nunca CSV. Moneda con `formatCurrency` (`lib/utils/format.ts`).
- **Verificación mínima** antes de commit: `npx tsc --noEmit`, `pnpm lint`,
  `pnpm build` limpios.

## Checklist al AGREGAR un módulo nuevo

1. Página en `app/(dashboard)/<ruta>/page.tsx` + servicios en `lib/services/`.
2. Entrada en `MODULOS` (`lib/constants/modulos.ts`) — actualizar el conteo
   del comentario.
3. `INSERT INTO modulos (nombre) ... ON CONFLICT DO NOTHING` en un script
   `scripts/NNN-*.sql` (el `nombre` debe calzar EXACTO con la constante).
4. **Tutorial en el Centro de Aprendizaje**: agregar el `TutorialModulo` en el
   `lib/aprendizaje/contenido-<categoria>.ts` correspondiente (`modulo` =
   `nombre` exacto de MODULOS). Si falta, la página `/aprendizaje` muestra un
   banner de cobertura a los admins.

## Checklist al CAMBIAR una función existente

- Si cambia el comportamiento visible de un módulo (nuevos pasos, límites,
  mensajes), **actualizar su tutorial** en `lib/aprendizaje/` en el mismo
  commit: `queHace`/`queNoHace`, `operaciones`, `faqs` y `keywords`.
- Si cambia el esquema de BD, actualizar `docs/DATABASE.md` y
  `scripts/README.md`.
