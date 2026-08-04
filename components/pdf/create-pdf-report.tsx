import { pdf } from "@react-pdf/renderer"

import { PdfDocument } from "@/components/pdf/PdfDocument"
import { downloadPdfBlob } from "@/components/pdf/download"
import type { PdfReportDefinition } from "@/components/pdf/types"

/**
 * Punto de entrada del motor PDF compartido.
 *
 * Cualquier MiniApp / producto (MiniApps Emprende, BrewControl, etc.)
 * construye un PdfReportDefinition y llama a esta función.
 * El motor no conoce el origen de los datos.
 *
 * @example
 * await createPdfReport({
 *   brand: { name: "Mi Marca", color: "#14B8A6", website: "www.ejemplo.cl" },
 *   title: "INFORME PROFESIONAL",
 *   productName: "Producto",
 *   generatedAtLabel: "4 de agosto de 2026",
 *   fileName: "Informe-Producto-2026-08-04.pdf",
 *   kpis: [...],
 *   sections: [...],
 *   summary: { items: [...] },
 *   recommendations: "Texto dinámico",
 * })
 */
export async function createPdfReport(
  definition: PdfReportDefinition
): Promise<void> {
  const blob = await pdf(<PdfDocument definition={definition} />).toBlob()
  downloadPdfBlob(blob, definition.fileName)
}

/** Genera el Blob sin descargar (útil para previews o envío). */
export async function renderPdfReportBlob(
  definition: PdfReportDefinition
): Promise<Blob> {
  return pdf(<PdfDocument definition={definition} />).toBlob()
}
