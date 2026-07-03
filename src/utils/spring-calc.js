/** 圆柱螺旋压缩弹簧设计 (GB/T 1239 简化) */
import { calcLifeFromStress } from '@/utils/fatigue-calc'

export const SPRING_MATERIALS = {
  music_wire: { label: '琴钢丝', allowableShear: 900 },
  oil_tempered: { label: '油淬火弹簧钢', allowableShear: 700 },
  stainless: { label: '不锈钢', allowableShear: 550 },
  custom: { label: '自定义', allowableShear: 600 },
}

export function calcSpringRate({ shearModulus = 79000, wireDiameter, meanDiameter, activeCoils }) {
  const d = wireDiameter
  const D = meanDiameter
  const na = activeCoils
  if (!d || !D || !na) return 0
  return (shearModulus * d ** 4) / (8 * D ** 3 * na)
}

export function calcWahlFactor(wireDiameter, meanDiameter) {
  const C = meanDiameter / wireDiameter
  if (C <= 1) return Infinity
  return (4 * C - 1) / (4 * C - 4) + 0.615 / C
}

export function calcSpringShearStress(force, wireDiameter, meanDiameter) {
  const K = calcWahlFactor(wireDiameter, meanDiameter)
  return (8 * force * meanDiameter) / (Math.PI * wireDiameter ** 3) * K
}

export function calcSpringIndex(wireDiameter, meanDiameter) {
  return meanDiameter / wireDiameter
}

/** 压缩弹簧稳定性 (简化 slenderness) */
export function calcBucklingCheck(freeLength, meanDiameter, endType = 'fixed') {
  const slenderness = freeLength / meanDiameter
  const limit = endType === 'fixed' ? 4 : 5.5
  return {
    slenderness,
    criticalSlenderness: limit,
    bucklingPass: slenderness <= limit,
  }
}

export function analyzeSpring(input) {
  const calcMode = input.calcMode ?? 'simple'
  const k = calcSpringRate(input)
  const force = input.load ?? k * (input.deflection ?? 0)
  const deflection = input.deflection ?? (input.load != null ? input.load / k : 0)
  const tau = calcSpringShearStress(force, input.wireDiameter, input.meanDiameter)
  const C = calcSpringIndex(input.wireDiameter, input.meanDiameter)
  const K = calcWahlFactor(input.wireDiameter, input.meanDiameter)

  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const allow = input.allowableShear ?? mat.allowableShear ?? 600

  const totalCoils = input.totalCoils ?? input.activeCoils + 2
  const solidHeight = input.wireDiameter * totalCoils
  const freeLength = input.freeLength ?? solidHeight + deflection + 3 * input.wireDiameter
  const maxDeflection = freeLength - solidHeight - (input.solidMargin ?? input.wireDiameter)
  const solidPass = deflection <= maxDeflection

  const result = {
    calcMode,
    springRate: k,
    force,
    deflection,
    shearStress: tau,
    wahlFactor: K,
    springIndex: C,
    solidHeight,
    freeLength,
    pass: tau <= allow,
    allowableShear: allow,
    materialLabel: mat.label,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const indexPass = C >= 4 && C <= 16
    const buckling = calcBucklingCheck(freeLength, input.meanDiameter, input.endType ?? 'fixed')
    result.indexPass = indexPass
    result.indexWarning = C < 4 ? '旋绕比过小' : C > 16 ? '旋绕比过大' : null
    result.buckling = buckling
    result.solidMargin = maxDeflection
    result.solidPass = solidPass
    result.pass = tau <= allow && indexPass && buckling.bucklingPass && solidPass
  }

  if (calcMode === 'professional') {
    const fMin = input.loadMin ?? 0
    const fMax = input.loadMax ?? force
    const tauMin = calcSpringShearStress(fMin, input.wireDiameter, input.meanDiameter)
    const tauMax = calcSpringShearStress(fMax, input.wireDiameter, input.meanDiameter)
    const tauAmp = (tauMax - tauMin) / 2
    const tauMean = (tauMax + tauMin) / 2
    const life = calcLifeFromStress('spring_steel', tauAmp)
    result.loadMin = fMin
    result.loadMax = fMax
    result.shearAmplitude = tauAmp
    result.shearMean = tauMean
    result.fatigueLife = life
    result.fatiguePass = life >= (input.targetCycles ?? 1e6)
    result.pass = result.pass && result.fatiguePass
  }

  return result
}
