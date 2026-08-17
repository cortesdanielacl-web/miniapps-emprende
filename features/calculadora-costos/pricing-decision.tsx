"use client"

import { useMemo, useState } from "react"

import { FormInput } from "@/components/forms/form-input"
import { formatClp } from "@/features/calculadora-costos/format-money"
import {
  calculatePricingFromMargin,
  calculatePricingFromMarkup,
  calculatePricingFromSalePrice,
  formatPricingPercent,
} from "@/features/calculadora-costos/pricing"
import type { PricingPath } from "@/features/calculadora-costos/schema"
import { cn } from "@/lib/utils"

export type PricingGoal = "define-price" | "known-price"
export type PriceDefineMethod = "markup" | "margin"

export type PricingResolution = {
  desiredMargin: string
  pricingPath: PricingPath
  appliedMarkup: string
}

type PricingDecisionProps = {
  totalCost: number
  onResolved: (resolution: PricingResolution | null) => void
}

function serializePercent(value: number): string {
  return String(Math.round(value * 1e6) / 1e6)
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8EEF5] py-3 last:border-b-0">
      <p className="text-sm text-muted-foreground sm:text-base">{label}</p>
      <p className="text-right text-sm font-semibold text-heading tabular-nums sm:text-base">
        {value}
      </p>
    </div>
  )
}

function ChoiceCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "min-w-0 rounded-[18px] border px-4 py-4 text-left transition-all duration-200 sm:px-5 sm:py-5",
        selected
          ? "border-brand-turquoise bg-brand-turquoise/10 shadow-[0_2px_10px_rgb(20_184_166/0.12)]"
          : "border-[#E8EEF5] bg-white hover:border-brand-turquoise/40"
      )}
    >
      <p className="font-heading text-sm font-semibold text-heading sm:text-base">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </button>
  )
}

export function PricingDecision({ totalCost, onResolved }: PricingDecisionProps) {
  const [goal, setGoal] = useState<PricingGoal | null>(null)
  const [defineMethod, setDefineMethod] = useState<PriceDefineMethod | null>(
    null
  )
  const [markupInput, setMarkupInput] = useState("")
  const [marginInput, setMarginInput] = useState("")
  const [priceInput, setPriceInput] = useState("")

  const fromMarkup = useMemo(() => {
    if (goal !== "define-price" || defineMethod !== "markup") return null
    const markup = Number(markupInput)
    if (markupInput.trim() === "" || Number.isNaN(markup)) return null
    return calculatePricingFromMarkup(totalCost, markup)
  }, [goal, defineMethod, markupInput, totalCost])

  const fromMargin = useMemo(() => {
    if (goal !== "define-price" || defineMethod !== "margin") return null
    const margin = Number(marginInput)
    if (marginInput.trim() === "" || Number.isNaN(margin)) return null
    return calculatePricingFromMargin(totalCost, margin)
  }, [goal, defineMethod, marginInput, totalCost])

  const fromPrice = useMemo(() => {
    if (goal !== "known-price") return null
    const salePrice = Number(priceInput)
    if (priceInput.trim() === "" || Number.isNaN(salePrice)) return null
    return calculatePricingFromSalePrice(totalCost, salePrice)
  }, [goal, priceInput, totalCost])

  function resolveFromMarkup(value: string) {
    setMarkupInput(value)
    const markup = Number(value)
    const result =
      value.trim() === "" || Number.isNaN(markup)
        ? null
        : calculatePricingFromMarkup(totalCost, markup)
    onResolved(
      result
        ? {
            desiredMargin: serializePercent(result.saleMargin),
            pricingPath: "markup",
            appliedMarkup: String(markup),
          }
        : null
    )
  }

  function resolveFromMargin(value: string) {
    setMarginInput(value)
    const margin = Number(value)
    const result =
      value.trim() === "" || Number.isNaN(margin)
        ? null
        : calculatePricingFromMargin(totalCost, margin)
    onResolved(
      result
        ? {
            desiredMargin: serializePercent(result.desiredMargin),
            pricingPath: "margin",
            appliedMarkup: "",
          }
        : null
    )
  }

  function resolveFromPrice(value: string) {
    setPriceInput(value)
    const salePrice = Number(value)
    const result =
      value.trim() === "" || Number.isNaN(salePrice)
        ? null
        : calculatePricingFromSalePrice(totalCost, salePrice)
    onResolved(
      result
        ? {
            desiredMargin: serializePercent(result.obtainedMargin),
            pricingPath: "sale-price",
            appliedMarkup: "",
          }
        : null
    )
  }

  function handleSelectGoal(nextGoal: PricingGoal) {
    setGoal(nextGoal)
    if (nextGoal === "known-price") {
      setDefineMethod(null)
      resolveFromPrice(priceInput)
      return
    }
    if (defineMethod === "markup") {
      resolveFromMarkup(markupInput)
      return
    }
    if (defineMethod === "margin") {
      resolveFromMargin(marginInput)
      return
    }
    onResolved(null)
  }

  function handleSelectMethod(nextMethod: PriceDefineMethod) {
    setDefineMethod(nextMethod)
    if (nextMethod === "markup") {
      resolveFromMarkup(markupInput)
      return
    }
    resolveFromMargin(marginInput)
  }

  return (
    <section
      id="precio-margen"
      className="scroll-mt-24"
      aria-labelledby="precio-margen-title"
    >
      <div className="min-w-0 overflow-hidden rounded-[18px] border border-[#E8EEF5] bg-[#F7FAFF] px-3 py-5 sm:px-8 sm:py-8">
        <div className="space-y-1.5">
          <h2
            id="precio-margen-title"
            className="font-heading text-base font-semibold text-heading sm:text-xl"
          >
            ¿Qué quieres calcular?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Recargo y margen no son lo mismo. Elige cómo quieres trabajar el
            precio.
          </p>
        </div>

        <div className="mt-5 rounded-[14px] border border-[#E8EEF5] bg-white px-4 py-4 sm:px-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Costo total
          </p>
          <p className="mt-1 font-heading text-xl font-semibold text-heading tabular-nums sm:text-2xl">
            {formatClp(totalCost)}
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Qué quieres calcular"
          className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4"
        >
          <ChoiceCard
            title="Definir mi precio"
            description="Quiero determinar el precio de venta."
            selected={goal === "define-price"}
            onSelect={() => handleSelectGoal("define-price")}
          />
          <ChoiceCard
            title="Ya tengo un precio"
            description="Quiero saber el recargo y el margen de un precio."
            selected={goal === "known-price"}
            onSelect={() => handleSelectGoal("known-price")}
          />
        </div>

        {goal === "define-price" ? (
          <div
            role="radiogroup"
            aria-label="Cómo definir el precio"
            className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4"
          >
            <ChoiceCard
              title="Según un recargo"
              description="Quiero agregar un porcentaje a mi costo."
              selected={defineMethod === "markup"}
              onSelect={() => handleSelectMethod("markup")}
            />
            <ChoiceCard
              title="Según un margen"
              description="Quiero que mi ganancia represente un porcentaje del precio de venta."
              selected={defineMethod === "margin"}
              onSelect={() => handleSelectMethod("margin")}
            />
          </div>
        ) : null}

        {goal === "define-price" && defineMethod === "markup" ? (
          <div className="mt-5 max-w-md">
            <FormInput
              id="desired-markup-input"
              label="Recargo (%)"
              type="number"
              placeholder="0"
              required
              value={markupInput}
              onChange={(event) => resolveFromMarkup(event.target.value)}
              error={
                markupInput.trim() !== "" && fromMarkup == null
                  ? "Ingresa un recargo válido."
                  : undefined
              }
            />
          </div>
        ) : null}

        {goal === "define-price" && defineMethod === "margin" ? (
          <div className="mt-5 max-w-md">
            <FormInput
              id="desired-margin-input"
              label="Margen (%)"
              type="number"
              placeholder="0"
              required
              value={marginInput}
              onChange={(event) => resolveFromMargin(event.target.value)}
              error={
                marginInput.trim() !== "" && fromMargin == null
                  ? "Ingresa un margen válido, menor que 100%."
                  : undefined
              }
            />
          </div>
        ) : null}

        {goal === "known-price" ? (
          <div className="mt-5 max-w-md">
            <FormInput
              id="sale-price-input"
              label="Precio de venta"
              type="number"
              placeholder="0"
              required
              value={priceInput}
              onChange={(event) => resolveFromPrice(event.target.value)}
              error={
                priceInput.trim() !== "" && fromPrice == null
                  ? "Ingresa un precio de venta mayor que cero."
                  : undefined
              }
            />
          </div>
        ) : null}

        {fromMarkup ? (
          <div className="mt-5 rounded-[14px] border border-[#E8EEF5] bg-white px-4 py-2 sm:px-5">
            <ResultRow label="Costo total" value={formatClp(fromMarkup.totalCost)} />
            <ResultRow
              label="Precio de venta"
              value={formatClp(fromMarkup.suggestedNetPrice)}
            />
            <ResultRow label="Ganancia" value={formatClp(fromMarkup.profit)} />
            <ResultRow
              label="Margen sobre venta"
              value={formatPricingPercent(fromMarkup.saleMargin)}
            />
          </div>
        ) : null}

        {fromMargin ? (
          <div className="mt-5 rounded-[14px] border border-[#E8EEF5] bg-white px-4 py-2 sm:px-5">
            <ResultRow label="Costo total" value={formatClp(fromMargin.totalCost)} />
            <ResultRow
              label="Precio de venta"
              value={formatClp(fromMargin.suggestedNetPrice)}
            />
            <ResultRow label="Ganancia" value={formatClp(fromMargin.profit)} />
            <ResultRow
              label="Recargo sobre costo"
              value={formatPricingPercent(fromMargin.costMarkup)}
            />
          </div>
        ) : null}

        {fromPrice ? (
          <div className="mt-5 rounded-[14px] border border-[#E8EEF5] bg-white px-4 py-2 sm:px-5">
            <ResultRow label="Costo total" value={formatClp(fromPrice.totalCost)} />
            <ResultRow
              label="Precio de venta"
              value={formatClp(fromPrice.salePrice)}
            />
            <ResultRow label="Ganancia" value={formatClp(fromPrice.profit)} />
            <ResultRow
              label="Margen sobre venta"
              value={formatPricingPercent(fromPrice.obtainedMargin)}
            />
            <ResultRow
              label="Recargo sobre costo"
              value={formatPricingPercent(fromPrice.obtainedMarkup)}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
