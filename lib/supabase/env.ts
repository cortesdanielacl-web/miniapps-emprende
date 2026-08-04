/**
 * Variables de entorno Supabase (App Router + @supabase/ssr).
 * Fail closed: sin configuración válida no hay autenticación ni acceso premium.
 */

import { logSecurityError } from "@/lib/security-log"

export type SupabaseEnv = {
  url: string
  publishableKey: string
}

let missingPublicEnvLogged = false
let missingServiceRoleLogged = false

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !publishableKey) {
    if (!missingPublicEnvLogged) {
      missingPublicEnvLogged = true
      logSecurityError(
        "env",
        new Error("missing_public_supabase_env"),
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      )
    }
    return null
  }

  return { url, publishableKey }
}

export function requireSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv()
  if (!env) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    )
  }
  return env
}

/** Service role solo servidor. Fail closed si falta. */
export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) {
    if (!missingServiceRoleLogged) {
      missingServiceRoleLogged = true
      logSecurityError(
        "env",
        new Error("missing_service_role_key"),
        "Falta SUPABASE_SERVICE_ROLE_KEY"
      )
    }
    return null
  }
  return key
}

export function requireServiceRoleKey(): string {
  const key = getServiceRoleKey()
  if (!key) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY")
  }
  return key
}

/** ¿La configuración pública de Auth está lista? */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null
}
