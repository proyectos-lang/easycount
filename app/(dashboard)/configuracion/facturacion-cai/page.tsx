"use client"

import { useEffect, useMemo, useState } from "react"
import { Receipt, Loader2, Save, AlertTriangle, Info, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { getHondurasTodayISODate } from "@/lib/utils/honduras-time"
import {
  getConfigsCai,
  saveConfigCai,
  nuevaConfigCai,
  formatearCorrelativoCai,
  foliosRestantes,
  fechaLimiteVencida,
  tipoDocumentoLabel,
  TIPOS_DOCUMENTO_CAI,
  type ConfigCai,
} from "@/lib/services/facturacion-cai"

export default function FacturacionCaiPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const activa = user?.flags?.facturacion_cai ?? false

  const [loading, setLoading] = useState(true)
  const [savingTipo, setSavingTipo] = useState<string | null>(null)
  // Config por tipo de documento (mapa codigo -> ConfigCai).
  const [configs, setConfigs] = useState<Record<string, ConfigCai>>({})

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const { data } = await getConfigsCai()
      if (!vivo) return
      const mapa: Record<string, ConfigCai> = {}
      for (const t of TIPOS_DOCUMENTO_CAI) mapa[t.codigo] = nuevaConfigCai(t.codigo)
      for (const c of data) mapa[c.tipo_documento] = c
      setConfigs(mapa)
      setLoading(false)
    })()
    return () => {
      vivo = false
    }
  }, [])

  function actualizar(tipo: string, cambios: Partial<ConfigCai>) {
    setConfigs((prev) => ({ ...prev, [tipo]: { ...prev[tipo], ...cambios } }))
  }

  async function guardar(tipo: string) {
    const cfg = configs[tipo]
    if (!cfg) return
    setSavingTipo(tipo)
    const { data, error } = await saveConfigCai(cfg)
    setSavingTipo(null)
    if (error || !data) {
      toast({ title: "No se pudo guardar", description: error ?? "Intenta de nuevo.", variant: "destructive" })
      return
    }
    setConfigs((prev) => ({ ...prev, [tipo]: data }))
    toast({ title: "Configuración guardada", description: `${tipoDocumentoLabel(tipo)}: datos CAI actualizados.` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
          <Receipt className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Facturación CAI</h1>
          <p className="text-sm text-muted-foreground">
            Configura los datos fiscales para emitir facturas oficiales del SAR (Honduras).
          </p>
        </div>
      </div>

      {!activa ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Lock className="h-8 w-8 text-stone-400" />
            <p className="max-w-md text-sm text-muted-foreground">
              La función <strong>Facturación CAI</strong> no está activada para tu empresa. Solicita al
              administrador de la plataforma que la habilite para poder emitir comprobantes fiscales.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="01">
          <TabsList>
            {TIPOS_DOCUMENTO_CAI.map((t) => (
              <TabsTrigger key={t.codigo} value={t.codigo}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TIPOS_DOCUMENTO_CAI.map((t) => (
            <TabsContent key={t.codigo} value={t.codigo}>
              <ConfigForm
                cfg={configs[t.codigo]}
                onChange={(c) => actualizar(t.codigo, c)}
                onSave={() => guardar(t.codigo)}
                saving={savingTipo === t.codigo}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

function ConfigForm({
  cfg,
  onChange,
  onSave,
  saving,
}: {
  cfg: ConfigCai
  onChange: (c: Partial<ConfigCai>) => void
  onSave: () => void
  saving: boolean
}) {
  const hoy = getHondurasTodayISODate()
  const restantes = foliosRestantes(cfg)
  const vencida = fechaLimiteVencida(cfg.fecha_limite_emision, hoy)

  const previewActual = useMemo(
    () => formatearCorrelativoCai(cfg.establecimiento, cfg.punto_emision, cfg.tipo_documento, cfg.correlativo_actual),
    [cfg.establecimiento, cfg.punto_emision, cfg.tipo_documento, cfg.correlativo_actual]
  )
  const previewInicial = formatearCorrelativoCai(cfg.establecimiento, cfg.punto_emision, cfg.tipo_documento, cfg.rango_inicial)
  const previewFinal = formatearCorrelativoCai(cfg.establecimiento, cfg.punto_emision, cfg.tipo_documento, cfg.rango_final)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{tipoDocumentoLabel(cfg.tipo_documento)} · Autorización del SAR</CardTitle>
        <CardDescription>
          Estos datos vienen de tu autorización de impresión del SAR (CAI). El nombre, RTN, dirección y teléfono del
          encabezado se toman de <strong>Configuración → Razón Social</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avisos */}
        {vencida && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>La fecha límite de emisión ya venció. Solicita una nueva autorización al SAR antes de facturar.</span>
          </div>
        )}
        {!vencida && cfg.rango_final > 0 && restantes <= 20 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Quedan {restantes} folios en el rango autorizado. Gestiona una nueva autorización pronto.</span>
          </div>
        )}

        {/* CAI */}
        <div className="grid gap-2">
          <Label htmlFor={`cai-${cfg.tipo_documento}`}>Clave de Autorización de Impresión (CAI)</Label>
          <Input
            id={`cai-${cfg.tipo_documento}`}
            value={cfg.cai}
            onChange={(e) => onChange({ cai: e.target.value })}
            placeholder="000000-000000-000000-000000-000000-00"
            className="font-mono"
          />
        </div>

        {/* Establecimiento / Punto / Preview */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor={`estab-${cfg.tipo_documento}`}>Establecimiento</Label>
            <Input
              id={`estab-${cfg.tipo_documento}`}
              value={cfg.establecimiento}
              onChange={(e) => onChange({ establecimiento: e.target.value.replace(/\D/g, "").slice(0, 3) })}
              placeholder="000"
              inputMode="numeric"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`punto-${cfg.tipo_documento}`}>Punto de emisión</Label>
            <Input
              id={`punto-${cfg.tipo_documento}`}
              value={cfg.punto_emision}
              onChange={(e) => onChange({ punto_emision: e.target.value.replace(/\D/g, "").slice(0, 3) })}
              placeholder="001"
              inputMode="numeric"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tipo de documento</Label>
            <Input value={`${cfg.tipo_documento} · ${tipoDocumentoLabel(cfg.tipo_documento)}`} disabled className="font-mono" />
          </div>
        </div>

        <div className="rounded-md border border-stone-200 bg-stone-50 p-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" /> Así se verá el número de factura:
          </div>
          <p className="mt-1 font-mono text-base text-stone-800">{previewActual}</p>
        </div>

        {/* Rango autorizado */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor={`ri-${cfg.tipo_documento}`}>Correlativo inicial</Label>
            <Input
              id={`ri-${cfg.tipo_documento}`}
              type="number"
              min={1}
              value={cfg.rango_inicial}
              onChange={(e) => onChange({ rango_inicial: Number(e.target.value) })}
            />
            <p className="font-mono text-[11px] text-muted-foreground">{previewInicial}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`rf-${cfg.tipo_documento}`}>Correlativo final</Label>
            <Input
              id={`rf-${cfg.tipo_documento}`}
              type="number"
              min={0}
              value={cfg.rango_final}
              onChange={(e) => onChange({ rango_final: Number(e.target.value) })}
            />
            <p className="font-mono text-[11px] text-muted-foreground">{previewFinal}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`ca-${cfg.tipo_documento}`}>Siguiente correlativo a emitir</Label>
            <Input
              id={`ca-${cfg.tipo_documento}`}
              type="number"
              min={1}
              value={cfg.correlativo_actual}
              onChange={(e) => onChange({ correlativo_actual: Number(e.target.value) })}
            />
            <p className="text-[11px] text-muted-foreground">
              {cfg.rango_final > 0 ? `${restantes} folios restantes` : "Define el rango para ver los folios"}
            </p>
          </div>
        </div>

        {/* Fecha límite */}
        <div className="grid gap-2 sm:max-w-xs">
          <Label htmlFor={`fl-${cfg.tipo_documento}`}>Fecha límite de emisión</Label>
          <Input
            id={`fl-${cfg.tipo_documento}`}
            type="date"
            value={cfg.fecha_limite_emision ?? ""}
            onChange={(e) => onChange({ fecha_limite_emision: e.target.value || null })}
          />
        </div>

        {/* Imprenta (modalidad por imprenta) */}
        <div className="space-y-4 rounded-md border border-stone-200 p-4">
          <p className="text-sm font-medium text-stone-700">Datos de la imprenta (opcional)</p>
          <p className="text-xs text-muted-foreground">
            Solo si emites por imprenta (formatos preimpresos). En modalidad de autoimpresor puedes dejarlos vacíos.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor={`in-${cfg.tipo_documento}`}>Nombre / razón social</Label>
              <Input
                id={`in-${cfg.tipo_documento}`}
                value={cfg.imprenta_nombre}
                onChange={(e) => onChange({ imprenta_nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`ir-${cfg.tipo_documento}`}>RTN</Label>
              <Input
                id={`ir-${cfg.tipo_documento}`}
                value={cfg.imprenta_rtn}
                onChange={(e) => onChange({ imprenta_rtn: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`ig-${cfg.tipo_documento}`}>N.º de registro (RFI)</Label>
              <Input
                id={`ig-${cfg.tipo_documento}`}
                value={cfg.imprenta_registro}
                onChange={(e) => onChange({ imprenta_registro: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Activo + Guardar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <Switch checked={cfg.activo} onCheckedChange={(v) => onChange({ activo: v })} />
            Autorización activa
          </label>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
