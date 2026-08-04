/**
 * Adapter MiniApps → motor PDF.
 * Convierte ProfessionalReport (autorizado) en PdfReportDefinition.
 */

import type { CostBreakdownLine } from "@/features/calculadora-costos/cost-aggregation"
import {
  formatClp,
  formatMarginPercent,
  formatQuantity,
} from "@/features/calculadora-costos/format-money"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"
import type {
  PdfBrand,
  PdfReportDefinition,
  PdfTableData,
} from "@/components/pdf"
import { APP_NAME, APP_SITE_URL } from "@/lib/constants"

const REPORT_TITLE = "INFORME PROFESIONAL DE COSTOS"
const BRAND_COLOR = "#14B8A6"
const BRAND_SLOGAN = "Herramientas simples para hacer crecer tu negocio."

function slugifyProductName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")

  return slug.length > 0 ? slug : "Producto"
}

export function buildProfessionalReportFileName(
  productName: string,
  date = new Date()
): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `Informe-Costos-${slugifyProductName(productName)}-${year}-${month}-${day}.pdf`
}

export function formatReportGeneratedAt(date = new Date()): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function ensureLines(
  lines: CostBreakdownLine[] | undefined
): CostBreakdownLine[] {
  return Array.isArray(lines) ? lines : []
}

function buildMaterialsTable(
  lines: CostBreakdownLine[],
  footerTotal: number
): PdfTableData {
  return {
    columns: [
      { key: "concept", label: "Concepto", width: "28%", align: "left" },
      { key: "quantity", label: "Cantidad", width: "14%", align: "right" },
      { key: "unit", label: "Unidad", width: "12%", align: "center" },
      {
        key: "unitCost",
        label: "Costo Unitario",
        width: "23%",
        align: "right",
      },
      { key: "total", label: "Costo Total", width: "23%", align: "right" },
    ],
    rows: lines.map((line) => ({
      concept: line.concept || "—",
      quantity: formatQuantity(line.quantity),
      unit: line.unit ?? "—",
      unitCost: line.unitCost != null ? formatClp(line.unitCost) : "—",
      total: formatClp(line.totalCost),
    })),
    totals: {
      label: "Total materias primas",
      value: formatClp(footerTotal),
    },
  }
}

function buildLaborTable(
  lines: CostBreakdownLine[],
  footerTotal: number
): PdfTableData {
  return {
    columns: [
      { key: "concept", label: "Concepto", width: "34%", align: "left" },
      { key: "hours", label: "Horas", width: "16%", align: "right" },
      { key: "rate", label: "Valor hora", width: "25%", align: "right" },
      { key: "total", label: "Costo Total", width: "25%", align: "right" },
    ],
    rows: lines.map((line) => ({
      concept: line.concept || "—",
      hours: formatQuantity(line.quantity),
      rate: line.unitCost != null ? formatClp(line.unitCost) : "—",
      total: formatClp(line.totalCost),
    })),
    totals: {
      label: "Costo total",
      value: formatClp(footerTotal),
    },
  }
}

function buildSimpleCostTable(
  lines: CostBreakdownLine[],
  footerLabel: string,
  footerTotal: number
): PdfTableData {
  return {
    columns: [
      { key: "concept", label: "Concepto", width: "62%", align: "left" },
      { key: "total", label: "Costo Total", width: "38%", align: "right" },
    ],
    rows: lines.map((line) => ({
      concept: line.concept || "—",
      total: formatClp(line.totalCost),
    })),
    totals: {
      label: footerLabel,
      value: formatClp(footerTotal),
    },
  }
}

function buildMiniAppsBrand(logoSrc?: string | null): PdfBrand {
  return {
    name: APP_NAME,
    logoSrc: logoSrc ?? null,
    color: BRAND_COLOR,
    slogan: BRAND_SLOGAN,
    website: APP_SITE_URL,
  }
}

/**
 * Adapter: resultado de cálculo → definición del motor PDF.
 */
export function buildCostReportDefinition(
  report: ProfessionalReport,
  options?: {
    generatedAt?: Date
    logoSrc?: string | null
  }
): PdfReportDefinition {
  const generatedAt = options?.generatedAt ?? new Date()
  const materialLines = ensureLines(report.materialLines)
  const laborLines = ensureLines(report.laborLines)
  const indirectLines = ensureLines(report.indirectLines)
  const generatedAtLabel = formatReportGeneratedAt(generatedAt)

  return {
    brand: buildMiniAppsBrand(options?.logoSrc),
    title: REPORT_TITLE,
    subtitle: "Documento profesional",
    productName: report.productName,
    generatedAtLabel,
    fileName: buildProfessionalReportFileName(report.productName, generatedAt),
    documentTitle: `${REPORT_TITLE} — ${report.productName}`,
    accentKpiIndexes: [2],
    kpis: [
      { label: "Costo total", value: formatClp(report.totalCost) },
      { label: "Costo unitario", value: formatClp(report.unitCost) },
      {
        label: "Precio de venta recomendado",
        value: formatClp(report.finalSalePrice),
        color: BRAND_COLOR,
      },
      {
        label: "Margen esperado",
        value: formatMarginPercent(report.margin),
      },
      {
        label: "Ganancia por unidad",
        value: formatClp(report.profitPerUnit),
      },
    ],
    sections: [
      {
        id: "materias-primas",
        title: "Materias primas",
        table: buildMaterialsTable(materialLines, report.rawMaterialsTotal),
      },
      {
        id: "mano-de-obra",
        title: "Mano de obra",
        table: buildLaborTable(laborLines, report.laborTotal),
      },
      {
        id: "indirectos",
        title: "Costos indirectos",
        table: buildSimpleCostTable(
          indirectLines,
          "Total costos indirectos",
          report.indirectTotal
        ),
      },
    ],
    summary: {
      title: "Resumen de costos",
      variant: "panel",
      items: [
        { label: "Costo total", value: formatClp(report.totalCost) },
        { label: "Costo por unidad", value: formatClp(report.unitCost) },
        {
          label: "Precio recomendado",
          value: formatClp(report.finalSalePrice),
          emphasize: true,
        },
        {
          label: "Margen",
          value: formatMarginPercent(report.margin),
        },
        {
          label: "Ganancia",
          value: formatClp(report.profit),
          emphasize: true,
        },
        {
          label: "Rentabilidad",
          value: formatMarginPercent(Math.round(report.profitability * 10) / 10),
        },
      ],
    },
    recommendationsTitle: "Recomendaciones",
    recommendations: report.recommendations,
  }
}

/** @deprecated Usar buildCostReportDefinition */
export const buildCostReportDocumentData = buildCostReportDefinition
