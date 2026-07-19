/** 圆柱螺旋压缩弹簧设计 (GB/T 1239 / GB/T 23935-2009 / 机械设计手册) */
import { calcMeanStressEffectiveAmplitude } from '@/utils/fatigue-calc'
import { auditCriticalInputs, applyReleaseGate } from '@/utils/critical-input-guard'
import { resolveSpringTensileStrength } from '@/utils/spring-rm-lookup'

export {
  lookupSpringRmByWireDiameter,
  lookupRmFromDiameterTable,
  resolveSpringTensileStrength,
  SPRING_MATERIAL_RM_GRADES,
  GB23935_APPENDIX_F4_RM,
} from '@/utils/spring-rm-lookup'

/** G 默认 80000 MPa；[τ] 为许用切应力 MPa；Rm 为抗拉强度 MPa（疲劳校核用） */
export const SPRING_MATERIALS = {
  '50CrVA': { label: '50CrVA', allowableShear: 529, shearModulus: 80000, tensileStrength: 1810, testShearFactor: 0.55 },
  '60Si2CrA': { label: '60Si2CrA', allowableShear: 684, shearModulus: 80000, tensileStrength: 1960, testShearFactor: 0.55 },
  '65Mn': { label: '65Mn', allowableShear: 540, shearModulus: 80000, tensileStrength: 1570, testShearFactor: 0.55 },
  '60Si2CrVA': { label: '60Si2CrVA', allowableShear: 671, shearModulus: 80000, tensileStrength: 1860, testShearFactor: 0.55 },
  music_wire: { label: '琴钢丝', allowableShear: 900, shearModulus: 80000, tensileStrength: 2000, testShearFactor: 0.55 },
  oil_tempered: { label: '油淬火弹簧钢', allowableShear: 700, shearModulus: 80000, tensileStrength: 1750, testShearFactor: 0.55 },
  stainless: { label: '不锈钢', allowableShear: 550, shearModulus: 80000, tensileStrength: 1600, testShearFactor: 0.45 },
  custom: { label: '自定义', allowableShear: 600, shearModulus: 80000, tensileStrength: 1600, testShearFactor: 0.55 },
}

/** GB/T 23935 表3 — 材料列（油淬火 / 重要碳素 / 不锈钢 / 青铜） */
export const SPRING_MATERIAL_STRESS_CLASS = {
  '50CrVA': 'oil_quenched',
  '60Si2CrA': 'oil_quenched',
  '60Si2CrVA': 'oil_quenched',
  '65Mn': 'oil_quenched',
  music_wire: 'carbon_important',
  oil_tempered: 'oil_quenched',
  stainless: 'stainless',
  custom: 'oil_quenched',
}

/** GB/T 23935 表3 — 静载 / 动载许用切应力系数（×Rm 下限） */
export const GB23935_TABLE3_STRESS_FACTORS = {
  oil_quenched: {
    static: 0.5,
    dynamicLimitedMin: 0.4,
    dynamicUnlimitedMin: 0.35,
  },
  carbon_important: {
    static: 0.45,
    dynamicLimitedMin: 0.38,
    dynamicUnlimitedMin: 0.33,
  },
  stainless: {
    static: 0.38,
    dynamicLimitedMin: 0.34,
    dynamicUnlimitedMin: 0.3,
  },
  bronze: {
    static: 0.36,
    dynamicLimitedMin: 0.33,
    dynamicUnlimitedMin: 0.3,
  },
}

/** GB/T 23935 图1 — 油淬火材料 [τ]/Rm 简化锚点（附录 C 算例校准） */
const FIG1_OIL_QUENCHED_RM_FACTOR = {
  1e4: [
    [0, 0.5],
    [0.5, 0.45],
    [1, 0.5],
  ],
  1e6: [
    [0, 0.4],
    [0.5, 0.38],
    [1, 0.45],
  ],
  1e7: [
    [0, 0.35],
    [0.35, 0.32],
    [0.5, 0.41],
    [0.667, 0.311],
    [0.8, 0.36],
    [1, 0.4],
  ],
  1e8: [
    [0, 0.3],
    [0.5, 0.3],
    [1, 0.38],
  ],
}

export const DEFAULT_SPRING_SHEAR_MODULUS = 80000
export const DEFAULT_SPRING_DENSITY = 7.85e-6
export const DEFAULT_FATIGUE_SAFETY = 1.1
/** GB/T 23935 表3 冷卷压缩弹簧试验切应力系数（τs = factor·Rm） */
export const DEFAULT_TEST_SHEAR_FACTOR = 0.55
/** GB/T 23935 表5 热卷压缩弹簧试验切应力范围（MPa），硬度 42-52 HRC */
export const HOT_COILED_COMPRESSION_TEST_SHEAR = {
  minHardnessHrc: 42,
  maxHardnessHrc: 52,
  minStress: 710,
  maxStress: 890,
}
/** 未输入热卷硬度时保守取表5下限 */
export const HOT_COILED_TEST_SHEAR_STRESS_MIN = HOT_COILED_COMPRESSION_TEST_SHEAR.minStress
export const DEFAULT_RESONANCE_RATIO_MIN = 10

/** GB/T 23935 图3 — 不稳定系数 CB 典型查表点（机械设计手册） */
const BUCKLING_CB_TABLE = {
  fixed: [
    { b: 5.3, cb: 2.78 },
    { b: 6, cb: 2.13 },
    { b: 7, cb: 1.52 },
    { b: 8, cb: 1.08 },
    { b: 9, cb: 0.77 },
    { b: 10, cb: 0.55 },
    { b: 12, cb: 0.28 },
  ],
  free: [
    { b: 3.7, cb: 2.65 },
    { b: 4, cb: 2.15 },
    { b: 5, cb: 1.35 },
    { b: 6, cb: 0.85 },
    { b: 7, cb: 0.53 },
    { b: 8, cb: 0.33 },
  ],
}

const BUCKLING_LIMITS = {
  fixed: 5.3,
  guided: 3.7,
  rotating: 2.6,
}

/** GB/T 23935-2009 表9 — 脉动疲劳极限 τu0 与 Rm 之比（按目标循环次数取不低于该档的值） */
export const TAU_U0_RM_LEVELS = [
  { cycles: 1e4, factor: 0.45 },
  { cycles: 1e5, factor: 0.4 },
  { cycles: 1e6, factor: 0.35 },
  { cycles: 1e7, factor: 0.32 },
  { cycles: 1e8, factor: 0.3 },
]

/**
 * 中径 D 为设计主参数（刚度、应力、旋绕比均基于 D）。
 * 仅当未给中径时，才由外径反推：D = D₂ − d。
 */
export function resolveMeanDiameter({ meanDiameter, outerDiameter, wireDiameter }) {
  if (meanDiameter != null && Number.isFinite(meanDiameter)) return meanDiameter
  if (outerDiameter != null && wireDiameter) return outerDiameter - wireDiameter
  return meanDiameter
}

/** 外径由几何导出：D₂ = D + d；无中径时才回退到输入外径 */
export function resolveOuterDiameter({ meanDiameter, outerDiameter, wireDiameter }) {
  if (meanDiameter != null && Number.isFinite(meanDiameter) && wireDiameter) {
    return meanDiameter + wireDiameter
  }
  if (outerDiameter != null) return outerDiameter
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

/** 曲度系数 K（GB/T 23935 式 7，Wahl） */
export function calcWahlFactor(wireDiameter, meanDiameter) {
  const C = meanDiameter / wireDiameter
  if (C <= 1) return Infinity
  return (4 * C - 1) / (4 * C - 4) + 0.615 / C
}

/** 切应力 τ = 8FD/(πd³)·K，D 为中径 (mm)，F (N)，τ (MPa) */
export function calcSpringShearStress(force, wireDiameter, meanDiameter) {
  if (!(force >= 0) || !wireDiameter || !meanDiameter) return 0
  const K = calcWahlFactor(wireDiameter, meanDiameter)
  if (!Number.isFinite(K)) return Infinity
  return (8 * force * meanDiameter) / (Math.PI * wireDiameter ** 3) * K
}

export function calcSpringIndex(wireDiameter, meanDiameter) {
  if (!wireDiameter || !meanDiameter) return 0
  return meanDiameter / wireDiameter
}

/** 循环特征 γ = Fmin/Fmax（或 τmin/τmax） */
export function resolveSpringStressRatio({ loadMin, loadMax, fMin, fMax, heightsValid = true } = {}) {
  let minF = loadMin
  let maxF = loadMax
  if ((minF == null || maxF == null) && heightsValid && fMin != null && fMax != null && fMax > 0) {
    minF = fMin
    maxF = fMax
  }
  if (minF == null || maxF == null || maxF <= 0 || minF < 0 || minF > maxF) return null
  if (minF === maxF) return 1
  return minF / maxF
}

/**
 * GB/T 23935 §5.1 — 静载 N<10⁴；动载有限/无限寿命
 * auto：无 N 且载荷有变化 → 图1 查取（默认 N≥10⁷ 档，保守）
 */
export function resolveSpringLoadCategory({
  loadCategory = 'auto',
  targetCycles,
  springProcess = 'cold',
  loadVariation = false,
} = {}) {
  if (loadCategory && loadCategory !== 'auto') return loadCategory

  const N = targetCycles
  if (!loadVariation && (N == null || N < 1e4)) return 'static'

  if (N == null) return loadVariation ? 'dynamic_figure' : 'static'

  if (springProcess === 'hot') {
    if (N >= 2e6) return 'dynamic_figure'
    if (N >= 1e4) return 'dynamic_limited'
    return 'static'
  }
  if (N >= 1e7) return 'dynamic_figure'
  if (N >= 1e4) return 'dynamic_limited'
  return 'static'
}

function interpolateFig1Anchors(gamma, anchors) {
  const g = Math.max(0, Math.min(1, gamma))
  if (!anchors?.length) return 0
  if (g <= anchors[0][0]) return anchors[0][1]
  for (let i = 1; i < anchors.length; i += 1) {
    const [g0, f0] = anchors[i - 1]
    const [g1, f1] = anchors[i]
    if (g <= g1) {
      const t = g1 === g0 ? 0 : (g - g0) / (g1 - g0)
      return f0 + t * (f1 - f0)
    }
  }
  return anchors[anchors.length - 1][1]
}

function pickFig1CycleTier(targetCycles) {
  const tiers = [1e4, 1e6, 1e7, 1e8]
  const N = Math.max(targetCycles ?? 1e7, 1e4)
  let tier = tiers[0]
  for (const t of tiers) {
    if (N >= t) tier = t
  }
  return tier
}

/** 图1 [τ]/Rm 系数；仅油淬火材料有锚点表，其余返回 null 走表3 下限 */
export function lookupFig1RmFactor(stressClass, gamma, targetCycles) {
  if (stressClass !== 'oil_quenched' || gamma == null) return null
  const tier = pickFig1CycleTier(targetCycles ?? 1e7)
  const anchors = FIG1_OIL_QUENCHED_RM_FACTOR[tier] ?? FIG1_OIL_QUENCHED_RM_FACTOR[1e7]
  return interpolateFig1Anchors(gamma, anchors)
}

/** 按 GB/T 23935 表3 / 图1 解析许用切应力 [τ] (MPa) */
export function resolveSpringAllowableShear({
  material = 'custom',
  rm,
  loadCategory = 'static',
  targetCycles,
  gamma,
  manualAllowable,
  manualOverride = false,
} = {}) {
  if (manualOverride && manualAllowable != null && manualAllowable > 0) {
    return {
      value: manualAllowable,
      loadCategory,
      source: 'manual',
      factor: rm > 0 ? manualAllowable / rm : null,
      stressClass: SPRING_MATERIAL_STRESS_CLASS[material] ?? 'oil_quenched',
    }
  }

  const stressClass = SPRING_MATERIAL_STRESS_CLASS[material] ?? 'oil_quenched'
  const factors = GB23935_TABLE3_STRESS_FACTORS[stressClass] ?? GB23935_TABLE3_STRESS_FACTORS.oil_quenched
  const Rm = rm ?? 0
  if (!(Rm > 0)) {
    return {
      value: manualAllowable ?? 0,
      loadCategory,
      source: 'missing_rm',
      factor: null,
      stressClass,
    }
  }

  let factor
  let source
  const category = loadCategory

  if (category === 'static') {
    factor = factors.static
    source = 'table3_static'
  } else if (category === 'dynamic_limited') {
    const fig = lookupFig1RmFactor(stressClass, gamma, targetCycles ?? 1e6)
    factor = fig ?? factors.dynamicLimitedMin
    source = fig ? 'fig1_limited' : 'table3_limited_min'
  } else {
    const fig = lookupFig1RmFactor(stressClass, gamma, targetCycles ?? 1e7)
    factor = fig ?? factors.dynamicUnlimitedMin
    source = fig ? 'fig1_unlimited' : 'table3_unlimited_min'
  }

  return {
    value: Rm * factor,
    loadCategory: category,
    source,
    factor,
    stressClass,
  }
}

/**
 * 由高度求载荷 F = P'(H₀ − H)，不截断负值；几何非法时由 validateSpringHeights 阻断判据。
 */
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

/** 展开长度 L = π D n₁ */
export function calcUnwindLength(meanDiameter, totalCoils) {
  if (!meanDiameter || !totalCoils) return 0
  return Math.PI * meanDiameter * totalCoils
}

export function calcSpringEffectiveAmplitude(tauAmp, tauMean, method = 'goodman') {
  return calcMeanStressEffectiveAmplitude(tauAmp, tauMean, 'spring_steel', method, 'shear')
}

export function normalizeSpringSupportType(endType = 'fixed') {
  if (endType === 'free' || endType === 'guided') return 'guided'
  if (endType === 'rotating') return 'rotating'
  return 'fixed'
}

export function calcHotCoiledCompressionTestShearStress(hardnessHrc) {
  const table = HOT_COILED_COMPRESSION_TEST_SHEAR
  if (hardnessHrc == null) return table.minStress
  if (hardnessHrc < table.minHardnessHrc || hardnessHrc > table.maxHardnessHrc) return null
  const t = (hardnessHrc - table.minHardnessHrc) / (table.maxHardnessHrc - table.minHardnessHrc)
  return table.minStress + t * (table.maxStress - table.minStress)
}

/** GB/T 23935 表9 — 按目标循环次数取 τu0 (MPa) */
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
 */
export function calcSpringFatigueCheck({
  tauMin,
  tauMax,
  tensileStrength,
  targetCycles = 1e6,
  minSafety = DEFAULT_FATIGUE_SAFETY,
}) {
  const tauU0 = getPulsatingFatigueLimit(targetCycles, tensileStrength)
  if (tauMax <= 0 || tauU0 <= 0 || !Number.isFinite(tauMax) || tauMax < tauMin) {
    return { safetyFactor: 0, fatiguePass: false, tauU0, minSafety, invalidLoadRange: tauMax < tauMin }
  }
  const safetyFactor = (tauU0 + 0.75 * (tauMin ?? 0)) / tauMax
  return {
    safetyFactor,
    fatiguePass: safetyFactor >= minSafety,
    tauU0,
    minSafety,
    invalidLoadRange: false,
  }
}

/** 估算满足公式 (30) 的最高表9分档循环次数 */
export function estimateSpringFatigueLife({ tauMin, tauMax, tensileStrength, minSafety = DEFAULT_FATIGUE_SAFETY }) {
  if (tauMax <= 0 || !tensileStrength || tauMax < tauMin) return 0
  let passed = null
  for (const level of TAU_U0_RM_LEVELS) {
    const tauU0 = level.factor * tensileStrength
    if ((tauU0 + 0.75 * (tauMin ?? 0)) / tauMax >= minSafety) passed = level.cycles
  }
  if (passed === TAU_U0_RM_LEVELS[TAU_U0_RM_LEVELS.length - 1].cycles) return Infinity
  return passed ?? 0
}

export function isSpringFatigueLifeAtTarget(achievableCycles, targetCycles) {
  if (!(achievableCycles > 0)) return false
  if (achievableCycles === Infinity) return true
  return achievableCycles >= targetCycles
}

/** GB/T 23935 图3 — CB 线性插值（超出图幅时不外推，由稳定性校核判 fail） */
export function lookupBucklingCoefficient(slenderness, endType = 'fixed') {
  const supportType = normalizeSpringSupportType(endType)
  const table = BUCKLING_CB_TABLE[supportType === 'guided' ? 'free' : supportType]
  if (!table) {
    return { coefficient: null, inTableRange: false, maxTableSlenderness: null }
  }
  const last = table[table.length - 1]
  if (slenderness > last.b) {
    return { coefficient: null, inTableRange: false, maxTableSlenderness: last.b }
  }
  if (slenderness <= table[0].b) {
    return { coefficient: table[0].cb, inTableRange: true, maxTableSlenderness: last.b }
  }
  for (let i = 0; i < table.length - 1; i += 1) {
    const a = table[i]
    const b = table[i + 1]
    if (slenderness >= a.b && slenderness <= b.b) {
      const t = (slenderness - a.b) / (b.b - a.b)
      return {
        coefficient: a.cb + t * (b.cb - a.cb),
        inTableRange: true,
        maxTableSlenderness: last.b,
      }
    }
  }
  return { coefficient: last.cb, inTableRange: true, maxTableSlenderness: last.b }
}

/**
 * 压缩弹簧稳定性 — GB/T 23935 §6.5.2
 * b≤限值：简化通过；b>限值：Fc=CB·P'·H₀ > F_n（式31）
 */
export function calcBucklingCheck(
  freeLength,
  meanDiameter,
  endType = 'fixed',
  { springRate = 0, maxWorkingLoad = 0 } = {},
) {
  const slenderness = freeLength / meanDiameter
  const supportType = normalizeSpringSupportType(endType)
  const limit = BUCKLING_LIMITS[supportType] ?? BUCKLING_LIMITS.fixed
  const minSlenderness = 0.8
  const tooShort = slenderness < minSlenderness
  const cbLookup = lookupBucklingCoefficient(slenderness, supportType)
  const bucklingCoefficient = cbLookup.coefficient
  const cbOutOfRange = !cbLookup.inTableRange
  const criticalLoad =
    bucklingCoefficient != null && springRate > 0 && freeLength > 0
      ? bucklingCoefficient * springRate * freeLength
      : null

  let bucklingPass = false
  let checkMode = 'slenderness'

  if (tooShort) {
    bucklingPass = false
  } else if (slenderness <= limit) {
    bucklingPass = true
    checkMode = 'slenderness'
  } else if (cbOutOfRange) {
    bucklingPass = false
    checkMode = 'critical_load'
  } else if (criticalLoad != null && maxWorkingLoad > 0) {
    bucklingPass = criticalLoad > maxWorkingLoad
    checkMode = 'critical_load'
  } else {
    bucklingPass = false
    checkMode = 'critical_load'
  }

  return {
    slenderness,
    criticalSlenderness: limit,
    supportType,
    minSlenderness,
    bucklingPass,
    tooShort,
    bucklingCoefficient,
    cbOutOfRange,
    cbMaxTableSlenderness: cbLookup.maxTableSlenderness,
    criticalLoad,
    maxWorkingLoad,
    checkMode,
    simplifiedOnly: slenderness <= limit,
  }
}

/**
 * GB/T 23935 表3 试验切应力 τs（MPa）
 * 注2：d < 1 mm 时表列系数 × 0.9
 */
export function calcSpringTestShearStress(
  tensileStrength,
  factor = DEFAULT_TEST_SHEAR_FACTOR,
  wireDiameter,
  {
    process = 'cold',
    hotCoilHardnessHrc = null,
    hotTestShearStress = HOT_COILED_TEST_SHEAR_STRESS_MIN,
  } = {},
) {
  if (!tensileStrength) return 0
  if (process === 'hot') {
    if (hotCoilHardnessHrc != null) return calcHotCoiledCompressionTestShearStress(hotCoilHardnessHrc) ?? 0
    return hotTestShearStress
  }
  let k = factor
  if (wireDiameter != null && wireDiameter > 0 && wireDiameter < 1) k *= 0.9
  return k * tensileStrength
}

/** GB/T 23935 式(14) 试验载荷 Fs = πd³τs/(8D)，不含 Wahl 系数 */
export function calcSpringTestLoad({ wireDiameter, meanDiameter, testShearStress }) {
  const d = wireDiameter
  const D = meanDiameter
  const tauS = testShearStress
  if (!(tauS > 0) || !(d > 0) || !(D > 0)) return 0
  return (Math.PI * d ** 3 * tauS) / (8 * D)
}

/** 式(14) 反算：τs = 8FsD/(πd³) — 用于 Fs 被压并负荷限制后回算有效 τs */
export function calcSpringTestShearFromLoad({ wireDiameter, meanDiameter, testLoad }) {
  const d = wireDiameter
  const D = meanDiameter
  if (!(testLoad > 0) || !(d > 0) || !(D > 0)) return 0
  return (8 * testLoad * D) / (Math.PI * d ** 3)
}

/**
 * 试验载荷与 fs — GB/T 23935 §6.3.2 + 附录 C.2.7
 * 当 Fs > Fb 时取 Fs = Fb，fs = fb（压并变形量）
 */
export function resolveSpringTestLoad({
  wireDiameter,
  meanDiameter,
  testShearStress,
  springRate,
  solidLoad,
  solidDeflection,
}) {
  const nominalLoad = calcSpringTestLoad({ wireDiameter, meanDiameter, testShearStress })
  let testLoad = nominalLoad
  let testDeflection = springRate > 0 ? testLoad / springRate : 0
  let cappedAtSolid = false
  let effectiveTestShearStress = testShearStress

  if (solidLoad != null && solidLoad > 0 && nominalLoad > solidLoad) {
    testLoad = solidLoad
    testDeflection =
      solidDeflection != null && solidDeflection >= 0 ? solidDeflection : testLoad / (springRate || 1)
    effectiveTestShearStress = calcSpringTestShearFromLoad({
      wireDiameter,
      meanDiameter,
      testLoad,
    })
    cappedAtSolid = true
  }

  return {
    testLoad,
    testDeflection,
    nominalTestLoad: nominalLoad,
    effectiveTestShearStress,
    cappedAtSolid,
  }
}

function resolveLoadRangeFatigue(input) {
  const fMin = Math.max(input.loadMin, 0)
  const fMax = Math.max(input.loadMax, 0)
  return {
    fMin,
    fMax,
    fromHeights: false,
    ready: fMax >= fMin && fMax > 0,
    issue:
      fMax < fMin
        ? 'fatigue_load_range_invalid'
        : fMax <= 0
          ? 'fatigue_load_inputs_missing'
          : null,
  }
}

/**
 * 专业模式疲劳载荷 F₁/F₂ — GB/T 23935 式(30)
 * - H₁+H₂ 齐全且顺序合法 → 仅用高度换算，忽略 loadMin/loadMax
 * - 高度不可信/不完整但 loadMin+loadMax 齐全 → 与静强度一致，回退载荷对
 * - 仅 H₁ 或仅 H₂ 且无载荷对 → 阻断
 */
export function resolveSpringFatigueLoadRange(
  input,
  { heightsValid, heightLoads, designForce },
) {
  const hasInstall = input.installHeight != null
  const hasWorking = input.workingHeight != null
  const hasPartialHeights = hasInstall !== hasWorking
  const hasFullHeights = hasInstall && hasWorking
  const hasLoadRange = input.loadMin != null && input.loadMax != null

  if (hasFullHeights && heightsValid) {
    return {
      fMin: heightLoads.install ?? 0,
      fMax: heightLoads.working ?? designForce,
      fromHeights: true,
      ready: true,
      issue: null,
      loadsFallback: false,
    }
  }

  if ((hasFullHeights && !heightsValid) || hasPartialHeights) {
    if (hasLoadRange) {
      return { ...resolveLoadRangeFatigue(input), loadsFallback: true }
    }
    return {
      fMin: null,
      fMax: null,
      fromHeights: hasFullHeights,
      ready: false,
      issue: hasPartialHeights ? 'fatigue_partial_heights' : 'fatigue_heights_invalid',
      loadsFallback: false,
    }
  }

  if (hasLoadRange) {
    return { ...resolveLoadRangeFatigue(input), loadsFallback: false }
  }

  return {
    fMin: null,
    fMax: null,
    fromHeights: false,
    ready: false,
    issue: 'fatigue_load_inputs_missing',
    loadsFallback: false,
  }
}

/** complete/professional 在高度载荷不可信时是否可回退到载荷输入 */
export function hasSpringLoadFallback(input, calcMode) {
  if (calcMode !== 'complete' && calcMode !== 'professional') return false
  return input.loadMax != null || input.load != null || input.deflection != null
}

/** 最大工作载荷 F₂ — 高度优先，否则 loadMax，再 load */
export function resolveSpringMaxWorkingLoad({
  usesHeightLoads,
  heightWorkingLoad,
  loadMax,
  load,
  force,
}) {
  if (usesHeightLoads && heightWorkingLoad != null) return Math.max(heightWorkingLoad, 0)
  if (loadMax != null) return Math.max(loadMax, 0)
  if (load != null) return Math.max(load, 0)
  return Math.max(force ?? 0, 0)
}

/** GB/T 23935 §6.3.1 — 0.2fs≤f≤0.8fs，且 F₂≤Fs */
export function calcSpringCharacteristicCheck({ deflection, testDeflection, workingLoad, testLoad }) {
  if (!(testDeflection > 0) || deflection == null) {
    return { pass: false, ratio: null, minRatio: 0.2, maxRatio: 0.8, loadWithinTest: false }
  }
  const ratio = deflection / testDeflection
  const loadWithinTest =
    workingLoad == null || testLoad == null || !(testLoad > 0) || workingLoad <= testLoad
  return {
    ratio,
    minRatio: 0.2,
    maxRatio: 0.8,
    loadWithinTest,
    pass: ratio >= 0.2 && ratio <= 0.8 && loadWithinTest,
  }
}

/** GB/T 23935 式(12)：fe = 3.56d/(nD²)·sqrt(G/ρ)，G: MPa, ρ: kg/mm³ */
export function calcSpringNaturalFrequency({
  wireDiameter,
  meanDiameter,
  activeCoils,
  shearModulus = DEFAULT_SPRING_SHEAR_MODULUS,
  density = DEFAULT_SPRING_DENSITY,
}) {
  const d = wireDiameter
  const D = meanDiameter
  const n = activeCoils
  if (!(d > 0) || !(D > 0) || !(n > 0) || !(shearModulus > 0) || !(density > 0)) return 0
  return (3.56 * d * Math.sqrt(shearModulus / density)) / (n * D ** 2)
}

/** GB/T 23935 §6.5.3：必要时 fe/fr > 10 */
export function calcSpringResonanceCheck({
  naturalFrequency,
  excitationFrequency,
  minRatio = DEFAULT_RESONANCE_RATIO_MIN,
}) {
  if (!(excitationFrequency > 0)) {
    return { checked: false, pass: true, ratio: null, minRatio }
  }
  const ratio = naturalFrequency > 0 ? naturalFrequency / excitationFrequency : 0
  return {
    checked: true,
    pass: ratio > minRatio,
    ratio,
    minRatio,
    excitationFrequency,
  }
}

export function calcSolidCoils(activeCoils, endType = 'fixed') {
  const endCoils = endType === 'fixed' ? 2 : 1
  return activeCoils + endCoils
}

/** 并紧高度 Hb — GB/T 23935 式 (23)/(24) */
export function calcSolidHeight({ wireDiameter, activeCoils, totalCoils, endType }) {
  const d = wireDiameter
  if (!d) return 0
  const n1 = totalCoils ?? calcSolidCoils(activeCoils, endType)
  const factor = endType === 'fixed' ? n1 : n1 + 1.5
  return d * factor
}

/**
 * 由 H₀、Hb 与刚度推导压并负荷 Fb 与 fb — 仅依赖几何，与 H₁/H₂ 顺序无关。
 * GB/T 23935 附录 C.2.7：Fs 不得超过 Fb。
 */
export function resolveSpringSolidLoadFromGeometry({ springRate, freeLength, solidHeight }) {
  if (!(springRate > 0) || !(freeLength > 0) || solidHeight == null || !(freeLength > solidHeight)) {
    return { solidLoad: null, solidDeflection: null }
  }
  const solidDeflection = freeLength - solidHeight
  return { solidLoad: springRate * solidDeflection, solidDeflection }
}

/** 校验 H₀ ≥ H₁ ≥ H₂ ≥ Hb（压缩弹簧常规工况顺序） */
export function validateSpringHeights({ freeLength, installHeight, workingHeight, solidHeight }) {
  const issues = []
  if (freeLength != null && solidHeight != null && freeLength < solidHeight) {
    issues.push('geometry')
  }
  if (freeLength != null && installHeight != null && installHeight > freeLength) {
    issues.push('h1_gt_h0')
  }
  if (freeLength != null && workingHeight != null && workingHeight > freeLength) {
    issues.push('h2_gt_h0')
  }
  if (installHeight != null && workingHeight != null && workingHeight > installHeight) {
    issues.push('h2_gt_h1')
  }
  if (workingHeight != null && solidHeight != null && workingHeight < solidHeight) {
    issues.push('h2_lt_solid')
  }
  return { valid: issues.length === 0, issues }
}

/** 基本输入合法性（不含高度顺序） */
export function validateSpringInputs(input) {
  const issues = []
  const d = input.wireDiameter
  const D = resolveMeanDiameter(input)
  if (!(d > 0)) issues.push('invalid_wire_diameter')
  if (!(D > 0)) issues.push('invalid_mean_diameter')
  if (input.outerDiameter != null && input.wireDiameter != null && input.outerDiameter <= input.wireDiameter) {
    issues.push('outer_not_gt_wire')
  }
  if (!(input.activeCoils > 0)) issues.push('invalid_active_coils')
  if (
    input.springProcess === 'hot' &&
    input.hotCoilHardnessHrc != null &&
    (input.hotCoilHardnessHrc < HOT_COILED_COMPRESSION_TEST_SHEAR.minHardnessHrc ||
      input.hotCoilHardnessHrc > HOT_COILED_COMPRESSION_TEST_SHEAR.maxHardnessHrc)
  ) {
    issues.push('hot_hardness_out_of_range')
  }
  const C = calcSpringIndex(d, D)
  if (C <= 1) issues.push('index_le_one')
  if (
    input.material &&
    input.material !== 'custom' &&
    !input.tensileStrengthManual &&
    input.wireDiameter != null &&
    resolveSpringTensileStrength({
      material: input.material,
      wireDiameter: input.wireDiameter,
      materialDefault: SPRING_MATERIALS[input.material]?.tensileStrength,
    }).issue === 'rm_out_of_table_range'
  ) {
    issues.push('rm_out_of_table_range')
  }
  return { valid: issues.length === 0, issues }
}

export function analyzeSpring(input) {
  const calcMode = input.calcMode ?? 'simple'
  const inputValidation = validateSpringInputs(input)
  const d = input.wireDiameter
  const D = resolveMeanDiameter(input)
  const outerDiameter = resolveOuterDiameter({ ...input, meanDiameter: D })

  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const G = input.shearModulus ?? mat.shearModulus ?? DEFAULT_SPRING_SHEAR_MODULUS
  const density = input.density ?? mat.density ?? DEFAULT_SPRING_DENSITY
  const rmResolved = resolveSpringTensileStrength({
    material: matKey,
    wireDiameter: d,
    tensileStrength: input.tensileStrength,
    tensileStrengthManual: input.tensileStrengthManual ?? false,
    materialDefault: mat.tensileStrength ?? 1600,
  })
  const Rm = rmResolved.value
  const springProcess = input.springProcess ?? 'cold'
  const testShearFactor = input.testShearFactor ?? mat.testShearFactor ?? DEFAULT_TEST_SHEAR_FACTOR

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

  const heightMode = calcMode === 'complete' || calcMode === 'professional'
  const hasHeightInputs =
    heightMode && (input.workingHeight != null || input.installHeight != null)
  const heightsValid = !hasHeightInputs || heightValidation.valid

  const heightLoads = heightMode
    ? calcLoadsFromHeights({
        springRate: k,
        freeLength,
        installHeight: input.installHeight,
        workingHeight: input.workingHeight,
        solidHeight,
      })
    : {}
  const stressRatioGamma = resolveSpringStressRatio({
    loadMin: input.loadMin,
    loadMax: input.loadMax,
    fMin: heightLoads.install,
    fMax: heightLoads.working,
    heightsValid,
  })
  const loadVariation =
    stressRatioGamma != null && stressRatioGamma < 1 - 1e-6
  const resolvedLoadCategory = resolveSpringLoadCategory({
    loadCategory: input.loadCategory,
    targetCycles: input.targetCycles,
    springProcess,
    loadVariation,
  })
  const allowResolved = resolveSpringAllowableShear({
    material: matKey,
    rm: Rm,
    loadCategory: resolvedLoadCategory,
    targetCycles: input.targetCycles,
    gamma: stressRatioGamma,
    manualAllowable: input.allowableShear,
    manualOverride: input.allowableShearManual ?? false,
  })
  const allow = allowResolved.value > 0 ? allowResolved.value : (input.allowableShear ?? mat.allowableShear ?? 600)
  /** 高度→载荷仅完整/专业；简化始终用 load，避免表单残留 H₁/H₂ 污染 */
  const usesHeightLoads = heightMode && heightLoads.working != null && heightsValid
  const useDesignLoadPath = heightMode
  const hasLoadFallback = hasSpringLoadFallback(input, calcMode)
  const heightLoadBlocked = hasHeightInputs && !heightsValid && !hasLoadFallback
  const heightLoadsFallback = hasHeightInputs && !heightsValid && hasLoadFallback

  let force
  let deflection
  if (usesHeightLoads) {
    force = heightLoads.working
    deflection = input.workingHeight != null ? freeLength - input.workingHeight : force / k
  } else if (heightLoadBlocked) {
    force = 0
    deflection = 0
  } else if (useDesignLoadPath) {
    force = resolveSpringMaxWorkingLoad({
      usesHeightLoads: false,
      heightWorkingLoad: null,
      loadMax: input.loadMax,
      load: input.load,
      force: 0,
    })
    deflection = k > 0 && force > 0 ? force / k : input.deflection ?? 0
  } else {
    force = input.load ?? k * (input.deflection ?? 0)
    deflection = input.deflection ?? (input.load != null && k > 0 ? input.load / k : 0)
  }

  const maxWorkingLoad = resolveSpringMaxWorkingLoad({
    usesHeightLoads,
    heightWorkingLoad: heightsValid ? heightLoads.working : null,
    loadMax: input.loadMax,
    load: input.load,
    force,
  })

  const designForce = useDesignLoadPath ? maxWorkingLoad : force
  const designDeflection =
    usesHeightLoads && input.workingHeight != null
      ? freeLength - input.workingHeight
      : k > 0 && designForce > 0
        ? designForce / k
        : deflection

  const tauEnabled = usesHeightLoads || !heightLoadBlocked
  const tau = tauEnabled
    ? calcSpringShearStress(useDesignLoadPath ? designForce : force, d, D)
    : 0
  const tauInstall =
    heightsValid && heightLoads.install != null ? calcSpringShearStress(heightLoads.install, d, D) : null
  const tauWorking = usesHeightLoads || useDesignLoadPath ? tau : null
  const tauSolid =
    heightsValid && heightLoads.solid != null ? calcSpringShearStress(heightLoads.solid, d, D) : null

  const checkTau = tauWorking ?? tau
  const shearPass = inputValidation.valid && !heightLoadBlocked && checkTau <= allow

  /** 并圈前预留行程，默认 1d（GB/T 23935 常用经验）；校核：δ₂ ≤ H₀−Lₛ−margin */
  const marginD = input.solidMargin ?? d
  const coreGeometryValid = inputValidation.valid && freeLength >= solidHeight
  const geometryPass = coreGeometryValid && (!hasHeightInputs || heightValidation.valid)
  const maxDeflection = coreGeometryValid ? freeLength - solidHeight - marginD : 0
  const solidPass = coreGeometryValid && designDeflection <= maxDeflection
  /** 预留后剩余行程：(H₀−Lₛ−margin)−δ₂；有 H₂ 时等价于 H₂−Lₛ−margin */
  const remainingDeflectionMargin = maxDeflection - designDeflection
  /** 几何间隙（未扣预留）：H₂−Lₛ */
  const solidClearance =
    input.workingHeight != null && solidHeight != null ? input.workingHeight - solidHeight : null

  const indexPass = C >= 4
  const indexRecommend = C <= 16

  const result = {
    calcMode,
    wireDiameter: d,
    meanDiameter: D,
    outerDiameter,
    springRate: k,
    shearModulus: G,
    density,
    tensileStrength: Rm,
    rmSource: rmResolved.source,
    rmGrade: rmResolved.grade,
    rmFromAppendixF: rmResolved.source === 'appendix_f',
    tensileStrengthManual: input.tensileStrengthManual ?? false,
    springProcess,
    hotCoilHardnessHrc: input.hotCoilHardnessHrc,
    testShearFactor,
    force,
    deflection: designDeflection,
    shearStress: tau,
    wahlFactor: K,
    springIndex: C,
    solidHeight,
    freeLength,
    totalCoils,
    unwindLength: calcUnwindLength(D, totalCoils),
    shearPass,
    staticShearCheck: shearPass,
    allowableShear: allow,
    loadCategory: allowResolved.loadCategory,
    allowableShearSource: allowResolved.source,
    allowableShearFactor: allowResolved.factor,
    stressRatioGamma,
    materialLabel: mat.label,
    pass: inputValidation.valid && shearPass,
    usesHeightLoads,
    heightValidation,
    inputValidation,
    heightsValid,
    heightLoadBlocked,
    heightLoadsFallback,
    indexPass,
    indexRecommend,
    indexWarning: C < 4 ? '旋绕比过小' : C > 16 ? '旋绕比过大(建议)' : null,
  }

  if (heightsValid && heightLoads.install != null) {
    result.installLoad = heightLoads.install
    result.tauInstall = tauInstall
  }
  if (heightsValid && heightLoads.working != null) {
    result.workingLoad = heightLoads.working
    result.tauWorking = tauWorking
  } else if (useDesignLoadPath && maxWorkingLoad > 0) {
    result.workingLoad = maxWorkingLoad
    result.tauWorking = tauWorking
  }
  if (heightsValid && heightLoads.solid != null) {
    result.solidLoad = heightLoads.solid
    result.tauSolid = tauSolid
  }
  if (heightLoadBlocked) {
    result.heightLoadBlocked = true
  }
  if (heightLoadsFallback) {
    result.heightLoadsFallback = true
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const testShearStressNominal = calcSpringTestShearStress(
      Rm,
      testShearFactor,
      d,
      {
        process: springProcess,
      hotCoilHardnessHrc: input.hotCoilHardnessHrc,
        hotTestShearStress: input.hotTestShearStress,
      },
    )
    const solidForTest = resolveSpringSolidLoadFromGeometry({
      springRate: k,
      freeLength,
      solidHeight,
    })
    const testResolved = resolveSpringTestLoad({
      wireDiameter: d,
      meanDiameter: D,
      testShearStress: testShearStressNominal,
      springRate: k,
      solidLoad: solidForTest.solidLoad,
      solidDeflection: solidForTest.solidDeflection,
    })
    const characteristic = calcSpringCharacteristicCheck({
      deflection: designDeflection,
      testDeflection: testResolved.testDeflection,
      workingLoad: maxWorkingLoad,
      testLoad: testResolved.testLoad,
    })
    const buckling = calcBucklingCheck(freeLength, D, endType, {
      springRate: k,
      maxWorkingLoad,
    })
    const naturalFrequency = calcSpringNaturalFrequency({
      wireDiameter: d,
      meanDiameter: D,
      activeCoils: input.activeCoils,
      shearModulus: G,
      density,
    })
    const resonance = calcSpringResonanceCheck({
      naturalFrequency,
      excitationFrequency: input.excitationFrequency,
      minRatio: input.resonanceMinRatio ?? DEFAULT_RESONANCE_RATIO_MIN,
    })
    result.maxWorkingLoad = maxWorkingLoad
    result.testShearStress = testResolved.effectiveTestShearStress
    result.testShearStressNominal = testShearStressNominal
    result.testLoad = testResolved.testLoad
    result.testDeflection = testResolved.testDeflection
    result.testLoadCappedAtSolid = testResolved.cappedAtSolid
    result.characteristic = characteristic
    result.buckling = buckling
    result.naturalFrequency = naturalFrequency
    result.excitationFrequency = input.excitationFrequency
    result.resonance = resonance
    result.resonancePass = resonance.pass
    result.geometryPass = geometryPass
    result.maxDeflection = maxDeflection
    result.solidReserve = marginD
    result.solidClearance = solidClearance
    result.remainingDeflectionMargin = remainingDeflectionMargin
    result.solidPass = solidPass
    result.characteristicPass = heightsValid && characteristic.pass
    result.pass =
      inputValidation.valid &&
      shearPass &&
      indexPass &&
      buckling.bucklingPass &&
      solidPass &&
      result.characteristicPass &&
      result.resonancePass
  }

  if (calcMode === 'professional') {
    const fatigueLoads = resolveSpringFatigueLoadRange(input, {
      heightsValid,
      heightLoads,
      designForce,
    })
    const fMin = fatigueLoads.fMin ?? 0
    const fMax = fatigueLoads.fMax ?? 0
    const loadRangeValid = fatigueLoads.ready && fMax >= fMin && fMin >= 0
    const tauMin = loadRangeValid ? calcSpringShearStress(fMin, d, D) : 0
    const tauMax = loadRangeValid ? calcSpringShearStress(fMax, d, D) : 0
    const tauAmp = loadRangeValid ? (tauMax - tauMin) / 2 : 0
    const tauMean = loadRangeValid ? (tauMax + tauMin) / 2 : 0
    const targetCycles = input.targetCycles ?? 1e6
    const minSafety = input.fatigueSafety ?? DEFAULT_FATIGUE_SAFETY
    const fatigueReady = inputValidation.valid && loadRangeValid && tauMax > 0
    const fatigue = fatigueReady
      ? calcSpringFatigueCheck({
          tauMin,
          tauMax,
          tensileStrength: Rm,
          targetCycles,
          minSafety,
        })
      : { safetyFactor: 0, fatiguePass: false, tauU0: 0, minSafety, invalidLoadRange: !loadRangeValid }
    result.loadMin = fatigueLoads.ready ? fMin : null
    result.loadMax = fatigueLoads.ready ? fMax : null
    result.fatigueFromHeights = fatigueLoads.fromHeights
    result.fatigueIssue = fatigueLoads.issue
    result.fatigueLoadsFallback = fatigueLoads.loadsFallback
    result.fatigueLoadRangeValid = loadRangeValid
    result.shearAmplitude = tauAmp
    result.shearMean = tauMean
    result.fatigueSafetyFactor = fatigue.safetyFactor
    result.fatigueTauU0 = fatigue.tauU0
    result.fatigueMinSafety = fatigue.minSafety
    result.fatigueTargetCycles = targetCycles
    result.fatigueLife = fatigueReady
      ? estimateSpringFatigueLife({ tauMin, tauMax, tensileStrength: Rm, minSafety })
      : 0
    result.fatigueLifePass = isSpringFatigueLifeAtTarget(result.fatigueLife, targetCycles)
    result.fatiguePass = fatigueReady && fatigue.fatiguePass
    result.pass = result.pass && result.fatiguePass
  }

  if (calcMode === 'simple') {
    result.estimateOnly = true
    result.pass = false
  } else if (input.enforceCriticalConfirm) {
    applyReleaseGate(result, auditCriticalInputs('spring', calcMode, input))
  }

  return result
}
