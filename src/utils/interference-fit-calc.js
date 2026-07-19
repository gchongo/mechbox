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

/** 压装力 (N) — DIN 7190 常用：π p d L (μ + 0.02)，0.02 计变形附加 */
export function calcPressForce(pressure, diameter, fitLength, friction = 0.12) {
  return pressure * Math.PI * diameter * fitLength * (friction + 0.02)
}

/**
 * 压入力曲线 F(z) — 接触长度从 0→L，接触压 p 取满配合值（常温过盈）
 * @returns {{ z: number, force: number }[]}
 */
export function calcPressForceCurve(pressure, diameter, fitLength, friction = 0.12, steps = 11) {
  const L = Math.max(0, fitLength ?? 0)
  const n = Math.max(2, Math.min(51, Math.round(steps) || 11))
  const points = []
  for (let i = 0; i < n; i++) {
    const z = L * (i / (n - 1))
    points.push({ z, force: calcPressForce(pressure, diameter, z, friction) })
  }
  return points
}

/**
 * 拆卸力 (N) — 干摩擦，无 0.02 变形附加；μ_ext 默认 ≥ 压装 μ
 */
export function calcExtractionForce(pressure, diameter, fitLength, frictionExtract) {
  const mu = frictionExtract ?? 0.15
  return pressure * Math.PI * diameter * fitLength * mu
}

/**
 * 热装/冷装所需温差（达到装配间隙）
 * 孔热胀：ΔT_heat = (i + c) / (α_h · D)
 * 轴冷缩：ΔT_cool = −(i + c) / (α_s · d)（负值表示降温）
 *
 * @param {{
 *   interference: number,
 *   shaftDiameter: number,
 *   holeDiameter: number,
 *   shaftAlpha?: number,
 *   holeAlpha?: number,
 *   assemblyClearance?: number,
 * }} input
 */
export function calcRequiredAssemblyDeltaT(input) {
  const i = Math.max(0, input.interference ?? 0)
  const c = Math.max(0, input.assemblyClearance ?? 0.02)
  const d = input.shaftDiameter ?? input.holeDiameter ?? 0
  const D = input.holeDiameter ?? d
  const alphaS = input.shaftAlpha ?? 11.5e-6
  const alphaH = input.holeAlpha ?? 11.5e-6
  const need = i + c

  const deltaTHubHeat = alphaH > 0 && D > 0 ? need / (alphaH * D) : Infinity
  const deltaTShaftCool = alphaS > 0 && d > 0 ? -need / (alphaS * d) : -Infinity

  return {
    interference: i,
    assemblyClearance: c,
    diametralNeed: need,
    deltaTHubHeat,
    deltaTShaftCool,
    shaftAlpha: alphaS,
    holeAlpha: alphaH,
  }
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
  const muExtract = input.frictionExtract ?? Math.max(mu, 0.15)
  const pressForce = calcPressForce(contact.pressure, shaftDiameter, L, mu)
  const extractionForce = calcExtractionForce(contact.pressure, shaftDiameter, L, muExtract)
  const pressForceCurve = calcPressForceCurve(contact.pressure, shaftDiameter, L, mu, input.curveSteps ?? 11)
  const torqueCapacity = calcTorqueCapacity(contact.pressure, shaftDiameter, L, mu)

  const nominalI =
    input.interference ?? shaftDiameter - (input.holeDiameter ?? shaftDiameter)
  const assembly = calcRequiredAssemblyDeltaT({
    interference: Math.max(0, nominalI),
    shaftDiameter,
    holeDiameter,
    shaftAlpha: input.shaftAlpha ?? 11.5e-6,
    holeAlpha: input.holeAlpha ?? 11.5e-6,
    assemblyClearance: input.assemblyClearance ?? 0.02,
  })

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
    nominalInterference: nominalI,
    shaftDiameter,
    holeDiameter,
    hubOuterDiameter: input.hubOuterDiameter,
    fitLength: L,
    friction: mu,
    frictionExtract: muExtract,
    thermal,
    assembly,
    ...contact,
    pressForce,
    extractionForce,
    pressForceCurve,
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
