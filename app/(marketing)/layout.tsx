import { Header } from "@/components/layout/header"

/**
 * Layout de marketing / landing — footer lo aporta la propia página.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  )
}
