/** 6σ RSS：T = 6√Σ(Tᵢ/Kᵢ)² */
import { resolveComponentRingTypes } from '@/utils/ring-direction'
import { resolveRingToleranceBounds, validateComponentRingTolerances } from '@/utils/ring-tolerance'

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
    let t
    if (ring.size != null || ring.es != null || ring.ei != null) {
      t = resolveRingToleranceBounds(ring).tolerance
    } else {
      t = (ring.tolerance ?? 0) * (ring.factor ?? 1)
    }
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

/** 分布修正系数（相对正态 RSS）— 除 normal 外均为经验值，非国家标准 */
export const RSS_CORRECTION = {
  normal: 1.0,
  uniform: 1.15,
  rectangular: 1.15,
  triangular: 1.05,
  skewed: 1.12,
}

export const MODIFIED_RSS_DISCLAIMER =
  '修正 RSS 采用经验分布/偏态系数，非 GB/ISO 标准算法；正式工程请优先 6σ RSS 或 Monte Carlo'

export const RSS_CORRECTION_META = {
  normal: { factor: 1.0, empirical: false, note: '正态 RSS 基准' },
  uniform: { factor: 1.15, empirical: true, note: '均匀分布经验系数（相对正态 RSS）' },
  rectangular: { factor: 1.15, empirical: true, note: '矩形分布经验系数' },
  triangular: { factor: 1.05, empirical: true, note: '三角分布经验系数' },
  skewed: { factor: 1.12, empirical: true, note: '偏态分布经验系数' },
}

/** 修正 RSS 明细 — 便于 UI/报告标注经验假设 */
export function getModifiedRssBreakdown(rings, distribution = 'normal', skewness = 0) {
  const mapped = rings.map((r) => {
    if (r.es != null || r.ei != null || r.tolerance != null) {
      return { tolerance: resolveRingToleranceBounds(r).tolerance }
    }
    return { tolerance: (r.tolerance ?? 0) * (r.factor ?? 1) }
  })
  const base = rssMethod(mapped)
  const meta = RSS_CORRECTION_META[distribution] ?? RSS_CORRECTION_META.normal
  const distFactor = meta.factor
  const skewFactor = 1 + Math.min(Math.abs(skewness) / 6, 0.2)
  return {
    total: base * distFactor * skewFactor,
    base,
    distFactor,
    skewFactor,
    distribution,
    empirical: meta.empirical || Math.abs(skewness) > 0,
    disclaimer: MODIFIED_RSS_DISCLAIMER,
    note: meta.note,
  }
}

/** 修正 RSS */
export function modifiedRssMethod(rings, distribution = 'normal', skewness = 0) {
  return getModifiedRssBreakdown(rings, distribution, skewness).total
}

/** 极值法：分别叠加上/下限（支持非对称 ES/EI） */
export function calculateWorstCaseLimits(componentRings) {
  let upper = 0
  let lower = 0

  for (const ring of componentRings) {
    const { es, ei, nominal } = resolveRingToleranceBounds(ring)

    if (ring.type === 'increasing') {
      upper += nominal + es
      lower += nominal + ei
    } else {
      upper -= nominal + ei
      lower -= nominal + es
    }
  }

  return {
    nominal: (upper + lower) / 2,
    upper,
    lower,
    totalTolerance: upper - lower,
  }
}

/** RSS 法：名义值含 (ES+EI)/2 偏移，公差带宽度为 ES−EI */
export function calculateRssLimits(componentRings) {
  const nominal = componentRings.reduce((sum, ring) => {
    const sign = ringSign(ring)
    if (sign == null) return sum
    const bounds = resolveRingToleranceBounds(ring)
    return sum + sign * (bounds.nominal + bounds.meanDev)
  }, 0)

  const tolerances = componentRings.map((r) => ({
    tolerance: resolveRingToleranceBounds(r).tolerance,
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
    const sign = ringSign(ring)
    if (sign == null) return sum
    const bounds = resolveRingToleranceBounds(ring)
    return sum + sign * (bounds.nominal + bounds.meanDev)
  }, 0)

  const tolerances = componentRings.map((r) => ({
    tolerance: resolveRingToleranceBounds(r).tolerance,
  }))
  const totalTolerance = modifiedRssMethod(tolerances, distribution, skewness)

  return {
    nominal,
    upper: nominal + totalTolerance / 2,
    lower: nominal - totalTolerance / 2,
    totalTolerance,
  }
}

/** 增/减环符号；type 非法时返回 null（禁止静默当减环） */
export function ringSign(ring) {
  if (ring.type === 'increasing') return 1
  if (ring.type === 'decreasing') return -1
  return null
}

/** 带符号名义尺寸和 — L₀ = Σ(增环) − Σ(减环)；环 type 须已校验 */
export function calcSignedNominalSum(componentRings) {
  return componentRings.reduce((sum, ring) => {
    const sign = ringSign(ring)
    if (sign == null) return sum
    return sum + sign * (ring.size ?? 0) * (ring.factor ?? 1)
  }, 0)
}

function chainValidationFailure(error) {
  return {
    nominal: null,
    upper: null,
    lower: null,
    totalTolerance: null,
    pass: false,
    validationError: error.errorKey,
    validationRing: error.ringName,
  }
}

/** 计算尺寸链结果 */
export function calculateSizeChain(closedRing, componentRings, method = 'rss', options = {}) {
  const resolved = resolveComponentRingTypes(componentRings, options.closedDirection)
  if (!resolved.valid) return chainValidationFailure(resolved)
  const rings = resolved.rings
  const tolCheck = validateComponentRingTolerances(rings)
  if (!tolCheck.valid) {
    return chainValidationFailure({ errorKey: tolCheck.errorKey, ringName: tolCheck.ringName })
  }

  let limits
  if (method === 'worst') {
    limits = calculateWorstCaseLimits(rings)
  } else if (method === 'modified-rss') {
    limits = calculateModifiedRssLimits(
      rings,
      options.distribution ?? 'normal',
      options.skewness ?? 0,
    )
  } else if (method === 'sigma6-rss') {
    const nominal = calcSignedNominalSum(rings)
    const totalTolerance = sigma6RssMethod(rings, options.distribution ?? 'normal')
    limits = {
      nominal,
      upper: nominal + totalTolerance / 2,
      lower: nominal - totalTolerance / 2,
      totalTolerance,
    }
  } else {
    limits = calculateRssLimits(rings)
  }

  const pass = limits.lower >= closedRing.min && limits.upper <= closedRing.max

  return { ...limits, pass }
}

/** 生成公式展示行 */
export function buildFormulaLines(closedRing, componentRings, method, unit = 'mm', options = {}) {
  if (!componentRings?.length) return ['请添加组成环']

  const resolved = resolveComponentRingTypes(componentRings, options.closedDirection)
  if (!resolved.valid) {
    return [`[校验失败: ${resolved.errorKey}] ${resolved.ringName ?? ''}`]
  }
  const rings = resolved.rings

  const inc = rings.filter((r) => r.type === 'increasing')
  const dec = rings.filter((r) => r.type === 'decreasing')
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
    const mod = getModifiedRssBreakdown(rings, options?.distribution ?? 'normal', options?.skewness ?? 0)
    lines.push(
      `总公差 (修正 RSS) = ${modified.totalTolerance.toFixed(3)} ${unit}  →  [${modified.lower.toFixed(3)}, ${modified.upper.toFixed(3)}]${passMark}`,
    )
    if (mod.empirical) {
      lines.push(`  ※ ${MODIFIED_RSS_DISCLAIMER}`)
    }
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
  if (!componentRings?.length) return [{ latex: '\\text{请添加组成环}', block: true }]

  const resolved = resolveComponentRingTypes(componentRings, options.closedDirection)
  if (!resolved.valid) {
    return [
      {
        latex: `\\text{[${resolved.errorKey}] ${String(resolved.ringName ?? '').replace(/_/g, '\\_')}}`,
        block: true,
      },
    ]
  }
  const rings = resolved.rings

  const inc = rings.filter((r) => r.type === 'increasing')
  const dec = rings.filter((r) => r.type === 'decreasing')
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
  const cap = calcProcessCapability({ lsl, usl, mean, sigma: processSigma })
  return {
    ...formatCapabilitySummary(cap),
    processSigmaFromRss: processSigma,
    rssTolerance: rssResult.totalTolerance,
  }
}
