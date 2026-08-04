import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/backoffice/components/placeholder-page"
import { requireBackofficeAccess } from "@/features/backoffice/require-backoffice.server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Ventas",
}

export default async function BackofficeVentasPage() {
  await requireBackofficeAccess("/backoffice/ventas")

  return (
    <PlaceholderPage
      title="Ventas"
      description="Aquí podrás analizar ventas, periodos y reportes comerciales."
    />
  )
}
