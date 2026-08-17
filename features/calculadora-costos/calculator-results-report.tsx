"use client"

import Link from "next/link"
import { useEffect, useState, type ComponentType } from "react"
import {
  DownloadIcon,
  LightbulbIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react"

import { EmptyState } from "@/components/common"
import { Button } from "@/components/ui/button"
import { CALCULATOR_ENTRY_HREF } from "@/config/routes"
import type { ProfessionalReport } from "@/features/calculadora-costos/professional-report"
import { buildProfessionalReportView } from "@/features/calculadora-costos/report-presentation"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import {
  PremiumAccessDeniedError,
  premiumAccessService,
} from "@/features/licensing/premium-access-service"

const BREAKDOWN_ICONS = [PackageIcon, UsersIcon, LightbulbIcon] as const

function SummaryRow({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string | null
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8EEF5] py-3.5 last:border-b-0 sm:py-4">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise">
            <Icon className="size-4" aria-hidden={true} />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm text-heading sm:text-base">{label}</p>
          {hint ? (
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {hint} del costo total
            </p>
          ) : null}
        </div>
      </div>
      <p className="shrink-0 text-right font-heading text-sm font-semibold text-heading tabular-nums sm:text-base">
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
        className="h-12 w-full bg-[#2563EB] px-6 text-base font-semibold shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:h-14 sm:w-auto sm:min-w-[16rem] sm:px-10"
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
      <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-6 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-10">
        <header className="space-y-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-heading sm:text-2xl">
            {view.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {view.subtitle}
          </p>
          {view.productName ? (
            <p className="text-sm font-medium text-heading sm:text-base">
              {view.productName}
            </p>
          ) : null}
        </header>

        <div className="mt-6 grid gap-6 rounded-[18px] bg-brand-turquoise/10 px-5 py-6 sm:mt-8 sm:grid-cols-[1.2fr_0.8fr] sm:items-end sm:gap-10 sm:px-8 sm:py-8">
          <div>
            <p className="text-xs font-medium tracking-wide text-brand-turquoise uppercase">
              {view.hero.finalSalePriceLabel}
            </p>
            <p className="mt-2 font-heading text-5xl font-bold tracking-tight text-brand-turquoise tabular-nums sm:text-6xl lg:text-7xl">
              {view.hero.finalSalePrice}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {view.hero.finalSalePriceNote}
            </p>
          </div>
          <div className="border-t border-brand-turquoise/20 pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {view.hero.totalCostLabel}
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-heading tabular-nums sm:text-3xl">
              {view.hero.totalCost}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {view.hero.totalCostNote}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <h3 className="font-heading text-base font-semibold text-heading sm:text-lg">
            Desglose de costos
          </h3>
          <div className="mt-2">
            {view.breakdown.map((row, index) => {
              const Icon = BREAKDOWN_ICONS[index]
              return (
                <SummaryRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  hint={row.share}
                  icon={Icon}
                />
              )
            })}
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <h3 className="font-heading text-base font-semibold text-heading sm:text-lg">
            Resultados clave
          </h3>
          <div className="mt-2">
            {view.keyResults.map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[14px] bg-[#F7FAFF] px-4 py-4 sm:mt-10 sm:px-5 sm:py-5">
          {view.interpretation.map((line) => (
            <p
              key={line}
              className="text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mt-8 sm:mt-10">
          <DownloadReportButton values={values} />
        </div>
      </div>
    </section>
  )
}
