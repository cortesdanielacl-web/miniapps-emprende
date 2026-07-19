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
      className="border-b border-border bg-card py-12 sm:py-16 lg:py-20"
    >
      <PageContainer size="xl">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-x-10 xl:gap-x-12">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <h1
              id="hero-title"
              className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              {content.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0">
              {content.description}
            </p>
            <div className="mt-8 sm:mt-10">
              {content.cta.eyebrow ? (
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
                  {content.cta.eyebrow}
                </p>
              ) : null}
              <Button
                asChild
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href={content.cta.href}>{content.cta.label}</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-xl items-center justify-center lg:max-w-none">
            <Image
              src="/hero.png"
              alt="Emprendedor revisando costos y precios de su negocio"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 68vw, 85vw"
              className="h-auto w-[82%] rounded-[16px] object-contain shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
