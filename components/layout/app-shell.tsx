import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"

type AppShellProps = React.ComponentProps<"div"> & {
  headerTitle?: string
  footerText?: string
}

/**
 * Base responsive layout: Header + Main + Footer.
 */
function AppShell({
  className,
  children,
  headerTitle,
  footerText,
  ...props
}: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn("flex min-h-full flex-1 flex-col", className)}
      {...props}
    >
      <Header title={headerTitle} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer text={footerText} />
    </div>
  )
}

export { AppShell, type AppShellProps }
