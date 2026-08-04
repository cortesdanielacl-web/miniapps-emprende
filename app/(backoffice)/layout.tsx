import type { Metadata } from "next"

import { BackofficeShell } from "@/features/backoffice/components/backoffice-shell"
import { requireAdmin } from "@/features/admin/require-admin.server"

export const metadata: Metadata = {
  title: {
    default: "Backoffice",
    template: "%s · Backoffice MiniApps",
  },
  robots: { index: false, follow: false },
}

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()

  if (!admin.ok || !admin.user?.email) {
    return (
      <div className="min-h-full flex-1 bg-[#EEF6FF]">
        <div className="mx-auto max-w-lg px-4 py-16">{children}</div>
      </div>
    )
  }

  return (
    <BackofficeShell adminEmail={admin.user.email}>{children}</BackofficeShell>
  )
}
