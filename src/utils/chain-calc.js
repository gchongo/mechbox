/** 滚子链传动 (GB/T 1243 简化) */

export function calcChainRatio(drivenTeeth, driverTeeth) {
  return drivenTeeth / driverTeeth
}

export function calcChainLength(pitch, z1, z2, centerDistance) {
  const p = pitch
  const C = centerDistance
  const Lp = (2 * C) / p + (z1 + z2) / 2 + (p * (z2 - z1) ** 2) / (4 * Math.PI ** 2 * C)
  return Math.ceil(Lp) * p
}

export function calcChainSpeed(pitch, teeth, rpm) {
  return (pitch * teeth * rpm) / 60000
}

export function calcChainTension({ power, speed, efficiency = 0.98 }) {
  if (!speed) return 0
  return (power * 1000) / speed / efficiency
}

export function analyzeChainDrive(input) {
  const ratio = calcChainRatio(input.drivenTeeth, input.driverTeeth)
  const length = calcChainLength(
    input.pitch,
    input.driverTeeth,
    input.drivenTeeth,
    input.centerDistance,
  )
  const speed = calcChainSpeed(input.pitch, input.driverTeeth, input.rpm)
  const power = input.power ?? (input.torque * 2 * Math.PI * input.rpm) / 60000
  const tension = calcChainTension({ power, speed, efficiency: input.efficiency })

  return {
    ratio,
    chainLength: length,
    chainSpeed: speed,
    power,
    chainTension: tension,
    drivenRpm: input.rpm / ratio,
    links: Math.ceil(length / input.pitch),
  }
}
