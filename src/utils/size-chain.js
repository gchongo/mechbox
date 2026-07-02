/** 分布类型 K 值（标准差系数） */
export const DISTRIBUTIONS = {
  normal: { k: 6.0, cv: 1.0, coverage: 0.9973, name: '正态分布' },
  uniform: { k: 3.46, cv: 0.577, coverage: 1.0, name: '均匀分布' },
  triangular: { k: 4.24, cv: 0.707, coverage: 0.95, name: '三角分布' },
  skewed: { k: 5.0, cv: 0.8, coverage: 0.98, name: '偏态分布' },
}

/** 公差 → 标准差 */
export function toleranceToSigma(tolerance, distribution = 'normal') {
  return tolerance / DISTRIBUTIONS[distribution].k
}

/** 标准差 → 公差 */
export function sigmaToTolerance(sigma, distribution = 'normal') {
  return sigma * DISTRIBUTIONS[distribution].k
}

/** 极值法（最坏情况） */
export function worstCaseMethod(rings) {
  return rings.reduce((sum, ring) => sum + ring.tolerance, 0)
}

/** RSS 法 */
export function rssMethod(rings) {
  const sumSquares = rings.reduce((sum, ring) => sum + ring.tolerance ** 2, 0)
  return Math.sqrt(sumSquares)
}

/** 近似正态 CDF（Abramowitz & Stegun） */
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

/** 西格玛水平 */
export function calculateSigmaLevel(tolerance, sigma) {
  if (!sigma) return 0
  return tolerance / (6 * sigma)
}

/** Cpk */
export function calculateCpk(upperSpec, lowerSpec, mean, sigma) {
  if (!sigma) return 0
  const cpu = (upperSpec - mean) / (3 * sigma)
  const cpl = (mean - lowerSpec) / (3 * sigma)
  return Math.min(cpu, cpl)
}

/** 合格率 */
export function calculatePassRate(sigmaLevel) {
  return 2 * cdfNormal(sigmaLevel) - 1
}

/** DPPM */
export function calculateDPPM(passRate) {
  return (1 - passRate) * 1_000_000
}

/** 计算尺寸链结果 */
export function calculateSizeChain(closedRing, componentRings, method = 'rss') {
  const nominal =
    closedRing.nominal ??
    componentRings.reduce((sum, ring) => {
      const sign = ring.type === 'increasing' ? 1 : -1
      return sum + sign * ring.size * (ring.factor ?? 1)
    }, 0)

  const tolerances = componentRings.map((r) => ({
    tolerance: r.tolerance * (r.factor ?? 1),
  }))

  const totalTolerance =
    method === 'worst' ? worstCaseMethod(tolerances) : rssMethod(tolerances)

  const upper = nominal + totalTolerance / 2
  const lower = nominal - totalTolerance / 2

  const pass =
    upper <= closedRing.max && lower >= closedRing.min

  return {
    nominal,
    totalTolerance,
    upper,
    lower,
    pass,
  }
}
