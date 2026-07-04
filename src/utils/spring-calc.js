/** 圆柱螺旋压缩弹簧设计 (GB/T 1239 / GB/T 23935-2009 / 机械设计手册) */
import { calcMeanStressEffectiveAmplitude } from '@/utils/fatigue-calc'

/** G 默认 80000 MPa；[τ] 为许用切应力 MPa；Rm 为抗拉强度 MPa（疲劳校核用） */
export const SPRING_MATERIALS = {
  '50CrVA': { label: '50CrVA', allowableShear: 529, shearModulus: 80000, tensileStrength: 1810 },
  '60Si2CrA': { label: '60Si2CrA', allowableShear: 684, shearModulus: 80000, tensileStrength: 1960 },
  '65Mn': { label: '65Mn', allowableShear: 540, shearModulus: 80000, tensileStrength: 1570 },
  '60Si2CrVA': { label: '60Si2CrVA', allowableShear: 671, shearModulus: 80000, tensileStrength: 1860 },
  music_wire: { label: '琴钢丝', allowableShear: 900, shearModulus: 80000, tensileStrength: 2000 },
  oil_tempered: { label: '油淬火弹簧钢', allowableShear: 700, shearModulus: 80000, tensileStrength: 1750 },
  stainless: { label: '不锈钢', allowableShear: 550, shearModulus: 80000, tensileStrength: 1600 },
  custom: { label: '自定义', allowableShear: 600, shearModulus: 80000, tensileStrength: 1600 },
}

export const DEFAULT_SPRING_SHEAR_MODULUS = 80000
export const DEFAULT_FATIGUE_SAFETY = 1.1

/** GB/T 23935 表9 — 脉动疲劳极限 τu0 与 Rm 之比 */
const TAU_U0_RM_LEVELS = [
  { cycles: 1e4, factor: 0.45 },
  { cycles: 1e5, factor: 0.4 },
  { cycles: 1e6, factor: 0.35 },
  { cycles: 1e7, factor: 0.3 },
]

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

/** 曲度系数 K（公式 7，Wahl） */
export function calcWahlFactor(wireDiameter, meanDiameter) {
  const C = meanDiameter / wireDiameter
  if (C <= 1) return Infinity
  return (4 * C - 1) / (4 * C - 4) + 0.615 / C
}

/** 切应力 τ = 8FD/(πd³)·K，D 为中径 */
export function calcSpringShearStress(force, wireDiameter, meanDiameter) {
  const K = calcWahlFactor(wireDiameter, meanDiameter)
  return (8 * force * meanDiameter) / (Math.PI * wireDiameter ** 3) * K
}

export function calcSpringIndex(wireDiameter, meanDiameter) {
  return meanDiameter / wireDiameter
}

/** 由高度求载荷：F = P' × (H₀ − H) */
export function calcLoadsFromHeights({ springRate, freeLength, installHeight, workingHeight, solidHeight }) {
  const k = springRate
  const h0 = freeLength
  const loads = {}
  if (!(k > 0) || !(h0 > 0)) return loads
  if (installHeight != null) loads.install = k * Math.max(0, h0 - installHeight)
  if (workingHeight != null) loads.working = k * Math.max(0, h0 - workingHeight)
  if (solidHeight != null) loads.solid = k * Math.max(0, h0 - solidHeight)
  return loads
}

/** 展开长度 L = π D n₁ */
export function calcUnwindLength(meanDiameter, totalCoils) {
  if (!meanDiameter || !totalCoils) return 0
  return Math.PI * meanDiameter * totalCoils
}

export function calcSpringEffectiveAmplitude(tauAmp, tauMean, method = 'goodman') {
  return calcMeanStressEffectiveAmplitude(tauAmp, tauMean, 'spring_steel', method, 'shear')
}

/** GB/T 23935 表9 — 按目标循环次数取 τu0 */
export function getPulsatingFatigueLimit(targetCycles, tensileStrength) {
  const Rm = tensileStrength
  if (!Rm || !targetCycles) return 0
  let factor = TAU_U0_RM_LEVELS[0].factor
  for (const level of TAU_U0_RM_LEVELS) {
    if (targetCycles >= level.cycles) factor = level.factor
  }
  return factor * Rm
}

/**
 * GB/T 23935 公式 (30)：S = (τu0 + 0.75·τmin) / τmax ≥ Smin
 * @returns {{ safetyFactor, fatiguePass, tauU0, minSafety }}
 */
export function calcSpringFatigueCheck({
  tauMin,
  tauMax,
  tensileStrength,
  targetCycles = 1e6,
  minSafety = DEFAULT_FATIGUE_SAFETY,
}) {
  const tauU0 = getPulsatingFatigueLimit(targetCycles, tensileStrength)
  if (tauMax <= 0 || tauU0 <= 0 || !Number.isFinite(tauMax)) {
    return { safetyFactor: 0, fatiguePass: false, tauU0, minSafety }
  }
  const safetyFactor = (tauU0 + 0.75 * (tauMin ?? 0)) / tauMax
  return {
    safetyFactor,
    fatiguePass: safetyFactor >= minSafety,
    tauU0,
    minSafety,
  }
}

/** 估算满足公式 (30) 的最高循环档次 */
export function estimateSpringFatigueLife({ tauMin, tauMax, tensileStrength, minSafety = DEFAULT_FATIGUE_SAFETY }) {
  if (tauMax <= 0 || !tensileStrength) return 0
  let passed = null
  for (const level of TAU_U0_RM_LEVELS) {
    const tauU0 = level.factor * tensileStrength
    if ((tauU0 + 0.75 * (tauMin ?? 0)) / tauMax >= minSafety) passed = level.cycles
  }
  if (passed === TAU_U0_RM_LEVELS[TAU_U0_RM_LEVELS.length - 1].cycles) return Infinity
  return passed ?? 0
}

/** 压缩弹簧稳定性 — GB/T 23935 §6.5.2.1，b = H₀/D */
export function calcBucklingCheck(freeLength, meanDiameter, endType = 'fixed') {
  const slenderness = freeLength / meanDiameter
  const limit = endType === 'fixed' ? 5.3 : 3.7
  const minSlenderness = 0.8
  return {
    slenderness,
    criticalSlenderness: limit,
    minSlenderness,
    bucklingPass: slenderness <= limit && slenderness >= minSlenderness,
    tooShort: slenderness < minSlenderness,
  }
}

/** 支承圈数：磨平端 n_z=2，一端自由 n_z=1 */
export function calcSolidCoils(activeCoils, endType = 'fixed') {
  const endCoils = endType === 'free' ? 1 : 2
  return activeCoils + endCoils
}

/**
 * 并紧高度 Hb — GB/T 23935 公式 (23)/(24)
 * 磨平端：Hb ≤ n₁·d；不磨端：Hb ≤ (n₁+1.5)·d
 */
export function calcSolidHeight({ wireDiameter, activeCoils, totalCoils, endType }) {
  const d = wireDiameter
  if (!d) return 0
  const n1 = totalCoils ?? calcSolidCoils(activeCoils, endType)
  const factor = endType === 'free' ? n1 + 1.5 : n1
  return d * factor
}

/** 校验 H₀ ≥ H₁ ≥ H₂ ≥ Hb */
export function validateSpringHeights({ freeLength, installHeight, workingHeight, solidHeight }) {
  const issues = []
  if (freeLength != null && solidHeight != null && freeLength < solidHeight) {
    issues.push('geometry')
  }
  if (freeLength != null && installHeight != null && installHeight > freeLength) {
    issues.push('h1_gt_h0')
  }
  if (installHeight != null && workingHeight != null && workingHeight > installHeight) {
    issues.push('h2_gt_h1')
  }
  if (workingHeight != null && solidHeight != null && workingHeight < solidHeight) {
    issues.push('h2_lt_solid')
  }
  return { valid: issues.length === 0, issues }
}

export function analyzeSpring(input) {
  const calcMode = input.calcMode ?? 'simple'
  const d = input.wireDiameter
  const D = resolveMeanDiameter(input)
  const outerDiameter = resolveOuterDiameter({ ...input, meanDiameter: D })

  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const G = input.shearModulus ?? mat.shearModulus ?? DEFAULT_SPRING_SHEAR_MODULUS
  const allow = input.allowableShear ?? mat.allowableShear ?? 600
  const Rm = input.tensileStrength ?? mat.tensileStrength ?? 1600

  const k = calcSpringRate({
    shearModulus: G,
    wireDiameter: d,
    meanDiameter: D,
    activeCoils: input.activeCoils,
  })
  const C = calcSpringIndex(d, D)
  const K = calcWahlFactor(d, D)

  const endType = input.endType ?? 'fixed'
  const totalCoils = input.totalCoils ?? calcSolidCoils(input.activeCoils, endType)
  const solidHeight = calcSolidHeight({
    wireDiameter: d,
    totalCoils,
    endType,
  })
  const freeLength = input.freeLength ?? solidHeight + 3 * d

  const heightValidation = validateSpringHeights({
    freeLength,
    installHeight: input.installHeight,
    workingHeight: input.workingHeight,
    solidHeight,
  })

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

  const tau = calcSpringShearStress(force, d, D)
  const tauInstall =
    heightLoads.install != null ? calcSpringShearStress(heightLoads.install, d, D) : null
  const tauWorking = usesHeightLoads ? tau : null
  const tauSolid =
    heightLoads.solid != null ? calcSpringShearStress(heightLoads.solid, d, D) : null

  const checkTau = usesHeightLoads ? tauWorking : tau
  const shearPass = checkTau <= allow

  const marginD = input.solidMargin ?? d
  const geometryPass = freeLength >= solidHeight && heightValidation.valid
  const maxDeflection = geometryPass ? freeLength - solidHeight - marginD : 0
  const solidPass = geometryPass && deflection <= maxDeflection
  const remainingDeflectionMargin = maxDeflection - deflection

  const result = {
    calcMode,
    wireDiameter: d,
    meanDiameter: D,
    outerDiameter,
    springRate: k,
    shearModulus: G,
    tensileStrength: Rm,
    force,
    deflection,
    shearStress: tau,
    wahlFactor: K,
    springIndex: C,
    solidHeight,
    freeLength,
    totalCoils,
    unwindLength: calcUnwindLength(D, totalCoils),
    shearPass,
    allowableShear: allow,
    materialLabel: mat.label,
    pass: shearPass,
    usesHeightLoads,
    heightValidation,
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
    const buckling = calcBucklingCheck(freeLength, D, endType)
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
    const useHeightFatigue =
      usesHeightLoads && input.installHeight != null && input.workingHeight != null
    const fMin = useHeightFatigue
      ? (heightLoads.install ?? 0)
      : (input.loadMin ?? heightLoads.install ?? 0)
    const fMax = useHeightFatigue
      ? (heightLoads.working ?? force)
      : (input.loadMax ?? heightLoads.working ?? force)
    const tauMin = calcSpringShearStress(fMin, d, D)
    const tauMax = calcSpringShearStress(fMax, d, D)
    const tauAmp = (tauMax - tauMin) / 2
    const tauMean = (tauMax + tauMin) / 2
    const targetCycles = input.targetCycles ?? 1e6
    const minSafety = input.fatigueSafety ?? DEFAULT_FATIGUE_SAFETY
    const fatigue = calcSpringFatigueCheck({
      tauMin,
      tauMax,
      tensileStrength: Rm,
      targetCycles,
      minSafety,
    })
    result.loadMin = fMin
    result.loadMax = fMax
    result.fatigueFromHeights = useHeightFatigue
    result.shearAmplitude = tauAmp
    result.shearMean = tauMean
    result.fatigueSafetyFactor = fatigue.safetyFactor
    result.fatigueTauU0 = fatigue.tauU0
    result.fatigueMinSafety = fatigue.minSafety
    result.fatigueLife = estimateSpringFatigueLife({ tauMin, tauMax, tensileStrength: Rm, minSafety })
    result.fatiguePass = fatigue.fatiguePass
    result.pass = result.pass && result.fatiguePass
  }

  return result
}
