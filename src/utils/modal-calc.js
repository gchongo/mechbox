/**
 * 振动与模态 — 固有频率前置估算
 */

/** 单自由度 k-m 系统 fn = (1/2π)√(k/m) */
export function calcSDOFFrequency(stiffness, mass) {
  if (!mass || !stiffness) return { error: '刚度与质量须大于 0' }
  const omega = Math.sqrt(stiffness / mass)
  const fn = omega / (2 * Math.PI)
  return { omega, fn, period: 1 / fn }
}

/** 简支梁一阶弯曲固有频率 fn = (π/2L²)√(EI/ρA) */
export function calcSimplySupportedBeamFreq(input) {
  const E = input.elasticModulus ?? 210e9
  const rho = (input.density ?? 7850) * 1e-9 // kg/mm³
  const L = input.spanLength ?? 500
  const I = input.inertia ?? (Math.PI * (input.diameter ?? 30) ** 4) / 64
  const A = input.area ?? (Math.PI * (input.diameter ?? 30) ** 2) / 4

  const fn = (Math.PI / (2 * L ** 2)) * Math.sqrt((E * I) / (rho * A)) * 1000 // mm单位修正
  // E in MPa = N/mm², I mm⁴, ρ kg/mm³, L mm → fn Hz
  const fnCorrect = (Math.PI / (2 * L ** 2)) * Math.sqrt((E * I) / (rho * A))

  return {
    fn: fnCorrect,
    spanLength: L,
    inertia: I,
    mode: '一阶弯曲（简支）',
  }
}

/** 悬臂梁一阶 fn = (1.875²/2πL²)√(EI/ρA) */
export function calcCantileverBeamFreq(input) {
  const E = input.elasticModulus ?? 210000
  const rho = (input.density ?? 7850) * 1e-9
  const L = input.spanLength ?? 300
  const d = input.diameter ?? 25
  const I = (Math.PI * d ** 4) / 64
  const A = (Math.PI * d ** 2) / 4

  const lambda1 = 1.875
  const fn = (lambda1 ** 2 / (2 * Math.PI * L ** 2)) * Math.sqrt((E * I) / (rho * A))

  return { fn, spanLength: L, mode: '一阶弯曲（悬臂）' }
}

/** 共振裕度：|f_excitation - fn| / fn */
export function calcResonanceMargin(fn, excitationFreq) {
  if (!fn || !excitationFreq) return { error: '频率须大于 0' }
  const delta = Math.abs(excitationFreq - fn)
  const margin = delta / fn
  const ratio = excitationFreq / fn

  let assessment = '安全'
  if (margin < 0.1) assessment = '危险 — 接近共振'
  else if (margin < 0.2) assessment = '警告 — 裕度不足'

  return {
    naturalFreq: fn,
    excitationFreq,
    margin,
    marginPercent: margin * 100,
    frequencyRatio: ratio,
    assessment,
    pass: margin >= 0.2,
  }
}

export const MODAL_CASES = {
  sdof: { id: 'sdof', label: '单自由度弹簧-质量' },
  beam_ss: { id: 'beam_ss', label: '简支梁一阶' },
  beam_cant: { id: 'beam_cant', label: '悬臂梁一阶' },
}

export function analyzeModal(input) {
  const calcMode = input.calcMode ?? 'simple'
  const caseId = input.caseId ?? 'sdof'
  let modal = null

  if (caseId === 'sdof') {
    modal = calcSDOFFrequency(input.stiffness ?? 10000, input.mass ?? 10)
  } else if (caseId === 'beam_ss') {
    modal = calcSimplySupportedBeamFreq(input)
  } else if (caseId === 'beam_cant') {
    modal = calcCantileverBeamFreq(input)
  }

  let resonance = null
  const excFreq = input.excitationFreq ?? (calcMode !== 'simple' ? 0 : null)
  if (excFreq && modal?.fn) {
    resonance = calcResonanceMargin(modal.fn, excFreq)
  }

  const result = { calcMode, caseId, modal, resonance }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.criticalSpeed = modal?.fn ? modal.fn * 60 : null
    if (input.rpm && modal?.fn) {
      const rpmHz = input.rpm / 60
      result.operatingResonance = calcResonanceMargin(modal.fn, rpmHz)
    }
  }

  if (calcMode === 'professional') {
    const zeta = input.dampingRatio ?? 0.02
    const r = resonance?.frequencyRatio ?? 1
    result.dampingRatio = zeta
    result.amplificationFactor = 1 / Math.sqrt((1 - r ** 2) ** 2 + (2 * zeta * r) ** 2)
    result.pass = resonance ? resonance.pass : true
  }

  return result
}
