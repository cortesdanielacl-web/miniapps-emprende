import { permanentRedirect } from "next/navigation"

import { getConfirmationPath } from "@/config/commercial"

/**
 * Compatibilidad: la postventa unificada vive en /compra/confirmacion.
 * 308 Permanent Redirect — no hay UI ni lógica de pago aquí.
 */
export default function ResultadoPagoLegacyPage() {
  permanentRedirect(getConfirmationPath())
}
