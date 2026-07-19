import { useLocale } from '@/composables/useLocale'

/**
 * @param {string} pageKey e.g. 'beam', 'sheet-metal'
 */
export function useCalcPage(pageKey) {
  const { t, locale } = useLocale()

  function pt(suffix, params) {
    return t(`calc.pages.${pageKey}.${suffix}`, params)
  }

  function ct(suffix, params) {
    return t(`calc.common.${suffix}`, params)
  }

  /** Page field label; falls back to page results, then calc.fields.common */
  function pf(key, params) {
    const fieldPath = `calc.pages.${pageKey}.fields.${key}`
    const fieldVal = t(fieldPath, params)
    if (fieldVal !== fieldPath) return fieldVal
    const resultPath = `calc.pages.${pageKey}.results.${key}`
    const resultVal = t(resultPath, params)
    if (resultVal !== resultPath) return resultVal
    return t(`calc.fields.common.${key}`, params)
  }

  /** Page result row label; falls back to page fields, then calc.fields.common */
  function pr(key, params) {
    const resultPath = `calc.pages.${pageKey}.results.${key}`
    const resultVal = t(resultPath, params)
    if (resultVal !== resultPath) return resultVal
    const fieldPath = `calc.pages.${pageKey}.fields.${key}`
    const fieldVal = t(fieldPath, params)
    if (fieldVal !== fieldPath) return fieldVal
    return t(`calc.fields.common.${key}`, params)
  }

  function fc(key, params) {
    return t(`calc.fields.common.${key}`, params)
  }

  return { t, locale, pt, ct, pf, pr, fc, pageKey }
}
