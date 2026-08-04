import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Acceso denegado",
}

export default function BackofficeAccessDeniedPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="font-heading text-2xl font-semibold text-heading">
        Acceso restringido
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        Este Backoffice solo está disponible para administradores autorizados.
        Si crees que deberías tener acceso, verifica{" "}
        <code className="text-xs">ADMIN_EMAILS</code> en el entorno.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="primary">
          <Link href="/login?next=/backoffice">Iniciar sesión</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Volver al sitio</Link>
        </Button>
      </div>
    </div>
  )
}
