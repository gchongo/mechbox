/** 开口皮带传动 (平皮带 / V 带简化) */

export function calcBeltLength(D1, D2, centerDistance) {
  const C = centerDistance
  return 2 * C + (Math.PI * (D1 + D2)) / 2 + ((D2 - D1) ** 2) / (4 * C)
}

export function calcDriveRatio(drivenDiameter, driverDiameter) {
  return drivenDiameter / driverDiameter
}

export function calcBeltSpeed(diameter, rpm) {
  return (Math.PI * diameter * rpm) / 60000
}

export function calcBeltTension({ power, speed, efficiency = 0.95, wrapAngle = 180, friction = 0.3 }) {
  if (!speed) return { F1: 0, F2: 0, F: 0 }
  const F = (power * 1000) / speed
  const theta = (wrapAngle * Math.PI) / 180
  const ratio = Math.exp(friction * theta)
  const F2 = F / (ratio - 1)
  const F1 = F2 * ratio
  return { F1, F2, effectiveForce: F }
}

export function analyzeBeltDrive(input) {
  const ratio = calcDriveRatio(input.drivenDiameter, input.driverDiameter)
  const length = calcBeltLength(input.driverDiameter, input.drivenDiameter, input.centerDistance)
  const speed = calcBeltSpeed(input.driverDiameter, input.rpm)
  const power = input.power ?? (input.torque * 2 * Math.PI * input.rpm) / 60000
  const tension = calcBeltTension({
    power,
    speed,
    efficiency: input.efficiency,
    wrapAngle: input.wrapAngle,
    friction: input.friction,
  })

  return {
    ratio,
    beltLength: length,
    beltSpeed: speed,
    power,
    ...tension,
    drivenRpm: input.rpm / ratio,
  }
}
