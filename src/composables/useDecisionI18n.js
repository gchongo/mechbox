import { useLocale } from '@/composables/useLocale'

/** Namespaced i18n helper for decision-layer components (compare/inverse/sensitivity/report) */
export function useDecisionI18n() {
  const { t, locale } = useLocale()

  function dt(key, params) {
    return t(`calc.decision.${key}`, params)
  }

  function inverseLabel(toolId, invId, fallback) {
    const path = `calc.decision.inverse.${toolId}.${invId}`
    const val = t(path, {})
    return val !== path ? val : fallback ?? invId
  }

  function reasonLabel(reason) {
    if (!reason) return '-'
    const path = `calc.decision.reasons.${reason}`
    const val = t(path, {})
    return val !== path ? val : reason
  }

  function metricLabel(toolId, metricKey) {
    const pagePath = `calc.pages.${toolId}.results.${metricKey}`
    const pageVal = t(pagePath, {})
    if (pageVal !== pagePath) return pageVal
    const decisionPath = `calc.decision.metrics.${metricKey}`
    const decisionVal = t(decisionPath, {})
    return decisionVal !== decisionPath ? decisionVal : metricKey
  }

  function paramLabel(toolId, paramKey, fallback, baseInputs) {
    if (paramKey?.startsWith('tol_')) {
      const i = Number.parseInt(paramKey.slice(4), 10)
      const name = baseInputs?.componentRings?.[i]?.name
      return dt('ringTolerance', { name: name || dt('ringN', { n: i + 1 }) })
    }
    const pagePath = `calc.pages.${toolId}.fields.${paramKey}`
    const pageVal = t(pagePath, {})
    if (pageVal !== pagePath) return pageVal
    const commonPath = `calc.fields.common.${paramKey}`
    const commonVal = t(commonPath, {})
    if (commonVal !== commonPath) return commonVal
    return fallback ?? paramKey
  }

  return { dt, t, locale, inverseLabel, reasonLabel, metricLabel, paramLabel }
}
