"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  COMMERCIAL,
  formatCommercialPrice,
} from "@/config/commercial"
import { COMPANY, getSupportEmailHref } from "@/config/company"
import {
  CALCULATOR_ENTRY_HREF,
  COMMERCIAL_CHECKOUT_HREF,
} from "@/config/routes"
import { useAuth } from "@/features/auth/use-auth"
import type { WebpayConfirmationState } from "@/features/compra/webpay-operation-result"
import { premiumAccessService } from "@/features/licensing/premium-access-service"
import { getMyCommercialPurchaseStateAction } from "@/features/pending-purchases/actions"
import { cn } from "@/lib/utils"

type LicenseUiStatus = "pending" | "active"

type TimelineStep = {
  id: string
  label: string
  marker: "done" | "current" | "todo"
}

function buildTimeline(
  status: LicenseUiStatus,
  hasUnverifiedPurchase: boolean
): TimelineStep[] {
  if (status === "active" && hasUnverifiedPurchase) {
    return [
      { id: "account", label: "Cuenta creada", marker: "done" },
      { id: "license", label: "Licencia activa", marker: "done" },
      { id: "purchase", label: "Compra registrada", marker: "done" },
      { id: "verify", label: "Verificando pago", marker: "current" },
    ]
  }

  if (status === "active") {
    return [
      { id: "account", label: "Cuenta creada", marker: "done" },
      { id: "purchase", label: "Compra realizada", marker: "done" },
      { id: "verify", label: "Pago verificado", marker: "done" },
      { id: "license", label: "Licencia activa", marker: "done" },
      { id: "access", label: "Acceso ilimitado", marker: "done" },
    ]
  }

  return [
    { id: "account", label: "Cuenta creada", marker: "done" },
    { id: "purchase", label: "Compra realizada", marker: "done" },
    { id: "verify", label: "Verificando pago", marker: "current" },
    { id: "license", label: "Licencia activa", marker: "todo" },
    { id: "access", label: "Acceso ilimitado", marker: "todo" },
  ]
}

function timelineMarker(marker: TimelineStep["marker"]): string {
  if (marker === "done") return "✓"
  if (marker === "current") return "🟡"
  return "⬜"
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8EEF5] py-3 last:border-b-0">
      <p className="text-sm text-muted-foreground sm:text-base">{label}</p>
      <p className="text-right text-sm font-semibold text-heading sm:text-base">
        {value}
      </p>
    </div>
  )
}

function operationCopy(result: WebpayConfirmationState): {
  title: string
  text: string
} {
  switch (result) {
    case "approved":
      return {
        title: "Compra realizada correctamente",
        text: "Recibimos tu pago. Tu licencia está pendiente de activación.",
      }
    case "declined":
      return {
        title: "Pago rechazado",
        text: "La tarjeta no fue autorizada. No se realizó el cobro.",
      }
    case "cancelled":
      return {
        title: "Compra cancelada",
        text: "La operación fue cancelada y no se realizó el cobro.",
      }
    case "error_before_authorization":
      return {
        title: "No se pudo completar el pago",
        text: "La operación no pudo finalizarse. Puedes intentarlo nuevamente.",
      }
    case "authorized_persistence_error":
      return {
        title: "Pago autorizado",
        text: "Tu pago fue autorizado, pero tuvimos un problema al registrar la compra. No vuelvas a realizar el pago. Estamos verificando la operación.",
      }
    default:
      return {
        title: "No hay una compra reciente",
        text: "No encontramos una operación de pago reciente. Si no completaste el pago en Webpay, no se registró ni se cobró nada.",
      }
  }
}

/**
 * Pantalla postventa de solo lectura.
 * No crea pending_purchases ni envía correos.
 * El resultado de la operación lo entrega el servidor (cookie firmada de commit).
 */
export function PurchaseConfirmationView({
  operationResult,
}: {
  operationResult: WebpayConfirmationState
}) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<LicenseUiStatus>("pending")
  const [hasPendingPurchase, setHasPendingPurchase] = useState(false)
  const [checkingLicense, setCheckingLicense] = useState(
    operationResult === "approved"
  )

  const isApprovedOperation = operationResult === "approved"

  useEffect(() => {
    if (!isApprovedOperation) {
      return
    }

    let cancelled = false

    async function resolveConfirmationState() {
      if (authLoading) {
        setCheckingLicense(true)
        return
      }

      setCheckingLicense(true)
      try {
        const hasAccess =
          await premiumAccessService.hasPremiumAccess(COMMERCIAL.productId)
        const purchaseState = await getMyCommercialPurchaseStateAction()
        if (cancelled) return

        setStatus(hasAccess ? "active" : "pending")
        setHasPendingPurchase(
          Boolean(purchaseState.ok && purchaseState.data.hasPendingPurchase)
        )
      } finally {
        if (!cancelled) {
          setCheckingLicense(false)
        }
      }
    }

    void resolveConfirmationState()
    return () => {
      cancelled = true
    }
  }, [isApprovedOperation, isAuthenticated, authLoading])

  const copy = operationCopy(operationResult)
  const isActive = status === "active"
  const hasUnverifiedPurchase = isApprovedOperation && isActive && hasPendingPurchase
  const showApprovedProgress = isApprovedOperation && !checkingLicense
  const timeline = buildTimeline(status, hasUnverifiedPurchase)

  const accountHref = isAuthenticated
    ? CALCULATOR_ENTRY_HREF
    : `/login?next=${encodeURIComponent(CALCULATOR_ENTRY_HREF)}`

  const retryHref = isAuthenticated
    ? COMMERCIAL_CHECKOUT_HREF
    : `/login?next=${encodeURIComponent(COMMERCIAL_CHECKOUT_HREF)}`

  const primaryHref =
    operationResult === "authorized_persistence_error"
      ? accountHref
      : operationResult === "approved"
        ? isActive
          ? CALCULATOR_ENTRY_HREF
          : accountHref
        : retryHref

  const primaryLabel =
    operationResult === "authorized_persistence_error"
      ? "Ir a mi cuenta"
      : operationResult === "approved"
        ? isActive
          ? "Comenzar a usar la MiniApp"
          : "Ir a mi cuenta"
        : operationResult === "none"
          ? "Ir al pago"
          : "Intentar de nuevo"

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-8 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-10 sm:py-10">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-heading break-words sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          {copy.text}
        </p>
      </div>

      {isApprovedOperation ? (
        <div
          className={cn(
            "rounded-[18px] border px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9",
            isActive && !checkingLicense
              ? "border-brand-turquoise/30 bg-[#F0FDFA]"
              : "border-[#E8EEF5] bg-white"
          )}
          aria-live="polite"
        >
          <p className="font-heading text-base font-semibold text-heading sm:text-lg">
            {checkingLicense
              ? "Revisando estado de tu licencia…"
              : isActive
                ? "🟢 Licencia activa"
                : "🟡 Licencia pendiente de activación"}
          </p>
          {!checkingLicense && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {isActive ? (
                <p>
                  Ya puedes calcular sin límites y generar Informes Profesionales
                  PDF ilimitados.
                </p>
              ) : (
                <>
                  <p>
                    Nuestro equipo verificará el pago recibido mediante Transbank.
                  </p>
                  <p>
                    Una vez confirmado, tu licencia será activada y podrás utilizar
                    la MiniApp sin restricciones.
                  </p>
                  <p>
                    Este proceso normalmente demora solo unos minutos dentro del
                    horario de atención.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      ) : null}

      {hasUnverifiedPurchase && !checkingLicense ? (
        <div
          className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9"
          aria-live="polite"
        >
          <p className="font-heading text-base font-semibold text-heading sm:text-lg">
            🟡 Compra pendiente de verificación
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Registramos tu pago aprobado. Tu licencia actual sigue activa.
            El equipo verificará el pago y te informará cuando corresponda.
          </p>
        </div>
      ) : null}

      {showApprovedProgress ? (
        <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9">
          <h2 className="font-heading text-base font-semibold text-heading sm:text-lg">
            Siguientes pasos
          </h2>
          <ol className="mt-5 space-y-3">
            {timeline.map((step) => (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-3 text-sm sm:text-base",
                  step.marker === "todo"
                    ? "text-muted-foreground/70"
                    : "text-foreground"
                )}
              >
                <span className="w-6 shrink-0 text-center" aria-hidden>
                  {timelineMarker(step.marker)}
                </span>
                <span
                  className={cn(
                    step.marker === "current" && "font-medium text-heading",
                    step.marker === "done" && "text-foreground"
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {showApprovedProgress ? (
        <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9">
          <h2 className="font-heading text-base font-semibold text-heading sm:text-lg">
            Detalle de tu compra
          </h2>
          <div className="mt-5">
            <InfoRow label="Producto" value={COMMERCIAL.productName} />
            <InfoRow label="Licencia" value={COMMERCIAL.licenseTypeLabel} />
            <InfoRow label="Precio" value={formatCommercialPrice()} />
            <InfoRow label="Pago" value={COMMERCIAL.paymentTypeLabel} />
            <InfoRow label="Suscripciones" value="Sin suscripciones" />
          </div>
        </div>
      ) : null}

      <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-8 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-10 sm:py-10">
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="h-auto min-h-12 w-full whitespace-normal bg-[#2563EB] px-4 py-3 text-sm font-semibold leading-snug shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:w-auto sm:min-w-[14rem] sm:whitespace-nowrap sm:px-8 sm:text-base"
          >
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto min-h-12 w-full whitespace-normal px-4 py-3 text-sm font-semibold sm:w-auto sm:min-w-[12rem] sm:whitespace-nowrap sm:px-8 sm:text-base"
          >
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#E8EEF5] bg-[#F7FAFF] px-4 py-7 sm:px-8 sm:py-9">
        <h2 className="font-heading text-base font-semibold text-heading sm:text-lg">
          ¿Necesitas ayuda?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Escríbenos a:
        </p>
        <p className="mt-2 text-sm text-foreground sm:text-base">
          <a
            href={getSupportEmailHref()}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {COMPANY.supportEmail}
          </a>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Responderemos a la brevedad.
        </p>
      </div>
    </div>
  )
}
