# MiniApps Emprende — Starter Kit v1.0

Plantilla oficial para crear nuevas miniapps sin configurar el stack desde cero.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) + React + TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Formularios | React Hook Form + Zod |
| Iconos | Lucide React |
| Tipografía | Poppins (Google Fonts vía `next/font`) |

## Estructura

```text
app/                 # Rutas Next.js (App Router)
components/
  ui/                # Primitivos shadcn/ui
  common/            # PageContainer, Section, EmptyState, ResultCard
  layout/            # Header, Footer, AppShell
  forms/             # FormInput, Form, FormField
features/            # Dominio de cada miniapp (vacío al inicio)
hooks/               # Hooks compartidos (responsive vía CSS)
lib/                 # Utilidades (cn, constants, format)
styles/              # Design tokens
types/               # Tipos compartidos
docs/                # Documentación del starter
public/              # Assets estáticos
```

## Design system

Colores de marca (CSS variables en `styles/tokens.css`):

- **Primary** `#0D1B2A`
- **Blue** `#2563EB`
- **Green** `#22C55E`
- **Yellow** `#FBBF24`
- **Gray** `#F3F4F6`

Tipografía: Poppins en toda la app (`--font-poppins`).

## Layout base

`AppShell` incluye Header simple, área principal (`#main-content`) y Footer minimalista. Sin menús ni autenticación.

## Componentes

| Componente | Ubicación | Variantes / notas |
|------------|-----------|-------------------|
| Button | `components/ui/button` | `primary`, `secondary`, `outline` (+ ghost, destructive, link) |
| Input | `components/ui/input` | Primitivo shadcn |
| FormInput | `components/forms/form-input` | Label + placeholder + error |
| Form / FormField | `components/forms/form` | Integración RHF + Zod |
| Card | `components/ui/card` | Card reutilizable |
| Section | `components/common/section` | Contenedor de sección |
| PageContainer | `components/common/page-container` | Ancho máximo + centrado |
| EmptyState | `components/common/empty-state` | Estado vacío |
| ResultCard | `components/common/result-card` | Presentación de resultados |

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # producción
npm run start    # servir build
npm run lint     # ESLint
```

## Reglas

- No agregar login, dashboard, base de datos, APIs de negocio ni IA en este kit.
- La lógica de cada miniapp vive en `features/`.
- Preferir componentes existentes antes de crear nuevos.
- Mobile first y accesibilidad (labels, focus visible, contraste, teclado).

## Crear una nueva miniapp

1. Duplicar este repositorio.
2. Renombrar el proyecto en `package.json` y `lib/constants.ts`.
3. Implementar features en `features/<nombre>/`.
