/** 组成环 ES/EI 与公差带互转、RSS 贡献度 */
export function ensureRingEsEi(ring) {
  if (ring.es == null && ring.ei == null && ring.tolerance != null) {
    ring.es = ring.tolerance / 2
    ring.ei = -ring.tolerance / 2
  }
  if (ring.tolerance == null && ring.es != null && ring.ei != null) {
    ring.tolerance = Math.max(ring.es - ring.ei, 0)
  }
  return ring
}

export function syncToleranceFromEsEi(ring) {
  const es = Number(ring.es) || 0
  const ei = Number(ring.ei) || 0
  ring.tolerance = Math.max(es - ei, 0)
  return ring.tolerance
}

export function getRingEs(ring) {
  return ring.es != null ? ring.es : (ring.tolerance ?? 0) / 2
}

export function getRingEi(ring) {
  return ring.ei != null ? ring.ei : -(ring.tolerance ?? 0) / 2
}

/** 封闭环名义尺寸：Σ增 − Σ减 */
export function calcNominalClosed(rings) {
  return rings.reduce((sum, ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    return sum + sign * (ring.size ?? 0) * (ring.factor ?? 1)
  }, 0)
}

/** RSS 方差贡献度 (%) */
export function calcRingContributions(rings) {
  const squares = rings.map((r) => {
    const t = (r.tolerance ?? 0) * (r.factor ?? 1)
    return t * t
  })
  const total = squares.reduce((a, b) => a + b, 0) || 1
  return rings.map((ring, i) => ({
    uid: ring.uid,
    name: ring.name,
    percent: (squares[i] / total) * 100,
  }))
}

/** 封闭环 min/max → 目标尺寸 + ES/EI 表述 */
export function closedRingAsDesign(closedRing) {
  const min = closedRing.min ?? 0
  const max = closedRing.max ?? 0
  const target = (min + max) / 2
  return {
    target,
    es: max - target,
    ei: min - target,
    tolerance: max - min,
  }
}

/** 极值法 / RSS 结果 → 上偏差 ES、下偏差 EI（相对名义值） */
export function limitsToDeviations(nominal, upper, lower) {
  return {
    nominal,
    es: upper - nominal,
    ei: lower - nominal,
    upper,
    lower,
    tolerance: upper - lower,
  }
}

export const CPK_REFERENCE = [
  { cpk: 0.5, sigma: 1.5, yield: 93.3, ppm: 67000 },
  { cpk: 0.67, sigma: 2.0, yield: 95.4, ppm: 46000 },
  { cpk: 1.0, sigma: 3.0, yield: 99.73, ppm: 2700 },
  { cpk: 1.33, sigma: 4.0, yield: 99.994, ppm: 63 },
  { cpk: 1.67, sigma: 5.0, yield: 99.9999, ppm: 0.57 },
  { cpk: 2.0, sigma: 6.0, yield: 99.9999998, ppm: 0.002 },
]
