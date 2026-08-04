import Link from "next/link"

import { Button } from "@/components/ui/button"

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="rounded-[18px] border border-[#E8EEF5] bg-white px-6 py-12 text-center shadow-[0_2px_12px_rgb(15_44_76/0.04)]">
      <h1 className="font-heading text-2xl font-semibold text-heading">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        Próximamente
      </p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/backoffice">Volver al Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
