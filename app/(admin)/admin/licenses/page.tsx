import { permanentRedirect } from "next/navigation"

/**
 * Compatibilidad: el panel vive en /backoffice/licenses.
 */
export default function AdminLicensesLegacyPage() {
  permanentRedirect("/backoffice/licenses")
}
