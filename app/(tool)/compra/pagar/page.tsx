import type { Metadata } from "next"

import { PageContainer } from "@/components/common"
import { StartCommercialCheckoutView } from "@/features/compra/start-commercial-checkout-view"

export const metadata: Metadata = {
  title: "Pagar licencia",
  description: "Inicia el pago seguro con Transbank Webpay Plus.",
}

export default function CompraPagarPage() {
  return (
    <PageContainer
      size="md"
      className="px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
    >
      <StartCommercialCheckoutView />
    </PageContainer>
  )
}
