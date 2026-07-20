"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import {
  LightbulbIcon,
  PackageIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"

import { Form, FormField } from "@/components/forms"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  calculateCost,
  type CostCalculatorResult,
} from "@/features/calculadora-costos/calculate"
import { CostCategoryList } from "@/features/calculadora-costos/cost-category-list"
import { RawMaterialsList } from "@/features/calculadora-costos/raw-materials-list"
import {
  costCalculatorDefaultValues,
  costCalculatorSchema,
  type CostCalculatorValues,
} from "@/features/calculadora-costos/schema"
import { cn } from "@/lib/utils"

const PAYMENT_URL = "https://www.webpay.cl/form-pay/402692"

/** While locked, the results report must never be mounted in the DOM. */
const FREEMIUM_RESULTS_LOCKED = true

const workspaceCardClass =
  "overflow-hidden rounded-[18px] border border-[#E8EEF5] bg-[#F7FAFF] px-4 sm:px-8"

function FreemiumUnlockGate() {
  return (
    <section
      id="desbloqueo"
      className="scroll-mt-24"
      aria-live="polite"
      aria-labelledby="desbloqueo-title"
    >
      <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-4 py-7 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)] sm:px-10 sm:py-10">
        <h2
          id="desbloqueo-title"
          className="font-heading text-xl font-semibold tracking-tight text-heading sm:text-3xl"
        >
          🎉 ¡Tu cálculo está listo!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          Ya analizamos toda la información que ingresaste.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground sm:mt-5 sm:text-base">
          En segundos podrás descubrir:
        </p>
        <ul className="mx-auto mt-3 max-w-md space-y-2 px-1 text-left text-sm leading-snug text-foreground sm:px-0 sm:text-base sm:leading-normal">
          <li>✓ ¿Cuánto realmente cuesta fabricar tu producto?</li>
          <li>✓ ¿Cuál debería ser tu precio de venta?</li>
          <li>✓ ¿Cuánta utilidad estás obteniendo?</li>
          <li>✓ ¿Estás ganando o perdiendo dinero?</li>
        </ul>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground sm:mt-5 sm:text-base">
          Desbloquea tu informe completo por un único pago de:
        </p>
        <p className="mt-6 font-heading text-4xl font-bold tracking-tight text-heading tabular-nums sm:mt-8 sm:text-6xl">
          $5.990 CLP
        </p>
        <div className="mt-6 sm:mt-8">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="h-auto min-h-14 w-full whitespace-normal bg-[#2563EB] px-4 py-3 text-sm font-semibold leading-snug shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:h-14 sm:w-auto sm:min-w-[13rem] sm:whitespace-nowrap sm:px-10 sm:py-2.5 sm:text-base"
          >
            <Link href={PAYMENT_URL}>Desbloquear mi resultado</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SectionIcon({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise sm:size-12">
      <Icon className="size-5 sm:size-6" aria-hidden={true} />
    </span>
  )
}

function SectionCount({
  count,
  singular = "elemento",
  plural = "elementos",
}: {
  count: number
  singular?: string
  plural?: string
}) {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-brand-turquoise/12 px-2.5 py-0.5 text-xs font-semibold text-brand-turquoise tabular-nums">
      {count} {count === 1 ? singular : plural}
    </span>
  )
}

export function CostCalculatorForm() {
  const [result, setResult] = useState<CostCalculatorResult | null>(null)
  const [openSection, setOpenSection] = useState("materia-prima")

  const form = useForm<CostCalculatorValues>({
    resolver: zodResolver(costCalculatorSchema),
    defaultValues: costCalculatorDefaultValues,
  })

  const rawMaterials = useWatch({
    control: form.control,
    name: "rawMaterials",
  })
  const laborItems = useWatch({
    control: form.control,
    name: "laborItems",
  })
  const indirectItems = useWatch({
    control: form.control,
    name: "indirectItems",
  })

  const rawCount = rawMaterials?.length ?? 0
  const laborCount = laborItems?.length ?? 0
  const indirectCount = indirectItems?.length ?? 0

  function onSubmit(values: CostCalculatorValues) {
    // Keep calculation intact for future paid unlock; never render these values while freemium is locked.
    setResult(calculateCost(values))
  }

  function handleNewCalculation() {
    form.reset(costCalculatorDefaultValues)
    setResult(null)
    setOpenSection("materia-prima")
    form.setFocus("productName")
  }

  const showUnlockGate = result !== null && FREEMIUM_RESULTS_LOCKED

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 sm:gap-20 lg:gap-24">
      {/* Hero */}
      <header className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#2563EB] to-[#14B8A6] px-5 py-6 sm:px-12 sm:py-8 lg:px-14 lg:py-9">
        <div className="max-w-2xl space-y-2.5 sm:space-y-4">
          <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:text-4xl sm:leading-normal lg:text-[2.5rem] lg:leading-[1.15]">
            Calcula el precio correcto de tus productos.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-lg">
            Costo real, IVA y precio sugerido en minutos.
          </p>
        </div>
      </header>

      <Form form={form} onSubmit={onSubmit} className="gap-8 sm:gap-16">
        {/* Producto */}
        <section className={cn(workspaceCardClass, "space-y-5 py-5 sm:space-y-6 sm:py-8")}>
          <div className="flex items-start gap-3 sm:gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise sm:size-12">
              <TagIcon className="size-5 sm:size-6" aria-hidden={true} />
            </span>
            <div className="min-w-0 space-y-1.5">
              <h2 className="font-heading text-base font-semibold text-heading sm:text-xl">
                Tu producto
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Define qué vas a vender y el margen que deseas.
              </p>
            </div>
          </div>
          <div className="grid max-w-md gap-5 sm:grid-cols-2 sm:gap-6">
            <FormField
              name="productName"
              label="Nombre del producto"
              placeholder="Ej. Vela artesanal"
              required
            />
            <FormField
              name="desiredMargin"
              label="Margen de ganancia (%)"
              type="number"
              placeholder="0"
              required
            />
          </div>
        </section>

        {/* Workspace */}
        <section className="space-y-5 sm:space-y-9">
          <div className="space-y-1.5">
            <h2 className="font-heading text-base font-semibold text-heading sm:text-xl">
              Construye tus costos
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Agrega cada pieza de tu producto, paso a paso.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="gap-4 sm:gap-7"
          >
            <AccordionItem
              value="materia-prima"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="py-5 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-3 pr-2 sm:gap-4 sm:pr-3">
                  <SectionIcon icon={PackageIcon} />
                  <span className="flex min-w-0 flex-col gap-1 text-left sm:gap-1.5">
                    <span className="font-heading text-[0.95rem] font-semibold text-heading sm:text-lg">
                      Materiales e Insumos
                    </span>
                    <SectionCount
                      count={rawCount}
                      singular="insumo"
                      plural="insumos"
                    />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 sm:pb-9">
                <div className="flex h-[min(28rem,65dvh)] min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-5 sm:h-[32rem] sm:pt-7">
                  <p className="mb-4 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-6">
                    Ejemplos: harina, madera, tela, filamento 3D, tinta, papel,
                    cera, resina, envases, pegamento, pintura, licencias
                    digitales.
                  </p>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <RawMaterialsList />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="mano-obra"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="py-5 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-3 pr-2 sm:gap-4 sm:pr-3">
                  <SectionIcon icon={UsersIcon} />
                  <span className="flex min-w-0 flex-col gap-1 text-left sm:gap-1.5">
                    <span className="font-heading text-[0.95rem] font-semibold text-heading sm:text-lg">
                      Mano de Obra
                    </span>
                    <SectionCount count={laborCount} />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 sm:pb-9">
                <div className="flex h-[min(28rem,65dvh)] min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-5 sm:h-[32rem] sm:pt-7">
                  <p className="mb-4 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-6">
                    Ejemplos: preparación, fabricación, armado, decoración,
                    envasado, despacho.
                  </p>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <CostCategoryList
                      name="laborItems"
                      nameHeader="Tarea"
                      namePlaceholder="Ej. Preparación"
                      addLabel="Agregar tarea"
                      totalLabel="Total Mano de Obra"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="costos-indirectos"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="py-5 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-3 pr-2 sm:gap-4 sm:pr-3">
                  <SectionIcon icon={LightbulbIcon} />
                  <span className="flex min-w-0 flex-col gap-1 text-left sm:gap-1.5">
                    <span className="font-heading text-[0.95rem] font-semibold text-heading sm:text-lg">
                      Costos Indirectos
                    </span>
                    <SectionCount count={indirectCount} />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-5 sm:pb-9">
                <div className="flex h-[min(28rem,65dvh)] min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-5 sm:h-[32rem] sm:pt-7">
                  <p className="mb-4 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-6">
                    Ejemplos: luz, agua, gas, arriendo, internet, etiquetas,
                    bolsas, transporte, comisiones.
                  </p>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <CostCategoryList
                      name="indirectItems"
                      nameHeader="Concepto"
                      namePlaceholder="Ej. Electricidad"
                      addLabel="Agregar costo"
                      totalLabel="Total Costos Indirectos"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="h-12 w-full bg-[#2563EB] px-6 text-base font-semibold shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:h-14 sm:min-w-[13rem] sm:w-auto sm:px-10"
          >
            Calcular
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full border-[#2563EB] bg-transparent text-[#2563EB] shadow-none hover:bg-[#2563EB]/5 hover:text-[#2563EB] sm:h-14 sm:w-auto"
            onClick={handleNewCalculation}
          >
            Nuevo cálculo
          </Button>
        </div>
      </Form>

      {/* Freemium: unlock gate fully replaces the results report (no ResultCard, no calculated figures). */}
      {showUnlockGate ? <FreemiumUnlockGate /> : null}
    </div>
  )
}
