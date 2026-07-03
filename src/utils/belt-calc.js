/** 开口皮带 / V 带传动 */

export function calcBeltLength(D1, D2, centerDistance) {
  const C = centerDistance
  if (!C) return 0
  return 2 * C + (Math.PI * (D1 + D2)) / 2 + ((D2 - D1) ** 2) / (4 * C)
}

export function calcDriveRatio(drivenDiameter, driverDiameter) {
  if (!driverDiameter) return 0
  return drivenDiameter / driverDiameter
}

export function calcBeltSpeed(diameter, rpm) {
  return (Math.PI * diameter * rpm) / 60000
}

/** 包角 (度) 由几何计算 */
export function calcWrapAngle(driverDiameter, drivenDiameter, centerDistance) {
  const C = centerDistance
  if (!C || drivenDiameter <= driverDiameter) return 180
  const sinArg = (drivenDiameter - driverDiameter) / (2 * C)
  if (sinArg >= 1) return 120
  const angle = 180 - (2 * Math.asin(sinArg) * 180) / Math.PI
  return Math.max(120, Math.min(210, angle))
}

export function calcBeltTension({ power, speed, efficiency = 0.95, wrapAngle = 180, friction = 0.3 }) {
  if (!speed) return { F1: 0, F2: 0, F: 0 }
  const F = (power * 1000) / (speed * efficiency)
  const theta = (wrapAngle * Math.PI) / 180
  const ratio = Math.exp(friction * theta)
  if (ratio <= 1) return { F1: F, F2: 0, F }
  const F2 = F / (ratio - 1)
  const F1 = F2 * ratio
  return { F1, F2, effectiveForce: F }
}

/** V 带根数估算 */
export function calcBeltCount(power, powerPerBelt, serviceFactor = 1.2) {
  if (!powerPerBelt) return 1
  return Math.ceil((power * serviceFactor) / powerPerBelt)
}

export function analyzeBeltDrive(input) {
  const calcMode = input.calcMode ?? 'simple'
  const D1 = input.driverDiameter
  const D2 = input.drivenDiameter
  const C = input.centerDistance
  const ratio = calcDriveRatio(D2, D1)
  const length = calcBeltLength(D1, D2, C)
  const speed = calcBeltSpeed(D1, input.rpm ?? 0)

  const wrapAngle =
    calcMode === 'simple'
      ? input.wrapAngle ?? 180
      : calcWrapAngle(D1, D2, C)

  const serviceFactor = calcMode === 'professional' ? input.serviceFactor ?? 1.2 : 1
  const power = (input.power ?? (input.torque * 2 * Math.PI * input.rpm) / 60000) * serviceFactor

  const tension = calcBeltTension({
    power,
    speed,
    efficiency: input.efficiency ?? 0.95,
    wrapAngle,
    friction: input.friction ?? 0.3,
  })

  const result = {
    calcMode,
    ratio,
    beltLength: length,
    beltSpeed: speed,
    power: power / serviceFactor,
    designPower: power,
    wrapAngle,
    drivenRpm: input.rpm / ratio,
    ...tension,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const powerPerBelt = input.powerPerBelt ?? power
    result.beltCount = calcBeltCount(power / serviceFactor, powerPerBelt, 1)
    result.powerPerBelt = powerPerBelt
    const maxSpeed = input.maxBeltSpeed ?? 30
    result.maxBeltSpeed = maxSpeed
    result.speedPass = speed <= maxSpeed
    result.pass = result.speedPass
  }

  if (calcMode === 'professional') {
    result.serviceFactor = serviceFactor
    result.beltCount = calcBeltCount(power / serviceFactor, input.powerPerBelt ?? power, serviceFactor)
    const flexStress = tension.F1 / (input.beltSection ?? 80)
    result.flexStress = flexStress
    result.flexPass = flexStress <= (input.allowTension ?? 600)
    const lifeBase = 1e4
    const lifeFactor = (input.allowTension ?? 600) / Math.max(tension.F1, 1)
    result.estimatedLifeHours = lifeBase * lifeFactor ** 3
    result.pass = result.speedPass && result.flexPass
  }

  return result
}
