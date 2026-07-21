"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { DownloadIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { EmptyState } from "@/components/common"
import { Button } from "@/components/ui/button"
import type { CostCalculatorResult } from "@/features/calculadora-costos/calculate"
import { CalculatorResultsReport } from "@/features/calculadora-costos/calculator-results-report"
import {
  takePendingProfessionalReportForDisplay,
  type PendingProfessionalReport,
} from "@/features/calculadora-costos/services/createWebpayPayment"
import {
  isPaymentResultStatus,
  PAYMENT_STATUS,
  type PaymentResultStatus,
} from "@/features/calculadora-costos/services/paymentStatus"

type ViewStatus = PaymentResultStatus | "unknown"

const SNAPSHOT_RECOVERY_MESSAGE =
  "No pudimos recuperar tu cálculo. Por favor realiza nuevamente el cálculo."

function parseStatus(value: string | null): ViewStatus {
  if (isPaymentResultStatus(value)) {
    return value
  }
  return "unknown"
}

function StatusMessage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button asChild variant="primary" size="lg">
          <Link href="/calculadora">Volver a la calculadora</Link>
        </Button>
      }
    />
  )
}

function DownloadProfessionalReportButton({
  result,
}: {
  result: CostCalculatorResult
}) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setError(null)
    setIsDownloading(true)
    try {
      const { downloadProfessionalReportPdf } = await import(
        "@/features/calculadora-costos/pdf/download-professional-report-pdf"
      )
      await downloadProfessionalReportPdf(result)
    } catch {
      setError("No se pudo generar el PDF. Inténtalo nuevamente.")
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
        {isDownloading ? "Generando PDF…" : "Descargar PDF"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function ResultadoPagoView() {
  const searchParams = useSearchParams()
  const status = parseStatus(searchParams.get("status"))
  const [pending, setPending] = useState<PendingProfessionalReport | null>(
    null
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (status === PAYMENT_STATUS.SUCCESS) {
      // Caso 10: consume y limpia el snapshot; cache de página evita pérdida en Strict Mode.
      setPending(takePendingProfessionalReportForDisplay())
    } else {
      // Sin pago exitoso nunca se muestra el informe, aunque exista un snapshot.
      setPending(null)
    }
    setReady(true)
  }, [status])

  if (!ready) {
    return (
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        Cargando resultado del pago…
      </p>
    )
  }

  if (status === PAYMENT_STATUS.REJECTED) {
    return (
      <StatusMessage
        title="Pago no completado"
        description="Tu pago fue rechazado o cancelado. No se realizó ningún cobro. Puedes volver a la calculadora e intentarlo nuevamente."
      />
    )
  }

  if (status === PAYMENT_STATUS.ERROR) {
    return (
      <StatusMessage
        title="No pudimos confirmar el pago"
        description="Ocurrió un problema al validar la transacción. Si se realizó un cobro, contacta soporte con tu comprobante."
      />
    )
  }

  // Caso 4: acceso directo sin haber pagado (sin status válido).
  if (status !== PAYMENT_STATUS.SUCCESS) {
    return (
      <StatusMessage
        title="No existe un cálculo disponible"
        description="No hay un pago confirmado ni un cálculo pendiente en esta sesión. Vuelve a la calculadora para generar uno nuevo."
      />
    )
  }

  // Casos 5 y 6: success sin snapshot (refresh tras limpieza o sesión vacía).
  if (!pending) {
    return (
      <StatusMessage
        title="Cálculo no disponible"
        description={SNAPSHOT_RECOVERY_MESSAGE}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
          ¡Pago exitoso!
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          Aquí tienes tu Informe Profesional.
        </p>
      </div>
      <DownloadProfessionalReportButton result={pending.result} />
      <CalculatorResultsReport result={pending.result} />
    </div>
  )
}
