/**
 * Validación única de destinos post-auth (?next=).
 * Solo rutas internas relativas — nunca URLs absolutas ni open redirects.
 */

import { CALCULATOR_ENTRY_HREF } from "@/config/routes"

/** Origin ficticio para parsear paths relativos con la API URL. */
const PARSE_ORIGIN = "https://miniapps-emprende.local"

/**
 * ¿Es una ruta interna segura (path relativo de MiniApps Emprende)?
 * Rechaza URLs absolutas, protocol-relative, schemes y backslashes.
 */
export function isSafeInternalPath(
  path: string | null | undefined
): path is string {
  if (typeof path !== "string") return false

  const value = path.trim()
  if (!value) return false

  // Solo paths relativos que empiezan con un único "/".
  if (!value.startsWith("/")) return false
  if (value.startsWith("//")) return false
  if (value.includes("\\")) return false
  if (value.toLowerCase().includes("://")) return false
  if (/[\u0000-\u001F\u007F]/.test(value)) return false

  try {
    const url = new URL(value, PARSE_ORIGIN)
    // Si el input fuera protocol-relative u host-qualified, el origin cambiaría.
    if (url.origin !== PARSE_ORIGIN) return false
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Devuelve un destino interno seguro, o el fallback (por defecto la calculadora).
 */
export function sanitizeNext(
  next: string | null | undefined,
  fallback: string = CALCULATOR_ENTRY_HREF
): string {
  if (isSafeInternalPath(next)) {
    const url = new URL(next.trim(), PARSE_ORIGIN)
    return `${url.pathname}${url.search}${url.hash}`
  }

  if (isSafeInternalPath(fallback)) {
    const url = new URL(fallback.trim(), PARSE_ORIGIN)
    return `${url.pathname}${url.search}${url.hash}`
  }

  return "/"
}
