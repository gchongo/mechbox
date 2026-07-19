/**
 * 钣金折弯展开计算（折弯扣除 / K 因子）
 * BA = (π/180) · θ · (R + K·T)
 * K 因子：L_flat = Σ 相切直段 + Σ BA
 * 折弯扣除：L_flat = Σ 外尺寸直段 − Σ BD
 */

export const BEND_METHODS = {
  k_factor: { id: 'k_factor', label: 'K 因子法', desc: 'BA = (π/180)·θ·(R + K·T)；直段为相切长度' },
  bend_deduction: { id: 'bend_deduction', label: '折弯扣除', desc: '展开 = Σ外尺寸 − ΣBD' },
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

/** 空气折弯最小法兰经验：L_min ≈ V/2 + 2 + T */
export function estimateMinFlange(thickness, dieOpening) {
  const T = thickness ?? 0
  if (dieOpening != null && Number.isFinite(dieOpening) && dieOpening > 0) {
    return dieOpening / 2 + 2 + T
  }
  return T * 4
}

/**
 * 多段钣金展开
 * segments: [{ type: 'straight', length }, { type: 'bend', angle, radius?, kFactor? }]
 * K 因子法：straight.length = 相切长度
 * 折弯扣除法：straight.length = 外模尺寸（至虚拟尖点）
 */
export function analyzeSheetMetalUnfold(input) {
  const calcMode = input.calcMode ?? 'simple'
  const thickness = input.thickness ?? 1.5
  const defaultRadius = input.bendRadius ?? thickness
  const defaultK = input.kFactor ?? 0.33
  const method = input.method ?? 'k_factor'
  const segments = input.segments ?? []

  if (!Number.isFinite(thickness) || thickness <= 0) return { errorKey: 'invalid_thickness', calcMode }
  if (!Number.isFinite(defaultRadius) || defaultRadius < 0) return { errorKey: 'invalid_radius', calcMode }
  if (!Number.isFinite(defaultK) || defaultK < 0 || defaultK > 0.5) return { errorKey: 'invalid_k_factor', calcMode }
  if (!segments.length) return { errorKey: 'need_one_segment', calcMode }

  let straightSum = 0
  const details = []
  let bendCount = 0
  let totalBa = 0
  let totalBd = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type === 'straight') {
      const len = seg.length ?? 0
      if (!Number.isFinite(len) || len < 0) return { errorKey: 'invalid_segment_length', calcMode, segmentIndex: i }
      straightSum += len
      details.push({ index: i, type: 'straight', length: len, contribution: len })
    } else if (seg.type === 'bend') {
      bendCount++
      const angle = seg.angle ?? 90
      const R = seg.radius ?? defaultRadius
      const K = seg.kFactor ?? defaultK
      if (!Number.isFinite(angle) || angle <= 0 || angle >= 180) {
        return { errorKey: 'invalid_bend_angle', calcMode, segmentIndex: i }
      }
      if (!Number.isFinite(R) || R < 0) return { errorKey: 'invalid_radius', calcMode, segmentIndex: i }
      if (!Number.isFinite(K) || K < 0 || K > 0.5) return { errorKey: 'invalid_k_factor', calcMode, segmentIndex: i }
      const ba = calcBendAllowance(angle, R, thickness, K)
      const bd = calcBendDeduction(angle, R, thickness, K)
      totalBa += ba
      totalBd += bd

      if (method === 'bend_deduction') {
        details.push({
          index: i,
          type: 'bend',
          angle,
          radius: R,
          kFactor: K,
          bendDeduction: bd,
          bendAllowance: ba,
          contribution: -bd,
        })
      } else {
        details.push({
          index: i,
          type: 'bend',
          angle,
          radius: R,
          kFactor: K,
          bendAllowance: ba,
          bendDeduction: bd,
          contribution: ba,
        })
      }
    }
  }

  const dimensionBasis = method === 'bend_deduction' ? 'outside' : 'tangent'
  const flatLength =
    method === 'bend_deduction' ? straightSum - totalBd : straightSum + totalBa

  const result = {
    calcMode,
    method,
    dimensionBasis,
    thickness,
    bendRadius: defaultRadius,
    kFactor: defaultK,
    straightSum,
    totalBendAllowance: totalBa,
    totalBendDeduction: totalBd,
    flatLength,
    bendCount,
    details,
    estimateOnly: true,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const dieOpening = input.dieOpening
    const useDie = dieOpening != null && Number.isFinite(dieOpening) && dieOpening > 0
    const minFlange = estimateMinFlange(thickness, dieOpening)
    const straightLengths = details.filter((d) => d.type === 'straight').map((d) => d.length ?? 0)
    const minStraight = straightLengths.length ? Math.min(...straightLengths) : 0
    result.dieOpening = useDie ? dieOpening : null
    result.minFlangeRule = minFlange
    result.minFlangeBasis = useDie ? 'die_opening' : '4t'
    result.minFlangeFormula = useDie
      ? `V/2 + 2 + T = ${dieOpening}/2 + 2 + ${thickness}`
      : `4·T = 4×${thickness}`
    result.minStraightLength = minStraight
    result.flangePass = minStraight >= minFlange || bendCount === 0
    result.pass = result.flangePass
  }

  if (calcMode === 'professional') {
    const springback = input.springbackFactor ?? 0.5
    if (!Number.isFinite(springback) || springback < 0) return { errorKey: 'invalid_springback', calcMode }
    const source = input.compensationSource ?? 'empirical'
    const bendProcess = input.bendProcess ?? 'air_bend'
    result.springbackDeg = springback
    result.springbackEstimateOnly = true
    result.compensationSource = source
    result.bendProcess = bendProcess
    // Separate from theoretical flatLength — do not replace the primary result.
    result.compensatedFlatLength =
      bendCount > 0
        ? result.flatLength * (1 + springback / (90 * bendCount))
        : result.flatLength
    const totalComp = result.compensatedFlatLength - result.flatLength
    result.springbackTotalCompensation = totalComp
    result.springbackPerBend = bendCount > 0 ? totalComp / bendCount : 0
    const innerRadius = defaultRadius
    result.minInnerRadius = thickness
    result.radiusPass = innerRadius >= thickness
    result.pass = result.pass !== false && result.radiusPass
  }

  return result
}

/** 常见 K 因子参考 */
export const K_FACTOR_PRESETS = {
  air_bend: { label: '空气折弯（R≈T）', k: 0.33 },
  tight: { label: '小半径（R≈0.5T）', k: 0.38 },
  coining: { label: '压印折弯', k: 0.42 },
  aluminum: { label: '铝合金（经验）', k: 0.35 },
}
