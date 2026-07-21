import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import { APP_NAME } from "@/lib/constants"
import type { ProfessionalReportView } from "@/features/calculadora-costos/report-presentation"

const colors = {
  navy: "#0F2C4C",
  turquoise: "#14B8A6",
  muted: "#64748B",
  border: "#E8EEF5",
  softBg: "#F0FDFA",
  white: "#FFFFFF",
  body: "#334155",
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.body,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 72,
    height: 64,
    objectFit: "contain",
  },
  brandFallback: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  headerMeta: {
    alignItems: "flex-end",
    maxWidth: "55%",
  },
  reportTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    textAlign: "right",
  },
  generatedAt: {
    marginTop: 4,
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
  },
  productBlock: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: colors.muted,
  },
  hero: {
    backgroundColor: colors.softBg,
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  heroLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.turquoise,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.turquoise,
  },
  heroNote: {
    marginTop: 8,
    fontSize: 9,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricTile: {
    width: "31.5%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  metricLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  metricValueEmphasize: {
    fontSize: 13,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  footerNote: {
    fontSize: 8,
    color: colors.muted,
  },
})

type ProfessionalReportPdfDocumentProps = {
  view: ProfessionalReportView
  generatedAtLabel: string
  logoSrc?: string | null
}

export function ProfessionalReportPdfDocument({
  view,
  generatedAtLabel,
  logoSrc,
}: ProfessionalReportPdfDocumentProps) {
  return (
    <Document
      title={`${view.reportTitle} — ${view.productName}`}
      author={APP_NAME}
      subject={view.reportTitle}
      creator={APP_NAME}
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          {logoSrc ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={styles.brandFallback}>{APP_NAME}</Text>
          )}
          <View style={styles.headerMeta}>
            <Text style={styles.reportTitle}>{view.reportTitle}</Text>
            <Text style={styles.generatedAt}>
              Generado el {generatedAtLabel}
            </Text>
          </View>
        </View>

        <View style={styles.productBlock}>
          <Text style={styles.productName}>{view.productName}</Text>
          <Text style={styles.description}>{view.description}</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{view.finalSalePriceLabel}</Text>
          <Text style={styles.heroValue}>{view.finalSalePrice}</Text>
          <Text style={styles.heroNote}>{view.finalSalePriceNote}</Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen de costos y margen</Text>
        <View style={styles.metricsGrid}>
          {view.metrics.map((metric) => (
            <View key={metric.label} style={styles.metricTile} wrap={false}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  metric.emphasize ? styles.metricValueEmphasize : {},
                ]}
              >
                {metric.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>{APP_NAME}</Text>
          <Text style={styles.footerNote}>Informe Profesional de Costos</Text>
        </View>
      </Page>
    </Document>
  )
}
