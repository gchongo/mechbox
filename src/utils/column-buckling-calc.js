/**
 * 压杆（柱）屈曲 — Euler + 中长柱 Rankine 修正
 *
 * P_e = π² E I / (μ L)²
 * λ = μ L / i，i = √(I/A)
 */

export const COLUMN_END_CONDITIONS = {
  pinned_pinned: { id: 'pinned_pinned', label: '两端铰支', mu: 1 },
  fixed_fixed: { id: 'fixed_fixed', label: '两端固支', mu: 0.5 },
  fixed_free: { id: 'fixed_free', label: '一端固支一端自由', mu: 2 },
  fixed_pinned: { id: 'fixed_pinned', label: '一端固支一端铰支', mu: 0.7 },
}

export const COLUMN_SECTIONS = {
  circular: { id: 'circular', label: '实心圆' },
  rectangular: { id: 'rectangular', label: '矩形' },
  tube: { id: 'tube', label: '圆管' },
}

function sectionProps(input) {
  const kind = input.section ?? 'circular'
  if (kind === 'rectangular') {
    const b = input.width ?? 20
    const h = input.height ?? 40
    // 弱轴：绕短边
    const I = (b * h ** 3) / 12
    const A = b * h
    return { kind, b, h, I, A, i: Math.sqrt(I / A) }
  }
  if (kind === 'tube') {
    const D = input.outerDiameter ?? 40
    const t = input.wallThickness ?? 3
    const d = Math.max(0, D - 2 * t)
    const I = (Math.PI / 64) * (D ** 4 - d ** 4)
    const A = (Math.PI / 4) * (D ** 2 - d ** 2)
    return { kind, D, d, t, I, A, i: A > 0 ? Math.sqrt(I / A) : 0 }
  }
  const d = input.diameter ?? 20
  const I = (Math.PI / 64) * d ** 4
  const A = (Math.PI / 4) * d ** 2
  return { kind: 'circular', d, I, A, i: d / 4 }
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   endCondition?: string,
 *   section?: string,
 *   length?: number,
 *   diameter?: number,
 *   width?: number,
 *   height?: number,
 *   outerDiameter?: number,
 *   wallThickness?: number,
 *   appliedForce?: number,
 *   elasticModulus?: number,
 *   yieldStrength?: number,
 *   minSafety?: number,
 *   eccentricity?: number,
 * }} input
 */
export function calcColumnBuckling(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const E = input.elasticModulus ?? 210000
  const fy = input.yieldStrength ?? 235
  const L = input.length ?? 800
  const endKey = input.endCondition ?? 'pinned_pinned'
  const end = COLUMN_END_CONDITIONS[endKey] ?? COLUMN_END_CONDITIONS.pinned_pinned
  const mu = end.mu
  const minSafety = input.minSafety ?? 2
  const P = input.appliedForce ?? 0

  const sec = sectionProps(input)
  const Le = mu * L
  const lambda = sec.i > 0 ? Le / sec.i : Infinity
  const Pe = sec.I > 0 ? (Math.PI ** 2 * E * sec.I) / Le ** 2 : 0
  const sigmaE = sec.A > 0 ? Pe / sec.A : 0

  // 中长柱界限：λ_c ≈ π √(2E/fy)
  const lambdaC = Math.PI * Math.sqrt((2 * E) / fy)

  let Pcr = Pe
  let sigmaCr = sigmaE
  let regime = 'euler'

  if (calcMode !== 'simple' && lambda < lambdaC && fy > 0) {
    // Rankine–Gordon：1/σ_r = 1/fy + 1/σ_E
    const sigmaR = sigmaE > 0 ? (fy * sigmaE) / (fy + sigmaE) : 0
    sigmaCr = Math.min(fy, sigmaR)
    Pcr = sigmaCr * sec.A
    regime = 'rankine'
  }

  const safetyFactor = P > 0 && Pcr > 0 ? Pcr / P : Infinity
  const appliedStress = sec.A > 0 ? P / sec.A : 0

  const result = {
    calcMode,
    endConditionKey: end.id,
    endCondition: end.label,
    endFactor: mu,
    section: sec.kind,
    length: L,
    effectiveLength: Le,
    area: sec.A,
    momentOfInertia: sec.I,
    radiusOfGyration: sec.i,
    slenderness: lambda,
    slendernessLimit: lambdaC,
    elasticModulus: E,
    yieldStrength: fy,
    eulerLoad: Pe,
    eulerStress: sigmaE,
    criticalLoad: Pcr,
    criticalStress: sigmaCr,
    regime,
    appliedForce: P,
    appliedStress,
    minSafety,
    safetyFactor,
    pass: P <= 0 || (Number.isFinite(safetyFactor) && safetyFactor >= minSafety),
    estimateOnly: calcMode === 'simple',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.utilization = Pcr > 0 ? P / Pcr : 0
  }

  if (calcMode === 'professional') {
    const e = input.eccentricity ?? 0
    result.eccentricity = e
    if (e > 0 && P > 0 && Pe > P) {
      // 放大系数近似：σ_max ≈ P/A · (1 + (e c / i²) / (1 − P/Pe))
      const c = sec.kind === 'rectangular'
        ? (input.height ?? 40) / 2
        : (sec.d ?? sec.D ?? 20) / 2
      const amp = 1 / (1 - P / Pe)
      const sigmaMax = (P / sec.A) * (1 + ((e * c) / sec.i ** 2) * amp)
      result.maxBendingStress = sigmaMax
      result.eccentricPass = sigmaMax <= fy / minSafety
      result.pass = result.pass && result.eccentricPass
    }
  }

  return result
}
