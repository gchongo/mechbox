/** 圆柱螺旋压缩弹簧设计 (GB/T 1239 简化) */

export function calcSpringRate({ shearModulus = 79000, wireDiameter, meanDiameter, activeCoils }) {
  const d = wireDiameter
  const D = meanDiameter
  const na = activeCoils
  if (!d || !D || !na) return 0
  return (shearModulus * d ** 4) / (8 * D ** 3 * na)
}

export function calcWahlFactor(wireDiameter, meanDiameter) {
  const C = meanDiameter / wireDiameter
  return (4 * C - 1) / (4 * C - 4) + 0.615 / C
}

export function calcSpringShearStress(force, wireDiameter, meanDiameter) {
  const K = calcWahlFactor(wireDiameter, meanDiameter)
  return (8 * force * meanDiameter) / (Math.PI * wireDiameter ** 3) * K
}

export function analyzeSpring(input) {
  const k = calcSpringRate(input)
  const force = input.load ?? k * (input.deflection ?? 0)
  const deflection = input.deflection ?? (input.load != null ? input.load / k : 0)
  const tau = calcSpringShearStress(force, input.wireDiameter, input.meanDiameter)
  const allow = input.allowableShear ?? 600
  const solidHeight = input.wireDiameter * (input.totalCoils ?? input.activeCoils + 2)
  const freeLength = input.freeLength ?? solidHeight + deflection + 3 * input.wireDiameter

  return {
    springRate: k,
    force,
    deflection,
    shearStress: tau,
    wahlFactor: calcWahlFactor(input.wireDiameter, input.meanDiameter),
    solidHeight,
    freeLength,
    pass: tau <= allow,
    allowableShear: allow,
  }
}
