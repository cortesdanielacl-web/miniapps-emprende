import type { Metadata } from "next"

import { PageContainer } from "@/components/common"
import { PurchaseConfirmationView } from "@/features/compra"

export const metadata: Metadata = {
  title: "Confirmación de compra",
  description:
    "Gracias por tu compra. Estamos verificando tu pago para activar tu licencia.",
}

/**
 * Único retorno postventa (Link de Pago / Webpay Plus commit).
 * Configurar /compra/confirmacion como URL de redirección en Transbank.
 * /resultado-pago redirige aquí (308) por compatibilidad.
 */
export default function CompraConfirmacionPage() {
  return (
    <PageContainer
      size="md"
      className="px-3 py-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
    >
      <PurchaseConfirmationView />
    </PageContainer>
  )
}
