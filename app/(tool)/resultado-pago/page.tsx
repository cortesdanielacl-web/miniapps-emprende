import type { Metadata } from "next"
import { Suspense } from "react"

import { PageContainer } from "@/components/common"
import { ResultadoPagoView } from "@/features/calculadora-costos/resultado-pago-view"

export const metadata: Metadata = {
  title: "Resultado del pago",
  description: "Confirmación del pago y acceso a tu Informe Profesional.",
}

export default function ResultadoPagoPage() {
  return (
    <PageContainer size="xl" className="px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="min-w-0 rounded-[1.25rem] border border-[#E8EEF5] bg-white p-3 shadow-[0_2px_16px_rgb(15_44_76/0.04)] sm:rounded-[1.75rem] sm:p-8 lg:p-10">
        <Suspense
          fallback={
            <p className="text-center text-sm text-muted-foreground">
              Cargando resultado del pago…
            </p>
          }
        >
          <ResultadoPagoView />
        </Suspense>
      </div>
    </PageContainer>
  )
}
