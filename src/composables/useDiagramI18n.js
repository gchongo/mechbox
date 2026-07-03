import { useLocale } from '@/composables/useLocale'
import { enrichMathText, dimLabel } from '@/utils/math-label'

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

  /** 示意图说明文字 — 自动补 $...$ LaTeX */
  function dm(text) {
    return enrichMathText(text)
  }

  /** 尺寸标注 sym = value unit — 自动 LaTeX */
  function dl(symbol, value, unit = 'mm') {
    return dimLabel(symbol, value, unit)
  }

  return { t, locale, dt, dm, dl }
}
