/** 圆柱螺旋压缩弹簧设计 (GB/T 1239 / 机械设计手册) */
import { calcLifeFromStress, SN_MATERIALS } from '@/utils/fatigue-calc'

/** G 默认 80000 MPa（手册弹簧钢丝）；[τ] 为许用切应力 MPa */
export const SPRING_MATERIALS = {
  '50CrVA': { label: '50CrVA', allowableShear: 529, shearModulus: 80000 },
  '60Si2CrA': { label: '60Si2CrA', allowableShear: 684, shearModulus: 80000 },
  '65Mn': { label: '65Mn', allowableShear: 540, shearModulus: 80000 },
  '60Si2CrVA': { label: '60Si2CrVA', allowableShear: 671, shearModulus: 80000 },
  music_wire: { label: '琴钢丝', allowableShear: 900, shearModulus: 80000 },
  oil_tempered: { label: '油淬火弹簧钢', allowableShear: 700, shearModulus: 80000 },
  stainless: { label: '不锈钢', allowableShear: 550, shearModulus: 80000 },
  custom: { label: '自定义', allowableShear: 600, shearModulus: 80000 },
}

export const DEFAULT_SPRING_SHEAR_MODULUS = 80000

export function resolveMeanDiameter({ meanDiameter, outerDiameter, wireDiameter }) {
  if (outerDiameter != null && wireDiameter) return outerDiameter - wireDiameter
  return meanDiameter
}

export function resolveOuterDiameter({ meanDiameter, outerDiameter, wireDiameter }) {
  if (outerDiameter != null) return outerDiameter
  if (meanDiameter != null && wireDiameter) return meanDiameter + wireDiameter
  return null
}

export function calcSpringRate({
  shearModulus = DEFAULT_SPRING_SHEAR_MODULUS,
  wireDiameter,
  meanDiameter,
  activeCoils,
}) {
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

/** 由高度求各工况载荷：F = P' × (H₀ − H) */
export function calcLoadsFromHeights({ springRate, freeLength, installHeight, workingHeight, solidHeight }) {
  const k = springRate
  const h0 = freeLength
  const loads = {}
  if (!(k > 0) || !(h0 > 0)) return loads
  if (installHeight != null) loads.install = k * (h0 - installHeight)
  if (workingHeight != null) loads.working = k * (h0 - workingHeight)
  if (solidHeight != null) loads.solid = k * (h0 - solidHeight)
  return loads
}

/** 展开长度（按总圈数） */
export function calcUnwindLength(meanDiameter, totalCoils) {
  if (!meanDiameter || !totalCoils) return 0
  return Math.PI * meanDiameter * totalCoils
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
  const d = input.wireDiameter
  const D2 = resolveMeanDiameter(input)
  const outerDiameter = resolveOuterDiameter({ ...input, meanDiameter: D2 })

  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const G = input.shearModulus ?? mat.shearModulus ?? DEFAULT_SPRING_SHEAR_MODULUS
  const allow = input.allowableShear ?? mat.allowableShear ?? 600

  const k = calcSpringRate({
    shearModulus: G,
    wireDiameter: d,
    meanDiameter: D2,
    activeCoils: input.activeCoils,
  })
  const C = calcSpringIndex(d, D2)
  const K = calcWahlFactor(d, D2)

  const endType = input.endType ?? 'fixed'
  const totalCoils = input.totalCoils ?? calcSolidCoils(input.activeCoils, endType)
  const solidHeight = calcSolidHeight({
    wireDiameter: d,
    totalCoils,
  })
  const freeLength = input.freeLength ?? solidHeight + 3 * d

  const heightLoads = calcLoadsFromHeights({
    springRate: k,
    freeLength,
    installHeight: input.installHeight,
    workingHeight: input.workingHeight,
    solidHeight,
  })
  const usesHeightLoads = heightLoads.working != null

  let force
  let deflection
  if (usesHeightLoads) {
    force = heightLoads.working
    deflection = input.workingHeight != null ? freeLength - input.workingHeight : force / k
  } else {
    force = input.load ?? k * (input.deflection ?? 0)
    deflection = input.deflection ?? (input.load != null && k > 0 ? input.load / k : 0)
  }

  const tau = calcSpringShearStress(force, d, D2)
  const tauInstall =
    heightLoads.install != null ? calcSpringShearStress(heightLoads.install, d, D2) : null
  const tauWorking = usesHeightLoads ? tau : null
  const tauSolid =
    heightLoads.solid != null ? calcSpringShearStress(heightLoads.solid, d, D2) : null

  const checkTau = usesHeightLoads ? tauWorking : tau
  const shearPass = checkTau <= allow

  const marginD = input.solidMargin ?? d
  const geometryPass = freeLength >= solidHeight
  const maxDeflection = geometryPass ? freeLength - solidHeight - marginD : 0
  const solidPass = geometryPass && deflection <= maxDeflection
  const remainingDeflectionMargin = maxDeflection - deflection

  const result = {
    calcMode,
    wireDiameter: d,
    meanDiameter: D2,
    outerDiameter,
    springRate: k,
    shearModulus: G,
    force,
    deflection,
    shearStress: tau,
    wahlFactor: K,
    springIndex: C,
    solidHeight,
    freeLength,
    totalCoils,
    unwindLength: calcUnwindLength(D2, totalCoils),
    shearPass,
    allowableShear: allow,
    materialLabel: mat.label,
    pass: shearPass,
    usesHeightLoads,
  }

  if (heightLoads.install != null) {
    result.installLoad = heightLoads.install
    result.tauInstall = tauInstall
  }
  if (heightLoads.working != null) {
    result.workingLoad = heightLoads.working
    result.tauWorking = tauWorking
  }
  if (heightLoads.solid != null) {
    result.solidLoad = heightLoads.solid
    result.tauSolid = tauSolid
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const indexPass = C >= 4 && C <= 16
    const buckling = calcBucklingCheck(freeLength, D2, endType)
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
    const fMin = input.loadMin ?? heightLoads.install ?? 0
    const fMax = input.loadMax ?? heightLoads.working ?? force
    const tauMin = calcSpringShearStress(fMin, d, D2)
    const tauMax = calcSpringShearStress(fMax, d, D2)
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
