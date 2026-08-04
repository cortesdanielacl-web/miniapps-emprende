import {
  formatClp,
  formatMarginPercent,
} from "@/features/calculadora-costos/format-money"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"

export type ReportMetric = {
  label: string
  value: string
  emphasize?: boolean
}

/**
 * Vista de presentación del Informe Profesional (web).
 * Solo a partir de ProfessionalReport autorizado por la API.
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
  report: ProfessionalReport
): ProfessionalReportView {
  return {
    productName: report.productName,
    description: "Resumen del cálculo de tu producto.",
    reportTitle: "Informe Profesional de Costos",
    finalSalePriceLabel: "Precio Final",
    finalSalePrice: formatClp(report.finalSalePrice),
    finalSalePriceNote: "Incluye IVA.",
    metrics: [
      {
        label: "Costo de Materias Primas",
        value: formatClp(report.rawMaterialsTotal),
      },
      {
        label: "Mano de Obra",
        value: formatClp(report.laborTotal),
      },
      {
        label: "Costos Indirectos",
        value: formatClp(report.indirectTotal),
      },
      {
        label: "Costo Total",
        value: formatClp(report.totalCost),
        emphasize: true,
      },
      {
        label: "Margen",
        value: formatMarginPercent(report.margin),
      },
      {
        label: "Utilidad",
        value: formatClp(report.profit),
        emphasize: true,
      },
      {
        label: "Rentabilidad",
        value: formatMarginPercent(
          Math.round(report.profitability * 10) / 10
        ),
      },
      {
        label: "Precio Neto",
        value: formatClp(report.netSalePrice),
        emphasize: true,
      },
      {
        label: "IVA (19%)",
        value: formatClp(report.iva),
      },
      {
        label: "Precio Final",
        value: formatClp(report.finalSalePrice),
        emphasize: true,
      },
    ],
  }
}

export {
  buildProfessionalReportFileName,
  formatReportGeneratedAt,
} from "@/features/calculadora-costos/report-data"
