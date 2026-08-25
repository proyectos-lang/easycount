"use client"

import { use, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  ShoppingCart, Search, Plus, Minus, Send, PackageX, CheckCircle2,
  ImageIcon, Loader2, LinkIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/format"

interface ProductoCatalogo {
  id: number
  nombre: string
  foto_url: string | null
  precio: number
  talla?: string | null
  disponible: boolean
  max: number
}

interface CatalogoData {
  empresa: { nombre: string; logo_url: string | null; telefono: string | null }
  link: { nombre: string | null; tipo: string }
  productos: ProductoCatalogo[]
}

function FotoProducto({ url, nombre }: { url: string | null; nombre: string }) {
  const [error, setError] = useState(false)
  if (!url || error) {
    return (
      <div className="w-full h-32 bg-stone-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-stone-300" />
      </div>
    )
  }
  return (
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-stone-100">
      <Image src={url} alt={nombre} fill className="object-cover" unoptimized onError={() => setError(true)} />
    </div>
  )
}

export default function CatalogoPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [invalido, setInvalido] = useState<string | null>(null)
  const [data, setData] = useState<CatalogoData | null>(null)
  const [busqueda, setBusqueda] = useState("")

  // Carrito: producto_id -> cantidad
  const [carrito, setCarrito] = useState<Record<number, number>>({})

  // Formulario de envío
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [notas, setNotas] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState<{ numero_pedido: string; total: number } | null>(null)

  useEffect(() => {
    fetch(`/api/catalogo/${token}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) {
          setInvalido(json.error || "Link inválido")
        } else {
          setData(json)
        }
      })
      .catch(() => setInvalido("No se pudo cargar el catálogo"))
      .finally(() => setLoading(false))
  }, [token])

  const productosFiltrados = useMemo(() => {
    if (!data) return []
    const q = busqueda.trim().toLowerCase()
    if (!q) return data.productos
    return data.productos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [data, busqueda])

  const items = useMemo(() => {
    if (!data) return []
    return Object.entries(carrito)
      .map(([id, cant]) => {
        const p = data.productos.find((x) => x.id === Number(id))
        return p && cant > 0 ? { producto: p, cantidad: cant } : null
      })
      .filter((x): x is { producto: ProductoCatalogo; cantidad: number } => x !== null)
  }, [carrito, data])

  const totalCarrito = items.reduce((a, i) => a + i.cantidad * i.producto.precio, 0)
  const cantidadItems = items.reduce((a, i) => a + i.cantidad, 0)

  function setCantidad(p: ProductoCatalogo, cantidad: number) {
    const c = Math.max(0, Math.min(cantidad, p.max))
    setCarrito((prev) => {
      const next = { ...prev }
      if (c === 0) delete next[p.id]
      else next[p.id] = c
      return next
    })
  }

  async function enviarPedido() {
    if (!nombre.trim()) {
      toast({ title: "Falta tu nombre", description: "Escribe tu nombre para enviar el pedido", variant: "destructive" })
      return
    }
    if (items.length === 0) return
    setEnviando(true)
    try {
      const res = await fetch(`/api/catalogo/${token}/pedido`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nombre: nombre,
          cliente_telefono: telefono,
          notas,
          lineas: items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast({ title: "No se pudo enviar", description: json.error || "Intenta de nuevo", variant: "destructive" })
        return
      }
      setEnviado({ numero_pedido: json.numero_pedido, total: json.total })
    } catch {
      toast({ title: "Error de conexión", description: "Verifica tu internet e intenta de nuevo", variant: "destructive" })
    } finally {
      setEnviando(false)
    }
  }

  // ---------- Estados de pantalla completa ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-amber-600" />
      </div>
    )
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-10 space-y-4">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-stone-800">¡Pedido enviado!</h1>
            <p className="text-stone-600">
              Tu pedido <span className="font-mono font-semibold">{enviado.numero_pedido}</span> por{" "}
              <strong>{formatCurrency(enviado.total)}</strong> fue recibido.
            </p>
            <p className="text-sm text-stone-500">
              {data?.empresa.nombre} revisará tu pedido y te contactará
              {telefono ? ` al ${telefono}` : ""} para confirmar precios y entrega.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invalido || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-10 space-y-4">
            <LinkIcon className="h-12 w-12 text-stone-300 mx-auto" />
            <h1 className="text-xl font-bold text-stone-800">Link no disponible</h1>
            <p className="text-stone-500">{invalido || "Este catálogo no está disponible."}</p>
            <p className="text-sm text-stone-400">
              Pide a la empresa que te genere un nuevo link de catálogo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---------- Catálogo ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 pb-28">
      {/* Header de la empresa */}
      <header className="bg-white/80 backdrop-blur border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {data.empresa.logo_url ? (
            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
              <Image src={data.empresa.logo_url} alt={data.empresa.nombre} fill className="object-contain" unoptimized />
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="font-bold text-stone-800 truncate">{data.empresa.nombre}</h1>
            <p className="text-xs text-stone-500">Catálogo de productos</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            className="pl-9 bg-white"
            placeholder="Buscar producto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Grid de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <PackageX className="h-10 w-10 mx-auto mb-2" />
            Sin productos que coincidan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {productosFiltrados.map((p) => {
              const enCarrito = carrito[p.id] || 0
              return (
                <Card key={p.id} className={`overflow-hidden ${!p.disponible ? "opacity-60" : ""}`}>
                  <CardContent className="p-3 space-y-2">
                    <FotoProducto url={p.foto_url} nombre={p.nombre} />
                    <div className="min-h-[40px]">
                      <p className="text-sm font-medium text-stone-800 line-clamp-2">{p.nombre}</p>
                      {p.talla ? (
                        <p className="text-xs text-stone-500 mt-0.5">Talla: {p.talla}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{formatCurrency(p.precio)}</span>
                      <Badge
                        variant="secondary"
                        className={p.disponible ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}
                      >
                        {p.disponible ? "Disponible" : "Agotado"}
                      </Badge>
                    </div>
                    {p.disponible ? (
                      enCarrito === 0 ? (
                        <Button size="sm" className="w-full gap-1" onClick={() => setCantidad(p, 1)}>
                          <Plus className="h-3.5 w-3.5" /> Agregar
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setCantidad(p, enCarrito - 1)}>
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="font-medium text-stone-800 w-8 text-center">{enCarrito}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            disabled={enCarrito >= p.max}
                            onClick={() => setCantidad(p, enCarrito + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button size="sm" className="w-full" disabled>
                        Agotado
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Barra fija del carrito */}
      {cantidadItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-stone-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full gap-2 h-12 text-base">
                  <ShoppingCart className="h-5 w-5" />
                  Ver carrito ({cantidadItems}) · {formatCurrency(totalCarrito)}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>Tu pedido</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-4">
                  {/* Líneas */}
                  <div className="space-y-2">
                    {items.map(({ producto, cantidad }) => (
                      <div key={producto.id} className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stone-800 truncate">{producto.nombre}</p>
                          <p className="text-xs text-stone-500">{formatCurrency(producto.precio)} c/u</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setCantidad(producto, cantidad - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-medium">{cantidad}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            disabled={cantidad >= producto.max}
                            onClick={() => setCantidad(producto, cantidad + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold w-20 text-right">
                          {formatCurrency(cantidad * producto.precio)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1">
                      <span className="font-medium text-stone-700">Total</span>
                      <span className="text-lg font-bold text-stone-900">{formatCurrency(totalCarrito)}</span>
                    </div>
                  </div>

                  {/* Datos del cliente */}
                  <div className="space-y-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="cat-nombre">Tu nombre *</Label>
                      <Input id="cat-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="cat-telefono">Teléfono</Label>
                      <Input id="cat-telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Para contactarte" inputMode="tel" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="cat-notas">Notas (opcional)</Label>
                      <Textarea id="cat-notas" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Indicaciones, dirección de entrega…" rows={2} />
                    </div>
                  </div>

                  <SheetFooter className="px-0">
                    <Button className="w-full gap-2 h-12 text-base" onClick={enviarPedido} disabled={enviando}>
                      {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      {enviando ? "Enviando…" : `Enviar pedido · ${formatCurrency(totalCarrito)}`}
                    </Button>
                    <p className="text-xs text-stone-400 text-center">
                      Al enviar, este link quedará usado. La empresa confirmará tu pedido.
                    </p>
                  </SheetFooter>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </div>
  )
}
