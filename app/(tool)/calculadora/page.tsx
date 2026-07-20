import type { Metadata } from "next"

import { PageContainer } from "@/components/common"
import { CostCalculatorForm } from "@/features/calculadora-costos/calculadora-form"

export const metadata: Metadata = {
  title: "Calcula el precio correcto de tus productos",
  description:
    "Conoce el costo real, considera todos tus gastos, agrega automáticamente el IVA y obtén un precio sugerido de venta en pocos minutos.",
}

export default function CalculadoraPage() {
  return (
    <PageContainer size="xl" className="px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="min-w-0 rounded-[1.25rem] border border-[#E8EEF5] bg-white p-3 shadow-[0_2px_16px_rgb(15_44_76/0.04)] sm:rounded-[1.75rem] sm:p-8 lg:p-10">
        <CostCalculatorForm />
      </div>
    </PageContainer>
  )
}
