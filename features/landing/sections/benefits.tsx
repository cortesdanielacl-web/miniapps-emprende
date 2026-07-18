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
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {content.items.map((item, index) => {
          const Icon = benefitIcons[index]

          return (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-[var(--shadow-card)] sm:gap-3.5 sm:p-5 sm:text-base"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-turquoise/12 text-brand-turquoise">
                <Icon className="size-5" aria-hidden={true} />
              </span>
              <span className="pt-2">{item}</span>
            </li>
          )
        })}
      </ul>
    </LandingSection>
  )
}
