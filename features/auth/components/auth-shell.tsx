import Link from "next/link"

import { BrandLogo } from "@/components/common/brand-logo"
import { PageContainer } from "@/components/common"
import { APP_NAME } from "@/lib/constants"

type AuthShellProps = {
  title: string
  description: string
  children: React.ReactNode
}

/**
 * Contenedor visual compartido para login / register / recovery.
 * Reutiliza tokens del Design System existente.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#EEF6FF]">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur-md">
        <PageContainer className="flex h-16 items-center px-4 sm:h-[5.5rem] sm:px-6">
          <Link
            href="/"
            className="group flex min-h-11 items-center gap-2.5 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:gap-4"
          >
            <BrandLogo size="md" className="h-10 w-auto shrink-0 sm:h-16" />
            <span className="font-heading text-sm font-semibold tracking-tight text-heading sm:text-lg">
              {APP_NAME}
            </span>
          </Link>
        </PageContainer>
      </header>

      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md rounded-[1.25rem] border border-[#E8EEF5] bg-white p-6 shadow-[0_2px_16px_rgb(15_44_76/0.04)] sm:rounded-[1.75rem] sm:p-8">
          <div className="mb-7 space-y-2 text-center sm:mb-8">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-heading sm:text-2xl">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
