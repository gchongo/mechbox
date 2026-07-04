/**
 * 过盈配合 — 简化 / 完整 Lame（空心轴）/ 专业（温变修正）
 */
import { calcFitChange } from '@/utils/thermal-expansion-calc'
import { auditCriticalInputs, applyReleaseGate } from '@/utils/critical-input-guard'

/** 轮毂径向柔度 — 厚壁圆筒平面应力：C_h = (1/E)[(r_o²+r_i²)/(r_o²-r_i²) + ν] */
function hubCompliance(ri, ro, E, nu) {
  if (ro <= ri) return 0
  return (1 / E) * ((ro * ro + ri * ri) / (ro * ro - ri * ri) + nu)
}

/** 实心轴径向柔度 — C_s = (1−ν)/E */
function shaftComplianceSolid(E, nu) {
  return (1 - nu) / E
}

/** 空心轴外压柔度 — 内表面自由、外表面接触压 p（厚壁圆筒平面应力） */
function shaftComplianceHollow(ri, ro, E, nu) {
  if (ro <= ri || ri <= 0) return shaftComplianceSolid(E, nu)
  return (1 / E) * ((ro * ro + ri * ri) / (ro * ro - ri * ri) + nu)
}

/** 径向接触压力 (MPa) — 实心轴 + 厚壁轮毂 */
export function calcContactPressure({
  interference,
  holeDiameter,
  hubOuterDiameter,
  shaftE = 210000,
  hubE = 210000,
  shaftNu = 0.3,
  hubNu = 0.3,
  shaftInnerDiameter = 0,
  shaftDiameter,
}) {
  const i = interference
  if (i <= 0) return { errorKey: 'interference_positive' }

  const ri = holeDiameter / 2
  const ro = hubOuterDiameter / 2
  if (ro <= ri) return { errorKey: 'hub_outer_gt_bore' }

  const deltaR = i / 2
  const lambdaH = hubCompliance(ri, ro, hubE, hubNu)

  const shaftRo = (shaftDiameter ?? holeDiameter + i) / 2
  const shaftRi = (shaftInnerDiameter ?? 0) / 2
  const lambdaS =
    shaftInnerDiameter > 0
      ? shaftComplianceHollow(shaftRi, shaftRo, shaftE, shaftNu)
      : shaftComplianceSolid(shaftE, shaftNu)

  const denom = ri * (lambdaH + lambdaS)
  if (!denom) return { errorKey: 'invalid_geometry' }

  const pressure = deltaR / denom
  const hoopHub = pressure * ((ro * ro + ri * ri) / (ro * ro - ri * ri))
  const hoopShaft = pressure * (shaftInnerDiameter > 0 ? 2 * shaftRo ** 2 / (shaftRo ** 2 - shaftRi ** 2) : 1)

  return {
    pressure,
    hoopHub,
    hoopShaft,
    radialInterference: deltaR,
    lambdaH,
    lambdaS,
    hollowShaft: shaftInnerDiameter > 0,
  }
}

/** 压装力 (N) */
export function calcPressForce(pressure, diameter, fitLength, friction = 0.12) {
  return pressure * Math.PI * diameter * fitLength * (friction + 0.02)
}

/** 传递扭矩 (N·mm) */
export function calcTorqueCapacity(pressure, diameter, fitLength, friction = 0.12) {
  return (pressure * Math.PI * diameter * diameter * fitLength * friction) / 2
}

export function analyzeInterferenceFit(input) {
  const calcMode = input.calcMode ?? 'simple'
  const shaftDiameter = input.shaftDiameter
  let holeDiameter = input.holeDiameter ?? shaftDiameter - (input.interference ?? 0)
  let interference = input.interference ?? shaftDiameter - holeDiameter

  let thermal = null
  if (calcMode === 'professional' && input.deltaT != null && input.deltaT !== 0) {
    thermal = calcFitChange({
      shaftDiameter,
      holeDiameter,
      shaftAlpha: input.shaftAlpha ?? 11.5e-6,
      holeAlpha: input.holeAlpha ?? 11.5e-6,
      deltaT: input.deltaT,
      initialInterference: interference,
    })
    interference = thermal.finalInterference
    if (thermal.becomesClearance) {
      return {
        errorKey: 'clearance_after_thermal',
        thermal,
        calcMode,
      }
    }
  }

  const contact = calcContactPressure({
    interference,
    holeDiameter,
    hubOuterDiameter: input.hubOuterDiameter,
    shaftE: input.shaftE,
    hubE: input.hubE,
    shaftNu: input.shaftNu,
    hubNu: input.hubNu,
    shaftInnerDiameter: calcMode === 'simple' ? 0 : input.shaftInnerDiameter ?? 0,
    shaftDiameter,
  })
  if (contact.errorKey) return { errorKey: contact.errorKey, thermal, calcMode }

  const L = input.fitLength ?? 30
  const mu = input.friction ?? 0.12
  const pressForce = calcPressForce(contact.pressure, shaftDiameter, L, mu)
  const torqueCapacity = calcTorqueCapacity(contact.pressure, shaftDiameter, L, mu)

  const minHubWall = (input.hubOuterDiameter - holeDiameter) / 2
  const thinWallWarning = minHubWall < shaftDiameter * 0.1

  const shaftAllow = input.shaftAllowHoop ?? 350
  const hubAllow = input.hubAllowHoop ?? 350
  const stressPass = contact.hoopShaft <= shaftAllow && contact.hoopHub <= hubAllow
  const estimateOnly = calcMode === 'simple'
  const result = {
    calcMode,
    estimateOnly,
    interference,
    nominalInterference: input.interference ?? shaftDiameter - (input.holeDiameter ?? shaftDiameter),
    shaftDiameter,
    holeDiameter,
    hubOuterDiameter: input.hubOuterDiameter,
    fitLength: L,
    friction: mu,
    thermal,
    ...contact,
    pressForce,
    torqueCapacity,
    torqueCapacityNm: torqueCapacity / 1000,
    minHubWall,
    thinWallWarning,
    shaftAllowHoop: shaftAllow,
    hubAllowHoop: hubAllow,
    hoopPass: stressPass,
    pass:
      contact.pressure > 0 &&
      contact.pressure < (input.allowPressure ?? Infinity) &&
      stressPass,
  }

  if (calcMode === 'simple') {
    result.pass = false
  } else if (input.enforceCriticalConfirm) {
    applyReleaseGate(result, auditCriticalInputs('interference-fit', calcMode, input))
  }

  return result
}
