/**
 * Identidad del usuario autenticado (cliente).
 * Usa Supabase Auth browser — sin next/headers.
 */

import { authService } from "@/features/auth/auth-service"
import type { AuthUser } from "@/features/auth/types"

export type { AuthUser }

/** Usuario autenticado en el cliente. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return authService.getCurrentUser()
}

/**
 * ID del usuario autenticado (Supabase Auth).
 * Única fuente de identidad para licencias en cliente.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}
