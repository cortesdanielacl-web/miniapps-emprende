import { formatClp } from "@/features/calculadora-costos/format-money"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"

export type ReportRow = {
  label: string
  value: string
  hint?: string
}

export type CostBreakdownRow = {
  label: string
  value: string
  share: string | null
}

/**
 * Vista de presentación del Informe Profesional (web).
 * Solo formatea ProfessionalReport autorizado. No recalcula.
 * Rentabilidad se omite aquí y permanece en el PDF.
 */
export type ProfessionalReportView = {
  productName: string
  title: string
  subtitle: string
  hero: {
    finalSalePriceLabel: string
    finalSalePrice: string
    finalSalePriceNote: string
    totalCostLabel: string
    totalCost: string
    totalCostNote: string
  }
  breakdown: CostBreakdownRow[]
  keyResults: ReportRow[]
  interpretation: string[]
}

function formatViewPercent(value: number): string {
  return `${new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`
}

function costShare(part: number, total: number): string | null {
  if (!(total > 0) || !Number.isFinite(part)) {
    return null
  }
  return formatViewPercent((part / total) * 100)
}

export function buildProfessionalReportView(
  report: ProfessionalReport
): ProfessionalReportView {
  return {
    productName: report.productName,
    title: "Resumen de tu producto",
    subtitle:
      "Aquí puedes ver el total de tus costos y el resultado de tu cálculo.",
    hero: {
      finalSalePriceLabel: "Precio final",
      finalSalePrice: formatClp(report.finalSalePrice),
      finalSalePriceNote: "Incluye IVA (19%)",
      totalCostLabel: "Costo total",
      totalCost: formatClp(report.totalCost),
      totalCostNote: "Sin IVA",
    },
    breakdown: [
      {
        label: "Materiales e Insumos",
        value: formatClp(report.rawMaterialsTotal),
        share: costShare(report.rawMaterialsTotal, report.totalCost),
      },
      {
        label: "Mano de Obra",
        value: formatClp(report.laborTotal),
        share: costShare(report.laborTotal, report.totalCost),
      },
      {
        label: "Costos Indirectos",
        value: formatClp(report.indirectTotal),
        share: costShare(report.indirectTotal, report.totalCost),
      },
    ],
    keyResults: [
      {
        label: "Margen",
        value: Number.isFinite(report.margin)
          ? formatViewPercent(report.margin)
          : "—",
      },
      {
        label: "Utilidad",
        value: formatClp(report.profit),
      },
      {
        label: "Precio neto",
        value: formatClp(report.netSalePrice),
      },
      {
        label: "IVA (19%)",
        value: formatClp(report.iva),
      },
      {
        label: "Precio final",
        value: formatClp(report.finalSalePrice),
      },
    ],
    interpretation: [
      "Este es el precio recomendado para tu producto, con IVA incluido.",
      "El costo total no incluye IVA; el precio final sí lo considera.",
    ],
  }
}

export {
  buildProfessionalReportFileName,
  formatReportGeneratedAt,
} from "@/features/calculadora-costos/report-data"
