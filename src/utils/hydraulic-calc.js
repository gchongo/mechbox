/** 液压缸 / 气缸计算 */
import { auditCriticalInputs, applyReleaseGate } from '@/utils/critical-input-guard'

export function calcCylinderArea(diameter, rodDiameter = 0) {
  const D = diameter
  const d = rodDiameter
  const bore = (Math.PI * D ** 2) / 4
  const annular = d > 0 ? (Math.PI * (D ** 2 - d ** 2)) / 4 : bore
  return { bore, annular, rod: d > 0 ? (Math.PI * d ** 2) / 4 : 0 }
}

export function calcCylinderForce(pressure, area) {
  // p (MPa) × A (mm²) = N  (1 MPa = 1 N/mm²)
  return pressure * area
}

export function calcFlowRate(area, velocity) {
  return (area * velocity * 60) / 1e6
}

/**
 * Euler 等效长度系数 K：L_e = K·L
 * 非“约束度分数”；须与两端边界条件一一对应
 */
export const END_FIXITY_PRESETS = {
  fixed_fixed: { K: 0.5, labelKey: 'fixedFixed' },
  fixed_pinned: { K: 1 / Math.sqrt(2), labelKey: 'fixedPinned' },
  pinned_pinned: { K: 1.0, labelKey: 'pinnedPinned' },
  fixed_free: { K: 2.0, labelKey: 'fixedFree' },
}

export const END_FIXITY_DEFINITION =
  'Le = K·L (Euler effective length); K maps to end restraints — not a generic fixity fraction'

/** @returns {{ K: number, preset: string|null, custom?: boolean, fallback?: boolean }} */
export function resolveEffectiveLengthFactor(endFixity = 'pinned_pinned') {
  if (typeof endFixity === 'string' && END_FIXITY_PRESETS[endFixity]) {
    return { K: END_FIXITY_PRESETS[endFixity].K, preset: endFixity }
  }
  const K = Number(endFixity)
  if (Number.isFinite(K) && K > 0) {
    return { K, preset: null, custom: true }
  }
  return { K: END_FIXITY_PRESETS.pinned_pinned.K, preset: 'pinned_pinned', fallback: true }
}

/** 活塞杆柱屈曲 — Euler（弹性）与 Johnson（弹塑性）取较小值 */
export function calcRodBucklingLoad(
  rodDiameter,
  length,
  yieldStrength = 235,
  endFixity = 'pinned_pinned',
) {
  const d = rodDiameter
  const L = length
  if (!d || !L) {
    return {
      criticalLoad: 0,
      effectiveLengthFactor: null,
      effectiveLength: null,
      slenderness: null,
      governingMode: null,
    }
  }

  const { K, preset } = resolveEffectiveLengthFactor(endFixity)
  const A = (Math.PI * d ** 2) / 4
  const I = (Math.PI * d ** 4) / 64
  const r = Math.sqrt(I / A)
  const E = 210000
  const Fy = yieldStrength
  const Le = K * L
  if (!Le || !r) {
    return {
      criticalLoad: 0,
      effectiveLengthFactor: K,
      effectiveLength: Le,
      slenderness: null,
      governingMode: null,
      endFixityPreset: preset,
    }
  }

  const P_euler = (Math.PI ** 2 * E * I) / (Le ** 2)
  const P_yield = A * Fy
  const slenderness = Le / r

  let criticalLoad
  let governingMode
  if (P_euler <= P_yield) {
    criticalLoad = P_euler
    governingMode = 'euler'
  } else {
    const sigmaJohnson = Fy - (Fy ** 2 / (4 * Math.PI ** 2 * E)) * slenderness ** 2
    const P_johnson = A * Math.max(0, sigmaJohnson)
    criticalLoad = Math.min(P_yield, P_johnson)
    governingMode = P_johnson <= P_yield ? 'johnson' : 'yield'
  }

  return {
    criticalLoad,
    effectiveLengthFactor: K,
    effectiveLength: Le,
    slenderness,
    governingMode,
    eulerLoad: P_euler,
    yieldLoad: P_yield,
    endFixityPreset: preset,
    endFixityDefinition: END_FIXITY_DEFINITION,
  }
}

export function analyzeHydraulicCylinder(input) {
  const calcMode = input.calcMode ?? 'simple'
  const boreDiameter = input.boreDiameter
  const rodDiameter = input.rodDiameter ?? 0
  const pressure = input.pressure
  if (!Number.isFinite(boreDiameter) || boreDiameter <= 0) return { errorKey: 'invalid_bore_diameter', calcMode }
  if (!Number.isFinite(rodDiameter) || rodDiameter < 0 || rodDiameter >= boreDiameter) return { errorKey: 'invalid_rod_diameter', calcMode }
  if (pressure == null || !Number.isFinite(pressure) || pressure < 0) return { errorKey: 'invalid_pressure', calcMode }
  const areas = calcCylinderArea(boreDiameter, rodDiameter)
  const extendForce = calcCylinderForce(input.pressure, areas.bore)
  const retractForce = calcCylinderForce(input.pressure, areas.annular)
  const extendVel = input.flowRate
    ? (input.flowRate * 1e6) / (60 * areas.bore)
    : input.velocity ?? 0
  const retractVel = input.flowRate
    ? (input.flowRate * 1e6) / (60 * areas.annular)
    : input.velocity ?? 0

  const result = {
    calcMode,
    ...areas,
    extendForce,
    retractForce,
    extendVelocity: extendVel,
    retractVelocity: retractVel,
    extendFlow: calcFlowRate(areas.bore, extendVel),
    retractFlow: calcFlowRate(areas.annular, retractVel),
    pressure: input.pressure,
    type: 'hydraulic',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const load = input.externalLoad ?? 0
    result.externalLoad = load
    result.extendMargin = extendForce - load
    result.retractMargin = retractForce - load
    result.loadPass = extendForce >= load && retractForce >= load

    if (input.strokeLength && extendVel) {
      result.cycleTimeExtend = input.strokeLength / extendVel
    }
    if (input.strokeLength && retractVel) {
      result.cycleTimeRetract = input.strokeLength / retractVel
    }

    if (input.rodDiameter && input.strokeLength) {
      const buckling = calcRodBucklingLoad(
        input.rodDiameter,
        input.strokeLength,
        input.yieldStrength ?? 235,
        input.endFixity ?? 'pinned_pinned',
      )
      // 杆屈曲仅对压缩载荷；默认外载在缩回工况使杆受压（可显式覆盖）
      const compressiveLoad =
        input.rodCompressiveLoad ??
        (input.compressOnRetract !== false ? Math.max(0, load) : 0)
      result.rodCompressiveLoad = compressiveLoad
      result.bucklingLoad = buckling.criticalLoad
      result.buckling = {
        ...buckling,
        compressiveLoad,
        bucklingPass:
          compressiveLoad <= 0
            ? null
            : compressiveLoad <= buckling.criticalLoad,
        checkSkipped: compressiveLoad <= 0,
        safetyFactor:
          compressiveLoad > 0 && buckling.criticalLoad > 0
            ? buckling.criticalLoad / compressiveLoad
            : null,
      }
      result.bucklingPass =
        result.buckling.bucklingPass === null ? true : result.buckling.bucklingPass
      result.pass = result.loadPass && result.bucklingPass
    } else {
      result.pass = result.loadPass
    }
    if (load > 0) {
      result.requiredPressureExtend = load / areas.bore
      result.requiredPressureRetract = load / areas.annular
    }
  }

  if (calcMode === 'professional') {
    const mass = input.loadMass ?? 0
    const accel = input.acceleration ?? 0
    const dynamicLoad = mass * 9.81 + mass * accel
    result.dynamicLoad = dynamicLoad
    const cushion = input.cushionPressure ?? input.pressure * 0.3
    result.cushionPressure = cushion
    result.cushionForce = calcCylinderForce(cushion, areas.bore)
    result.pass =
      result.pass !== false &&
      extendForce >= dynamicLoad &&
      (result.bucklingPass !== false)
  }

  if (calcMode === 'simple') {
    result.estimateOnly = true
    result.pass = false
  } else if (input.enforceCriticalConfirm) {
    applyReleaseGate(result, auditCriticalInputs('cylinder', calcMode, input))
  }

  return result
}

export function analyzePneumaticCylinder(input) {
  const calcMode = input.calcMode ?? 'simple'
  const efficiency = input.efficiency ?? 0.85
  if (!Number.isFinite(efficiency) || efficiency <= 0 || efficiency > 1) return { errorKey: 'invalid_efficiency', calcMode }
  const result = analyzeHydraulicCylinder({ ...input, calcMode })
  const extendForce = result.extendForce * efficiency
  const retractForce = result.retractForce * efficiency
  const updated = {
    ...result,
    extendForce,
    retractForce,
    efficiency,
    type: 'pneumatic',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const load = result.externalLoad ?? input.externalLoad ?? 0
    updated.extendMargin = extendForce - load
    updated.retractMargin = retractForce - load
    updated.loadPass = extendForce >= load && retractForce >= load

    const bucklingPass = updated.bucklingPass !== false
    updated.pass = updated.loadPass && bucklingPass

    if (calcMode === 'professional') {
      const dynamicLoad =
        updated.dynamicLoad ?? ((input.loadMass ?? 0) * 9.81 + (input.loadMass ?? 0) * (input.acceleration ?? 0))
      updated.dynamicLoad = dynamicLoad
      updated.pass = updated.pass && extendForce >= dynamicLoad && bucklingPass
    }
  }

  if (updated.releaseBlocked) {
    updated.pass = false
  }

  return updated
}
