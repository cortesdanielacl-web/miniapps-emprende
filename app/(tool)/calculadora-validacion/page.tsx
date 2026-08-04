import { permanentRedirect } from "next/navigation"

import { CALCULATOR_ENTRY_HREF } from "@/config/routes"

/**
 * Compatibilidad: la entrada de producción es /calculadora.
 * 308 Permanent Redirect.
 */
export default function CalculadoraValidacionLegacyPage() {
  permanentRedirect(CALCULATOR_ENTRY_HREF)
}
