import { useLocale } from '@/composables/useLocale'

/**
 * @param {string} diagramKey e.g. 'spring', 'beam'
 */
export function useDiagramI18n(diagramKey) {
  const { t, locale } = useLocale()

  function dt(suffix, params) {
    const scoped = `calc.diagrams.${diagramKey}.${suffix}`
    const scopedVal = t(scoped, params)
    if (scopedVal !== scoped) return scopedVal
    const common = `calc.diagrams.labels.${suffix}`
    const commonVal = t(common, params)
    return commonVal !== common ? commonVal : suffix
  }

  return { t, locale, dt }
}
