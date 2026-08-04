/**
 * URL canónica de la app (emails, redirects absolutos).
 */

export function getAppUrl(): string {
  const fromEnv = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "")
  }
  return "https://www.miniappsemprende.cl"
}

export function getBackofficeUrl(path = "/backoffice"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getAppUrl()}${normalized}`
}
