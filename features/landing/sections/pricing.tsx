import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { PageContainer } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { VALIDATION_MODE } from "@/config/validation"
import { landingContent } from "@/features/landing/content"

const content = landingContent.pricing

export function LandingPricing() {
  if (VALIDATION_MODE) {
    return null
  }

  return (
    <section
      id={content.id}
      aria-labelledby={`${content.id}-title`}
      className="pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20"
    >
      <PageContainer size="xl">
        <Card className="mx-auto w-full max-w-[37rem] text-center">
          <CardHeader className="items-center gap-4 sm:gap-5">
            <span className="inline-flex items-center rounded-full bg-brand-turquoise/12 px-3 py-1 text-xs font-semibold tracking-wide text-brand-turquoise uppercase">
              {content.badge}
            </span>
            <h2
              id={`${content.id}-title`}
              className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {content.title}
            </h2>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <p className="text-base text-muted-foreground line-through sm:text-lg">
                {content.originalPrice}
              </p>
              <p className="font-heading text-6xl font-bold tracking-tight text-heading tabular-nums sm:text-7xl">
                {content.launchPrice}
              </p>
              <p className="text-sm font-medium text-brand-turquoise sm:text-base">
                {content.savings}
              </p>
            </div>

            <ul className="w-full max-w-sm space-y-3 text-left">
              {content.benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-foreground sm:text-base"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise">
                    <CheckIcon className="size-3.5" aria-hidden={true} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant="primary"
              size="lg"
              className="w-full sm:w-auto sm:min-w-[15rem] sm:px-10"
            >
              <Link href={content.cta.href}>{content.cta.label}</Link>
            </Button>

            <p className="text-xs text-muted-foreground sm:text-sm">
              {content.footnote}
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    </section>
  )
}
