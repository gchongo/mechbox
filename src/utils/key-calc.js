/** 平键连接强度 (GB/T 1096 简化) */

export function calcKeyShearStress(force, keyWidth, keyLength) {
  const area = keyWidth * keyLength
  if (!area) return 0
  return force / area
}

export function calcKeyCrushStress(force, keyWidth, hubLength) {
  const area = keyWidth * (hubLength / 2)
  if (!area) return 0
  return force / area
}

export function analyzeKeyConnection(input) {
  const force = input.tangentialForce ?? (input.torque * 2000) / (input.shaftDiameter || 1)
  const tau = calcKeyShearStress(force, input.keyWidth, input.keyLength)
  const sigmaC = calcKeyCrushStress(force, input.keyWidth, input.keyLength)
  const allowTau = input.allowShear ?? 100
  const allowCrush = input.allowCrush ?? 150
  return {
    tangentialForce: force,
    shearStress: tau,
    crushStress: sigmaC,
    pass: tau <= allowTau && sigmaC <= allowCrush,
    allowShear: allowTau,
    allowCrush: allowCrush,
  }
}
