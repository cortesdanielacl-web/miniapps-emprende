import type { Metadata } from "next"
import Link from "next/link"

import { PageContainer } from "@/components/common"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VALIDATION_MODE } from "@/config/validation"
import { CostCalculatorForm } from "@/features/calculadora-costos/calculadora-form"
import { landingContent } from "@/features/landing/content"

export const metadata: Metadata = {
  title: "Calcula el precio correcto de tus productos",
  description:
    "Conoce el costo real, considera todos tus gastos, agrega automáticamente el IVA y obtén un precio sugerido de venta en pocos minutos.",
}

export default function CalculadoraValidacionPage() {
  if (VALIDATION_MODE) {
    return (
      <PageContainer size="xl" className="px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="min-w-0 rounded-[1.25rem] border border-[#E8EEF5] bg-white p-3 shadow-[0_2px_16px_rgb(15_44_76/0.04)] sm:rounded-[1.75rem] sm:p-8 lg:p-10">
          <CostCalculatorForm unlockResults />
        </div>
      </PageContainer>
    )
  }

  const paymentUrl = landingContent.pricing.cta.href

  return (
    <PageContainer size="xl" className="px-3 py-5 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center sm:gap-10">
        <div className="space-y-3.5 sm:space-y-5">
          <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-heading sm:text-4xl sm:leading-normal">
            🚀 La etapa de validación ha finalizado
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-lg">
            Muchas gracias por haber participado en la validación exclusiva de
            la Calculadora Inteligente de Costos.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-lg">
            Gracias a los comentarios recibidos estamos realizando las últimas
            mejoras antes del lanzamiento oficial.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-lg">
            Si registraste tu correo durante la validación, recibirás un
            beneficio exclusivo cuando la herramienta esté disponible.
          </p>
        </div>

        <Card className="w-full max-w-lg text-left">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Calculadora Inteligente de Costos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-foreground sm:text-base">
              <li>• Acceso ilimitado</li>
              <li>• Pago único</li>
              <li>• Actualizaciones futuras</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <Link href={paymentUrl}>Comprar ahora</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
