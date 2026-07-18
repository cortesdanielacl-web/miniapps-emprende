"use client"

import { useState, type ComponentType } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import {
  LightbulbIcon,
  PackageIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react"

import { ResultCard } from "@/components/common"
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
  formatClp,
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

const workspaceCardClass =
  "overflow-hidden rounded-[18px] border border-[#E8EEF5] bg-[#F7FAFF] px-6 sm:px-8"

function SectionIcon({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise">
      <Icon className="size-6" aria-hidden={true} />
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
    setResult(calculateCost(values))
  }

  function handleNewCalculation() {
    form.reset(costCalculatorDefaultValues)
    setResult(null)
    setOpenSection("materia-prima")
    form.setFocus("productName")
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-16 sm:gap-20 lg:gap-24">
      {/* Hero */}
      <header className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#2563EB] to-[#14B8A6] px-8 py-7 sm:px-12 sm:py-8 lg:px-14 lg:py-9">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
            Calcula el precio correcto de tus productos.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            Costo real, IVA y precio sugerido en minutos.
          </p>
        </div>
      </header>

      <Form form={form} onSubmit={onSubmit} className="gap-12 sm:gap-16">
        {/* Producto */}
        <section className={cn(workspaceCardClass, "space-y-6 py-7 sm:py-8")}>
          <div className="flex items-start gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-turquoise/12 text-brand-turquoise">
              <TagIcon className="size-6" aria-hidden={true} />
            </span>
            <div className="space-y-1.5">
              <h2 className="font-heading text-lg font-semibold text-heading sm:text-xl">
                Tu producto
              </h2>
              <p className="text-sm text-muted-foreground">
                Define qué vas a vender y el margen que deseas.
              </p>
            </div>
          </div>
          <div className="grid max-w-md gap-6 sm:grid-cols-2 sm:gap-6">
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
        <section className="space-y-7 sm:space-y-9">
          <div className="space-y-1.5">
            <h2 className="font-heading text-lg font-semibold text-heading sm:text-xl">
              Construye tus costos
            </h2>
            <p className="text-sm text-muted-foreground">
              Agrega cada pieza de tu producto, paso a paso.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="gap-6 sm:gap-7"
          >
            <AccordionItem
              value="materia-prima"
              className={cn(
                workspaceCardClass,
                "border-t-[3px] border-t-brand-turquoise"
              )}
            >
              <AccordionTrigger className="py-6 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-4 pr-3">
                  <SectionIcon icon={PackageIcon} />
                  <span className="flex min-w-0 flex-col gap-1.5 text-left">
                    <span className="font-heading text-base font-semibold text-heading sm:text-lg">
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
              <AccordionContent className="h-auto pb-7 sm:pb-9">
                <div className="flex h-[32rem] min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-6 sm:pt-7">
                  <p className="mb-6 shrink-0 text-sm leading-relaxed text-muted-foreground">
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
              <AccordionTrigger className="py-6 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-4 pr-3">
                  <SectionIcon icon={UsersIcon} />
                  <span className="flex min-w-0 flex-col gap-1.5 text-left">
                    <span className="font-heading text-base font-semibold text-heading sm:text-lg">
                      Mano de Obra
                    </span>
                    <SectionCount count={laborCount} />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-7 sm:pb-9">
                <div className="flex h-[32rem] min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-6 sm:pt-7">
                  <p className="mb-6 shrink-0 text-sm leading-relaxed text-muted-foreground">
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
              <AccordionTrigger className="py-6 sm:py-7">
                <span className="flex min-w-0 flex-1 items-center gap-4 pr-3">
                  <SectionIcon icon={LightbulbIcon} />
                  <span className="flex min-w-0 flex-col gap-1.5 text-left">
                    <span className="font-heading text-base font-semibold text-heading sm:text-lg">
                      Costos Indirectos
                    </span>
                    <SectionCount count={indirectCount} />
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="h-auto pb-7 sm:pb-9">
                <div className="flex h-[32rem] min-h-0 flex-col overflow-hidden border-t border-[#E8EEF5] pt-6 sm:pt-7">
                  <p className="mb-6 shrink-0 text-sm leading-relaxed text-muted-foreground">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="h-14 w-full bg-[#2563EB] px-10 text-base font-semibold shadow-[0_2px_10px_rgb(37_99_235/0.18)] hover:bg-[#1d4ed8] sm:min-w-[13rem] sm:w-auto"
          >
            Calcular
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full border-[#2563EB] bg-transparent text-[#2563EB] shadow-none hover:bg-[#2563EB]/5 hover:text-[#2563EB] sm:w-auto"
            onClick={handleNewCalculation}
          >
            Nuevo cálculo
          </Button>
        </div>
      </Form>

      {/* Resultado */}
      {result ? (
        <section className="scroll-mt-24" aria-live="polite">
          <ResultCard
            title={result.productName}
            description="Resumen del cálculo de tu producto."
            tone="success"
            className="border border-[#E8EEF5] bg-brand-turquoise/[0.06] shadow-[0_2px_12px_rgb(15_44_76/0.04)]"
          >
            <div className="space-y-8 sm:space-y-10">
              <div className="rounded-[18px] border border-brand-turquoise/20 bg-brand-turquoise/10 px-6 py-8 sm:px-10 sm:py-10">
                <p className="text-xs font-medium tracking-wide text-brand-turquoise uppercase">
                  Precio sugerido
                </p>
                <p className="mt-3 font-heading text-5xl font-bold tracking-tight text-brand-turquoise tabular-nums sm:text-6xl lg:text-7xl">
                  {formatClp(result.finalSalePrice)}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Incluye IVA.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <div className="space-y-2 rounded-2xl border border-[#E8EEF5] bg-white px-4 py-5 sm:px-5 sm:py-6">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Producto
                  </p>
                  <p className="font-heading text-base font-semibold text-heading sm:text-lg">
                    {result.productName}
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-[#E8EEF5] bg-white px-4 py-5 sm:px-5 sm:py-6">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Costo real
                  </p>
                  <p className="font-heading text-xl font-semibold text-heading tabular-nums sm:text-2xl">
                    {formatClp(result.totalCost)}
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-[#E8EEF5] bg-white px-4 py-5 sm:px-5 sm:py-6">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Precio neto
                  </p>
                  <p className="font-heading text-xl font-semibold text-heading tabular-nums sm:text-2xl">
                    {formatClp(result.netSalePrice)}
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-[#E8EEF5] bg-white px-4 py-5 sm:px-5 sm:py-6">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    IVA (19%)
                  </p>
                  <p className="font-heading text-xl font-semibold text-heading tabular-nums sm:text-2xl">
                    {formatClp(result.iva)}
                  </p>
                </div>
              </div>
            </div>
          </ResultCard>
        </section>
      ) : null}
    </div>
  )
}
