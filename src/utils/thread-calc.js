/** 螺纹强度计算 (ISO 898 / GB/T 3098 简化) */

/** 常用公制螺纹标准螺距 (mm) */
export const METRIC_THREAD_PITCH = {
  3: 0.5,
  4: 0.7,
  5: 0.8,
  6: 1.0,
  8: 1.25,
  10: 1.5,
  12: 1.75,
  14: 2.0,
  16: 2.0,
  18: 2.5,
  20: 2.5,
  22: 2.5,
  24: 3.0,
  27: 3.0,
  30: 3.5,
}

/** 性能等级许用拉应力 (MPa, 含安全系数约 1.5~2) */
export const THREAD_GRADES = {
  '4.6': { label: '4.6 级', yieldMin: 240, tensileMin: 400, allowStress: 160 },
  '4.8': { label: '4.8 级', yieldMin: 320, tensileMin: 420, allowStress: 200 },
  '5.6': { label: '5.6 级', yieldMin: 300, tensileMin: 500, allowStress: 190 },
  '8.8': { label: '8.8 级', yieldMin: 640, tensileMin: 800, allowStress: 400 },
  '10.9': { label: '10.9 级', yieldMin: 900, tensileMin: 1000, allowStress: 560 },
  '12.9': { label: '12.9 级', yieldMin: 1080, tensileMin: 1200, allowStress: 630 },
}

/** 有效截面积 As (mm²) — d 公称直径, P 螺距 */
export function calcTensileStressArea(diameter, pitch) {
  const d = diameter
  const P = pitch
  const d2 = d - 0.9382 * P
  return (Math.PI / 4) * d2 ** 2
}

/** 螺纹中径 d2 */
export function calcPitchDiameter(diameter, pitch) {
  return diameter - 0.6495 * pitch
}

/** 拉应力 σ = F / As (MPa) */
export function calcThreadTensileStress(axialForce, stressArea) {
  if (!stressArea) return 0
  return axialForce / stressArea
}

/** 螺纹剪切应力 (简化, 内螺纹弱) τ ≈ F / (0.5 π d1 L) */
export function calcThreadShearStress(axialForce, diameter, pitch, engagedLength) {
  const d1 = diameter - 1.0825 * pitch
  const area = 0.5 * Math.PI * d1 * engagedLength
  if (!area) return 0
  return axialForce / area
}

/** 拧紧扭矩 T = K D F (N·m), D in mm, F in N */
export function calcTighteningTorque(axialForce, diameter, frictionCoeff = 0.2) {
  return (frictionCoeff * diameter * axialForce) / 1000
}

/** 所需预紧力 (由扭矩反算) */
export function calcPreloadFromTorque(torque, diameter, frictionCoeff = 0.2) {
  if (!frictionCoeff || !diameter) return 0
  return (torque * 1000) / (frictionCoeff * diameter)
}

export function analyzeThreadStrength(input) {
  const d = input.diameter
  const P = input.pitch ?? METRIC_THREAD_PITCH[Math.round(d)] ?? 1.5
  const grade = THREAD_GRADES[input.grade ?? '8.8'] ?? THREAD_GRADES['8.8']
  const As = calcTensileStressArea(d, P)
  const force = input.axialForce ?? 0
  const sigma = calcThreadTensileStress(force, As)
  const engaged = input.engagedLength ?? d * 1.5
  const tau = calcThreadShearStress(force, d, P, engaged)
  const torque = input.torque ?? calcTighteningTorque(force, d, input.frictionCoeff ?? 0.2)
  const maxForce = grade.allowStress * As

  return {
    pitch: P,
    stressArea: As,
    pitchDiameter: calcPitchDiameter(d, P),
    tensileStress: sigma,
    shearStress: tau,
    tighteningTorque: torque,
    maxAllowableForce: maxForce,
    grade: grade.label,
    allowTensileStress: grade.allowStress,
    allowShearStress: grade.allowStress * 0.6,
    pass: sigma <= grade.allowStress && tau <= grade.allowStress * 0.6,
    tensilePass: sigma <= grade.allowStress,
    shearPass: tau <= grade.allowStress * 0.6,
  }
}

export function suggestPitch(diameter) {
  return METRIC_THREAD_PITCH[Math.round(diameter)] ?? null
}
