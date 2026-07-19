import Link from "next/link"

import { BrandLogo } from "@/components/common/brand-logo"
import { PageContainer } from "@/components/common/page-container"
import { CALCULATOR_ENTRY_HREF } from "@/config/validation"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"

type HeaderProps = React.ComponentProps<"header"> & {
  title?: string
}

/**
 * Header de marca — limpio, con presencia clara del logo MiniApps Emprende.
 */
function Header({
  className,
  title = APP_NAME,
  ...props
}: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur-md",
        className
      )}
      {...props}
    >
      <PageContainer className="flex h-20 items-center justify-between gap-4 sm:h-[5.5rem]">
        <Link
          href="/"
          className="group flex items-center gap-3.5 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:gap-4"
        >
          <BrandLogo size="md" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-heading text-base font-semibold tracking-tight text-heading sm:text-lg">
              {title}
            </span>
            <span className="truncate text-xs text-muted-foreground sm:text-sm">
              Herramientas simples para hacer crecer tu negocio.
            </span>
          </span>
        </Link>
        <Link
          href={CALCULATOR_ENTRY_HREF}
          className="rounded-xl px-3.5 py-2 text-sm font-medium text-heading transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Calculadora Inteligente
        </Link>
      </PageContainer>
    </header>
  )
}

export { Header, type HeaderProps }
