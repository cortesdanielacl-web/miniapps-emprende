import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/proxy"

/**
 * Proxy Next.js (App Router) — refresca sesión Supabase y protege rutas.
 * Convención oficial: proxy.ts en la raíz + updateSession en lib/supabase/proxy.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Excluye estáticos y assets. Incluye páginas de auth y herramientas.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
