/**
 * 同步带（齿形带）简化校核
 * 节距选型包络 + 几何带长 + 有效圆周力 / 安装张力 + 寿命量级
 */

/** 常用节距系列（mm）与适用功率–转速粗包络 */
export const TIMING_PITCH_SERIES = {
  MXL: { id: 'MXL', pitch: 2.032, label: 'MXL', maxPower: 0.5, maxRpm: 10000 },
  XL: { id: 'XL', pitch: 5.08, label: 'XL', maxPower: 1.5, maxRpm: 6000 },
  L: { id: 'L', pitch: 9.525, label: 'L', maxPower: 5, maxRpm: 4000 },
  H: { id: 'H', pitch: 12.7, label: 'H', maxPower: 15, maxRpm: 3000 },
  '3M': { id: '3M', pitch: 3, label: 'HTD 3M', maxPower: 2, maxRpm: 8000 },
  '5M': { id: '5M', pitch: 5, label: 'HTD 5M', maxPower: 8, maxRpm: 5000 },
  '8M': { id: '8M', pitch: 8, label: 'HTD 8M', maxPower: 30, maxRpm: 3500 },
  '14M': { id: '14M', pitch: 14, label: 'HTD 14M', maxPower: 80, maxRpm: 2000 },
}

/**
 * 按功率与转速推荐节距（取能覆盖的最小节距系列）
 * @returns {{ id: string, pitch: number, label: string } | null}
 */
export function recommendTimingPitch({ power = 0, rpm = 0 } = {}) {
  const P = Math.max(0, Number(power) || 0)
  const n = Math.max(0, Number(rpm) || 0)
  const order = ['MXL', 'XL', '3M', 'L', '5M', 'H', '8M', '14M']
  for (const id of order) {
    const s = TIMING_PITCH_SERIES[id]
    if (P <= s.maxPower && (n <= 0 || n <= s.maxRpm)) {
      return { id: s.id, pitch: s.pitch, label: s.label }
    }
  }
  const last = TIMING_PITCH_SERIES['14M']
  return { id: last.id, pitch: last.pitch, label: last.label, oversized: true }
}

/** 同步带节线长近似（同链长公式，用节圆直径 d=p·z/π） */
export function calcTimingBeltLength(pitch, z1, z2, centerDistance) {
  const p = pitch
  const C = centerDistance
  if (!p || !C || !z1 || !z2) return 0
  const d1 = (p * z1) / Math.PI
  const d2 = (p * z2) / Math.PI
  return 2 * C + (Math.PI * (d1 + d2)) / 2 + ((d2 - d1) ** 2) / (4 * C)
}

export function calcTimingBeltSpeed(pitch, z1, rpm) {
  if (!pitch || !z1 || !rpm) return 0
  return (pitch * z1 * rpm) / 60000
}

/** 有效圆周力 Fe (N)；P 为 kW，v 为 m/s */
export function calcTimingEffectiveForce(powerKw, speedMs, efficiency = 0.96) {
  if (!speedMs || speedMs <= 0) return 0
  return (powerKw * 1000) / (speedMs * efficiency)
}

/**
 * 安装张力建议：约 0.5·Fe（厂家常给 0.4–0.6·Fe）
 */
export function calcTimingInstallTension(effectiveForce, factor = 0.5) {
  return Math.max(0, effectiveForce) * factor
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   pitch?: number,
 *   pitchId?: string,
 *   z1?: number,
 *   z2?: number,
 *   centerDistance?: number,
 *   beltWidth?: number,
 *   rpm?: number,
 *   power?: number,
 *   serviceFactor?: number,
 *   efficiency?: number,
 *   maxBeltSpeed?: number,
 *   allowPowerPerMm?: number,
 * }} input
 */
export function analyzeTimingBeltDrive(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const pitchRec = recommendTimingPitch({ power: input.power ?? 0, rpm: input.rpm ?? 0 })
  const pitchId = input.pitchId ?? pitchRec.id
  const series = TIMING_PITCH_SERIES[pitchId] ?? TIMING_PITCH_SERIES['5M']
  const pitch = input.pitch ?? series.pitch
  const z1 = input.z1 ?? 24
  const z2 = input.z2 ?? 48
  const C = input.centerDistance ?? 300
  const rpm = input.rpm ?? 1450
  const serviceFactor = calcMode === 'professional' ? input.serviceFactor ?? 1.3 : 1
  const power = (input.power ?? 2) * serviceFactor
  const efficiency = input.efficiency ?? 0.96
  const beltWidth = input.beltWidth ?? 15
  const maxSpeed = input.maxBeltSpeed ?? 40
  const allowPowerPerMm = input.allowPowerPerMm ?? 0.15

  const ratio = z1 > 0 ? z2 / z1 : 0
  const pitchLength = calcTimingBeltLength(pitch, z1, z2, C)
  const toothCount = pitch > 0 ? Math.ceil(pitchLength / pitch) : 0
  const beltSpeed = calcTimingBeltSpeed(pitch, z1, rpm)
  const effectiveForce = calcTimingEffectiveForce(power, beltSpeed, efficiency)
  const installTension = calcTimingInstallTension(effectiveForce)
  const installTensionMin = calcTimingInstallTension(effectiveForce, 0.4)
  const installTensionMax = calcTimingInstallTension(effectiveForce, 0.6)

  const designPower = power / serviceFactor
  const capacityKw = allowPowerPerMm * beltWidth
  const widthPass = designPower * (calcMode === 'professional' ? serviceFactor : 1) <= capacityKw * 1.05
  const speedPass = beltSpeed <= maxSpeed

  const result = {
    calcMode,
    kind: 'timing',
    pitch,
    pitchId: series.id,
    pitchLabel: series.label,
    recommendedPitch: pitchRec,
    z1,
    z2,
    centerDistance: C,
    beltWidth,
    ratio,
    pitchLength,
    toothCount,
    beltSpeed,
    power: designPower,
    designPower: power,
    efficiency,
    effectiveForce,
    installTension,
    installTensionMin,
    installTensionMax,
    capacityKw,
    maxBeltSpeed: maxSpeed,
    speedPass,
    widthPass,
    pass: calcMode === 'simple' ? false : speedPass && widthPass,
    estimateOnly: calcMode === 'simple',
  }

  if (calcMode === 'professional') {
    result.serviceFactor = serviceFactor
    // 寿命量级：基准 1e4 h · (Pallow/Pdes)^2.5 · (vmax/v)
    const lifeBase = 1e4
    const powerFactor = capacityKw / Math.max(power, 1e-6)
    const speedFactor = maxSpeed / Math.max(beltSpeed, 1e-6)
    result.estimatedLifeHours = Math.min(
      5e5,
      lifeBase * Math.max(0.1, powerFactor) ** 2.5 * Math.min(2, Math.max(0.3, speedFactor)),
    )
    result.pass = speedPass && widthPass
  }

  return result
}
