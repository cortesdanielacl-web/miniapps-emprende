import { NextResponse } from "next/server"

import { RESET_PASSWORD_HREF } from "@/config/routes"
import { sanitizeNext } from "@/lib/navigation/safe-next"
import { createClient } from "@/lib/supabase/server"

/**
 * Intercambio del código PKCE de Supabase Auth.
 * Usado por el email de recuperación de contraseña (y futuros confirms).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = sanitizeNext(
    searchParams.get("next"),
    RESET_PASSWORD_HREF
  )

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL(next, origin))
      }
    } catch {
      // Fail closed: sin env o error de intercambio → login.
    }
  }

  const loginUrl = new URL("/login", origin)
  loginUrl.searchParams.set("error", "recovery_link_invalid")
  return NextResponse.redirect(loginUrl)
}
