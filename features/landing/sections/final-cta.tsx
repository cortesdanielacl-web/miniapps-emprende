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
      className="border-t border-border bg-primary py-10 sm:py-16 lg:py-20"
    >
      <PageContainer size="xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id={`${content.id}-title`}
            className="font-heading text-xl font-semibold tracking-tight text-primary-foreground sm:text-3xl"
          >
            {content.title}
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-primary-foreground/85 sm:mt-3 sm:text-base">
            {content.description}
          </p>
          <div className="mt-7 sm:mt-8">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-auto min-h-12 w-full whitespace-normal border-transparent px-4 py-3 text-sm leading-snug sm:h-12 sm:w-auto sm:whitespace-nowrap sm:px-7 sm:py-2.5 sm:text-[0.95rem]"
            >
              <Link href={content.cta.href}>{content.cta.label}</Link>
            </Button>
            {content.cta.note ? (
              <p className="mx-auto mt-3 max-w-[17rem] text-xs leading-relaxed text-primary-foreground/80 sm:max-w-xs sm:text-sm">
                {content.cta.note}
              </p>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
