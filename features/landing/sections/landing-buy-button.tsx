"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { startCommercialCheckout } from "@/features/calculadora-costos/services/report-checkout"

type LandingBuyButtonProps = {
  label: string
}

export function LandingBuyButton({ label }: LandingBuyButtonProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setError(null)
    setIsStarting(true)
    try {
      await startCommercialCheckout()
    } catch {
      setError("No fue posible iniciar el pago. Inténtalo nuevamente.")
      setIsStarting(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full sm:w-auto sm:min-w-[15rem] sm:px-10"
        disabled={isStarting}
        onClick={() => void handleBuy()}
      >
        {isStarting ? "Abriendo pago…" : label}
      </Button>
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
