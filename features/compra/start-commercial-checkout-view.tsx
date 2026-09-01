"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { COMMERCIAL_CHECKOUT_HREF } from "@/config/routes"
import { useAuth } from "@/features/auth/use-auth"
import { startCommercialCheckout } from "@/features/calculadora-costos/services/report-checkout"

/**
 * Retoma el checkout Webpay Plus tras login (landing "Comprar ahora").
 * No registra compras: solo llama a /api/webpay/create.
 */
export function StartCommercialCheckoutView() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const startedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || startedRef.current) return

    if (!isAuthenticated) {
      startedRef.current = true
      window.location.assign(
        `/login?next=${encodeURIComponent(COMMERCIAL_CHECKOUT_HREF)}`
      )
      return
    }

    startedRef.current = true
    void startCommercialCheckout().catch(() => {
      setError("No fue posible iniciar el pago. Inténtalo nuevamente.")
    })
  }, [authLoading, isAuthenticated])

  return (
    <div className="mx-auto max-w-md rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-10 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-8">
      <h1 className="font-heading text-xl font-semibold tracking-tight text-heading sm:text-2xl">
        {error ? "No se pudo abrir el pago" : "Abriendo Webpay…"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {error
          ? error
          : "Te redirigiremos al formulario de pago seguro de Transbank."}
      </p>
      {error ? (
        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setError(null)
            startedRef.current = true
            void startCommercialCheckout().catch(() => {
              startedRef.current = false
              setError("No fue posible iniciar el pago. Inténtalo nuevamente.")
            })
            }}
          >
            Reintentar
          </Button>
        </div>
      ) : null}
    </div>
  )
}
