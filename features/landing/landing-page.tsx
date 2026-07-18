import { LandingBenefits } from "@/features/landing/sections/benefits"
import { LandingFinalCta } from "@/features/landing/sections/final-cta"
import { LandingFooter } from "@/features/landing/sections/footer"
import { LandingHero } from "@/features/landing/sections/hero"
import { LandingPricing } from "@/features/landing/sections/pricing"
import { LandingProblem } from "@/features/landing/sections/problem"
import { LandingSolution } from "@/features/landing/sections/solution"

/**
 * Landing Page V1 — Calculadora Inteligente de Costos.
 */
export function LandingPage() {
  return (
    <div className="flex w-full flex-col">
      <LandingHero />
      <LandingProblem />
      <LandingSolution />
      <LandingBenefits />
      <LandingPricing />
      <LandingFinalCta />
      <LandingFooter />
    </div>
  )
}
