import {
  BadgeCheckIcon,
  CalculatorIcon,
  ClockIcon,
  PercentIcon,
} from "lucide-react"

import { landingContent } from "@/features/landing/content"
import { LandingSection } from "@/features/landing/sections/landing-section"

const content = landingContent.benefits

const benefitIcons = [
  CalculatorIcon,
  PercentIcon,
  BadgeCheckIcon,
  ClockIcon,
] as const

export function LandingBenefits() {
  return (
    <LandingSection
      id={content.id}
      title={content.title}
      className="pb-8 sm:pb-10 lg:pb-12"
    >
      <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
        {content.items.map((item, index) => {
          const Icon = benefitIcons[index]

          return (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-sm leading-snug text-foreground shadow-[var(--shadow-card)] sm:gap-3.5 sm:p-5 sm:text-base sm:leading-normal"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-turquoise/12 text-brand-turquoise sm:size-10">
                <Icon className="size-4 sm:size-5" aria-hidden={true} />
              </span>
              <span className="min-w-0 pt-1.5 sm:pt-2">{item}</span>
            </li>
          )
        })}
      </ul>
    </LandingSection>
  )
}
