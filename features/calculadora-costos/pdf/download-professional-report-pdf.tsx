import { pdf } from "@react-pdf/renderer"

import type { CostCalculatorResult } from "@/features/calculadora-costos/calculate"
import { ProfessionalReportPdfDocument } from "@/features/calculadora-costos/pdf/professional-report-pdf"
import {
  buildProfessionalReportFileName,
  buildProfessionalReportView,
  formatReportGeneratedAt,
} from "@/features/calculadora-costos/report-presentation"

const LOGO_PATH = "/logo-miniapps.png"

async function resolveLogoSrc(): Promise<string | null> {
  if (typeof window === "undefined") return null

  try {
    const response = await fetch(`${window.location.origin}${LOGO_PATH}`)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("No se pudo leer el logo"))
        }
      }
      reader.onerror = () =>
        reject(reader.error ?? new Error("Error de lectura"))
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Genera y descarga el PDF del Informe Profesional.
 * Usa exclusivamente CostCalculatorResult (misma fuente que el Informe Web).
 */
export async function downloadProfessionalReportPdf(
  result: CostCalculatorResult
): Promise<void> {
  const generatedAt = new Date()
  const view = buildProfessionalReportView(result)
  const logoSrc = await resolveLogoSrc()

  const blob = await pdf(
    <ProfessionalReportPdfDocument
      view={view}
      generatedAtLabel={formatReportGeneratedAt(generatedAt)}
      logoSrc={logoSrc}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = buildProfessionalReportFileName(generatedAt)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
