import { PageContainer } from "@/components/common/page-container"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"

type FooterProps = React.ComponentProps<"footer"> & {
  text?: string
}

/**
 * Footer minimalista alineado a la nueva identidad.
 */
function Footer({
  className,
  text = `${APP_NAME}`,
  ...props
}: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      data-slot="footer"
      className={cn("mt-auto border-t border-border/70 bg-card/80", className)}
      {...props}
    >
      <PageContainer className="flex flex-col items-center justify-between gap-2 px-3 py-6 text-center sm:flex-row sm:px-6 sm:py-8 sm:text-left">
        <p className="min-w-0 break-words text-sm text-muted-foreground">{text}</p>
        <p className="shrink-0 text-xs text-muted-foreground">© {year}</p>
      </PageContainer>
    </footer>
  )
}

export { Footer, type FooterProps }
