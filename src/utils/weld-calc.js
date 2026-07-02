/** 角焊缝强度 (GB/T 985 简化) */

export function calcFilletThroat(weldLeg) {
  return 0.7 * weldLeg
}

export function calcWeldShearStress(force, throat, weldLength) {
  const area = throat * weldLength
  if (!area) return 0
  return force / area
}

export function analyzeFilletWeld(input) {
  const throat = calcFilletThroat(input.legSize)
  const tau = calcWeldShearStress(input.force, throat, input.weldLength)
  const allow = input.allowShear ?? 160
  return {
    throat,
    shearStress: tau,
    pass: tau <= allow,
    allowableShear: allow,
  }
}
