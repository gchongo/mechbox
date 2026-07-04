/** 圆柱螺旋压缩弹簧设计 (GB/T 1239 简化) */
import { calcLifeFromStress, SN_MATERIALS } from '@/utils/fatigue-calc'

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

/** 弹簧切应力幅值 + 平均应力 → Goodman/Soderberg 等效幅值 */
export function calcSpringEffectiveAmplitude(tauAmp, tauMean, method = 'goodman') {
  if (!tauAmp || tauAmp <= 0) return 0
  const m = SN_MATERIALS.spring_steel
  const denom = method === 'soderberg' ? m.yieldMin : m.uts
  if (tauMean <= 0) return tauAmp
  if (tauMean >= denom) return Infinity
  return tauAmp / (1 - tauMean / denom)
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

/** 并圈高度对应的总圈数（GB/T 1239 简化：磨平端 +2，一端自由 +1） */
export function calcSolidCoils(activeCoils, endType = 'fixed') {
  const endCoils = endType === 'free' ? 1 : 2
  return activeCoils + endCoils
}

export function calcSolidHeight({ wireDiameter, activeCoils, totalCoils, endType }) {
  const d = wireDiameter
  if (!d) return 0
  const total = totalCoils ?? calcSolidCoils(activeCoils, endType)
  return d * total
}

export function analyzeSpring(input) {
  const calcMode = input.calcMode ?? 'simple'
  const k = calcSpringRate(input)
  const force = input.load ?? k * (input.deflection ?? 0)
  const deflection = input.deflection ?? (input.load != null && k > 0 ? input.load / k : 0)
  const tau = calcSpringShearStress(force, input.wireDiameter, input.meanDiameter)
  const C = calcSpringIndex(input.wireDiameter, input.meanDiameter)
  const K = calcWahlFactor(input.wireDiameter, input.meanDiameter)

  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const allow = input.allowableShear ?? mat.allowableShear ?? 600
  const shearPass = tau <= allow

  const endType = input.endType ?? 'fixed'
  const totalCoils = input.totalCoils ?? calcSolidCoils(input.activeCoils, endType)
  const solidHeight = calcSolidHeight({
    wireDiameter: input.wireDiameter,
    totalCoils,
  })
  const freeLength = input.freeLength ?? solidHeight + deflection + 3 * input.wireDiameter
  const marginD = input.solidMargin ?? input.wireDiameter
  const geometryPass = freeLength >= solidHeight
  const maxDeflection = geometryPass ? freeLength - solidHeight - marginD : 0
  const solidPass = geometryPass && deflection <= maxDeflection
  const remainingDeflectionMargin = maxDeflection - deflection

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
    totalCoils,
    shearPass,
    allowableShear: allow,
    materialLabel: mat.label,
    pass: shearPass,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const indexPass = C >= 4 && C <= 16
    const buckling = calcBucklingCheck(freeLength, input.meanDiameter, endType)
    result.indexPass = indexPass
    result.indexWarning = C < 4 ? '旋绕比过小' : C > 16 ? '旋绕比过大' : null
    result.buckling = buckling
    result.geometryPass = geometryPass
    result.maxDeflection = maxDeflection
    result.remainingDeflectionMargin = remainingDeflectionMargin
    result.solidPass = solidPass
    result.pass = shearPass && indexPass && buckling.bucklingPass && solidPass
  }

  if (calcMode === 'professional') {
    const fMin = input.loadMin ?? 0
    const fMax = input.loadMax ?? force
    const tauMin = calcSpringShearStress(fMin, input.wireDiameter, input.meanDiameter)
    const tauMax = calcSpringShearStress(fMax, input.wireDiameter, input.meanDiameter)
    const tauAmp = (tauMax - tauMin) / 2
    const tauMean = (tauMax + tauMin) / 2
    const meanMethod = input.meanStressMethod ?? 'goodman'
    const tauEff = calcSpringEffectiveAmplitude(tauAmp, tauMean, meanMethod)
    const life = calcLifeFromStress('spring_steel', tauEff)
    result.loadMin = fMin
    result.loadMax = fMax
    result.shearAmplitude = tauAmp
    result.shearMean = tauMean
    result.effectiveShearAmplitude = tauEff
    result.meanStressMethod = meanMethod
    result.fatigueLife = life
    result.fatiguePass = life >= (input.targetCycles ?? 1e6)
    result.pass = result.pass && result.fatiguePass
  }

  return result
}
