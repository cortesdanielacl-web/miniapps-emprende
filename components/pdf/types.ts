/**
 * Tipos del motor PDF compartido.
 * Sin conocimiento de MiniApps, BrewControl ni ningún negocio concreto.
 */

export type PdfBrand = {
  name: string
  logoSrc?: string | null
  color: string
  slogan?: string
  website: string
}

export type PdfKpiItem = {
  label: string
  value: string
  color?: string
}

export type PdfTableColumn = {
  key: string
  label: string
  align?: "left" | "right" | "center"
  width?: string | number
}

export type PdfTableRow = Record<string, string>

export type PdfTableData = {
  columns: PdfTableColumn[]
  rows: PdfTableRow[]
  totals?: {
    label: string
    value: string
  }
}

export type PdfSummaryItem = {
  label: string
  value: string
  emphasize?: boolean
  color?: string
}

export type PdfReportSection = {
  id: string
  title: string
  description?: string
  table?: PdfTableData
  kpis?: PdfKpiItem[]
}

/**
 * Definición completa de un informe.
 * El motor solo renderiza este objeto.
 */
export type PdfReportDefinition = {
  brand: PdfBrand
  title: string
  subtitle?: string
  productName: string
  generatedAtLabel: string
  fileName: string
  /** Título metadata del PDF */
  documentTitle?: string
  kpis?: PdfKpiItem[]
  /** Índices de KPI del resumen ejecutivo a destacar */
  accentKpiIndexes?: number[]
  sections?: PdfReportSection[]
  summary?: {
    title?: string
    items: PdfSummaryItem[]
    /** cards = grilla KPI; panel = bloque destacado oscuro */
    variant?: "cards" | "panel"
  }
  recommendations?: string | string[]
  recommendationsTitle?: string
}
