import { useLocale } from '@/composables/useLocale'

export function useChartI18n() {
  const { t, locale } = useLocale()

  function ch(key, params) {
    return t(`calc.charts.${key}`, params)
  }

  return { locale, ch }
}
