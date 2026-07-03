/** 滚子链传动 (GB/T 1243 简化) */

export function calcChainRatio(drivenTeeth, driverTeeth) {
  if (!driverTeeth) return 0
  return drivenTeeth / driverTeeth
}

export function calcChainLength(pitch, z1, z2, centerDistance) {
  const p = pitch
  const C = centerDistance
  if (!p || !C) return 0
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
  const calcMode = input.calcMode ?? 'simple'
  const ratio = calcChainRatio(input.drivenTeeth, input.driverTeeth)
  const length = calcChainLength(
    input.pitch,
    input.driverTeeth,
    input.drivenTeeth,
    input.centerDistance,
  )
  const speed = calcChainSpeed(input.pitch, input.driverTeeth, input.rpm ?? 0)
  const serviceFactor = calcMode === 'professional' ? input.serviceFactor ?? 1.3 : calcMode === 'complete' ? input.serviceFactor ?? 1.15 : 1
  const power = (input.power ?? ((input.torque ?? 0) * 2 * Math.PI * (input.rpm ?? 0)) / 60000) * serviceFactor
  const tension = calcChainTension({ power, speed, efficiency: input.efficiency ?? 0.98 })

  const result = {
    calcMode,
    ratio,
    chainLength: length,
    chainSpeed: speed,
    power: power / serviceFactor,
    designPower: power,
    chainTension: tension,
    drivenRpm: (input.rpm ?? 0) / ratio,
    links: input.pitch ? Math.ceil(length / input.pitch) : 0,
    serviceFactor,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const maxSpeed = input.maxChainSpeed ?? 15
    result.maxChainSpeed = maxSpeed
    result.speedPass = speed <= maxSpeed
    const allowTension = input.allowTension ?? 20000
    result.allowTension = allowTension
    result.tensionPass = tension <= allowTension
    result.tensionUtilization = allowTension ? tension / allowTension : 0
    result.pass = result.speedPass && result.tensionPass
  }

  if (calcMode === 'professional') {
    const lubrication = input.lubricationFactor ?? 1
    const lifeBase = 15000
    const lifeFactor = (input.allowTension ?? 20000) / Math.max(tension, 1)
    result.lubricationFactor = lubrication
    result.estimatedLifeHours = lifeBase * lifeFactor ** 2 * lubrication
    result.strands = input.strands ?? 1
    result.tensionPerStrand = tension / result.strands
    result.pass = result.pass && result.tensionPerStrand <= (input.allowTension ?? 20000)
  }

  return result
}
