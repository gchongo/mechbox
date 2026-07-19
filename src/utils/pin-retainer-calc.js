/**
 * 销连接与弹性挡圈（卡簧）简化校核
 */

/** 圆柱/圆锥销剪切 + 挤压 */
export function analyzePinConnection(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const F = input.force ?? 0
  const d = input.diameter ?? 10
  const planes = input.shearPlanes === 2 ? 2 : 1
  const t = input.plateThickness ?? d
  const allowShear = input.allowShear ?? 80
  const allowCrush = input.allowCrush ?? 120
  const minSafety = input.minSafety ?? 1.5

  const As = planes * (Math.PI / 4) * d ** 2
  const tau = As > 0 ? F / As : 0
  const Ab = d * t
  const sigmaB = Ab > 0 ? F / Ab : 0

  const shearSF = tau > 0 ? allowShear / tau : Infinity
  const crushSF = sigmaB > 0 ? allowCrush / sigmaB : Infinity
  const shearPass = tau <= 0 || shearSF >= minSafety
  const crushPass = sigmaB <= 0 || crushSF >= minSafety

  const result = {
    calcMode,
    kind: 'pin',
    force: F,
    diameter: d,
    shearPlanes: planes,
    plateThickness: t,
    shearArea: As,
    shearStress: tau,
    bearingArea: Ab,
    bearingStress: sigmaB,
    allowShear,
    allowCrush,
    minSafety,
    shearSF,
    crushSF,
    shearPass,
    crushPass,
    pass: shearPass && crushPass,
    estimateOnly: calcMode === 'simple',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.recommendedDiameter =
      planes > 0 && allowShear > 0
        ? Math.sqrt((4 * F * minSafety) / (planes * Math.PI * allowShear))
        : null
  }

  if (calcMode === 'professional') {
    const Kt = input.stressConcentration ?? 1.5
    result.stressConcentration = Kt
    result.fatigueShear = tau * Kt
    result.fatiguePass = result.fatigueShear <= allowShear / minSafety
    result.pass = result.pass && result.fatiguePass
  }

  return result
}

/**
 * 轴用弹性挡圈轴向力简化（环剪切 + 沟槽承压）
 * F_shear ≈ π · d · s · τ_allow
 * σ_groove ≈ F / (π · d · h)
 */
export function analyzeRetainingRing(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const F = input.axialForce ?? 0
  const d = input.shaftDiameter ?? 20
  const s = input.ringThickness ?? 1.2
  const h = input.grooveDepth ?? 0.6
  const allowShear = input.allowShear ?? 200
  const allowCrush = input.allowCrush ?? 300
  const minSafety = input.minSafety ?? 2

  const As = Math.PI * d * s
  const tau = As > 0 ? F / As : 0
  const Ag = Math.PI * d * h
  const sigmaG = Ag > 0 ? F / Ag : 0

  const shearSF = tau > 0 ? allowShear / tau : Infinity
  const grooveSF = sigmaG > 0 ? allowCrush / sigmaG : Infinity
  const shearPass = tau <= 0 || shearSF >= minSafety
  const groovePass = sigmaG <= 0 || grooveSF >= minSafety

  const result = {
    calcMode,
    kind: 'ring',
    axialForce: F,
    shaftDiameter: d,
    ringThickness: s,
    grooveDepth: h,
    shearArea: As,
    shearStress: tau,
    grooveArea: Ag,
    grooveStress: sigmaG,
    allowShear,
    allowCrush,
    minSafety,
    shearSF,
    grooveSF,
    shearPass,
    groovePass,
    pass: shearPass && groovePass,
    estimateOnly: calcMode === 'simple',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.allowableAxial =
      Math.min(allowShear * As, allowCrush * Ag) / minSafety
  }

  if (calcMode === 'professional') {
    const rpm = input.rpm ?? 0
    result.rpm = rpm
    // 粗估离心卸载：高速时有效许用下降（经验 1 − (n/10000)²）
    if (rpm > 0) {
      const factor = Math.max(0.4, 1 - (rpm / 10000) ** 2)
      result.speedFactor = factor
      result.allowableAxialSpeed = (result.allowableAxial ?? 0) * factor
      result.speedPass = F <= result.allowableAxialSpeed
      result.pass = result.pass && result.speedPass
    }
  }

  return result
}
