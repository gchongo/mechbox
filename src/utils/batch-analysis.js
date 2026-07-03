import { rssMethod, worstCaseMethod, calculateRssLimits, calculateWorstCaseLimits } from './size-chain-math'
import { combineStackAdvice } from './stack-method-advice'

export function parseToleranceRow(str) {
  return String(str)
    .split(/[,，\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n >= 0)
}

/** 单行公差列表的 RSS / 极值分析 */
export function analyzeToleranceRow(tolerances, factors = []) {
  const rings = tolerances.map((t, i) => ({
    name: `T${i + 1}`,
    size: 0,
    tolerance: t,
    factor: factors[i] ?? 1,
    type: 'increasing',
  }))

  const worst = calculateWorstCaseLimits(rings)
  const rss = calculateRssLimits(rings)

  return {
    ringCount: tolerances.length,
    worstTolerance: worst.totalTolerance,
    rssTolerance: rss.totalTolerance,
    worstUpper: worst.upper,
    worstLower: worst.lower,
    rssUpper: rss.upper,
    rssLower: rss.lower,
  }
}

/** 批量验证多组公差 */
export function batchValidate(rows, targetMin, targetMax) {
  return rows.map((row, index) => {
    const tolerances = parseToleranceRow(row.tolerances)
    const factors = row.factors ? parseToleranceRow(row.factors) : []
    if (!tolerances.length) {
      return { index, name: row.name, errorKey: 'batch_no_tolerance' }
    }

    const result = analyzeToleranceRow(tolerances, factors)
    const rssPass = result.rssLower >= targetMin && result.rssUpper <= targetMax
    const worstPass = result.worstLower >= targetMin && result.worstUpper <= targetMax
    const advice = combineStackAdvice(
      worstPass,
      rssPass,
      result.worstTolerance,
      result.rssTolerance,
    )

    return {
      index,
      name: row.name || `方案 ${index + 1}`,
      ringCount: result.ringCount,
      worstTolerance: result.worstTolerance,
      rssTolerance: result.rssTolerance,
      rssPass,
      worstPass,
      adviceLevel: advice.level,
      adviceKey: advice.warningKey,
      methodRatio: advice.divergence.ratio,
    }
  })
}

/** 从 CSV 文本解析批量行：名称,公差1,公差2,... */
export function parseBatchCsv(text) {
  return String(text)
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line, i) => {
      const parts = line.split(/[,，\t]/).map((s) => s.trim())
      if (parts.length < 2) return null
      const name = parts[0]
      const tolerances = parts.slice(1).join(',')
      return { name: name || `行 ${i + 1}`, tolerances }
    })
    .filter(Boolean)
}

export { rssMethod, worstCaseMethod }
