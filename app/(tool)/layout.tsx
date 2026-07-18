import { AppShell } from "@/components/layout/app-shell"

/**
 * Layout de herramientas / miniapps.
 */
export default function ToolLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppShell className="bg-[#EEF6FF]">{children}</AppShell>
}
