/**
 * Identidad del usuario autenticado para licencias y servicios.
 * Usa Supabase Auth a través de authService — sin valores simulados.
 */

import { authService } from "@/features/auth/auth-service"
import type { AuthUser } from "@/features/auth/types"

export type { AuthUser }

/** Usuario autenticado (cliente o servidor según el entorno). */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (typeof window === "undefined") {
    return authService.getCurrentUserServer()
  }
  return authService.getCurrentUser()
}

/**
 * ID del usuario autenticado (Supabase Auth).
 * Única fuente de identidad para licencias — no usar params ni storage.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}
