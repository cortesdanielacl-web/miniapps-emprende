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
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {content.cards.map((card, index) => {
          const Icon = cardIcons[index]

          return (
            <li key={card.title}>
              <Card className="h-full">
                <CardHeader>
                  <span className="mb-1 flex size-10 items-center justify-center rounded-2xl bg-brand-turquoise/12 text-brand-turquoise">
                    <Icon className="size-5" aria-hidden={true} />
                  </span>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          )
        })}
      </ul>
    </LandingSection>
  )
}
