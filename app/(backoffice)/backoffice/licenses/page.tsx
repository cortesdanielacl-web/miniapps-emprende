import type { Metadata } from "next"

import { LicensesTable } from "@/features/backoffice/components/licenses-table"
import { requireBackofficeAccess } from "@/features/backoffice/require-backoffice.server"
import { pendingPurchaseService } from "@/features/pending-purchases/pending-purchase-service.server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Licencias",
}

export default async function BackofficeLicensesPage() {
  await requireBackofficeAccess("/backoffice/licenses")
  const rows = await pendingPurchaseService.listForAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-heading sm:text-3xl">
          Licencias
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Revisa y activa manualmente las compras confirmadas por Webpay.
        </p>
      </div>
      <LicensesTable initialRows={rows} />
    </div>
  )
}
