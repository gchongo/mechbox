/**
 * 过盈配合计算 (DIN 7190 / 弹性理论简化)
 * 实心轴 + 厚壁轮毂，估算接触压力、压装力与传递扭矩
 */

const D2_STAR = {
  2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534,
  7: 2.704, 8: 2.847, 9: 2.97, 10: 3.078,
}

function hubCompliance(ri, ro, E, nu) {
  if (ro <= ri) return 0
  return ((1 - nu) / E) * ((ro * ro + ri * ri) / (ro * ro - ri * ri))
}

function shaftCompliance(E, nu) {
  return (1 - nu) / E
}

/** 径向接触压力 (MPa) */
export function calcContactPressure({
  interference,
  holeDiameter,
  hubOuterDiameter,
  shaftE = 210000,
  hubE = 210000,
  shaftNu = 0.3,
  hubNu = 0.3,
}) {
  const i = interference
  if (i <= 0) return { error: '过盈量须大于 0（轴径 > 孔径）' }

  const ri = holeDiameter / 2
  const ro = hubOuterDiameter / 2
  if (ro <= ri) return { error: '轮毂外径须大于孔径' }

  const deltaR = i / 2
  const lambdaH = hubCompliance(ri, ro, hubE, hubNu)
  const lambdaS = shaftCompliance(shaftE, shaftNu)
  const denom = ri * (lambdaH + lambdaS)
  if (!denom) return { error: '几何或材料参数无效' }

  const pressure = deltaR / denom
  const hoopHub = pressure * ((ro * ro + ri * ri) / (ro * ro - ri * ri))
  const hoopShaft = pressure

  return {
    pressure,
    hoopHub,
    hoopShaft,
    radialInterference: deltaR,
    lambdaH,
    lambdaS,
  }
}

/** 压装力 (N) — 锥度 0 时 F ≈ p · π · d · L · (μ + 0.02) 经验修正 */
export function calcPressForce(pressure, diameter, fitLength, friction = 0.12) {
  return pressure * Math.PI * diameter * fitLength * (friction + 0.02)
}

/** 传递扭矩 (N·mm) T = p · π · d² · L · μ / 2 */
export function calcTorqueCapacity(pressure, diameter, fitLength, friction = 0.12) {
  return (pressure * Math.PI * diameter * diameter * fitLength * friction) / 2
}

export function analyzeInterferenceFit(input) {
  const shaftDiameter = input.shaftDiameter
  const holeDiameter = input.holeDiameter ?? shaftDiameter - (input.interference ?? 0)
  const interference = input.interference ?? shaftDiameter - holeDiameter

  const contact = calcContactPressure({
    interference,
    holeDiameter,
    hubOuterDiameter: input.hubOuterDiameter,
    shaftE: input.shaftE,
    hubE: input.hubE,
    shaftNu: input.shaftNu,
    hubNu: input.hubNu,
  })
  if (contact.error) return { error: contact.error }

  const L = input.fitLength ?? 30
  const mu = input.friction ?? 0.12
  const pressForce = calcPressForce(contact.pressure, shaftDiameter, L, mu)
  const torqueCapacity = calcTorqueCapacity(contact.pressure, shaftDiameter, L, mu)

  const minHubWall = (input.hubOuterDiameter - holeDiameter) / 2
  const thinWallWarning = minHubWall < shaftDiameter * 0.1

  return {
    interference,
    shaftDiameter,
    holeDiameter,
    hubOuterDiameter: input.hubOuterDiameter,
    fitLength: L,
    friction: mu,
    ...contact,
    pressForce,
    torqueCapacity,
    torqueCapacityNm: torqueCapacity / 1000,
    minHubWall,
    thinWallWarning,
    pass: contact.pressure > 0 && contact.pressure < (input.allowPressure ?? Infinity),
  }
}

export { D2_STAR }
