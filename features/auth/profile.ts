import type { User } from "@supabase/supabase-js"

import type { AuthUser, Profile } from "@/features/auth/types"

/** Extrae nombre desde metadata de Supabase Auth. */
export function getDisplayNameFromUser(user: User): string | null {
  const meta = user.user_metadata ?? {}
  const name =
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    null

  return name
}

export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    name: getDisplayNameFromUser(user),
  }
}

/**
 * Construye un Profile a partir del usuario Auth.
 * Estructura preparada para futura tabla `profiles` / edición.
 */
export function mapUserToProfile(user: User): Profile {
  return {
    id: user.id,
    name: getDisplayNameFromUser(user) ?? "",
    email: user.email ?? "",
    createdAt: user.created_at,
  }
}
