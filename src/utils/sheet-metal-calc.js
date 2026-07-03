/**
 * 钣金折弯展开计算（折弯扣除 / K 因子）
 * BA = (π/180) · θ · (R + K·T)
 * 展开长度 = Σ直段 + Σ折弯补偿
 */

export const BEND_METHODS = {
  k_factor: { id: 'k_factor', label: 'K 因子法', desc: 'BA = (π/180)·θ·(R + K·T)' },
  bend_deduction: { id: 'bend_deduction', label: '折弯扣除', desc: '展开 = 外尺寸之和 − 折弯扣除' },
}

/** 单道折弯补偿量 (mm) */
export function calcBendAllowance(angleDeg, radius, thickness, kFactor = 0.33) {
  return (Math.PI / 180) * angleDeg * (radius + kFactor * thickness)
}

/** 折弯扣除 BD = 2·(R+T)·tan(θ/2) − BA */
export function calcBendDeduction(angleDeg, radius, thickness, kFactor = 0.33) {
  const rad = (angleDeg * Math.PI) / 180
  const ba = calcBendAllowance(angleDeg, radius, thickness, kFactor)
  const outsideSetback = 2 * (radius + thickness) * Math.tan(rad / 2)
  return outsideSetback - ba
}

/**
 * 多段钣金展开
 * segments: [{ type: 'straight', length }, { type: 'bend', angle, radius?, kFactor? }]
 */
export function analyzeSheetMetalUnfold(input) {
  const thickness = input.thickness ?? 1.5
  const defaultRadius = input.bendRadius ?? thickness
  const defaultK = input.kFactor ?? 0.33
  const method = input.method ?? 'k_factor'
  const segments = input.segments ?? []

  if (!segments.length) return { error: '至少需要一个直段' }

  let flatLength = 0
  const details = []
  let bendCount = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type === 'straight') {
      const len = Math.max(seg.length ?? 0, 0)
      flatLength += len
      details.push({ index: i, type: 'straight', length: len, contribution: len })
    } else if (seg.type === 'bend') {
      bendCount++
      const angle = seg.angle ?? 90
      const R = seg.radius ?? defaultRadius
      const K = seg.kFactor ?? defaultK
      const ba = calcBendAllowance(angle, R, thickness, K)
      const bd = calcBendDeduction(angle, R, thickness, K)

      if (method === 'bend_deduction') {
        details.push({
          index: i,
          type: 'bend',
          angle,
          radius: R,
          kFactor: K,
          bendDeduction: bd,
          contribution: -bd,
          note: '扣除量（由外尺寸法使用时）',
        })
      } else {
        flatLength += ba
        details.push({
          index: i,
          type: 'bend',
          angle,
          radius: R,
          kFactor: K,
          bendAllowance: ba,
          contribution: ba,
        })
      }
    }
  }

  if (method === 'k_factor') {
    return {
      method: 'k_factor',
      thickness,
      bendRadius: defaultRadius,
      kFactor: defaultK,
      flatLength,
      bendCount,
      details,
    }
  }

  // 折弯扣除模式：需用户提供外轮廓总长 outerSum
  const outerSum = input.outerSum ?? flatLength
  const totalDeduction = details
    .filter((d) => d.type === 'bend')
    .reduce((s, d) => s + (d.bendDeduction ?? 0), 0)
  flatLength = outerSum - totalDeduction

  return {
    method: 'bend_deduction',
    thickness,
    outerSum,
    totalDeduction,
    flatLength,
    bendCount,
    details,
  }
}

/** 常见 K 因子参考 */
export const K_FACTOR_PRESETS = {
  air_bend: { label: '空气折弯（R≈T）', k: 0.33 },
  tight: { label: '小半径（R≈0.5T）', k: 0.38 },
  coining: { label: '压印折弯', k: 0.42 },
  aluminum: { label: '铝合金（经验）', k: 0.35 },
}
