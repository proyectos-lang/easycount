"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

/**
 * Paginador controlado y presentacional para tablas client-side.
 * El slice de los datos queda en el padre; este componente solo muestra el
 * selector de tamaño de pagina, el rango actual y los botones anterior/siguiente.
 */
export interface TablePaginatorProps {
  pageIndex: number
  pageSize: number
  totalItems: number
  onPageIndexChange: (index: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function TablePaginator({
  pageIndex,
  pageSize,
  totalItems,
  onPageIndexChange,
  onPageSizeChange,
  pageSizeOptions = [50, 100, 1000],
  className,
}: TablePaginatorProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const desde = totalItems === 0 ? 0 : pageIndex * pageSize + 1
  const hasta = Math.min(totalItems, (pageIndex + 1) * pageSize)

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 text-sm ${className || ""}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="whitespace-nowrap">Filas por página</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-muted-foreground">
          {desde.toLocaleString("es-HN")}–{hasta.toLocaleString("es-HN")} de {totalItems.toLocaleString("es-HN")}
        </span>
        <span className="whitespace-nowrap text-stone-500">
          Página {pageIndex + 1} de {pageCount}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageIndexChange(pageIndex - 1)}
            disabled={pageIndex <= 0}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageIndexChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
