import { useLocale } from '@/composables/useLocale'

/** Namespaced i18n helper for decision-layer components (compare/inverse/sensitivity/report) */
export function useDecisionI18n() {
  const { t, locale } = useLocale()

  function dt(key, params) {
    return t(`calc.decision.${key}`, params)
  }

  return { dt, t, locale }
}
