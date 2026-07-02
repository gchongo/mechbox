/** 液压缸 / 气缸计算 */

export function calcCylinderArea(diameter, rodDiameter = 0) {
  const D = diameter
  const d = rodDiameter
  const bore = (Math.PI * D ** 2) / 4
  const annular = d > 0 ? (Math.PI * (D ** 2 - d ** 2)) / 4 : bore
  return { bore, annular, rod: d > 0 ? (Math.PI * d ** 2) / 4 : 0 }
}

export function calcCylinderForce(pressure, area) {
  return (pressure * area) / 1000 // MPa·mm² → N (pressure in MPa, area mm²)
}

export function calcFlowRate(area, velocity) {
  return (area * velocity * 60) / 1e6 // L/min
}

export function analyzeHydraulicCylinder(input) {
  const areas = calcCylinderArea(input.boreDiameter, input.rodDiameter)
  const extendForce = calcCylinderForce(input.pressure, areas.bore)
  const retractForce = calcCylinderForce(input.pressure, areas.annular)
  const extendVel = input.flowRate
    ? (input.flowRate * 1e6) / (60 * areas.bore)
    : input.velocity ?? 0
  const retractVel = input.flowRate
    ? (input.flowRate * 1e6) / (60 * areas.annular)
    : input.velocity ?? 0

  return {
    ...areas,
    extendForce,
    retractForce,
    extendVelocity: extendVel,
    retractVelocity: retractVel,
    extendFlow: calcFlowRate(areas.bore, extendVel),
    retractFlow: calcFlowRate(areas.annular, retractVel),
    pressure: input.pressure,
  }
}

export function analyzePneumaticCylinder(input) {
  const efficiency = input.efficiency ?? 0.85
  const result = analyzeHydraulicCylinder(input)
  return {
    ...result,
    extendForce: result.extendForce * efficiency,
    retractForce: result.retractForce * efficiency,
    efficiency,
    type: 'pneumatic',
  }
}
