import Image from "next/image"
import Link from "next/link"

import { PageContainer } from "@/components/common"
import { Button } from "@/components/ui/button"
import { landingContent } from "@/features/landing/content"

const content = landingContent.hero

export function LandingHero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="border-b border-border bg-card py-10 sm:py-16 lg:py-20"
    >
      <PageContainer size="xl" className="px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-7 sm:gap-10 lg:grid-cols-2 lg:gap-x-10 xl:gap-x-12">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <h1
              id="hero-title"
              className="font-heading text-[1.65rem] leading-tight font-bold tracking-tight text-foreground sm:text-4xl sm:leading-normal lg:text-5xl"
            >
              {content.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0">
              {content.description}
            </p>
            <div className="mt-7 sm:mt-10">
              {content.cta.eyebrow ? (
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
                  {content.cta.eyebrow}
                </p>
              ) : null}
              <Button
                asChild
                variant="primary"
                size="lg"
                className="h-auto min-h-12 w-full whitespace-normal px-4 py-3 text-sm leading-snug sm:h-12 sm:w-auto sm:whitespace-nowrap sm:px-7 sm:py-2.5 sm:text-[0.95rem]"
              >
                <Link href={content.cta.href}>{content.cta.label}</Link>
              </Button>
              {content.cta.note ? (
                <p className="mx-auto mt-3 max-w-[17rem] text-xs leading-relaxed text-muted-foreground sm:mx-0 sm:max-w-xs sm:text-sm">
                  {content.cta.note}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md items-center justify-center sm:max-w-xl lg:max-w-none">
            <Image
              src="/hero.png"
              alt="Emprendedor revisando costos y precios de su negocio"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 68vw, 92vw"
              className="h-auto w-full rounded-[16px] object-contain shadow-[var(--shadow-card)] sm:w-[82%]"
            />
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
