export type BackofficeNavItem = {
  href: string
  label: string
  exact?: boolean
  placeholder?: boolean
}

export const BACKOFFICE_NAV: BackofficeNavItem[] = [
  { href: "/backoffice", label: "Dashboard", exact: true },
  { href: "/backoffice/licenses", label: "Licencias" },
  {
    href: "/backoffice/clientes",
    label: "Clientes",
    placeholder: true,
  },
  {
    href: "/backoffice/ventas",
    label: "Ventas",
    placeholder: true,
  },
  {
    href: "/backoffice/configuracion",
    label: "Configuración",
    placeholder: true,
  },
]
