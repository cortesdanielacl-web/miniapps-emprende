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

type LicensesTableProps = {
  initialRows: PendingPurchase[]
}

export function LicensesTable({ initialRows }: LicensesTableProps) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleActivate(purchaseId: string) {
    setError(null)
    setPendingId(purchaseId)

    startTransition(async () => {
      const result = await activatePendingPurchaseAction(purchaseId)
      setPendingId(null)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setRows((prev) =>
        prev.map((row) => (row.id === purchaseId ? result.data : row))
      )
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-[18px] border border-[#E8EEF5] bg-white shadow-[0_2px_12px_rgb(15_44_76/0.04)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#E8EEF5] bg-[#F7FAFF] text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No hay compras registradas.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const canActivate = row.status === "pending"
                const activating = isPending && pendingId === row.id

                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#E8EEF5] last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-heading">
                      <Link
                        href={`/backoffice/licenses/${row.id}`}
                        className="hover:underline"
                      >
                        {row.customerName?.trim() || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.email}</td>
                    <td className="px-4 py-3 text-foreground">{row.product}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {formatBackofficeAmount(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatBackofficeDate(row.paymentDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">
                      {statusEmoji(row.status)} {statusLabel(row.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/backoffice/licenses/${row.id}`}>
                            Ver
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={!canActivate || activating}
                          onClick={() => handleActivate(row.id)}
                        >
                          {row.status === "activated"
                            ? "Activada"
                            : activating
                              ? "Activando…"
                              : "Activar licencia"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
