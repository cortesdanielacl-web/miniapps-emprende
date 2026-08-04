"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DownloadIcon } from "lucide-react"

import { EmptyState, ResultCard } from "@/components/common"
import { Button } from "@/components/ui/button"
import { CALCULATOR_ENTRY_HREF } from "@/config/routes"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"
import { buildProfessionalReportView } from "@/features/calculadora-costos/report-presentation"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import {
  PremiumAccessDeniedError,
  premiumAccessService,
} from "@/features/licensing/premium-access-service"
import { cn } from "@/lib/utils"

function MetricTile({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-[#E8EEF5] bg-white px-4 py-5 sm:px-5 sm:py-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-heading font-semibold text-heading tabular-nums break-words",
          emphasize ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function DownloadReportButton({ values }: { values: CostCalculatorValues }) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setError(null)
    setIsDownloading(true)
    try {
      const allowed = await premiumAccessService.canDownloadReport()
      if (!allowed) {
        setError("Se requiere una licencia activa para descargar el informe.")
        return
      }

      const { downloadProfessionalReportPdf } = await import(
        "@/features/calculadora-costos/pdf/download-professional-report-pdf"
      )
      // PDF: ProfessionalReport fresco desde la API (no estado React).
      await downloadProfessionalReportPdf(values)
    } catch (err) {
      if (err instanceof PremiumAccessDeniedError) {
        setError(err.message)
      } else {
        setError("No se pudo generar el PDF. Inténtalo nuevamente.")
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleDownload}
        disabled={isDownloading}
        data-icon="inline-start"
      >
        <DownloadIcon data-icon="inline-start" />
        {isDownloading ? "Generando PDF…" : "Descargar Informe PDF"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Informe Profesional — solo con ProfessionalReport de la API autorizada.
 */
export function CalculatorResultsReport({
  report,
  values,
}: {
  report: ProfessionalReport
  values: CostCalculatorValues
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    void premiumAccessService.canViewPremiumResults().then((ok) => {
      if (!cancelled) setAllowed(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (allowed === null) {
    return (
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        Verificando acceso…
      </p>
    )
  }

  if (!allowed) {
    return (
      <EmptyState
        title="Contenido premium"
        description="Necesitas una licencia activa para ver el Informe Profesional y descargar el PDF."
        action={
          <Button asChild variant="primary" size="lg">
            <Link href={CALCULATOR_ENTRY_HREF}>Volver a la calculadora</Link>
          </Button>
        }
      />
    )
  }

  const view = buildProfessionalReportView(report)

  return (
    <section id="resultado" className="scroll-mt-24" aria-live="polite">
      <ResultCard
        title={view.productName}
        description={view.description}
        tone="success"
        className="border border-[#E8EEF5] bg-brand-turquoise/[0.06] shadow-[0_2px_12px_rgb(15_44_76/0.04)]"
      >
        <div className="space-y-8 sm:space-y-10">
          <div className="rounded-[18px] border border-brand-turquoise/20 bg-brand-turquoise/10 px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-xs font-medium tracking-wide text-brand-turquoise uppercase">
              {view.finalSalePriceLabel}
            </p>
            <p className="mt-3 font-heading text-5xl font-bold tracking-tight text-brand-turquoise tabular-nums sm:text-6xl lg:text-7xl">
              {view.finalSalePrice}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {view.finalSalePriceNote}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {view.metrics.map((metric) => (
              <MetricTile
                key={metric.label}
                label={metric.label}
                value={metric.value}
                emphasize={metric.emphasize}
              />
            ))}
          </div>

          <DownloadReportButton values={values} />
        </div>
      </ResultCard>
    </section>
  )
}
