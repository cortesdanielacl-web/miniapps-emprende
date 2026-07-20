import {
  CircleDollarSignIcon,
  ClockIcon,
  WalletIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { landingContent } from "@/features/landing/content"
import { LandingSection } from "@/features/landing/sections/landing-section"

const content = landingContent.problem

const cardIcons = [CircleDollarSignIcon, WalletIcon, ClockIcon] as const

export function LandingProblem() {
  return (
    <LandingSection
      id={content.id}
      title={content.title}
      description={content.description}
    >
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {content.cards.map((card, index) => {
          const Icon = cardIcons[index]

          return (
            <li key={card.title} className="min-w-0">
              <Card className="h-full">
                <CardHeader className="gap-1">
                  <span className="mb-1 flex size-9 items-center justify-center rounded-2xl bg-brand-turquoise/12 text-brand-turquoise sm:size-10">
                    <Icon className="size-4 sm:size-5" aria-hidden={true} />
                  </span>
                  <CardTitle className="text-[0.95rem] sm:text-base">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-[0.8125rem] leading-relaxed sm:text-sm">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          )
        })}
      </ul>
    </LandingSection>
  )
}
