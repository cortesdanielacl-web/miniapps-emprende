import { ResultCard } from "@/components/common"
import type { CostCalculatorResult } from "@/features/calculadora-costos/calculate"
import { buildProfessionalReportView } from "@/features/calculadora-costos/report-presentation"
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

/** Informe Profesional — resumen del cálculo de costos. */
export function CalculatorResultsReport({
  result,
}: {
  result: CostCalculatorResult
}) {
  const view = buildProfessionalReportView(result)

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
        </div>
      </ResultCard>
    </section>
  )
}
