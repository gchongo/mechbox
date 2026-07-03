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

  return { t, locale, pt, ct, pageKey }
}
