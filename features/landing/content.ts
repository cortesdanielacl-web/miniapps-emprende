/**
 * Contenido de la Landing Page V1 — Calculadora Inteligente de Costos.
 * No modificar el copy aquí salvo por instrucción explícita de producto.
 */

export const landingContent = {
  hero: {
    title: "¿Estás seguro de que ganas dinero con cada venta?",
    description:
      "Descubre el costo real de tus productos y obtén un precio de venta recomendado en menos de 5 minutos.",
    cta: {
      label: "Calcular mi precio ahora",
      href: "/calculadora",
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
    originalPrice: "$14.990",
    launchPrice: "$5.990 CLP",
    savings: "Ahorra $9.000 con el precio de lanzamiento.",
    benefits: [
      "Pago único.",
      "Acceso inmediato.",
      "Sin suscripciones.",
      "Actualizaciones incluidas para la versión V1.",
    ],
    cta: {
      label: "Comprar ahora",
      href: "#",
    },
    footnote: "*Precio de lanzamiento por tiempo limitado.",
  },
  finalCta: {
    id: "cta-final",
    title: "Deja de poner precios a ciegas.",
    description: "Calcula el costo real de tus productos hoy mismo.",
    cta: {
      label: "Comenzar ahora.",
      href: "/calculadora",
    },
  },
  footer: {
    copyright: "© 2026 MiniApps Emprende",
  },
} as const
