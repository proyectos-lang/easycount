import {
  getResumenEmpresas,
  getDbStats,
  getSupabaseProjectStatus,
} from "@/lib/services/plataforma"
import { FlagToggle } from "./flag-toggle"
import type { FeatureFlags } from "@/lib/constants/feature-flags"
import { RrhhToggle } from "./rrhh-toggle"
import { LogoutButton } from "./logout-button"
import { CrearEmpresaDialog } from "./crear-empresa"
import { GestionUsuariosDialog } from "./gestion-usuarios"
import { GestionModulosDialog } from "./gestion-modulos"

export const dynamic = "force-dynamic"

// ---- helpers de formato (server-side) ----
function fmtNum(n: number): string {
  return (n || 0).toLocaleString("es-HN")
}
function fmtBytes(b: number): string {
  if (!b) return "0 B"
  const u = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1)
  return `${(b / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`
}
function haceCuanto(s: string | null): string {
  if (!s) return "nunca"
  const ms = Date.now() - new Date(s).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return "hace instantes"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `hace ${d} d`
  const mo = Math.floor(d / 30)
  return `hace ${mo} mes${mo > 1 ? "es" : ""}`
}
function activaReciente(s: string | null): boolean {
  if (!s) return false
  return Date.now() - new Date(s).getTime() < 30 * 24 * 60 * 60 * 1000 // < 30 dias
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-stone-400">{sub}</p>}
    </div>
  )
}

/** Funciones por empresa que se encienden/apagan en la tabla (una columna cada una). */
const FUNCIONES: { clave: string; flag: keyof FeatureFlags | null; corto: string; ayuda: string; on: string; off: string }[] = [
  { clave: "isv", flag: "ventas_mostrar_isv", corto: "ISV en ventas", ayuda: "Mostrar el ISV (15%) en Nueva Venta para esta empresa", on: "se muestra", off: "oculto" },
  { clave: "codigo", flag: "tirilla_mostrar_codigo", corto: "Código en tirilla", ayuda: "Imprimir el código del producto bajo su nombre en la tirilla térmica", on: "sí", off: "no" },
  { clave: "lector", flag: "ventas_lector_codigo_barras", corto: "Lector código", ayuda: "Lector de código de barras en Nueva Venta (escanear = ubicar/agregar)", on: "activo", off: "inactivo" },
  { clave: "tallas", flag: "productos_por_talla", corto: "Tallas", ayuda: "Productos por talla: check 'tiene tallas' al crear + agrupamiento de tallas en Productos e Inventario", on: "activo", off: "inactivo" },
  { clave: "rapida", flag: "venta_rapida", corto: "Venta rápida", ayuda: "En Nueva Venta, agregar una línea con descripción y precio a mano, sin afectar inventario", on: "activo", off: "inactivo" },
  { clave: "cai", flag: "facturacion_cai", corto: "Factura CAI", ayuda: "Habilita el módulo 'Facturación CAI' en Configuración para emitir facturas oficiales del SAR (Honduras)", on: "activo", off: "inactivo" },
  { clave: "bloqueo", flag: "ventas_bloquear_precio_descuento", corto: "Bloq. precio/desc.", ayuda: "Bloquea la edición del precio por línea y el descuento en Nueva Venta para los usuarios NO admin", on: "bloqueado", off: "libre" },
  { clave: "caja", flag: "caja_ocultar_saldo", corto: "Ocultar saldo caja", ayuda: "Oculta el saldo y los montos de Caja Chica a los usuarios NO admin (cierre a ciegas); el admin ve todo", on: "oculto", off: "visible" },
  { clave: "bancos", flag: "cierre_ocultar_saldo_banco", corto: "Ocultar saldo bancos", ayuda: "En los imprimibles del Cierre Diario oculta el SALDO FINAL de cada banco; los movimientos sí se muestran", on: "oculto", off: "visible" },
  { clave: "retiro", flag: "ventas_orden_retiro_bodega", corto: "Orden retiro bodega", ayuda: "Al imprimir la tirilla de una venta, imprime también la 'ORDEN DE RETIRO EN BODEGA' con el mismo número de factura", on: "activo", off: "inactivo" },
  { clave: "rrhh", flag: null, corto: "RRHH", ayuda: "Enciende o apaga de un clic los 5 módulos de RRHH (Empleados, Asistencia, Novedades, Nómina, Parámetros RRHH)", on: "activo", off: "apagado" },
]

export default async function PlataformaPage() {
  const [empRes, dbRes, proj] = await Promise.all([
    getResumenEmpresas(),
    getDbStats(),
    getSupabaseProjectStatus(),
  ])

  const empresas = empRes.data
  const db = dbRes.data
  const err = empRes.error || dbRes.error

  const totUsuarios = empresas.reduce((a, e) => a + e.usuarios, 0)
  const activas = empresas.filter((e) => activaReciente(e.ultima_conexion)).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de la plataforma</h1>
          <p className="mt-1 text-sm text-stone-500">
            Todas las empresas del sistema, sus métricas de uso y el estado de la base de datos.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CrearEmpresaDialog />
          <LogoutButton />
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err} {" · "}
          <span className="text-red-500">
            ¿Aplicaste <code>scripts/037-plataforma-admin.sql</code> y está configurado
            <code> SUPABASE_SERVICE_ROLE_KEY</code>?
          </span>
        </div>
      )}

      {/* KPIs globales (administracion: sin datos de ventas ni inventario) */}
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Empresas" value={fmtNum(empresas.length)} sub={`${activas} activas (30 d)`} />
        <Kpi label="Usuarios" value={fmtNum(totUsuarios)} />
        <Kpi label="Tamaño BD" value={db ? fmtBytes(db.db_bytes) : "—"} />
      </div>

      {/* Estado de la base de datos */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Estado de la base de datos</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 py-4 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-stone-500">Tamaño</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">{db ? fmtBytes(db.db_bytes) : "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-stone-500">Conexiones</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {db ? `${db.conexiones} / ${db.conexiones_max}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-stone-500">Estado del proyecto</p>
            {proj.configured ? (
              proj.error ? (
                <p className="mt-0.5 text-lg font-semibold text-amber-600">{proj.error}</p>
              ) : (
                <p className="mt-0.5 text-lg font-semibold text-emerald-700">
                  {proj.status || "OK"}
                  {proj.region ? <span className="ml-1 text-xs font-normal text-stone-400">· {proj.region}</span> : null}
                </p>
              )
            ) : (
              <p className="mt-0.5 text-xs text-stone-400">
                Agrega <code>SUPABASE_ACCESS_TOKEN</code> para ver el estado del proyecto (el
                project ref se toma de la URL).
              </p>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-stone-500">Totales</p>
            <p className="mt-0.5 text-sm text-stone-600">
              {db ? `${fmtNum(db.empresas)} empresas · ${fmtNum(db.usuarios)} usuarios` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de empresas (compacta): empresa fija a la izquierda, una
          columna por función con su interruptor y cuántas la tienen activa. */}
      <div className="rounded-lg border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
          <h2 className="text-sm font-semibold">Empresas ({empresas.length})</h2>
          <p className="text-[11px] text-stone-400">Pasa el mouse sobre cada función para ver qué hace · verde = activa</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-stone-500">
              <tr className="bg-stone-50">
                <th className="sticky left-0 z-20 border-b bg-stone-50 px-2 py-1.5 text-left font-medium">Empresa</th>
                <th className="border-b px-2 py-1.5 text-left font-medium whitespace-nowrap">Uso</th>
                <th className="border-b px-2 py-1.5 text-left font-medium">Gestión</th>
                {FUNCIONES.map((f) => {
                  const activas = empresas.filter((e) => (f.flag ? e.flags[f.flag] : e.rrhh_activo)).length
                  return (
                    <th key={f.clave} title={f.ayuda} className="cursor-help border-b px-1.5 py-1.5 text-center align-bottom font-medium">
                      <span className="block min-w-[3.5rem] max-w-[5.5rem] mx-auto leading-tight normal-case text-[10.5px] text-stone-600">{f.corto}</span>
                      <span className="mt-0.5 block font-normal tabular-nums text-stone-400">{activas}/{empresas.length}</span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan={3 + FUNCIONES.length} className="px-4 py-10 text-center text-stone-400">
                    Sin empresas para mostrar.
                  </td>
                </tr>
              ) : (
                empresas.map((e, i) => {
                  const fondo = i % 2 ? "bg-stone-50/70" : "bg-white"
                  return (
                    <tr key={e.id} className={`group ${fondo} hover:bg-amber-50/60`}>
                      <td className={`sticky left-0 z-10 border-b px-2 py-1.5 ${fondo} group-hover:bg-amber-50 shadow-[1px_0_0_0_#e7e5e4]`}>
                        <div className="flex items-center gap-1.5 min-w-[11rem] max-w-[15rem]">
                          <span
                            className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${activaReciente(e.ultima_conexion) ? "bg-emerald-500" : "bg-stone-300"}`}
                            title={activaReciente(e.ultima_conexion) ? "Activa (conexión en los últimos 30 días)" : "Inactiva"}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-stone-800" title={e.nombre}>
                              {e.nombre} <span className="font-normal text-[10px] text-stone-300">#{e.id}</span>
                            </p>
                            <p className="truncate text-[10px] text-stone-400">
                              {[e.comercial && e.comercial !== e.nombre ? e.comercial : null, e.rtn ? `RTN ${e.rtn}` : null].filter(Boolean).join(" · ") || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b px-2 py-1.5 whitespace-nowrap text-stone-600" title={e.ultima_conexion || "Sin conexiones"}>
                        <span className="tabular-nums">{e.usuarios}</span>
                        <span className="text-stone-400"> ({e.usuarios_activos}) usr</span>
                        <span className="block text-[10px] text-stone-400">{haceCuanto(e.ultima_conexion)}</span>
                      </td>
                      <td className="border-b px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <GestionUsuariosDialog razonSocialId={e.id} empresaNombre={e.nombre} />
                          <GestionModulosDialog razonSocialId={e.id} empresaNombre={e.nombre} />
                        </div>
                      </td>
                      {FUNCIONES.map((f) => (
                        <td key={f.clave} className="border-b px-1.5 py-1.5 text-center">
                          {f.flag ? (
                            <FlagToggle compacto razonSocialId={e.id} flag={f.flag} initial={e.flags[f.flag]} onLabel={`${f.corto}: ${f.on}`} offLabel={`${f.corto}: ${f.off}`} />
                          ) : (
                            <RrhhToggle compacto razonSocialId={e.id} initial={e.rrhh_activo} />
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-stone-400">
        Ingreso del mes = suma de <code>total_venta</code> del mes en curso. Inventario = Σ (stock × costo
        promedio). Última conexión = último <code>last_sign_in_at</code> de los usuarios de la empresa.
      </p>
    </div>
  )
}
