import { createBrowserClient } from "@supabase/ssr"

import { requireSupabaseEnv } from "@/lib/supabase/env"

/**
 * Cliente Supabase para Client Components.
 * Patrón oficial @supabase/ssr (singleton interno).
 */
export function createClient() {
  const { url, publishableKey } = requireSupabaseEnv()
  return createBrowserClient(url, publishableKey)
}

/** Alias de aplicación — preferir createClient en código nuevo. */
export const createSupabaseBrowserClient = createClient
