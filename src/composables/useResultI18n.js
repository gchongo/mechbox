import { useLocale } from '@/composables/useLocale'

function formatError(result, re) {
  if (!result) return ''
  if (result.errorKey) return re(result.errorKey, result.errorParams)
  return result.error ?? ''
}

export function useResultI18n() {
  const { t, locale } = useLocale()

  /** calc.messages.{group}.{key} with optional {param} substitution */
  function rm(group, key, params) {
    const path = `calc.messages.${group}.${key}`
    const val = t(path, params)
    return val !== path ? val : key
  }

  /** calc.messages.errors.{key} */
  function re(key, params) {
    const path = `calc.messages.errors.${key}`
    const val = t(path, params)
    return val !== path ? val : key
  }

  function resultError(result) {
    locale.value
    return formatError(result, re)
  }

  return { locale, rm, re, resultError }
}
