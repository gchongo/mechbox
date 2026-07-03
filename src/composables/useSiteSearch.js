import { getAllToolsFlat } from '@/constants/tool-catalog'
import { ANALYSIS_GROUPS } from '@/constants/analysis-types'
import { useLocale } from '@/composables/useLocale'
import { useContentI18n } from '@/composables/useContentI18n'
import { localizedTool, localizedStatTool, localizedAnalysisType } from '@/i18n'

const LIMIT = { tool: 6, analysis: 4, glossary: 4, formula: 4 }

function matchHay(hay, q) {
  return hay.toLowerCase().includes(q)
}

export function useSiteSearch() {
  const { locale, t } = useLocale()
  const { glossaryTerms, formulas, filterGlossary, filterFormulas } = useContentI18n()

  function localizedTools() {
    return getAllToolsFlat().map((tool) => {
      const localized = tool.path
        ? localizedTool(tool, locale.value)
        : localizedStatTool(tool, locale.value)
      const category =
        tool.categoryId === 'stat'
          ? t('home.statTools')
          : t(`toolGroups.${tool.categoryId}`)
      return {
        ...localized,
        category,
        categoryId: tool.categoryId,
        route: tool.route,
        path: tool.path,
        query: tool.query,
      }
    })
  }

  /** @returns {{ tools: object[], analysis: object[], glossary: object[], formulas: object[] }} */
  function searchSite(rawQuery) {
    const q = String(rawQuery ?? '').trim().toLowerCase()
    if (!q) {
      return { tools: [], analysis: [], glossary: [], formulas: [] }
    }

    const tools = localizedTools()
      .filter((tool) => {
        const hay = [tool.label, tool.desc, tool.category, ...(tool.keywords ?? [])].join(' ')
        return matchHay(hay, q)
      })
      .slice(0, LIMIT.tool)
      .map((tool) => ({
        id: `tool-${tool.route}`,
        kind: 'tool',
        label: tool.label,
        desc: tool.desc,
        category: tool.category,
        path: tool.path,
        query: tool.query,
        route: tool.route,
      }))

    const analysis = []
    for (const group of ANALYSIS_GROUPS) {
      for (const type of group.types) {
        const label = localizedAnalysisType(type.id, locale.value, 'name')
        const desc = localizedAnalysisType(type.id, locale.value, 'desc')
        const groupLabel = t(`analysisGroups.${group.id}`)
        const hay = [label, desc, type.name, type.desc, groupLabel].join(' ')
        if (matchHay(hay, q)) {
          analysis.push({
            id: `analysis-${type.id}`,
            kind: 'analysis',
            label,
            desc,
            category: groupLabel,
            analysisTypeId: type.id,
          })
        }
      }
    }

    const glossary = filterGlossary(glossaryTerms.value, q)
      .slice(0, LIMIT.glossary)
      .map((item) => ({
        id: `glossary-${item.id ?? item.term}`,
        kind: 'glossary',
        label: item.term,
        desc: item.definition,
        category: item.category,
        term: item.term,
      }))

    const formulasList = filterFormulas(formulas.value, 'all', q)
      .slice(0, LIMIT.formula)
      .map((item) => ({
        id: `formula-${item.id}`,
        kind: 'formula',
        label: item.name,
        desc: item.desc,
        category: item.category,
        formulaId: item.id,
      }))

    return {
      tools,
      analysis: analysis.slice(0, LIMIT.analysis),
      glossary,
      formulas: formulasList,
    }
  }

  function flattenResults(groups) {
    return [
      ...groups.tools,
      ...groups.analysis,
      ...groups.glossary,
      ...groups.formulas,
    ]
  }

  function hasResults(groups) {
    return flattenResults(groups).length > 0
  }

  return { searchSite, flattenResults, hasResults }
}
