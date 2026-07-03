/** 液压缸 / 气缸计算 */

export function calcCylinderArea(diameter, rodDiameter = 0) {
  const D = diameter
  const d = rodDiameter
  const bore = (Math.PI * D ** 2) / 4
  const annular = d > 0 ? (Math.PI * (D ** 2 - d ** 2)) / 4 : bore
  return { bore, annular, rod: d > 0 ? (Math.PI * d ** 2) / 4 : 0 }
}

export function calcCylinderForce(pressure, area) {
  return (pressure * area) / 1000
}

export function calcFlowRate(area, velocity) {
  return (area * velocity * 60) / 1e6
}

/** 活塞杆柱屈曲 — Euler（弹性）与 Johnson（弹塑性）取较小值，返回临界载荷 (N) */
export function calcRodBucklingLoad(rodDiameter, length, yieldStrength = 235, endFixity = 0.5) {
  const d = rodDiameter
  const L = length
  if (!d || !L) return 0

  const A = (Math.PI * d ** 2) / 4
  const I = (Math.PI * d ** 4) / 64
  const r = Math.sqrt(I / A)
  const E = 210000
  const Fy = yieldStrength
  const Le = endFixity * L
  if (!Le || !r) return 0

  const P_euler = (Math.PI ** 2 * E * I) / (Le ** 2)
  const P_yield = A * Fy
  const slenderness = Le / r

  if (P_euler <= P_yield) {
    return P_euler
  }

  const sigmaJohnson = Fy - (Fy ** 2 / (4 * Math.PI ** 2 * E)) * slenderness ** 2
  const P_johnson = A * Math.max(0, sigmaJohnson)
  return Math.min(P_yield, P_johnson)
}

export function analyzeHydraulicCylinder(input) {
  const calcMode = input.calcMode ?? 'simple'
  const areas = calcCylinderArea(input.boreDiameter, input.rodDiameter)
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
    if (input.rodDiameter && input.strokeLength) {
      const buckling = calcRodBucklingLoad(
        input.rodDiameter,
        input.strokeLength,
        input.yieldStrength ?? 235,
        input.endFixity ?? 0.5,
      )
      result.bucklingLoad = buckling
      result.bucklingPass = load <= buckling
      result.pass = result.loadPass && result.bucklingPass
    } else {
      result.pass = result.loadPass
    }
    if (load > 0) {
      result.requiredPressureExtend = (load * 1000) / areas.bore
      result.requiredPressureRetract = (load * 1000) / areas.annular
    }
  }

  if (calcMode === 'professional') {
    const mass = input.loadMass ?? 0
    const accel = input.acceleration ?? 0
    const dynamicLoad = mass * 9.81 + mass * accel
    result.dynamicLoad = dynamicLoad
    result.cycleTimeExtend = input.strokeLength && extendVel ? input.strokeLength / extendVel : null
    result.cycleTimeRetract = input.strokeLength && retractVel ? input.strokeLength / retractVel : null
    const cushion = input.cushionPressure ?? input.pressure * 0.3
    result.cushionPressure = cushion
    result.cushionForce = calcCylinderForce(cushion, areas.bore)
    result.pass =
      (result.pass !== false) &&
      extendForce >= dynamicLoad &&
      (result.bucklingPass !== false)
  }

  return result
}

export function analyzePneumaticCylinder(input) {
  const efficiency = input.efficiency ?? 0.85
  const result = analyzeHydraulicCylinder({ ...input, calcMode: input.calcMode ?? 'simple' })
  return {
    ...result,
    extendForce: result.extendForce * efficiency,
    retractForce: result.retractForce * efficiency,
    efficiency,
    type: 'pneumatic',
  }
}
