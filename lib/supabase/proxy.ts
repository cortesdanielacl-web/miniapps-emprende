import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { CALCULATOR_ENTRY_HREF } from "@/config/routes"
import { sanitizeNext } from "@/lib/navigation/safe-next"
import {
  ACCESS_VALIDATION_FAILED_MESSAGE,
  logSecurityError,
} from "@/lib/security-log"
import { getSupabaseEnv } from "@/lib/supabase/env"

function isProtectedPage(pathname: string): boolean {
  return pathname.startsWith("/calculadora")
}

function isPremiumApi(pathname: string): boolean {
  return pathname.startsWith("/api/professional-report")
}

/** Rutas auth donde un usuario ya autenticado se redirige fuera (excepto recovery). */
function isAuthBounceRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password")
  )
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = "/login"
  redirectUrl.search = ""
  redirectUrl.searchParams.set("next", sanitizeNext(pathname))
  return NextResponse.redirect(redirectUrl)
}

function denyPremiumApi() {
  return NextResponse.json(
    { error: ACCESS_VALIDATION_FAILED_MESSAGE },
    { status: 403 }
  )
}

/**
 * Refresca la sesión Auth y protege rutas privadas.
 * Estrategia Fail Closed: sin env, sin claims o con error → no autenticado.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const env = getSupabaseEnv()

  // Sin configuración: imposible validar sesión → denegar rutas protegidas.
  if (!env) {
    if (isPremiumApi(pathname)) {
      return denyPremiumApi()
    }
    if (isProtectedPage(pathname)) {
      return redirectToLogin(request, pathname)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value)
        })
      },
    },
  })

  let claims: { sub?: string } | null = null
  try {
    const { data, error } = await supabase.auth.getClaims()
    if (error) {
      logSecurityError("proxy", error, "getClaims rejected session")
      claims = null
    } else {
      claims = (data?.claims as { sub?: string } | undefined) ?? null
    }
  } catch (error) {
    logSecurityError("proxy", error, "getClaims threw — treating as anonymous")
    claims = null
  }

  const isAuthenticated = Boolean(claims?.sub)

  if ((isProtectedPage(pathname) || isPremiumApi(pathname)) && !isAuthenticated) {
    if (isPremiumApi(pathname)) {
      return denyPremiumApi()
    }
    return redirectToLogin(request, pathname)
  }

  // /reset-password queda accesible con sesión de recovery (no bounce).
  if (isAuthBounceRoute(pathname) && isAuthenticated) {
    const destination = sanitizeNext(
      request.nextUrl.searchParams.get("next"),
      CALCULATOR_ENTRY_HREF
    )
    const destUrl = new URL(destination, request.nextUrl.origin)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = destUrl.pathname
    redirectUrl.search = destUrl.search
    redirectUrl.hash = destUrl.hash
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
