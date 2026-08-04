/**
 * Contenido de la Landing Page V1 — Calculadora Inteligente de Costos.
 * No modificar el copy aquí salvo por instrucción explícita de producto.
 */

import {
  COMMERCIAL,
  formatCommercialAmount,
  formatCommercialPrice,
  getCheckoutUrl,
} from "@/config/commercial"

export const landingContent = {
  hero: {
    title: "¿Estás seguro de que ganas dinero con cada venta?",
    description:
      "Descubre el costo real de tus productos y obtén un precio de venta recomendado en menos de 5 minutos.",
    cta: {
      label: "Crear cuenta gratis",
      href: "/register",
      eyebrow: "Empieza gratis en menos de 5 minutos.",
      note: "Crea tu cuenta sin costo. Descubre el precio correcto para vender con confianza.",
    },
  },
  problem: {
    id: "problema",
    title: "¿Por qué cuesta tanto definir el precio correcto?",
    description:
      "Muchos emprendedores toman decisiones sin conocer el costo real de sus productos. Eso puede afectar directamente sus ganancias.",
    cards: [
      {
        title: "No conoces el costo real",
        description:
          "Pequeños gastos terminan reduciendo tu rentabilidad sin que lo notes.",
      },
      {
        title: "El margen no siempre alcanza",
        description:
          "Puedes vender mucho y obtener menos ganancias de las esperadas.",
      },
      {
        title: "Calcular todo toma tiempo",
        description:
          "Las planillas y los cálculos manuales hacen más lento tu trabajo.",
      },
    ],
  },
  solution: {
    id: "solucion",
    title: "Una herramienta simple para calcular tus costos.",
    description:
      "Ingresa tus costos, define el margen que deseas y obtén un precio de venta recomendado en pocos minutos.",
    checklist: [
      "Calcula el costo real.",
      "Define tu margen.",
      "Obtén un precio recomendado.",
      "Ahorra tiempo.",
    ],
  },
  benefits: {
    id: "beneficios",
    title: "Todo lo que necesitas para calcular el precio correcto.",
    items: [
      "Conoce el costo real.",
      "Define tu margen de ganancia.",
      "Obtén un precio de venta recomendado.",
      "Ahorra tiempo.",
    ],
  },
  pricing: {
    id: "precio",
    badge: "LANZAMIENTO 🚀",
    title: "Comienza hoy por un pago único.",
    originalPrice: formatCommercialAmount(COMMERCIAL.compareAtPrice),
    launchPrice: formatCommercialPrice(),
    savings: `Ahorra ${formatCommercialAmount(COMMERCIAL.compareAtPrice - COMMERCIAL.price)}.`,
    benefits: [...COMMERCIAL.licenseBenefits],
    cta: {
      label: "Comprar ahora",
      href: getCheckoutUrl(),
    },
    footnote: COMMERCIAL.paymentLabel,
  },
  finalCta: {
    id: "cta-final",
    title: "Deja de poner precios a ciegas.",
    description: "Empieza hoy a calcular el costo real de tus productos.",
    cta: {
      label: "Crear cuenta gratis",
      href: "/register",
      note: "Sin tarjeta de crédito. Empieza a calcular en pocos minutos.",
    },
  },
  footer: {
    copyright: "© 2026 MiniApps Emprende",
  },
}
