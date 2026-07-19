/**
 * 单自由度隔振：位移传递率
 * TR = √(1+(2ζr)²) / √((1−r²)²+(2ζr)²)，r = f/fn
 */

const DEG = Math.PI / 180

export function naturalFreqHz(stiffnessNPerM, massKg) {
  const k = Math.max(1e-6, Number(stiffnessNPerM) || 0)
  const m = Math.max(1e-6, Number(massKg) || 0)
  return (1 / (2 * Math.PI)) * Math.sqrt(k / m)
}

export function transmissibility(r, zeta) {
  const rr = Math.max(0, Number(r) || 0)
  const z = Math.max(0.001, Number(zeta) || 0.05)
  const num = Math.sqrt(1 + (2 * z * rr) ** 2)
  const den = Math.sqrt((1 - rr ** 2) ** 2 + (2 * z * rr) ** 2)
  if (den < 1e-12) return Infinity
  return num / den
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   mass?: number,
 *   stiffness?: number,
 *   dampingRatio?: number,
 *   excitationFreq?: number,
 *   maxTransmissibility?: number,
 *   isolationTargetDb?: number,
 * }} input
 * mass kg，stiffness N/m，excitationFreq Hz
 */
export function analyzeVibrationIsolation(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const mass = Math.max(0.01, Number(input.mass) || 50)
  const k = Math.max(1, Number(input.stiffness) || 20000)
  const zeta = Math.max(0.001, Math.min(0.5, Number(input.dampingRatio) || 0.05))
  const f = Math.max(0, Number(input.excitationFreq) || 20)
  const maxTR = Math.max(0.05, Number(input.maxTransmissibility) || 0.2)
  const targetDb = Number(input.isolationTargetDb) || 10

  const fn = naturalFreqHz(k, mass)
  const r = fn > 0 ? f / fn : 0
  const TR = f > 0 ? transmissibility(r, zeta) : 0
  // 隔振效率 η_iso = 1 − TR（力传递，0~1）
  const isolationEff = TR > 0 && TR < 1 ? 1 - TR : TR >= 1 ? 0 : 1
  const isolationDb = TR > 0 ? -20 * Math.log10(Math.max(TR, 1e-9)) : 0

  const result = {
    calcMode,
    mass,
    stiffness: k,
    dampingRatio: zeta,
    excitationFreq: f,
    naturalFreq: fn,
    frequencyRatio: r,
    transmissibility: TR,
    isolationEfficiency: isolationEff,
    isolationDb,
    estimateOnly: calcMode === 'simple',
    pass: false,
  }

  if (calcMode === 'simple') return result

  // 完整：通常要求 r>√2 且 TR ≤ 目标（边界用相对容差，避免浮点误入隔振区）
  result.maxTransmissibility = maxTR
  result.aboveIsolationRegion = r > Math.SQRT2 * (1 + 1e-12)
  result.trPass = TR > 0 && TR <= maxTR + 1e-9
  result.pass = result.aboveIsolationRegion && result.trPass

  if (calcMode === 'professional') {
    result.isolationTargetDb = targetDb
    result.dbPass = isolationDb >= targetDb - 1e-9
    // 推荐刚度使 r=2.5 @ 给定 f：fn = f/2.5，k = (2π fn)² m
    const fnTarget = f > 0 ? f / 2.5 : fn
    result.recommendedStiffness = mass * (2 * Math.PI * fnTarget) ** 2
    result.pass = result.aboveIsolationRegion && result.trPass && result.dbPass
  }

  return result
}

export { DEG }
