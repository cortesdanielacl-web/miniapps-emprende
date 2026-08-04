/**
 * Autorización admin (servidor).
 * ADMIN_EMAILS: lista separada por comas.
 */

import "server-only"

import { getCurrentUser } from "@/features/auth/session.server"

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim()
  if (!raw) return []
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user?.email) {
    return { ok: false as const, reason: "unauthenticated" as const, user: null }
  }

  const admins = getAdminEmails()
  if (admins.length === 0) {
    return { ok: false as const, reason: "not_configured" as const, user }
  }

  const email = user.email.toLowerCase()
  if (!admins.includes(email)) {
    return { ok: false as const, reason: "forbidden" as const, user }
  }

  return { ok: true as const, reason: null, user }
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}
