import { buildCostReportDefinition } from "@/features/calculadora-costos/report-data"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { fetchProfessionalReport } from "@/features/calculadora-costos/services/fetch-professional-report"
import {
  createPdfReport,
  resolvePublicImageAsDataUrl,
} from "@/components/pdf"
import {
  PremiumAccessDeniedError,
  premiumAccessService,
} from "@/features/licensing/premium-access-service"

const LOGO_PATH = "/logo-miniapps.png"

/**
 * Genera y descarga el PDF.
 * ProfessionalReport se obtiene del servidor autorizado — no usa estado React
 * ni sessionStorage ni cálculos del cliente.
 */
export async function downloadProfessionalReportPdf(
  values: CostCalculatorValues
): Promise<void> {
  const allowed = await premiumAccessService.canGeneratePdf()
  if (!allowed) {
    throw new PremiumAccessDeniedError(
      "Se requiere una licencia activa para generar el Informe PDF."
    )
  }

  const report = await fetchProfessionalReport(values)

  const generatedAt = new Date()
  const logoSrc = await resolvePublicImageAsDataUrl(LOGO_PATH)
  const definition = buildCostReportDefinition(report, {
    generatedAt,
    logoSrc,
  })

  await createPdfReport(definition)
}
