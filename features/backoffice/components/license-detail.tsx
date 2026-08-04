"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  formatBackofficeAmount,
  formatBackofficeDate,
  statusEmoji,
  statusLabel,
} from "@/features/backoffice/format"
import { activatePendingPurchaseAction } from "@/features/pending-purchases/actions"
import type { PendingPurchase } from "@/features/pending-purchases/types"

type LicenseDetailProps = {
  purchase: PendingPurchase
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#E8EEF5] py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all text-heading sm:text-right">
        {value}
      </p>
    </div>
  )
}

export function LicenseDetail({ purchase }: LicenseDetailProps) {
  const router = useRouter()
  const [row, setRow] = useState(purchase)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleActivate() {
    setError(null)
    startTransition(async () => {
      const result = await activatePendingPurchaseAction(row.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setRow(result.data)
      router.refresh()
    })
  }

  const canActivate = row.status === "pending"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/backoffice/licenses" className="hover:underline">
              Licencias
            </Link>{" "}
            / Detalle
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-heading">
            Compra {row.buyOrder}
          </h1>
        </div>
        <p className="text-sm font-medium text-foreground">
          {statusEmoji(row.status)} {statusLabel(row.status)}
        </p>
      </div>

      <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-5 shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-6">
        <DetailRow
          label="Nombre"
          value={row.customerName?.trim() || "—"}
        />
        <DetailRow label="Correo" value={row.email} />
        <DetailRow label="Producto" value={row.product} />
        <DetailRow label="Monto" value={formatBackofficeAmount(row.amount)} />
        <DetailRow
          label="Fecha"
          value={formatBackofficeDate(row.paymentDate)}
        />
        <DetailRow label="Buy Order" value={row.buyOrder} />
        <DetailRow
          label="Transaction Token"
          value={row.transactionToken || "—"}
        />
        <DetailRow
          label="Estado"
          value={`${statusEmoji(row.status)} ${statusLabel(row.status)}`}
        />
        {row.activatedAt ? (
          <DetailRow
            label="Activada el"
            value={formatBackofficeDate(row.activatedAt)}
          />
        ) : null}
      </div>

      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={!canActivate || isPending}
          onClick={handleActivate}
        >
          {row.status === "activated"
            ? "Licencia activada"
            : isPending
              ? "Activando…"
              : "Activar licencia"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/backoffice/licenses">Volver al listado</Link>
        </Button>
      </div>
    </div>
  )
}
