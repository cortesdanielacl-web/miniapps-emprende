import "server-only"

import { createClient } from "@supabase/supabase-js"

import {
  requireServiceRoleKey,
  requireSupabaseEnv,
} from "@/lib/supabase/env"

/**
 * Cliente Supabase con service role.
 * Solo servidor — bypassea RLS para escrituras admin de licencias.
 * Fail closed si falta URL o SERVICE_ROLE_KEY.
 */
export function createServiceRoleClient() {
  const { url } = requireSupabaseEnv()
  const serviceRoleKey = requireServiceRoleKey()

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
