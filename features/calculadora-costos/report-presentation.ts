import {
  formatClp,
  formatMarginPercent,
  type CostCalculatorResult,
} from "@/features/calculadora-costos/calculate"

export type ReportMetric = {
  label: string
  value: string
  emphasize?: boolean
}

/**
 * Vista de presentación del Informe Profesional.
 * Única fuente de etiquetas y valores formateados para Web y PDF.
 * No recalcula: solo deriva utilidad y formatea campos de CostCalculatorResult.
 */
export type ProfessionalReportView = {
  productName: string
  description: string
  reportTitle: string
  finalSalePriceLabel: string
  finalSalePrice: string
  finalSalePriceNote: string
  metrics: ReportMetric[]
}

export function buildProfessionalReportView(
  result: CostCalculatorResult
): ProfessionalReportView {
  const profit = result.netSalePrice - result.totalCost

  return {
    productName: result.productName,
    description: "Resumen del cálculo de tu producto.",
    reportTitle: "Informe Profesional de Costos",
    finalSalePriceLabel: "Precio Final",
    finalSalePrice: formatClp(result.finalSalePrice),
    finalSalePriceNote: "Incluye IVA.",
    metrics: [
      {
        label: "Costo de Materias Primas",
        value: formatClp(result.rawMaterialsTotal),
      },
      {
        label: "Mano de Obra",
        value: formatClp(result.laborTotal),
      },
      {
        label: "Costos Indirectos",
        value: formatClp(result.indirectTotal),
      },
      {
        label: "Costo Total",
        value: formatClp(result.totalCost),
        emphasize: true,
      },
      {
        label: "Margen",
        value: formatMarginPercent(result.margin),
      },
      {
        label: "Utilidad",
        value: formatClp(profit),
        emphasize: true,
      },
      {
        label: "Precio Neto",
        value: formatClp(result.netSalePrice),
        emphasize: true,
      },
      {
        label: "IVA (19%)",
        value: formatClp(result.iva),
      },
      {
        label: "Precio Final",
        value: formatClp(result.finalSalePrice),
        emphasize: true,
      },
    ],
  }
}

/** Nombre de archivo: Informe-Costos-YYYY-MM-DD.pdf */
export function buildProfessionalReportFileName(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `Informe-Costos-${year}-${month}-${day}.pdf`
}

export function formatReportGeneratedAt(date = new Date()): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}
