import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LicenseDetail } from "@/features/backoffice/components/license-detail"
import { requireBackofficeAccess } from "@/features/backoffice/require-backoffice.server"
import { pendingPurchaseService } from "@/features/pending-purchases/pending-purchase-service.server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Detalle de licencia",
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BackofficeLicenseDetailPage({
  params,
}: PageProps) {
  const { id } = await params
  await requireBackofficeAccess(`/backoffice/licenses/${id}`)

  const purchase = await pendingPurchaseService.getById(id)
  if (!purchase) {
    notFound()
  }

  return <LicenseDetail purchase={purchase} />
}
