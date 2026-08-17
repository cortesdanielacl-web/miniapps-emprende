"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  COMMERCIAL,
  formatCommercialPrice,
} from "@/config/commercial"
import { COMPANY, getSupportEmailHref } from "@/config/company"
import { CALCULATOR_ENTRY_HREF } from "@/config/routes"
import { useAuth } from "@/features/auth/use-auth"
import { premiumAccessService } from "@/features/licensing/premium-access-service"
import { registerPendingPurchaseFromCheckoutAction } from "@/features/pending-purchases/actions"
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

/**
 * Pantalla postventa: tranquilidad + estado de licencia.
 * Pendiente hoy (activación manual); activa vía premiumAccessService.
 */
export function PurchaseConfirmationView() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<LicenseUiStatus>("pending")
  const [checkingLicense, setCheckingLicense] = useState(true)
  const [pendingRecorded, setPendingRecorded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function resolveLicenseStatus() {
      if (authLoading) {
        setCheckingLicense(true)
        return
      }

      setCheckingLicense(true)
      try {
        const hasAccess =
          await premiumAccessService.hasPremiumAccess(COMMERCIAL.productId)
        if (!cancelled) {
          setStatus(hasAccess ? "active" : "pending")
        }

        // Link de Pago / retorno postventa: registrar pending sin auto-activar.
        // hasPremiumAccess solo define el estado visual; no bloquea el registro.
        let recorded = false
        if (isAuthenticated) {
          const result = await registerPendingPurchaseFromCheckoutAction()
          recorded = Boolean(result.ok && result.data)
        }
        if (!cancelled) {
          setPendingRecorded(recorded)
        }
      } finally {
        if (!cancelled) {
          setCheckingLicense(false)
        }
      }
    }

    void resolveLicenseStatus()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, authLoading])

  const isActive = status === "active"
  const hasUnverifiedPurchase = isActive && pendingRecorded
  const timeline = buildTimeline(status, hasUnverifiedPurchase)

  const accountHref = isAuthenticated
    ? CALCULATOR_ENTRY_HREF
    : `/login?next=${encodeURIComponent(CALCULATOR_ENTRY_HREF)}`

  const primaryHref = isActive ? CALCULATOR_ENTRY_HREF : accountHref
  const primaryLabel = isActive
    ? "Comenzar a usar la MiniApp"
    : "Ir a mi cuenta"

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Encabezado */}
      <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-8 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-10 sm:py-10">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-heading break-words sm:text-3xl">
          🎉 ¡Gracias por tu compra!
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          Hemos recibido tu solicitud correctamente.
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-foreground sm:text-base">
          {hasUnverifiedPurchase
            ? "Tu licencia actual sigue activa. La nueva compra quedó pendiente de verificación."
            : isActive
              ? "Tu licencia ya está activa. Puedes utilizar la MiniApp sin restricciones."
              : "Estamos verificando tu pago para activar tu licencia."}
        </p>
      </div>

      {/* Estado de licencia */}
      <div
        className={cn(
          "rounded-[18px] border px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9",
          isActive
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

      {hasUnverifiedPurchase && !checkingLicense ? (
        <div
          className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8 sm:py-9"
          aria-live="polite"
        >
          <p className="font-heading text-base font-semibold text-heading sm:text-lg">
            🟡 Compra pendiente de verificación
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Registramos tu solicitud de compra. Tu licencia actual sigue activa.
            El equipo verificará el pago y te informará cuando corresponda.
          </p>
        </div>
      ) : null}

      {/* Línea de tiempo */}
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

      {/* Detalle de compra */}
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

      {/* Acciones */}
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

      {/* Ayuda — solo correo electrónico */}
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
