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

  /** Page field label, falls back to calc.fields.common */
  function pf(key, params) {
    const pageKeyPath = `calc.pages.${pageKey}.fields.${key}`
    const pageVal = t(pageKeyPath, params)
    if (pageVal !== pageKeyPath) return pageVal
    return t(`calc.fields.common.${key}`, params)
  }

  /** Page result row label */
  function pr(key, params) {
    const path = `calc.pages.${pageKey}.results.${key}`
    const val = t(path, params)
    return val !== path ? val : key
  }

  function fc(key, params) {
    return t(`calc.fields.common.${key}`, params)
  }

  return { t, locale, pt, ct, pf, pr, fc, pageKey }
}
