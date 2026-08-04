import type { Metadata } from "next"
import Link from "next/link"

import { requireBackofficeAccess } from "@/features/backoffice/require-backoffice.server"
import {
  formatBackofficeAmount,
  formatBackofficeDate,
  statusEmoji,
  statusLabel,
} from "@/features/backoffice/format"
import { pendingPurchaseService } from "@/features/pending-purchases/pending-purchase-service.server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function BackofficeDashboardPage() {
  await requireBackofficeAccess("/backoffice")
  const stats = await pendingPurchaseService.getDashboardStats()

  const cards = [
    {
      label: "Licencias pendientes",
      value: String(stats.pendingCount),
    },
    {
      label: "Licencias activadas",
      value: String(stats.activatedCount),
    },
    {
      label: "Ventas del día",
      value: formatBackofficeAmount(stats.salesTodayAmount),
    },
    {
      label: "Ventas del mes",
      value: formatBackofficeAmount(stats.salesMonthAmount),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-heading sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Resumen operativo de compras y licencias.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[18px] border border-[#E8EEF5] bg-white px-5 py-5 shadow-[0_2px_12px_rgb(15_44_76/0.04)]"
          >
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {card.label}
            </p>
            <p className="mt-3 font-heading text-2xl font-bold text-heading tabular-nums sm:text-3xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-[18px] border border-[#E8EEF5] bg-white shadow-[0_2px_12px_rgb(15_44_76/0.04)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E8EEF5] px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-heading">
            Últimas compras
          </h2>
          <Link
            href="/backoffice/licenses"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F7FAFF] text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    Aún no hay compras registradas.
                  </td>
                </tr>
              ) : (
                stats.recentPurchases.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#E8EEF5]"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/backoffice/licenses/${row.id}`}
                        className="font-medium text-heading hover:underline"
                      >
                        {row.customerName?.trim() || row.email}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">{row.product}</td>
                    <td className="px-5 py-3 tabular-nums text-foreground">
                      {formatBackofficeAmount(row.amount)}
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {formatBackofficeDate(row.paymentDate)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-foreground">
                      {statusEmoji(row.status)} {statusLabel(row.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
