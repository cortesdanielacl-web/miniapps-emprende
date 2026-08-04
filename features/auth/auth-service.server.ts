/**
 * Auth solo servidor (RSC / Route Handlers).
 * No importar desde Client Components.
 */

import "server-only"

import {
  mapSupabaseUser,
} from "@/features/auth/profile"
import type { AuthUser } from "@/features/auth/types"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { logSecurityError } from "@/lib/security-log"

export const authServiceServer = {
  /** Usuario autenticado (servidor / RSC). Fail closed → null. */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!getSupabaseEnv()) return null
      const supabase = await createServerClient()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) return null
      return mapSupabaseUser(data.user)
    } catch (error) {
      logSecurityError(
        "authServiceServer",
        error,
        "getCurrentUser fail-closed"
      )
      return null
    }
  },

  /** Verifica identidad en servidor vía JWT (getClaims). Fail closed → false. */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!getSupabaseEnv()) return false
      const supabase = await createServerClient()
      const { data, error } = await supabase.auth.getClaims()
      if (error || !data?.claims) return false
      return true
    } catch (error) {
      logSecurityError(
        "authServiceServer",
        error,
        "isAuthenticated fail-closed"
      )
      return false
    }
  },
}
