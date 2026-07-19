/**
 * 蜗轮蜗杆传动 — 三档校核（教材/机械设计手册常用式，非完整 ISO 14521）
 *
 * 简化：几何、传动比、导程角、滑动效率、运动/扭矩/力（estimateOnly）
 * 完整：+ 蜗轮齿根弯曲、齿面接触粗校核
 * 专业：+ 工况系数 KA、当量摩擦、滑动速度与散热容量判定
 *
 * 约定：蜗杆主动驱动蜗轮（减速）。
 */

const DEG = Math.PI / 180

/** 钢—锡青铜接触弹性系数 ZE (√MPa)，机械设计常用表值 */
export const WORM_ZE_STEEL_BRONZE = 160

/** 蜗轮齿形系数近似（青铜，简化 Lewis） */
export const WORM_YF_DEFAULT = 1.6

/**
 * 导程角 γ（°）：tan γ = z1 / q = pz/(π d1)
 * @param {number} z1 蜗杆头数
 * @param {number} q 直径系数 d1/m
 */
export function leadAngleFromQ(z1, q) {
  if (!z1 || !q || q <= 0) return 0
  return Math.atan(z1 / q) / DEG
}

/** 摩擦角 ρ = arctan(μ)（°） */
export function frictionAngleDeg(mu) {
  return Math.atan(Math.max(1e-6, Number(mu) || 0)) / DEG
}

/**
 * 蜗杆主动时啮合效率
 * η = tanγ / tan(γ+ρ) = tanγ(1−μ tanγ)/(tanγ+μ)
 * @param {number} leadAngleDeg 导程角 γ
 * @param {number} mu 当量摩擦系数 μ（或 μ'）
 */
export function calcWormEfficiency(leadAngleDeg, mu = 0.08) {
  const g = Math.max(0, Number(leadAngleDeg) || 0) * DEG
  const m = Math.max(0, Number(mu) || 0)
  if (g <= 0) return 0
  const tg = Math.tan(g)
  // γ+ρ ≥ 90° 或 μ tanγ ≥ 1 → 无法正向传动
  if (m * tg >= 1 - 1e-12) return 0
  const num = tg * (1 - m * tg)
  const den = tg + m
  if (den <= 0 || num <= 0) return 0
  return Math.min(0.98, num / den)
}

/**
 * 法面压力角修正当量摩擦：μ' = μ / cos α_n（专业）
 * @param {number} mu
 * @param {number} pressureAngleDeg 法面压力角，默认 20°
 */
export function equivalentFriction(mu, pressureAngleDeg = 20) {
  const c = Math.cos((Number(pressureAngleDeg) || 20) * DEG)
  if (c <= 0.2) return Math.max(0, Number(mu) || 0)
  return Math.max(0, Number(mu) || 0) / c
}

/**
 * 滑动速度 (m/s)：v_s = π d1 n1 / (60000 cos γ)
 * d1 mm，n1 rpm，γ °
 */
export function calcSlidingSpeed(d1, n1, leadAngleDeg) {
  const g = Number(leadAngleDeg) || 0
  const cg = Math.cos(g * DEG)
  if (!d1 || !n1 || cg <= 0.05) return 0
  return (Math.PI * d1 * n1) / (60000 * cg)
}

/**
 * 自然冷却散热功率粗估 (kW)：P_th ≈ k_th · a · (d1+d2) · 10⁻⁵
 * a,d 单位 mm；k_th 默认 3.5（封闭箱体量级）
 */
export function calcHeatCapacityKw(a, d1, d2, kTh = 3.5) {
  return Math.max(0, Number(kTh) || 3.5) * Math.max(0, a) * (Math.max(0, d1) + Math.max(0, d2)) * 1e-5
}

/**
 * 蜗轮齿根弯曲应力 (MPa)：σ_F = Y_F · F_t2 / (b · m)
 * F_t2 N，b、m mm
 */
export function calcWormBendingStress(Ft2, faceWidth, module, YF = WORM_YF_DEFAULT) {
  if (!faceWidth || !module || faceWidth <= 0 || module <= 0) return 0
  return (Math.max(0, YF) * Math.max(0, Ft2)) / (faceWidth * module)
}

/**
 * 齿面接触应力 (MPa)：σ_H = Z_E · √(F_t2 / (d2 · b))
 */
export function calcWormContactStress(Ft2, d2, faceWidth, ZE = WORM_ZE_STEEL_BRONZE) {
  if (!d2 || !faceWidth || d2 <= 0 || faceWidth <= 0 || Ft2 <= 0) return 0
  return Math.max(0, ZE) * Math.sqrt(Ft2 / (d2 * faceWidth))
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   module?: number,
 *   wormStarts?: number,
 *   wheelTeeth?: number,
 *   diameterFactor?: number,
 *   centerDistance?: number,
 *   frictionCoeff?: number,
 *   pressureAngle?: number,
 *   rpmWorm?: number,
 *   torqueWorm?: number,
 *   power?: number,
 *   faceWidth?: number,
 *   allowBending?: number,
 *   allowContact?: number,
 *   formFactor?: number,
 *   contactFactor?: number,
 *   serviceFactor?: number,
 *   maxSlidingSpeed?: number,
 *   heatCoeff?: number,
 * }} input
 */
export function analyzeWormGear(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const m = Math.max(0.5, Number(input.module) || 2)
  const z1 = Math.max(1, Math.round(Number(input.wormStarts) || 1))
  const z2 = Math.max(z1 + 1, Math.round(Number(input.wheelTeeth) || 40))
  const qIn = Number(input.diameterFactor)
  const aIn = Number(input.centerDistance)
  const muBare = Math.max(0.01, Number(input.frictionCoeff) || 0.08)
  const alphaN = Math.max(10, Math.min(30, Number(input.pressureAngle) || 20))
  const n1 = Math.max(0, Number(input.rpmWorm) || 0)
  let T1 = Math.max(0, Number(input.torqueWorm) || 0)
  const PkwIn = Math.max(0, Number(input.power) || 0)
  const bDefault = Math.max(m * 2, 0.75 * m * 10)
  const b = Math.max(m, Number(input.faceWidth) || bDefault)
  const allowF = Math.max(1, Number(input.allowBending) || 100)
  const allowH = Math.max(1, Number(input.allowContact) || 300)
  const YF = Math.max(0.5, Number(input.formFactor) || WORM_YF_DEFAULT)
  const ZE = Math.max(50, Number(input.contactFactor) || WORM_ZE_STEEL_BRONZE)
  const KA = calcMode === 'professional' ? Math.max(1, Number(input.serviceFactor) || 1.25) : 1
  const maxVs = Math.max(1, Number(input.maxSlidingSpeed) || 10)
  const kTh = Math.max(0.5, Number(input.heatCoeff) || 3.5)

  const ratio = z2 / z1
  const d2 = m * z2

  let q
  let d1
  let a
  if (Number.isFinite(qIn) && qIn > 0) {
    q = qIn
    d1 = m * q
    a = (d1 + d2) / 2
  } else if (Number.isFinite(aIn) && aIn > d2 / 2) {
    a = aIn
    d1 = Math.max(m * 6, 2 * a - d2)
    q = d1 / m
  } else {
    q = 10
    d1 = m * q
    a = (d1 + d2) / 2
  }

  const leadAngle = leadAngleFromQ(z1, q)
  const lead = Math.PI * m * z1

  // 专业用 μ'=μ/cos α_n；简化/完整用输入 μ
  const mu =
    calcMode === 'professional' ? equivalentFriction(muBare, alphaN) : muBare
  const eta = calcWormEfficiency(leadAngle, mu)
  const rho = frictionAngleDeg(mu)
  const selfLocking = leadAngle <= rho + 1e-9

  // 载荷：优先 T1；否则由 P 与 n1 反推。P 与 T1 同时给出时以 T1 为准。
  if (T1 <= 0 && PkwIn > 0 && n1 > 0) {
    T1 = (9550 * PkwIn) / n1
  }
  const T1design = T1 * KA
  const n2 = n1 > 0 ? n1 / ratio : 0
  const T2 = T1design * ratio * eta
  // 输入功率按实际 T1；散热/输出按设计扭矩 T1·KA（专业）
  const powerIn = n1 > 0 ? (T1 * n1) / 9550 : PkwIn
  const powerDesign = n1 > 0 ? (T1design * n1) / 9550 : powerIn * KA
  const powerOut = powerDesign * eta
  const powerLoss = Math.max(0, powerDesign * (1 - eta))

  const Ft1 = d1 > 0 ? (2000 * T1design) / d1 : 0
  const Ft2 = d2 > 0 ? (2000 * T2) / d2 : 0
  // 力平衡：蜗杆轴向力 = 蜗轮圆周力
  const Fa1 = Ft2
  const Fr2 = Ft2 * Math.tan(alphaN * DEG)

  const result = {
    calcMode,
    module: m,
    wormStarts: z1,
    wheelTeeth: z2,
    diameterFactor: q,
    wormDiameter: d1,
    wheelDiameter: d2,
    centerDistance: a,
    lead,
    leadAngle,
    pressureAngle: alphaN,
    ratio,
    frictionCoeff: muBare,
    frictionCoeffUsed: mu,
    frictionAngle: rho,
    efficiency: eta,
    selfLocking,
    rpmWorm: n1,
    rpmWheel: n2,
    torqueWorm: T1,
    torqueWormDesign: T1design,
    torqueWheel: T2,
    powerIn,
    powerDesign,
    powerOut,
    powerLoss,
    serviceFactor: KA,
    faceWidth: b,
    tangentialForceWorm: Ft1,
    tangentialForceWheel: Ft2,
    axialForceWorm: Fa1,
    radialForceWheel: Fr2,
    formFactor: YF,
    contactFactor: ZE,
    estimateOnly: calcMode === 'simple',
    pass: false,
  }

  if (calcMode === 'simple') {
    // 与链/同步带简化一致：只估算，不正式放行
    return result
  }

  // —— 完整 + 专业：强度 ——
  const bendingStress = calcWormBendingStress(Ft2, b, m, YF)
  const contactStress = calcWormContactStress(Ft2, d2, b, ZE)
  const bendingPass = bendingStress <= allowF + 1e-9
  const contactPass = contactStress <= allowH + 1e-9
  const hasLoad = T1design > 0

  result.bendingStress = bendingStress
  result.contactStress = contactStress
  result.allowBending = allowF
  result.allowContact = allowH
  result.bendingPass = bendingPass
  result.contactPass = contactPass
  result.bendingUtilization = allowF > 0 ? bendingStress / allowF : 0
  result.contactUtilization = allowH > 0 ? contactStress / allowH : 0

  if (calcMode === 'complete') {
    result.pass = hasLoad && bendingPass && contactPass
    return result
  }

  // —— 专业：滑动速度 + 散热 ——
  const slidingSpeed = calcSlidingSpeed(d1, n1, leadAngle)
  const heatCapacity = calcHeatCapacityKw(a, d1, d2, kTh)
  const slidingPass = slidingSpeed <= maxVs + 1e-9
  const thermalPass = powerLoss <= heatCapacity + 1e-9

  result.slidingSpeed = slidingSpeed
  result.maxSlidingSpeed = maxVs
  result.slidingPass = slidingPass
  result.heatCapacity = heatCapacity
  result.heatCoeff = kTh
  result.thermalPass = thermalPass
  result.pass = hasLoad && bendingPass && contactPass && slidingPass && thermalPass

  return result
}
