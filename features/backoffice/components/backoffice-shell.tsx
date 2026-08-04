"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandLogo } from "@/components/common/brand-logo"
import { BACKOFFICE_NAV } from "@/features/backoffice/nav"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

type BackofficeShellProps = {
  adminEmail: string
  children: React.ReactNode
}

function isActive(href: string, activePath: string, exact?: boolean): boolean {
  if (exact) return activePath === href
  return activePath === href || activePath.startsWith(`${href}/`)
}

export function BackofficeShell({
  adminEmail,
  children,
}: BackofficeShellProps) {
  const pathname = usePathname() || "/backoffice"

  return (
    <div className="flex min-h-full flex-1 bg-[#EEF6FF]">
      <aside className="hidden w-64 shrink-0 border-r border-[#E8EEF5] bg-white md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-[#E8EEF5] px-5 py-5">
          <BrandLogo size="sm" className="h-9 w-auto" />
          <div>
            <p className="font-heading text-sm font-semibold text-heading">
              {APP_NAME}
            </p>
            <p className="text-xs text-muted-foreground">Backoffice</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Backoffice">
          {BACKOFFICE_NAV.map((item) => {
            const active = isActive(item.href, pathname, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-turquoise/12 text-heading"
                    : "text-muted-foreground hover:bg-[#F7FAFF] hover:text-heading"
                )}
              >
                {item.label}
                {item.placeholder ? (
                  <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-muted-foreground/80">
                    pronto
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#E8EEF5] px-4 py-4 text-xs text-muted-foreground">
          <p className="truncate">{adminEmail}</p>
          <Link
            href="/"
            className="mt-2 inline-block font-medium text-primary hover:underline"
          >
            Volver al sitio
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#E8EEF5] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="font-heading text-sm font-semibold text-heading">
              Backoffice
            </p>
            <Link href="/" className="text-xs text-primary hover:underline">
              Sitio
            </Link>
          </div>
          <nav
            className="mt-3 flex gap-2 overflow-x-auto pb-1"
            aria-label="Backoffice móvil"
          >
            {BACKOFFICE_NAV.map((item) => {
              const active = isActive(item.href, pathname, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    active
                      ? "bg-brand-turquoise/12 text-heading"
                      : "bg-[#F7FAFF] text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
