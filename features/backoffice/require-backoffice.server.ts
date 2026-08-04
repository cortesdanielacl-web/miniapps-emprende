/**
 * Gate de acceso al Backoffice (reutiliza ADMIN_EMAILS).
 */

import "server-only"

import { redirect } from "next/navigation"

import { requireAdmin } from "@/features/admin/require-admin.server"
import type { AuthUser } from "@/features/auth/types"

export async function requireBackofficeAccess(
  nextPath: string
): Promise<AuthUser> {
  const admin = await requireAdmin()

  if (!admin.ok && admin.reason === "unauthenticated") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  if (!admin.ok || !admin.user) {
    redirect("/backoffice/acceso-denegado")
  }

  return admin.user
}
