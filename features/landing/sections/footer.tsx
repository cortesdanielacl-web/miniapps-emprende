import { PageContainer } from "@/components/common"
import { landingContent } from "@/features/landing/content"

/**
 * Footer de la landing — contenido fijo V1.
 */
export function LandingFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-border bg-card py-6 sm:py-10"
      aria-label="Pie de página"
    >
      <PageContainer size="xl">
        <p className="text-center text-sm text-muted-foreground">
          {landingContent.footer.copyright}
        </p>
      </PageContainer>
    </footer>
  )
}
