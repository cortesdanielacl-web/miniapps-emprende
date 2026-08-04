import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/backoffice/components/placeholder-page"
import { requireBackofficeAccess } from "@/features/backoffice/require-backoffice.server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Clientes",
}

export default async function BackofficeClientesPage() {
  await requireBackofficeAccess("/backoffice/clientes")

  return (
    <PlaceholderPage
      title="Clientes"
      description="Aquí podrás revisar el listado de clientes y su historial de licencias."
    />
  )
}
