import { messages } from '@/i18n'
import { useLocale } from '@/composables/useLocale'

function getOptionField(locale, group, key, field = 'label') {
  const loc = messages[locale]?.calc?.options?.[group]?.[key]
  if (loc?.[field] != null) return loc[field]
  const fb = messages.zh?.calc?.options?.[group]?.[key]
  if (fb?.[field] != null) return fb[field]
  return null
}

export function useOptionsI18n() {
  const { locale } = useLocale()

  /** Localized option string; keys may contain dots (e.g. thread grade 8.8). */
  function ol(group, key, field = 'label') {
    const text = getOptionField(locale.value, group, key, field)
    return text ?? key
  }

  /** Keyed map with localized `label` (and optional extra fields). */
  function optionMap(source, group, field = 'label') {
    const out = {}
    for (const [k, v] of Object.entries(source)) {
      out[k] = {
        ...v,
        label: getOptionField(locale.value, group, k, field) ?? v.label ?? k,
      }
    }
    return out
  }

  /** Array entries with localized `label`. */
  function optionEntries(source, group, field = 'label') {
    return Object.entries(source).map(([k, v]) => ({
      ...v,
      id: v.id ?? k,
      label: getOptionField(locale.value, group, k, field) ?? v.label ?? k,
    }))
  }

  /** Numeric or string grade keys (e.g. ISO 1328). */
  function gradeLabel(group, key) {
    const k = String(key)
    return getOptionField(locale.value, group, k, 'label') ?? k
  }

  return { locale, ol, optionMap, optionEntries, gradeLabel }
}
