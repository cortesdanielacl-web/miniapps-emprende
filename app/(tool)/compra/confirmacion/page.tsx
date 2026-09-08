import type { Metadata } from "next"

import { PageContainer } from "@/components/common"
import { PurchaseConfirmationView } from "@/features/compra"
import { readWebpayConfirmationState } from "@/features/compra/webpay-operation-result.server"

export const metadata: Metadata = {
  title: "Confirmación de compra",
  description: "Resultado de tu operación de pago en MiniApps Emprende.",
}

/**
 * Único retorno postventa (Webpay Plus commit).
 * Solo lectura: no registra compras. /resultado-pago redirige aquí (308).
 * El resultado reciente lo define la cookie firmada de commit, no ?status=.
 */
export default async function CompraConfirmacionPage() {
  const operationResult = await readWebpayConfirmationState()

  return (
    <PageContainer
      size="md"
      className="px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
    >
      <PurchaseConfirmationView operationResult={operationResult} />
    </PageContainer>
  )
}
