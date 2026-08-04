"use client"

import { useState } from "react"
import { ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  COMMERCIAL,
  formatCommercialAmount,
} from "@/config/commercial"
import type { CostPreview } from "@/features/calculadora-costos/cost-preview"
import { formatClp } from "@/features/calculadora-costos/format-money"
import type { CostCalculatorValues } from "@/features/calculadora-costos/schema"
import { startReportCheckout } from "@/features/calculadora-costos/services/report-checkout"
import { cn } from "@/lib/utils"

const LOCKED_INSIGHTS = [
  "Precio recomendado",
  "Margen esperado",
  "Utilidad",
  "Rentabilidad",
] as const

type ReportUnlockScreenProps = {
  /** Solo datos públicos de costo — nunca campos premium. */
  preview: CostPreview
  values: CostCalculatorValues
  className?: string
}

function PreviewRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8EEF5] py-3 last:border-b-0">
      <p className="text-sm text-muted-foreground sm:text-base">✓ {label}</p>
      <p className="text-right text-sm font-semibold text-heading tabular-nums sm:text-base">
        {value}
      </p>
    </div>
  )
}

function LockedRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-[#E8EEF5] py-3 last:border-b-0">
      <p className="text-sm text-muted-foreground sm:text-base">🔒 {label}</p>
      <p className="text-sm text-muted-foreground/70 sm:text-base">••••••</p>
    </div>
  )
}

/**
 * Pantalla comercial de licencia.
 * Misma estructura visual; copy orientado a acceso permanente.
 */
export function ReportUnlockScreen({
  preview,
  values,
  className,
}: ReportUnlockScreenProps) {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false)
  const paymentLabelLines = [
    COMMERCIAL.paymentLabel,
    COMMERCIAL.licenseLabel,
  ].flatMap((text) => text.split(/(?<=\.)\s+/))

  async function handleUnlock() {
    setIsStartingCheckout(true)
    try {
      await startReportCheckout({ values })
    } finally {
      setIsStartingCheckout(false)
    }
  }

  return (
    <section
      id="desbloqueo"
      className={cn("scroll-mt-24", className)}
      aria-live="polite"
      aria-labelledby="desbloqueo-title"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* 1. Encabezado */}
        <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-8 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-10 sm:py-10">
          <h2
            id="desbloqueo-title"
            className="font-heading text-xl font-semibold tracking-tight text-heading break-words sm:text-3xl"
          >
            🎉 Tu cálculo está listo.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            Ya analizamos todos los costos de tu producto.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-foreground sm:text-base">
            Obtén acceso permanente a esta MiniApp para ver resultados
            completos y generar Informes Profesionales ilimitados.
          </p>
        </div>

        {/* 2. Vista previa */}
        <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9">
          <h3 className="font-heading text-base font-semibold text-heading sm:text-lg">
            Vista previa de tu cálculo
          </h3>
          <div className="mt-5">
            <PreviewRow label="Producto" value={preview.productName} />
            <PreviewRow
              label="Cantidad producida"
              value={`${preview.quantity} unidad${preview.quantity === 1 ? "" : "es"}`}
            />
            <PreviewRow
              label="Costo total"
              value={formatClp(preview.totalCost)}
            />
            <PreviewRow
              label="Costo por unidad"
              value={formatClp(preview.unitCost)}
            />
          </div>

          <div className="mt-6 rounded-[14px] border border-[#E8EEF5] bg-[#F7FAFF] px-3 py-2 sm:px-4">
            <p className="px-1 pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm">
              Incluido con tu licencia
            </p>
            <div className="mt-1 px-1 pb-2">
              {LOCKED_INSIGHTS.map((label) => (
                <LockedRow key={label} label={label} />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Beneficios de licencia */}
        <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9">
          <h3 className="font-heading text-base font-semibold text-heading sm:text-lg">
            ¿Qué incluye tu licencia?
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm leading-snug text-foreground sm:text-base sm:leading-normal">
            {COMMERCIAL.licenseBenefits.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>

        {/* 4. Bloque comercial */}
        <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-8 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-10 sm:py-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-turquoise uppercase sm:text-sm">
            Licencia individual
          </p>
          <p className="mt-4 font-heading text-[2.25rem] font-bold tracking-tight text-heading tabular-nums sm:text-6xl">
            {formatCommercialAmount()}
          </p>
          <div className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
            {paymentLabelLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Pago seguro mediante Transbank Webpay.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-[14px] border border-[#E8EEF5] bg-[#F7FAFF] px-4 py-4 text-left sm:mt-7 sm:px-5 sm:py-5">
            <div className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise">
                <ShieldCheckIcon className="size-4" aria-hidden={true} />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-semibold text-heading sm:text-[0.95rem]">
                  Pago seguro con Transbank
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  MiniApps Emprende es un producto desarrollado por Bebidas
                  Artesanales FUCOR.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Por este motivo, el pago será procesado por Transbank y el
                  comercio aparecerá identificado como{" "}
                  <span className="font-semibold text-foreground">
                    Bebidas Artesanales FUCOR
                  </span>
                  .
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Tu licencia de MiniApps Emprende será activada una vez
                  confirmado el pago.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-7">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isStartingCheckout}
              onClick={handleUnlock}
              className="h-auto min-h-14 w-full whitespace-normal bg-[#2563EB] px-4 py-3 text-sm font-semibold leading-snug shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:h-14 sm:w-auto sm:min-w-[16rem] sm:whitespace-nowrap sm:px-10 sm:py-2.5 sm:text-base"
            >
              {isStartingCheckout
                ? "Abriendo pago…"
                : "Comprar licencia"}
            </Button>
          </div>
        </div>

        {/* 5. Garantía */}
        <div className="rounded-[18px] border border-[#E8EEF5] bg-[#F7FAFF] px-4 py-7 text-center sm:px-10 sm:py-8">
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-foreground sm:text-base">
            Con tu licencia obtienes acceso permanente a esta MiniApp. Podrás
            calcular ilimitadamente y generar Informes Profesionales PDF cuando
            lo necesites.
          </p>
          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-sm">
            No almacenamos datos bancarios. El pago es procesado por Transbank.
            Licencia personal y no transferible.
          </p>
        </div>
      </div>
    </section>
  )
}
