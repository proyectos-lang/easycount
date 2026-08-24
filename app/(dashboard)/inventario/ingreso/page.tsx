"use client"

import * as React from "react"
import { Package, Warehouse, MapPin, ArrowDownCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getProductos, getAlmacenes, getLocalizaciones, type Producto, type Almacen, type Localizacion } from "@/lib/services/catalogos"
import { procesarIngresoManual } from "@/lib/services/inventario"

export default function IngresoManualPage() {
  const { toast } = useToast()
  const [productos, setProductos] = React.useState<Producto[]>([])
  const [almacenes, setAlmacenes] = React.useState<Almacen[]>([])
  const [localizaciones, setLocalizaciones] = React.useState<Localizacion[]>([])
  const [localizacionesFiltradas, setLocalizacionesFiltradas] = React.useState<Localizacion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const [formData, setFormData] = React.useState({
    producto_id: "",
    almacen_id: "",
    localizacion_id: "",
    cantidad: "",
    costo_unitario: "",
    observaciones: ""
  })

  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [prodRes, almRes, locRes] = await Promise.all([
      getProductos(),
      getAlmacenes(),
      getLocalizaciones()
    ])
    
    if (prodRes.error) toast({ title: "Error", description: prodRes.error, variant: "destructive" })
    if (almRes.error) toast({ title: "Error", description: almRes.error, variant: "destructive" })
    
    setProductos(prodRes.data)
    setAlmacenes(almRes.data)
    setLocalizaciones(locRes.data)
    
    // Auto-select if only one almacen
    if (almRes.data.length === 1) {
      const almId = almRes.data[0].id!.toString()
      setFormData(prev => ({ ...prev, almacen_id: almId }))
      const filtradas = locRes.data.filter(l => l.almacen_id === almRes.data[0].id)
      setLocalizacionesFiltradas(filtradas)
      if (filtradas.length === 1) {
        setFormData(prev => ({ ...prev, localizacion_id: filtradas[0].id!.toString() }))
      }
    }
    
    setLoading(false)
  }

  function handleAlmacenChange(value: string) {
    setFormData({ ...formData, almacen_id: value, localizacion_id: "" })
    const filtradas = localizaciones.filter(l => l.almacen_id === parseInt(value))
    setLocalizacionesFiltradas(filtradas)
    if (filtradas.length === 1) {
      setFormData(prev => ({ ...prev, almacen_id: value, localizacion_id: filtradas[0].id!.toString() }))
    }
  }

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedProducto = productos.find(p => p.id?.toString() === formData.producto_id)

  // Calculate preview values
  const cantidadIngreso = parseFloat(formData.cantidad) || 0
  const costoIngreso = parseFloat(formData.costo_unitario) || 0
  const stockActual = selectedProducto?.stock_total || 0
  const costoActual = selectedProducto?.costo_promedio || 0

  const nuevoStock = stockActual + cantidadIngreso
  const nuevoCosto = nuevoStock > 0 
    ? ((stockActual * costoActual) + (cantidadIngreso * costoIngreso)) / nuevoStock
    : costoIngreso

  const showPreview = selectedProducto && cantidadIngreso > 0 && costoIngreso > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.producto_id) {
      toast({ title: "Error", description: "Seleccione un producto", variant: "destructive" })
      return
    }
    if (!formData.almacen_id) {
      toast({ title: "Error", description: "Seleccione un almacen", variant: "destructive" })
      return
    }
    if (!formData.localizacion_id) {
      toast({ title: "Error", description: "Seleccione una localizacion", variant: "destructive" })
      return
    }
    if (cantidadIngreso <= 0) {
      toast({ title: "Error", description: "Ingrese una cantidad valida", variant: "destructive" })
      return
    }
    if (costoIngreso <= 0) {
      toast({ title: "Error", description: "Ingrese un costo unitario valido", variant: "destructive" })
      return
    }

    setSaving(true)
    
    const { success, error } = await procesarIngresoManual({
      producto_id: parseInt(formData.producto_id),
      almacen_id: parseInt(formData.almacen_id),
      localizacion_id: parseInt(formData.localizacion_id),
      cantidad: cantidadIngreso,
      costo_unitario: costoIngreso,
      observaciones: formData.observaciones,
      stock_anterior: stockActual,
      costo_anterior: costoActual,
      nuevo_stock: nuevoStock,
      nuevo_costo: nuevoCosto
    })

    setSaving(false)

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" })
      return
    }

    toast({ 
      title: "Ingreso procesado", 
      description: `Se ingresaron ${cantidadIngreso} unidades de ${selectedProducto?.nombre}` 
    })
    
    // Reset form
    setFormData({
      producto_id: "",
      almacen_id: almacenes.length === 1 ? almacenes[0].id!.toString() : "",
      localizacion_id: "",
      cantidad: "",
      costo_unitario: "",
      observaciones: ""
    })
    setSearchTerm("")
    
    // Reload products to get updated stock
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Ingreso Manual de Inventario</h1>
        <p className="text-sm md:text-base text-muted-foreground">Registrar entradas de producto con recalculo de costo promedio</p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Importante</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Esta accion afectara la utilidad de las futuras ventas al cambiar el costo promedio del producto.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Product Selection Card */}
          <Card className="lg:col-span-2 border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                Seleccionar Producto
              </CardTitle>
              <CardDescription>Busque y seleccione el producto a ingresar</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Buscar Producto</Label>
                  <Input
                    placeholder="Buscar por nombre o codigo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Producto</Label>
                  <Select 
                    value={formData.producto_id} 
                    onValueChange={(v) => setFormData({ ...formData, producto_id: v })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productosFiltrados.map((p) => (
                        <SelectItem key={p.id} value={p.id!.toString()}>
                          {p.codigo_barras ? `[${p.codigo_barras}] ` : ''}{p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current Product Info */}
              {selectedProducto && (
                <div className="p-3 md:p-4 bg-background border rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Datos Actuales del Producto</p>
                  <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Nombre</p>
                      <p className="font-medium text-sm truncate">{selectedProducto.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Codigo</p>
                      <p className="font-mono text-sm">{selectedProducto.codigo_barras || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stock Total</p>
                      <p className="font-bold text-lg">{stockActual}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Costo Promedio</p>
                      <p className="font-bold text-lg text-primary">L {costoActual.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Selection */}
          <Card className="border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Warehouse className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                Ubicacion de Ingreso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Almacen</Label>
                <Select value={formData.almacen_id} onValueChange={handleAlmacenChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccione almacen" />
                  </SelectTrigger>
                  <SelectContent>
                    {almacenes.map((a) => (
                      <SelectItem key={a.id} value={a.id!.toString()}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Localizacion
                </Label>
                <Select 
                  value={formData.localizacion_id} 
                  onValueChange={(v) => setFormData({ ...formData, localizacion_id: v })}
                  disabled={!formData.almacen_id}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={formData.almacen_id ? "Seleccione localizacion" : "Primero seleccione almacen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {localizacionesFiltradas.map((l) => (
                      <SelectItem key={l.id} value={l.id!.toString()}>
                        {l.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Entry Data */}
          <Card className="lg:col-span-2 border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                Datos del Ingreso
              </CardTitle>
              <CardDescription>Cantidad y costo de las unidades a ingresar</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Cantidad a Ingresar</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    placeholder="Ej: 50"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Costo Unitario (LPS)</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.costo_unitario}
                    onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })}
                    placeholder="Ej: 125.50"
                    className="bg-background"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Observaciones</Label>
                <Textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Justificacion o motivo del ingreso manual..."
                  rows={3}
                  className="bg-background resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Impact Preview */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                Previsualizacion del Impacto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {showPreview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Nuevo Stock</p>
                      <p className="text-2xl font-bold text-emerald-600">{nuevoStock}</p>
                      <p className="text-xs text-muted-foreground">
                        ({stockActual} + {cantidadIngreso})
                      </p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Nuevo Costo Promedio</p>
                      <p className="text-2xl font-bold text-emerald-600">L {nuevoCosto.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Anterior: L {costoActual.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Formula aplicada:</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      (({stockActual} × L{costoActual.toFixed(2)}) + ({cantidadIngreso} × L{costoIngreso.toFixed(2)})) / {nuevoStock}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={saving} 
                    size="lg" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="mr-2 h-4 w-4" />
                        Procesar Ingreso
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Seleccione un producto e ingrese cantidad y costo para ver la previsualizacion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
