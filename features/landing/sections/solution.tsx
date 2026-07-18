import Image from "next/image"
import { CheckIcon } from "lucide-react"

import { PageContainer } from "@/components/common"
import { landingContent } from "@/features/landing/content"

const content = landingContent.solution

const screenshots = [
  {
    src: "/images/mockup3.png",
    alt: "Captura del resultado de la Calculadora Inteligente de Costos",
    width: 943,
    height: 953,
  },
  {
    src: "/images/mockup2.png",
    alt: "Captura del formulario de la Calculadora Inteligente de Costos",
    width: 768,
    height: 944,
  },
] as const

export function LandingSolution() {
  return (
    <section
      id={content.id}
      aria-labelledby={`${content.id}-title`}
      className="border-y border-border bg-card py-12 sm:py-16 lg:py-20"
    >
      <PageContainer size="xl">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.2fr_0.95fr] lg:gap-x-5 xl:gap-x-6">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-center lg:max-w-none">
            <Image
              src="/images/mockup1.png"
              alt="Calculadora Inteligente de Costos en un teléfono, lista para usar desde cualquier dispositivo"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 55vw, (min-width: 640px) 90vw, 100vw"
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="max-w-xl">
            <h2
              id={`${content.id}-title`}
              className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {content.title}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {content.description}
            </p>
            <ul className="mt-6 space-y-3 sm:mt-8">
              {content.checklist.map((item) => (
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
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          {screenshots.map((shot) => (
            <div
              key={shot.src}
              className="overflow-hidden rounded-[18px] border border-border/80 bg-background shadow-[var(--shadow-card)]"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-auto w-full object-contain"
              />
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
