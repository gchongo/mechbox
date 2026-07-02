/** 轴弯扭合成强度 (第三强度理论简化) */

export function calcBendingStress(moment, diameter) {
  const W = (Math.PI * diameter ** 3) / 32
  if (!W) return 0
  return (moment * 1000) / W
}

export function calcCombinedEquivalentStress(bending, torsion) {
  return Math.sqrt(bending ** 2 + 3 * torsion ** 2)
}

export function analyzeShaftCombined(input) {
  const torsion = (input.torque * 1000 * (input.diameter / 2)) / ((Math.PI * input.diameter ** 4) / 32)
  const bending = calcBendingStress(input.bendingMoment ?? 0, input.diameter)
  const equiv = calcCombinedEquivalentStress(bending, torsion)
  const allow = input.allowableStress ?? 60
  return {
    torsionStress: torsion,
    bendingStress: bending,
    equivalentStress: equiv,
    pass: equiv <= allow,
    allowableStress: allow,
  }
}
