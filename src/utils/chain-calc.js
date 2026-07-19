/** 滚子链传动 (GB/T 1243 简化) */

export function calcChainRatio(drivenTeeth, driverTeeth) {
  if (!driverTeeth) return 0
  return drivenTeeth / driverTeeth
}

/**
 * 链节数：理论 Lp 上取整，并优先偶数（避免过渡链节）。
 * @returns {{ linksExact: number, links: number, chainLength: number, oddRoundedUp: boolean }}
 */
export function calcChainLinks(pitch, z1, z2, centerDistance) {
  const p = pitch
  const C = centerDistance
  if (!p || !C) return { linksExact: 0, links: 0, chainLength: 0, oddRoundedUp: false }
  const linksExact =
    (2 * C) / p + (z1 + z2) / 2 + (p * (z2 - z1) ** 2) / (4 * Math.PI ** 2 * C)
  let links = Math.ceil(linksExact - 1e-9)
  let oddRoundedUp = false
  if (links % 2 === 1) {
    links += 1
    oddRoundedUp = true
  }
  return { linksExact, links, chainLength: links * p, oddRoundedUp }
}

export function calcChainLength(pitch, z1, z2, centerDistance) {
  return calcChainLinks(pitch, z1, z2, centerDistance).chainLength
}

export function calcChainSpeed(pitch, teeth, rpm) {
  return (pitch * teeth * rpm) / 60000
}

export function calcChainTension({ power, speed, efficiency = 0.98 }) {
  if (!speed) return 0
  return (power * 1000) / speed / efficiency
}

/** 理论寿命粗估；利用率很低时平方律会发散，故设上限 */
const LIFE_HOURS_CAP = 30000

export function analyzeChainDrive(input) {
  const calcMode = input.calcMode ?? 'simple'
  const ratio = calcChainRatio(input.drivenTeeth, input.driverTeeth)
  const linkInfo = calcChainLinks(
    input.pitch,
    input.driverTeeth,
    input.drivenTeeth,
    input.centerDistance,
  )
  const speed = calcChainSpeed(input.pitch, input.driverTeeth, input.rpm ?? 0)
  /** 工况系数仅专业模式；完整与简化按额定功率计张力 */
  const serviceFactor = calcMode === 'professional' ? (input.serviceFactor ?? 1.3) : 1
  const efficiency = input.efficiency ?? 0.98
  const power =
    (input.power ?? ((input.torque ?? 0) * 2 * Math.PI * (input.rpm ?? 0)) / 60000) * serviceFactor
  const tension = calcChainTension({ power, speed, efficiency })

  const result = {
    calcMode,
    ratio,
    chainLength: linkInfo.chainLength,
    chainSpeed: speed,
    power: power / serviceFactor,
    designPower: power,
    chainTension: tension,
    drivenRpm: (input.rpm ?? 0) / ratio,
    links: linkInfo.links,
    linksExact: linkInfo.linksExact,
    oddRoundedUp: linkInfo.oddRoundedUp,
    serviceFactor,
    efficiency,
  }

  const strands = Math.max(1, input.strands ?? 1)
  result.strands = strands
  result.tensionPerStrand = tension / strands

  if (calcMode === 'complete' || calcMode === 'professional') {
    const maxSpeed = input.maxChainSpeed ?? 15
    result.maxChainSpeed = maxSpeed
    result.speedPass = speed <= maxSpeed
    const allowTension = input.allowTension ?? 20000
    result.allowTension = allowTension
    result.tensionPass = result.tensionPerStrand <= allowTension
    result.tensionUtilization = allowTension ? result.tensionPerStrand / allowTension : 0
    result.pass = result.speedPass && result.tensionPass
  }

  if (calcMode === 'professional') {
    const lubrication = input.lubricationFactor ?? 1
    const lifeBase = 15000
    const lifeFactor = (input.allowTension ?? 20000) / Math.max(result.tensionPerStrand, 1)
    const rawLife = lifeBase * lifeFactor ** 2 * lubrication
    result.lubricationFactor = lubrication
    result.estimatedLifeHoursRaw = rawLife
    result.estimatedLifeHours = Math.min(rawLife, LIFE_HOURS_CAP)
    result.lifeCapped = rawLife > LIFE_HOURS_CAP
  }

  return result
}
