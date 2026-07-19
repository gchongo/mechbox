/**
 * 拉伸 / 扭转螺旋弹簧 — 与压簧并列的简化校核
 * 公式参考：机械设计手册 / GB/T 23935 同类量级
 */
import {
  SPRING_MATERIALS,
  DEFAULT_SPRING_SHEAR_MODULUS,
  DEFAULT_FATIGUE_SAFETY,
  resolveMeanDiameter,
  resolveOuterDiameter,
  calcSpringRate,
  calcWahlFactor,
  calcSpringShearStress,
  calcSpringIndex,
  calcSpringFatigueCheck,
  estimateSpringFatigueLife,
  isSpringFatigueLifeAtTarget,
  resolveSpringTensileStrength,
  validateSpringInputs,
  analyzeSpring as analyzeCompressionSpring,
} from '@/utils/spring-calc'
import { auditCriticalInputs, applyReleaseGate } from '@/utils/critical-input-guard'

export const DEFAULT_SPRING_ELASTIC_MODULUS = 206000

/** 扭转弹簧内侧应力集中 Ki = (4C−1)/(4C−4) */
export function calcTorsionStressFactor(springIndex) {
  const C = springIndex
  if (!(C > 1)) return 1
  return (4 * C - 1) / (4 * C - 4)
}

/** 扭转角刚度 (N·mm/rad)：k_θ = E d⁴ / (64 D n) */
export function calcTorsionAngularRate({ elasticModulus, wireDiameter, meanDiameter, activeCoils }) {
  const E = elasticModulus ?? DEFAULT_SPRING_ELASTIC_MODULUS
  const d = wireDiameter
  const D = meanDiameter
  const n = activeCoils
  if (!d || !D || !n) return 0
  return (E * d ** 4) / (64 * D * n)
}

/** 扭簧弯应力 (MPa)：σ = 32 M Ki / (π d³)，M 为 N·mm */
export function calcTorsionBendingStress(momentNmm, wireDiameter, stressFactor = 1) {
  const d = wireDiameter
  if (!d) return 0
  return (32 * momentNmm * stressFactor) / (Math.PI * d ** 3)
}

/**
 * 弯曲疲劳 Goodman：S = 1 / (σ_a/σ_e + σ_m/Rm)
 * σ_e ≈ 0.45 Rm（圆钢丝弯曲脉动近似）
 */
export function calcBendingFatigueCheck({
  sigmaMin,
  sigmaMax,
  tensileStrength,
  enduranceFactor = 0.45,
  minSafety = DEFAULT_FATIGUE_SAFETY,
}) {
  const Rm = tensileStrength ?? 0
  if (!(Rm > 0) || !(sigmaMax > 0) || sigmaMax < sigmaMin) {
    return {
      safetyFactor: 0,
      fatiguePass: false,
      sigmaE: 0,
      sigmaAmp: 0,
      sigmaMean: 0,
      minSafety,
      invalidLoadRange: sigmaMax < sigmaMin,
    }
  }
  const sigmaAmp = (sigmaMax - sigmaMin) / 2
  const sigmaMean = (sigmaMax + sigmaMin) / 2
  const sigmaE = enduranceFactor * Rm
  const denom = sigmaAmp / sigmaE + sigmaMean / Rm
  const safetyFactor = denom > 0 ? 1 / denom : 0
  return {
    safetyFactor,
    fatiguePass: safetyFactor >= minSafety,
    sigmaE,
    sigmaAmp,
    sigmaMean,
    minSafety,
    invalidLoadRange: false,
  }
}

function resolveRm(input, mat) {
  return resolveSpringTensileStrength({
    material: input.material ?? 'custom',
    wireDiameter: input.wireDiameter,
    tensileStrength: input.tensileStrength,
    tensileStrengthManual: input.tensileStrengthManual ?? false,
    materialDefault: mat.tensileStrength ?? 1600,
  })
}

/** 拉伸螺旋弹簧 */
export function analyzeTensionSpring(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const inputValidation = validateSpringInputs(input)
  const d = input.wireDiameter
  const D = resolveMeanDiameter(input)
  const outerDiameter = resolveOuterDiameter({ ...input, meanDiameter: D })
  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const G = input.shearModulus ?? mat.shearModulus ?? DEFAULT_SPRING_SHEAR_MODULUS
  const rmResolved = resolveRm(input, mat)
  const Rm = rmResolved.value
  const n = input.activeCoils ?? 10
  const k = calcSpringRate({ shearModulus: G, wireDiameter: d, meanDiameter: D, activeCoils: n })
  const C = calcSpringIndex(d, D)
  const K = calcWahlFactor(d, D)

  // 初拉力：τ_i 默认约 100~0.15 Rm 量级，可手填
  const initialStress = input.initialShearStress ?? Math.min(200, 0.12 * Rm)
  const initialTension = (Math.PI * d ** 3 * initialStress) / (8 * D)

  const deflection = input.deflection ?? 0
  const load =
    input.load != null
      ? input.load
      : initialTension + k * deflection
  const workingDeflection =
    input.deflection != null ? input.deflection : k > 0 ? Math.max(0, (load - initialTension) / k) : 0

  const tauBody = calcSpringShearStress(load, d, D)
  const hookFactor = input.hookStressFactor ?? 1.25
  const tauHook = tauBody * hookFactor
  const allow = input.allowableShear ?? mat.allowableShear ?? 600
  const shearPass = inputValidation.valid && tauBody <= allow && tauHook <= allow * 1.15

  const result = {
    calcMode,
    springType: 'tension',
    wireDiameter: d,
    meanDiameter: D,
    outerDiameter,
    springRate: k,
    shearModulus: G,
    tensileStrength: Rm,
    rmSource: rmResolved.source,
    force: load,
    deflection: workingDeflection,
    initialTension,
    initialShearStress: initialStress,
    shearStress: tauBody,
    hookShearStress: tauHook,
    hookStressFactor: hookFactor,
    wahlFactor: K,
    springIndex: C,
    allowableShear: allow,
    shearPass,
    materialLabel: mat.label,
    pass: inputValidation.valid && shearPass,
    inputValidation,
    estimateOnly: calcMode === 'simple',
  }

  if (calcMode === 'professional') {
    const fMin = input.loadMin ?? initialTension
    const fMax = input.loadMax ?? load
    const loadRangeValid = fMax >= fMin && fMin >= 0 && fMax > 0
    const tauMin = loadRangeValid ? calcSpringShearStress(fMin, d, D) : 0
    const tauMax = loadRangeValid ? calcSpringShearStress(fMax, d, D) : 0
    const targetCycles = input.targetCycles ?? 1e6
    const minSafety = input.fatigueSafety ?? DEFAULT_FATIGUE_SAFETY
    const fatigueReady = inputValidation.valid && loadRangeValid && tauMax > 0
    const fatigue = fatigueReady
      ? calcSpringFatigueCheck({ tauMin, tauMax, tensileStrength: Rm, targetCycles, minSafety })
      : { safetyFactor: 0, fatiguePass: false, tauU0: 0, minSafety }
    result.loadMin = loadRangeValid ? fMin : null
    result.loadMax = loadRangeValid ? fMax : null
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
    result.pass = false
  } else if (input.enforceCriticalConfirm) {
    applyReleaseGate(result, auditCriticalInputs('spring', calcMode, input))
  }

  return result
}

/** 扭转螺旋弹簧 */
export function analyzeTorsionSpring(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const inputValidation = validateSpringInputs(input)
  const d = input.wireDiameter
  const D = resolveMeanDiameter(input)
  const outerDiameter = resolveOuterDiameter({ ...input, meanDiameter: D })
  const matKey = input.material ?? 'custom'
  const mat = SPRING_MATERIALS[matKey] ?? SPRING_MATERIALS.custom
  const E = input.elasticModulus ?? DEFAULT_SPRING_ELASTIC_MODULUS
  const rmResolved = resolveRm(input, mat)
  const Rm = rmResolved.value
  const n = input.activeCoils ?? 10
  const C = calcSpringIndex(d, D)
  const Ki = calcTorsionStressFactor(C)
  const angularRate = calcTorsionAngularRate({
    elasticModulus: E,
    wireDiameter: d,
    meanDiameter: D,
    activeCoils: n,
  })

  // moment: N·mm；angleDeg 可选
  const moment =
    input.moment != null
      ? input.moment
      : input.angleDeg != null && angularRate > 0
        ? angularRate * ((input.angleDeg * Math.PI) / 180)
        : 0
  const angleRad = angularRate > 0 ? moment / angularRate : 0
  const angleDeg = (angleRad * 180) / Math.PI
  const sigma = calcTorsionBendingStress(moment, d, Ki)
  const allowBend = input.allowableBending ?? Math.round(0.6 * Rm)
  const bendPass = inputValidation.valid && sigma <= allowBend

  const result = {
    calcMode,
    springType: 'torsion',
    wireDiameter: d,
    meanDiameter: D,
    outerDiameter,
    elasticModulus: E,
    tensileStrength: Rm,
    rmSource: rmResolved.source,
    activeCoils: n,
    springIndex: C,
    stressFactor: Ki,
    angularRate,
    angularRatePerDeg: angularRate * (Math.PI / 180),
    moment,
    angleDeg,
    bendingStress: sigma,
    allowableBending: allowBend,
    bendPass,
    materialLabel: mat.label,
    pass: inputValidation.valid && bendPass,
    inputValidation,
    estimateOnly: calcMode === 'simple',
  }

  if (calcMode === 'professional') {
    const mMin = input.momentMin ?? 0
    const mMax = input.momentMax ?? moment
    const loadRangeValid = mMax >= mMin && mMax > 0
    const sigmaMin = loadRangeValid ? calcTorsionBendingStress(mMin, d, Ki) : 0
    const sigmaMax = loadRangeValid ? calcTorsionBendingStress(mMax, d, Ki) : 0
    const minSafety = input.fatigueSafety ?? DEFAULT_FATIGUE_SAFETY
    const fatigueReady = inputValidation.valid && loadRangeValid
    const fatigue = fatigueReady
      ? calcBendingFatigueCheck({
          sigmaMin,
          sigmaMax,
          tensileStrength: Rm,
          minSafety,
        })
      : { safetyFactor: 0, fatiguePass: false, minSafety }
    result.momentMin = loadRangeValid ? mMin : null
    result.momentMax = loadRangeValid ? mMax : null
    result.fatigueSafetyFactor = fatigue.safetyFactor
    result.fatigueSigmaE = fatigue.sigmaE
    result.fatigueMinSafety = fatigue.minSafety
    result.bendingAmplitude = fatigue.sigmaAmp
    result.bendingMean = fatigue.sigmaMean
    result.fatiguePass = fatigueReady && fatigue.fatiguePass
    result.pass = result.pass && result.fatiguePass
  }

  if (calcMode === 'simple') {
    result.pass = false
  } else if (input.enforceCriticalConfirm) {
    applyReleaseGate(result, auditCriticalInputs('spring', calcMode, input))
  }

  return result
}

/** 按类型分发：压缩 / 拉伸 / 扭转 */
export function analyzeSpringByType(input = {}) {
  const springType = input.springType ?? 'compression'
  if (springType === 'tension') return analyzeTensionSpring(input)
  if (springType === 'torsion') return analyzeTorsionSpring(input)
  return analyzeCompressionSpring({ ...input, springType: 'compression' })
}
