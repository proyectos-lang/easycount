import Link from "next/link"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEmpresaGestion } from "@/lib/services/gestion"
import { ETIQUETA_ESTADO_REUNION, ETIQUETA_METODO, ETIQUETA_MOTIVO, ETIQUETA_RESULTADO, ETIQUETA_TIPO_REUNION } from "@/lib/gestion/reglas"
import { datosGestion } from "../../datos"
import { BotonEditarEmpresa, BotonRegistrarPago, EliminarEmpresa, EliminarPago, NotaForm } from "../../_components/perfil-acciones"
import { CicloBadge, CobroBadge, EstadoBadge, Etiqueta, Panel, Vacio, fmtFecha, fmtFechaHora, fmtHora, fmtMoneda } from "../../_components/ui"
import type { GActividad } from "@/lib/services/gestion"

export const dynamic = "force-dynamic"

const TONO_ACT: Record<string, string> = { pago: "bg-emerald-500", activada: "bg-emerald-600", estado: "bg-amber-400", etapa: "bg-sky-500", reunion: "bg-stone-700", nota: "bg-violet-400", creada: "bg-stone-400", instalada: "bg-sky-400", fin_prueba: "bg-red-400" }

function Timeline({ items, vacio }: { items: GActividad[]; vacio: string }) {
  if (items.length === 0) return <Vacio titulo={vacio} />
  return (
    <ol className="relative ml-2 border-l border-stone-200 pl-4 space-y-3">
      {items.map((a) => (
        <li key={a.id} className="relative">
          <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${TONO_ACT[a.tipo] || "bg-stone-400"}`} />
          <p className="text-sm text-stone-800 whitespace-pre-wrap">{a.descripcion || a.tipo}</p>
          <p className="text-[11px] text-stone-400">{fmtFechaHora(a.fecha)}{a.usuario ? ` · ${a.usuario}` : ""}</p>
        </li>
      ))}
    </ol>
  )
}

function Dato({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-[11px] uppercase tracking-wide text-stone-500">{label}</p><p className="text-sm text-stone-800">{value || "—"}</p></div>
}

export default async function PerfilEmpresa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const n = Number(id)
  if (!Number.isFinite(n)) notFound()
  const [res, datos] = await Promise.all([getEmpresaGestion(n), datosGestion()])
  if (!res.data) {
    if (res.error === "Empresa no encontrada.") notFound()
    return null
  }
  const { empresa: e, pagos, reuniones, actividades } = res.data
  const config = datos.data?.config ?? { dias_prueba: 10, moneda: "L", planes: [], categorias_gasto: [], plantillas_recordatorio: [] }
  const hoy = datos.data?.hoy ?? new Date().toISOString().slice(0, 10)
  const m = e.moneda || config.moneda
  const esCliente = e.estado === "activo" || e.estado === "pago_pendiente"
  const notas = actividades.filter((a) => a.tipo === "nota")

  return (
    <div className="space-y-4">
      <Link href="/gestion/empresas" className="text-xs text-stone-500 hover:underline">← Empresas</Link>

      {/* Cabecera */}
      <div className="rounded-xl border bg-white p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-stone-800">{e.nombre}</h2>
              <EstadoBadge estado={e.estado} />
              {esCliente && <CobroBadge estado={e.estado_cobro} />}
            </div>
            <p className="mt-0.5 text-sm text-stone-500">{[e.nombre_comercial !== e.nombre ? e.nombre_comercial : null, e.dueno, e.ciudad].filter(Boolean).join(" · ") || "—"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {e.estado !== "cancelado" && <BotonRegistrarPago empresaId={e.id} />}
            <BotonEditarEmpresa empresa={e} config={config} hoy={hoy} />
            <EliminarEmpresa empresaId={e.id} nombre={e.nombre} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Dato label={e.ciclo_cobro === "anual" ? "Cuota anual" : "Cuota mensual"} value={<span className="tabular-nums font-semibold">{fmtMoneda(e.cuota, m)} <CicloBadge ciclo={e.ciclo_cobro} /></span>} />
          <Dato label="Próximo pago" value={esCliente ? fmtFecha(e.fecha_proximo_pago) : "—"} />
          <Dato label="Último pago" value={fmtFecha(e.ultimo_pago)} />
          <Dato label="Cliente desde" value={fmtFecha(e.fecha_instalacion || e.created_at)} />
        </div>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="pagos">Pagos <span className="ml-1 text-stone-400">{pagos.length}</span></TabsTrigger>
          <TabsTrigger value="reuniones">Reuniones <span className="ml-1 text-stone-400">{reuniones.length}</span></TabsTrigger>
          <TabsTrigger value="notas">Notas <span className="ml-1 text-stone-400">{notas.length}</span></TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-3 grid gap-4 lg:grid-cols-3">
          <Panel titulo="Información" className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-3">
              <Dato label="Dueño" value={e.dueno} /><Dato label="Contacto" value={e.contacto_principal} />
              <Dato label="Teléfono" value={e.telefono} /><Dato label="WhatsApp" value={e.whatsapp} />
              <Dato label="Correo" value={e.correo} /><Dato label="Redes" value={e.redes} />
              <Dato label="Ciudad" value={e.ciudad} /><Dato label="País" value={e.pais} />
              <Dato label="Sucursales" value={e.sucursales} /><Dato label="Empresa en EasyCount" value={e.razon_social_id ? `#${e.razon_social_id}` : null} />
            </div>
            {e.observaciones && <p className="mt-3 rounded-md bg-stone-50 p-2 text-xs text-stone-600 whitespace-pre-wrap">{e.observaciones}</p>}
          </Panel>
          <Panel titulo="Plan en EasyCount" className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-3">
              <Dato label="Plan" value={e.plan} /><Dato label="Ciclo" value={<CicloBadge ciclo={e.ciclo_cobro} />} />
              <Dato label="Cuota" value={<span className="tabular-nums">{fmtMoneda(e.cuota, m)}</span>} /><Dato label="Día de cobro" value={e.ciclo_cobro === "mensual" ? e.dia_cobro : "—"} />
              <Dato label="Instalación" value={fmtFecha(e.fecha_instalacion)} /><Dato label="Fin de prueba" value={fmtFecha(e.fin_prueba)} />
              <Dato label="Próximo pago" value={fmtFecha(e.fecha_proximo_pago)} /><Dato label="Total pagado" value={<span className="tabular-nums">{fmtMoneda(e.total_pagado, m)}</span>} />
              {e.motivo_perdida && <Dato label="Motivo de pérdida" value={ETIQUETA_MOTIVO[e.motivo_perdida]} />}
              {e.proxima_accion && <Dato label="Próxima acción" value={e.proxima_accion} />}
            </div>
          </Panel>
          <Panel titulo="Historial reciente" className="lg:col-span-1">
            <Timeline items={actividades.slice(0, 8)} vacio="Sin actividad todavía" />
          </Panel>
        </TabsContent>

        <TabsContent value="pagos" className="mt-3">
          <Panel titulo="Pagos" accion={e.estado !== "cancelado" ? <BotonRegistrarPago empresaId={e.id} /> : undefined}>
            {pagos.length === 0 ? <Vacio titulo="Sin pagos registrados" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                    <tr><th className="py-1.5 pr-3 font-medium">Fecha</th><th className="py-1.5 pr-3 font-medium">Método</th><th className="py-1.5 pr-3 font-medium">Cuenta</th><th className="py-1.5 pr-3 font-medium">Referencia</th><th className="py-1.5 pr-3 font-medium">Período</th><th className="py-1.5 pr-3 text-right font-medium">Monto</th><th className="py-1.5"></th></tr>
                  </thead>
                  <tbody>
                    {pagos.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 pr-3 tabular-nums">{fmtFecha(p.fecha)}</td>
                        <td className="py-2 pr-3">{ETIQUETA_METODO[p.metodo]}</td>
                        <td className="py-2 pr-3">{p.cuenta_nombre || "—"}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{p.referencia || "—"}</td>
                        <td className="py-2 pr-3 text-xs text-stone-500">{p.periodo_cubierto_desde ? `${fmtFecha(p.periodo_cubierto_desde)} – ${fmtFecha(p.periodo_cubierto_hasta)}` : "—"} <Etiqueta tono={p.ciclo_aplicado === "anual" ? "morado" : "gris"}>{p.ciclo_aplicado === "anual" ? "Anual" : "Mensual"}</Etiqueta></td>
                        <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmtMoneda(p.monto, m)}</td>
                        <td className="py-2 text-right"><EliminarPago pagoId={p.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="reuniones" className="mt-3">
          <Panel titulo="Reuniones" accion={<Link href={`/gestion/reuniones?empresa=${e.id}`} className="text-xs text-stone-500 underline underline-offset-4">Agendar / registrar resultado</Link>}>
            {reuniones.length === 0 ? <Vacio titulo="Sin reuniones" /> : (
              <ul className="divide-y">
                {reuniones.map((r) => (
                  <li key={r.id} className="py-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular-nums font-medium">{fmtFecha(r.fecha)} {fmtHora(r.hora)}</span>
                      <span className="text-stone-500">{ETIQUETA_TIPO_REUNION[r.tipo]} · {r.contacto || "—"}</span>
                      <Etiqueta tono={r.resultado ? (r.resultado === "no_interesado" ? "rojo" : r.resultado === "cliente_confirmado" ? "verde" : "azul") : "gris"}>
                        {r.resultado ? ETIQUETA_RESULTADO[r.resultado] : ETIQUETA_ESTADO_REUNION[r.estado]}
                      </Etiqueta>
                      {r.motivo_perdida && <span className="text-xs text-red-700">{ETIQUETA_MOTIVO[r.motivo_perdida]}</span>}
                    </div>
                    {(r.proximo_paso || r.notas) && <p className="mt-0.5 text-xs text-stone-500">{[r.proximo_paso && `Próximo paso: ${r.proximo_paso}`, r.notas].filter(Boolean).join(" · ")}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="notas" className="mt-3 grid gap-4 lg:grid-cols-3">
          <Panel titulo="Nueva nota" className="lg:col-span-1"><NotaForm empresaId={e.id} /></Panel>
          <Panel titulo="Notas" className="lg:col-span-2"><Timeline items={notas} vacio="Sin notas" /></Panel>
        </TabsContent>

        <TabsContent value="actividad" className="mt-3">
          <Panel titulo="Actividad" descripcion="Bitácora automática: creación, instalación, prueba, activación, pagos, cambios de estado y reuniones."><Timeline items={actividades} vacio="Sin actividad" /></Panel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
