import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/backoffice/components/placeholder-page"
import { requireBackofficeAccess } from "@/features/backoffice/require-backoffice.server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Configuración",
}

export default async function BackofficeConfiguracionPage() {
  await requireBackofficeAccess("/backoffice/configuracion")

  return (
    <PlaceholderPage
      title="Configuración"
      description="Aquí podrás ajustar parámetros operativos del Backoffice."
    />
  )
}
