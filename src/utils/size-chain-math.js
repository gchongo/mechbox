/** 6σ RSS：T = 6√Σ(Tᵢ/Kᵢ)² */
const SIGMA6_K = {
  normal: 6.0,
  uniform: 3.46,
  rectangular: 3.46,
  triangular: 4.24,
  skewed: 5.0,
}

export function sigma6RssMethod(rings, distribution = 'normal') {
  const k = SIGMA6_K[distribution] ?? 6
  const sumSq = rings.reduce((s, ring) => {
    const t = (ring.tolerance ?? 0) * (ring.factor ?? 1)
    return s + (t / k) ** 2
  }, 0)
  return 6 * Math.sqrt(sumSq)
}

/** 极值法（最坏情况）— 各环公差代数叠加 */
export function worstCaseMethod(rings) {
  return rings.reduce((sum, ring) => sum + (ring.tolerance ?? 0) * (ring.factor ?? 1), 0)
}

/** RSS 法 */
export function rssMethod(rings) {
  const sumSquares = rings.reduce(
    (sum, ring) => sum + ((ring.tolerance ?? 0) * (ring.factor ?? 1)) ** 2,
    0,
  )
  return Math.sqrt(sumSquares)
}

/** 分布修正系数（相对正态 RSS） */
export const RSS_CORRECTION = {
  normal: 1.0,
  uniform: 1.15,
  rectangular: 1.15,
  triangular: 1.05,
  skewed: 1.12,
}

/** 修正 RSS */
export function modifiedRssMethod(rings, distribution = 'normal', skewness = 0) {
  const base = rssMethod(rings)
  const distFactor = RSS_CORRECTION[distribution] ?? 1
  const skewFactor = 1 + Math.min(Math.abs(skewness) / 6, 0.2)
  return base * distFactor * skewFactor
}

/** 极值法：分别叠加上/下限 */
export function calculateWorstCaseLimits(componentRings) {
  let upper = 0
  let lower = 0

  for (const ring of componentRings) {
    const factor = ring.factor ?? 1
    const half = (ring.tolerance * factor) / 2
    const nominal = ring.size * factor

    if (ring.type === 'increasing') {
      upper += nominal + half
      lower += nominal - half
    } else {
      upper -= nominal - half
      lower -= nominal + half
    }
  }

  return {
    nominal: (upper + lower) / 2,
    upper,
    lower,
    totalTolerance: upper - lower,
  }
}

/** RSS 法：公差均布在名义值两侧 */
export function calculateRssLimits(componentRings) {
  const nominal = componentRings.reduce((sum, ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    return sum + sign * ring.size * (ring.factor ?? 1)
  }, 0)

  const tolerances = componentRings.map((r) => ({
    tolerance: r.tolerance * (r.factor ?? 1),
  }))
  const totalTolerance = rssMethod(tolerances)

  return {
    nominal,
    upper: nominal + totalTolerance / 2,
    lower: nominal - totalTolerance / 2,
    totalTolerance,
  }
}

/** 修正 RSS 法 */
export function calculateModifiedRssLimits(
  componentRings,
  distribution = 'normal',
  skewness = 0,
) {
  const nominal = componentRings.reduce((sum, ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    return sum + sign * ring.size * (ring.factor ?? 1)
  }, 0)

  const tolerances = componentRings.map((r) => ({
    tolerance: r.tolerance * (r.factor ?? 1),
  }))
  const totalTolerance = modifiedRssMethod(tolerances, distribution, skewness)

  return {
    nominal,
    upper: nominal + totalTolerance / 2,
    lower: nominal - totalTolerance / 2,
    totalTolerance,
  }
}

/** 带符号名义尺寸和 — L₀ = Σ(增环) − Σ(减环) */
export function calcSignedNominalSum(componentRings) {
  return componentRings.reduce((sum, ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    return sum + sign * (ring.size ?? 0) * (ring.factor ?? 1)
  }, 0)
}

/** 计算尺寸链结果 */
export function calculateSizeChain(closedRing, componentRings, method = 'rss', options = {}) {
  let limits
  if (method === 'worst') {
    limits = calculateWorstCaseLimits(componentRings)
  } else if (method === 'modified-rss') {
    limits = calculateModifiedRssLimits(
      componentRings,
      options.distribution ?? 'normal',
      options.skewness ?? 0,
    )
  } else if (method === 'sigma6-rss') {
    const nominal = componentRings.reduce((sum, ring) => {
      const sign = ring.type === 'increasing' ? 1 : -1
      return sum + sign * ring.size * (ring.factor ?? 1)
    }, 0)
    const tolerances = componentRings.map((r) => ({
      tolerance: r.tolerance,
      factor: r.factor ?? 1,
    }))
    const totalTolerance = sigma6RssMethod(tolerances, options.distribution ?? 'normal')
    limits = {
      nominal,
      upper: nominal + totalTolerance / 2,
      lower: nominal - totalTolerance / 2,
      totalTolerance,
    }
  } else {
    limits = calculateRssLimits(componentRings)
  }

  const pass = limits.lower >= closedRing.min && limits.upper <= closedRing.max

  return { ...limits, pass }
}

/** 生成公式展示行 */
export function buildFormulaLines(closedRing, componentRings, method, unit = 'mm', options = {}) {
  const rings = componentRings
  if (!rings.length) return ['请添加组成环']

  const inc = rings.filter((r) => r.type === 'increasing')
  const dec = rings.filter((r) => r.type !== 'increasing')
  const incExpr = inc.map((r) => r.name).join(' + ') || '0'
  const decExpr = dec.map((r) => r.name).join(' + ') || '0'
  const incSum = inc.reduce((s, r) => s + r.size * (r.factor ?? 1), 0)
  const decSum = dec.reduce((s, r) => s + r.size * (r.factor ?? 1), 0)
  const nominal = incSum - decSum

  const worst = calculateWorstCaseLimits(rings)
  const rss = calculateRssLimits(rings)
  const modified = calculateModifiedRssLimits(rings, options?.distribution ?? 'normal')
  const sigma6Tol = sigma6RssMethod(rings, options?.distribution ?? 'normal')
  const sigma6 = {
    totalTolerance: sigma6Tol,
    upper: nominal + sigma6Tol / 2,
    lower: nominal - sigma6Tol / 2,
  }
  let active
  if (method === 'worst') active = worst
  else if (method === 'modified-rss') active = modified
  else if (method === 'sigma6-rss') active = sigma6
  else active = rss
  const passMark =
    active.lower >= closedRing.min && active.upper <= closedRing.max ? ' ✓' : ' ✗'

  const lines = [
    `${closedRing.name || 'L0'} = ${incExpr} - (${decExpr})`,
    `     = ${incSum.toFixed(2)} - ${decSum.toFixed(2)}`,
    `     = ${nominal.toFixed(2)} ${unit}`,
    `总公差 (极值法) = ${worst.totalTolerance.toFixed(3)} ${unit}  →  [${worst.lower.toFixed(3)}, ${worst.upper.toFixed(3)}]`,
    `总公差 (RSS 法) = ${rss.totalTolerance.toFixed(3)} ${unit}  →  [${rss.lower.toFixed(3)}, ${rss.upper.toFixed(3)}]`,
  ]
  if (method === 'modified-rss') {
    lines.push(
      `总公差 (修正 RSS) = ${modified.totalTolerance.toFixed(3)} ${unit}  →  [${modified.lower.toFixed(3)}, ${modified.upper.toFixed(3)}]${passMark}`,
    )
  } else if (method === 'sigma6-rss') {
    lines.push(
      `总公差 (6σ RSS) = ${sigma6.totalTolerance.toFixed(3)} ${unit}  →  [${sigma6.lower.toFixed(3)}, ${sigma6.upper.toFixed(3)}]${passMark}`,
    )
  } else {
    lines[lines.length - 1] += passMark
  }
  return lines
}

function texLabel(name) {
  return `\\text{${String(name).replace(/_/g, '\\_')}}`
}

/** 生成 LaTeX 公式行（用于 KaTeX 渲染） */
export function buildFormulaLatex(
  closedRing,
  componentRings,
  method,
  unit = 'mm',
  options = {},
) {
  const rings = componentRings
  if (!rings.length) return [{ latex: '\\text{请添加组成环}', block: true }]

  const inc = rings.filter((r) => r.type === 'increasing')
  const dec = rings.filter((r) => r.type !== 'increasing')
  const incTex = inc.map((r) => texLabel(r.name)).join(' + ') || '0'
  const decTex = dec.map((r) => texLabel(r.name)).join(' + ') || '0'
  const incSum = inc.reduce((s, r) => s + r.size * (r.factor ?? 1), 0)
  const decSum = dec.reduce((s, r) => s + r.size * (r.factor ?? 1), 0)
  const nominal = incSum - decSum
  const l0 = texLabel(closedRing.name || 'L_0')

  const worst = calculateWorstCaseLimits(rings)
  const rss = calculateRssLimits(rings)
  const modified = calculateModifiedRssLimits(
    rings,
    options.distribution ?? 'normal',
    options.skewness ?? 0,
  )
  const sigma6Tol = sigma6RssMethod(rings, options.distribution ?? 'normal')
  const sigma6 = {
    totalTolerance: sigma6Tol,
    upper: nominal + sigma6Tol / 2,
    lower: nominal - sigma6Tol / 2,
  }
  let active
  if (method === 'worst') active = worst
  else if (method === 'modified-rss') active = modified
  else if (method === 'sigma6-rss') active = sigma6
  else active = rss
  const passMark =
    active.lower >= closedRing.min && active.upper <= closedRing.max ? '\\checkmark' : '\\times'

  const u = unit === 'inch' ? '\\text{inch}' : '\\text{mm}'

  const lines = [
    {
      latex: `${l0} = ${incTex} - (${decTex})`,
      block: true,
    },
    {
      latex: `= ${incSum.toFixed(2)} - ${decSum.toFixed(2)} = ${nominal.toFixed(2)}\\,${u}`,
      block: true,
    },
    {
      latex: `T_{\\text{极值}} = ${worst.totalTolerance.toFixed(3)}\\,${u},\\quad [${worst.lower.toFixed(3)},\\, ${worst.upper.toFixed(3)}]`,
      block: true,
    },
    {
      latex: `T_{\\text{RSS}} = ${rss.totalTolerance.toFixed(3)}\\,${u},\\quad [${rss.lower.toFixed(3)},\\, ${rss.upper.toFixed(3)}]`,
      block: true,
    },
  ]
  if (method === 'modified-rss') {
    lines.push({
      latex: `T_{\\text{mod}} = ${modified.totalTolerance.toFixed(3)}\\,${u},\\quad [${modified.lower.toFixed(3)},\\, ${modified.upper.toFixed(3)}]\\; ${passMark}`,
      block: true,
    })
  } else if (method === 'sigma6-rss') {
    lines.push({
      latex: `T_{6\\sigma} = ${sigma6.totalTolerance.toFixed(3)}\\,${u},\\quad [${sigma6.lower.toFixed(3)},\\, ${sigma6.upper.toFixed(3)}]\\; ${passMark}`,
      block: true,
    })
  } else {
    lines[lines.length - 1].latex += `\\; ${passMark}`
  }
  return lines
}

import { calcProcessCapability, formatCapabilitySummary } from '@/utils/process-capability'

/** 西格玛分析摘要（基于 RSS 结果与规格限） */
export function buildSigmaSummary(closedRing, rssResult) {
  const usl = closedRing.max
  const lsl = closedRing.min
  const processSigma = rssResult.processSigma ?? rssResult.totalTolerance / 6
  const mean = rssResult.nominal ?? (usl + lsl) / 2
  return formatCapabilitySummary(
    calcProcessCapability({ lsl, usl, mean, sigma: processSigma }),
  )
}
