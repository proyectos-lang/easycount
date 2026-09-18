"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Link2, Loader2, CheckCircle2, Copy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"
import { getProductos, type Producto } from "@/lib/services/catalogos"
import { crearLink } from "@/lib/services/pedidos"

const TODOS = "__todos__"

export default function NuevoLinkCatalogoPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [saving, setSaving] = React.useState(false)
  const [nombre, setNombre] = React.useState("")
  const [tipo, setTipo] = React.useState<"completo" | "seleccion">("completo")
  const [dias, setDias] = React.useState("7")
  const [linkCreado, setLinkCreado] = React.useState<string | null>(null)

  // Productos + selección
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [cargandoProd, setCargandoProd] = React.useState(false)
  const [seleccion, setSeleccion] = React.useState<Set<number>>(new Set())

  // Filtros
  const [filtro, setFiltro] = React.useState("")
  const [fMarca, setFMarca] = React.useState(TODOS)
  const [fCategoria, setFCategoria] = React.useState(TODOS)
  const [fSubcategoria, setFSubcategoria] = React.useState(TODOS)
  const [fTalla, setFTalla] = React.useState(TODOS)

  // Carga productos al elegir 'seleccion'.
  React.useEffect(() => {
    if (tipo === "seleccion" && productos.length === 0 && !cargandoProd) {
      setCargandoProd(true)
      getProductos().then((r) => { setProductos(r.data || []); setCargandoProd(false) })
    }
  }, [tipo, productos.length, cargandoProd])

  // Opciones de cada dimensión, derivadas de los productos cargados.
  const opciones = React.useMemo(() => {
    const marcas = new Map<number, string>()
    const categorias = new Map<number, string>()
    const tallas = new Set<string>()
    for (const p of productos) {
      if (p.marca_id != null && p.marca_nombre) marcas.set(p.marca_id, p.marca_nombre)
      if (p.categoria_id != null && p.categoria_nombre) categorias.set(p.categoria_id, p.categoria_nombre)
      if (p.talla) tallas.add(p.talla)
    }
    return {
      marcas: Array.from(marcas, ([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
      categorias: Array.from(categorias, ([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
      tallas: Array.from(tallas).sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    }
  }, [productos])

  // Subcategorías: en cascada de la categoría elegida (o todas si no hay categoría).
  const subcategoriasOpts = React.useMemo(() => {
    const m = new Map<number, string>()
    for (const p of productos) {
      if (fCategoria !== TODOS && String(p.categoria_id) !== fCategoria) continue
      if (p.subcategoria_id != null && p.subcategoria_nombre) m.set(p.subcategoria_id, p.subcategoria_nombre)
    }
    return Array.from(m, ([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
  }, [productos, fCategoria])

  // Al cambiar categoría, si la subcategoría elegida ya no aplica, se resetea.
  React.useEffect(() => {
    if (fSubcategoria !== TODOS && !subcategoriasOpts.some((s) => String(s.id) === fSubcategoria)) {
      setFSubcategoria(TODOS)
    }
  }, [subcategoriasOpts, fSubcategoria])

  // Productos que pasan TODOS los filtros.
  const productosFiltradosTodos = React.useMemo(() => {
    const q = filtro.trim().toLowerCase()
    return productos.filter((p) => {
      if (q && !((p.nombre || "").toLowerCase().includes(q) || (p.codigo_barras || "").toLowerCase().includes(q))) return false
      if (fMarca !== TODOS && String(p.marca_id) !== fMarca) return false
      if (fCategoria !== TODOS && String(p.categoria_id) !== fCategoria) return false
      if (fSubcategoria !== TODOS && String(p.subcategoria_id) !== fSubcategoria) return false
      if (fTalla !== TODOS && p.talla !== fTalla) return false
      return true
    })
  }, [productos, filtro, fMarca, fCategoria, fSubcategoria, fTalla])

  // Visible con tope por rendimiento.
  const productosFiltrados = React.useMemo(() => productosFiltradosTodos.slice(0, 200), [productosFiltradosTodos])

  const todosFiltradosSeleccionados =
    productosFiltradosTodos.length > 0 && productosFiltradosTodos.every((p) => seleccion.has(p.id!))

  const hayFiltroActivo = filtro.trim() !== "" || fMarca !== TODOS || fCategoria !== TODOS || fSubcategoria !== TODOS || fTalla !== TODOS

  function toggle(id: number) {
    setSeleccion((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function toggleTodosFiltrados() {
    setSeleccion((prev) => {
      const next = new Set(prev)
      if (todosFiltradosSeleccionados) productosFiltradosTodos.forEach((p) => next.delete(p.id!))
      else productosFiltradosTodos.forEach((p) => next.add(p.id!))
      return next
    })
  }
  function limpiarFiltros() {
    setFiltro(""); setFMarca(TODOS); setFCategoria(TODOS); setFSubcategoria(TODOS); setFTalla(TODOS)
  }

  async function guardar() {
    setSaving(true)
    const res = await crearLink({
      nombre,
      tipo,
      producto_ids: tipo === "seleccion" ? Array.from(seleccion) : undefined,
      dias_vigencia: dias === "" ? null : Number(dias),
    })
    setSaving(false)
    if (res.error || !res.data) {
      toast({ title: "Error", description: res.error || "No se pudo crear", variant: "destructive" })
      return
    }
    const url = `${window.location.origin}/catalogo/${res.data.token}`
    setLinkCreado(url)
    navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/ventas/pedidos")}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Nuevo link de catálogo</h1>
          <p className="text-sm text-muted-foreground">Comparte el link con tu cliente; podrá armar su carrito y enviarte el pedido.</p>
        </div>
      </div>

      {linkCreado ? (
        <Card className="rounded-xl border-emerald-200">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm text-emerald-800 font-medium">Link creado y copiado al portapapeles</p>
            <p className="text-xs font-mono break-all text-stone-600 bg-stone-50 rounded-lg border border-stone-200 p-3">{linkCreado}</p>
            <div className="flex justify-center gap-2 pt-1">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(linkCreado)}><Copy className="h-4 w-4 mr-1" /> Copiar de nuevo</Button>
              <Button onClick={() => router.push("/ventas/pedidos")}>Ir a los links</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Datos del link */}
          <Card className="rounded-xl border-stone-200">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-base md:text-lg">Datos del link</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="link-nombre">Referencia interna</Label>
                <Input id="link-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Catálogo Doña María - julio" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                <div className="grid gap-2">
                  <Label>Tipo de catálogo</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as "completo" | "seleccion")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completo">Catálogo completo</SelectItem>
                      <SelectItem value="seleccion">Seleccionar productos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link-dias">Vigencia (días)</Label>
                  <Input id="link-dias" type="number" min={1} value={dias} onChange={(e) => setDias(e.target.value)} placeholder="Sin límite" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de productos */}
          {tipo === "seleccion" && (
            <Card className="rounded-xl border-stone-200">
              <CardHeader className="p-4 md:p-6 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg">Productos del catálogo</CardTitle>
                    <CardDescription className="text-xs">Filtra por dimensión y marca lo que incluirá el catálogo.</CardDescription>
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0">{seleccion.size} seleccionados</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                {/* Filtros. Cada celda es min-w-0 + w-full para que el texto
                    largo de un select no lo agrande ni se monte sobre el vecino. */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                  <div className="relative col-span-2 lg:col-span-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input className="pl-9 h-9 w-full border-stone-300" placeholder="Nombre o código…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <Select value={fMarca} onValueChange={setFMarca}>
                      <SelectTrigger className="h-9 w-full border-stone-300"><SelectValue placeholder="Marca" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TODOS}>Todas las marcas</SelectItem>
                        {opciones.marcas.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0">
                    <Select value={fCategoria} onValueChange={setFCategoria}>
                      <SelectTrigger className="h-9 w-full border-stone-300"><SelectValue placeholder="Categoría" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TODOS}>Todas las categorías</SelectItem>
                        {opciones.categorias.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0">
                    <Select value={fSubcategoria} onValueChange={setFSubcategoria} disabled={subcategoriasOpts.length === 0}>
                      <SelectTrigger className="h-9 w-full border-stone-300"><SelectValue placeholder="Subcategoría" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TODOS}>Todas las subcategorías</SelectItem>
                        {subcategoriasOpts.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0">
                    <Select value={fTalla} onValueChange={setFTalla} disabled={opciones.tallas.length === 0}>
                      <SelectTrigger className="h-9 w-full border-stone-300"><SelectValue placeholder="Talla" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TODOS}>Todas las tallas</SelectItem>
                        {opciones.tallas.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hayFiltroActivo && (
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-stone-500" onClick={limpiarFiltros}>
                    <X className="h-3.5 w-3.5" /> Limpiar filtros
                  </Button>
                )}

                {cargandoProd ? (
                  <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
                ) : (
                  <>
                    {productosFiltradosTodos.length > 0 && (
                      <label className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-stone-50 cursor-pointer border border-stone-200">
                        <Checkbox checked={todosFiltradosSeleccionados} onCheckedChange={toggleTodosFiltrados} />
                        <span className="text-sm font-medium flex-1">
                          {todosFiltradosSeleccionados ? "Quitar todo lo filtrado" : "Seleccionar todo lo filtrado"}
                        </span>
                        <span className="text-xs text-muted-foreground">{productosFiltradosTodos.length}</span>
                      </label>
                    )}
                    <ScrollArea className="h-[46vh] rounded-md border">
                      <div className="p-2 space-y-1">
                        {productosFiltrados.length === 0 ? (
                          <p className="text-sm text-stone-400 text-center py-8">Sin productos que coincidan con el filtro.</p>
                        ) : productosFiltrados.map((p) => (
                          <label key={p.id} className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-stone-50 cursor-pointer">
                            <Checkbox className="mt-0.5 shrink-0" checked={seleccion.has(p.id!)} onCheckedChange={() => toggle(p.id!)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm break-words leading-tight">{p.nombre}{p.talla ? ` · Talla ${p.talla}` : ""}</p>
                              <p className="text-[11px] text-stone-400 truncate">
                                {[p.marca_nombre, p.categoria_nombre, p.subcategoria_nombre].filter(Boolean).join(" · ") || "—"}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{formatCurrency(Number(p.precio_venta_sugerido || 0))}</span>
                          </label>
                        ))}
                        {productosFiltradosTodos.length > productosFiltrados.length && (
                          <p className="text-[11px] text-stone-400 text-center py-2">
                            Mostrando {productosFiltrados.length} de {productosFiltradosTodos.length}. Afina el filtro o usa &quot;Seleccionar todo lo filtrado&quot;.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/ventas/pedidos")} disabled={saving}>Cancelar</Button>
            <Button onClick={guardar} disabled={saving || (tipo === "seleccion" && seleccion.size === 0)}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Link2 className="h-4 w-4 mr-1" />}
              Generar link
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
