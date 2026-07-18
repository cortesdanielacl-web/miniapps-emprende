import Link from "next/link"

import { PageContainer } from "@/components/common"
import { Button } from "@/components/ui/button"
import { landingContent } from "@/features/landing/content"

const content = landingContent.finalCta

export function LandingFinalCta() {
  return (
    <section
      id={content.id}
      aria-labelledby={`${content.id}-title`}
      className="border-t border-border bg-primary py-12 sm:py-16 lg:py-20"
    >
      <PageContainer size="xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id={`${content.id}-title`}
            className="font-heading text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl"
          >
            {content.title}
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/85 sm:text-base">
            {content.description}
          </p>
          <div className="mt-8">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full border-transparent sm:w-auto"
            >
              <Link href={content.cta.href}>{content.cta.label}</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
