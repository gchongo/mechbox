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

/** 计算尺寸链结果 */
export function calculateSizeChain(closedRing, componentRings, method = 'rss') {
  const limits =
    method === 'worst'
      ? calculateWorstCaseLimits(componentRings)
      : calculateRssLimits(componentRings)

  const pass = limits.lower >= closedRing.min && limits.upper <= closedRing.max

  return { ...limits, pass }
}

/** 生成公式展示行 */
export function buildFormulaLines(closedRing, componentRings, method, unit = 'mm') {
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
  const active = method === 'worst' ? worst : rss
  const passMark =
    active.lower >= closedRing.min && active.upper <= closedRing.max ? ' ✓' : ' ✗'

  return [
    `${closedRing.name || 'L0'} = ${incExpr} - (${decExpr})`,
    `     = ${incSum.toFixed(2)} - ${decSum.toFixed(2)}`,
    `     = ${nominal.toFixed(2)} ${unit}`,
    `总公差 (极值法) = ${worst.totalTolerance.toFixed(3)} ${unit}  →  [${worst.lower.toFixed(3)}, ${worst.upper.toFixed(3)}]`,
    `总公差 (RSS 法) = ${rss.totalTolerance.toFixed(3)} ${unit}  →  [${rss.lower.toFixed(3)}, ${rss.upper.toFixed(3)}]${passMark}`,
  ]
}

function texLabel(name) {
  return `\\text{${String(name).replace(/_/g, '\\_')}}`
}

/** 生成 LaTeX 公式行（用于 KaTeX 渲染） */
export function buildFormulaLatex(closedRing, componentRings, method, unit = 'mm') {
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
  const active = method === 'worst' ? worst : rss
  const passMark =
    active.lower >= closedRing.min && active.upper <= closedRing.max ? '\\checkmark' : '\\times'

  const u = unit === 'inch' ? '\\text{inch}' : '\\text{mm}'

  return [
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
      latex: `T_{\\text{RSS}} = ${rss.totalTolerance.toFixed(3)}\\,${u},\\quad [${rss.lower.toFixed(3)},\\, ${rss.upper.toFixed(3)}]\\; ${passMark}`,
      block: true,
    },
  ]
}

function cdfNormal(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

/** 西格玛分析摘要（基于 RSS 公差） */
export function buildSigmaSummary(closedRing, rssResult) {
  const targetTolerance = closedRing.max - closedRing.min
  const sigma = rssResult.totalTolerance / 6
  const sigmaLevel = targetTolerance / (6 * sigma || 1)
  const passRate = 2 * cdfNormal(sigmaLevel) - 1
  const mean = (closedRing.max + closedRing.min) / 2
  const cpu = (closedRing.max - mean) / (3 * sigma || 1)
  const cpl = (mean - closedRing.min) / (3 * sigma || 1)
  const cpk = Math.min(cpu, cpl)

  return {
    c: (rssResult.totalTolerance / (6 * sigma || 1)).toFixed(2),
    cpk: cpk.toFixed(2),
    sigmaLevel: sigmaLevel.toFixed(2),
    passRate: `${(passRate * 100).toFixed(2)}%`,
    dppm: Math.round((1 - passRate) * 1_000_000),
  }
}
