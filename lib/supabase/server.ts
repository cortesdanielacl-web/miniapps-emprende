import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { requireSupabaseEnv } from "@/lib/supabase/env"

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Patrón oficial @supabase/ssr — crear uno nuevo por request.
 */
export async function createClient() {
  const { url, publishableKey } = requireSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components no pueden escribir cookies.
          // El Proxy (lib/supabase/proxy) refresca la sesión en cada request.
        }
      },
    },
  })
}

/** Alias de aplicación — preferir createClient en código nuevo. */
export const createSupabaseServerClient = createClient
