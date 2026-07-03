import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { FAQ_ITEMS } from '@/constants/faq'
import { GLOSSARY_TERMS } from '@/constants/glossary'
import { FORMULAS } from '@/constants/formulas'
import { faqEn, manualCategoryZh } from '@/i18n/content-i18n'
import { glossaryEn } from '@/i18n/glossary-i18n'
import { manualEnById, manualCategoryEn } from '@/i18n/manual-i18n'

export function useContentI18n() {
  const { locale, t } = useLocale()

  function ct(key, params) {
    return t(`content.${key}`, params)
  }

  const faqItems = computed(() => (locale.value === 'en' ? faqEn : FAQ_ITEMS))

  const glossaryTerms = computed(() => {
    if (locale.value !== 'en') return GLOSSARY_TERMS
    return GLOSSARY_TERMS.map((item) => {
      const en = glossaryEn[item.id]
      if (!en) return item
      return { ...item, term: en.term, category: en.category, definition: en.definition, tags: en.tags ?? item.tags }
    })
  })

  const formulas = computed(() => {
    if (locale.value !== 'en') return FORMULAS
    return FORMULAS.map((f) => {
      const en = manualEnById[f.id]
      if (!en) return { ...f, category: manualCategoryEn[f.category] ?? f.category }
      return {
        ...f,
        name: en.name ?? f.name,
        desc: en.desc ?? f.desc,
        tags: en.tags ?? f.tags,
        category: en.category ?? manualCategoryEn[f.category] ?? f.category,
      }
    })
  })

  function manualCategoryLabel(key) {
    if (key === 'all') return ct('manual.categories.all')
    if (locale.value === 'en') return ct(`manual.categories.${key}`)
    return manualCategoryZh[key] ?? key
  }

  function filterFormulas(list, categoryKey, keyword) {
    let out = list
    if (categoryKey !== 'all') {
      const label = manualCategoryLabel(categoryKey)
      out = out.filter((f) => f.category === label)
    }
    const k = keyword.trim().toLowerCase()
    if (!k) return out
    return out.filter(
      (f) =>
        f.name.toLowerCase().includes(k) ||
        f.formula.toLowerCase().includes(k) ||
        f.latex.toLowerCase().includes(k) ||
        f.desc.toLowerCase().includes(k) ||
        (f.category && f.category.toLowerCase().includes(k)) ||
        f.tags.some((tag) => tag.toLowerCase().includes(k)),
    )
  }

  function filterGlossary(list, query) {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q),
    )
  }

  return {
    locale,
    ct,
    faqItems,
    glossaryTerms,
    formulas,
    manualCategoryLabel,
    filterFormulas,
    filterGlossary,
  }
}
