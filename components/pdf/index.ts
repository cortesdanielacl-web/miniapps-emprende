/**
 * Motor PDF compartido — MiniApps Emprende / BrewControl / futuras apps.
 *
 * Capas:
 * 1. Motor      → createPdfReport, PdfDocument, renderPdfReportBlob
 * 2. Visual     → PdfCover, PdfSection, PdfKpiCard, PdfTable, …
 * 3. Datos      → PdfReportDefinition (lo construye cada producto)
 * 4. Branding   → PdfBrand (props; sin valores fijos de producto)
 */

export type {
  PdfBrand,
  PdfKpiItem,
  PdfReportDefinition,
  PdfReportSection,
  PdfSummaryItem,
  PdfTableColumn,
  PdfTableData,
  PdfTableRow,
} from "./types"

export { pdfColors, pdfSpacing, withAlpha } from "./theme"
export { downloadPdfBlob, resolvePublicImageAsDataUrl } from "./download"
export { createPdfReport, renderPdfReportBlob } from "./create-pdf-report"

export { PdfDocument } from "./PdfDocument"
export { PdfCover } from "./PdfCover"
export { PdfSection } from "./PdfSection"
export { PdfKpiCard } from "./PdfKpiCard"
export { PdfTable } from "./PdfTable"
export { PdfSummary } from "./PdfSummary"
export { PdfRecommendation } from "./PdfRecommendation"
export { PdfFooter } from "./PdfFooter"
export { PdfBrandHeader } from "./PdfBrandHeader"
