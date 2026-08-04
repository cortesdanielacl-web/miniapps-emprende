import { COMMERCIAL } from "@/config/commercial"
import { cn } from "@/lib/utils"

type PaymentTrustNoticeProps = {
  className?: string
}

/**
 * Bloque informativo de confianza antes del CTA de compra.
 * Copy comercial desde config/commercial.ts.
 */
export function PaymentTrustNotice({ className }: PaymentTrustNoticeProps) {
  return (
    <div className={cn("mx-auto max-w-md text-center", className)}>
      <p className="text-sm font-medium text-foreground sm:text-base">
        {COMMERCIAL.trustTitle}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {COMMERCIAL.trustDescription}
      </p>
    </div>
  )
}
