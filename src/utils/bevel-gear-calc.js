/**
 * 直齿锥齿轮 — 三档校核（教材级，非 ISO 10300）
 *
 * 简化：Σ=90° 几何、传动比、分度圆、锥距；有扭矩则算圆周力（estimateOnly）
 * 完整：平均直径力分解 Ft/Fr/Fa + 当量齿数 Lewis 弯曲 + 接触粗估
 * 专业：工况 KA、节线速度提示参与综合判定
 */

const DEG = Math.PI / 180

/** 钢—钢接触弹性系数 ZE (√MPa) 量级 */
export const BEVEL_ZE_STEEL = 190
/** 齿形系数默认（当量直齿近似） */
export const BEVEL_YF_DEFAULT = 0.35

/**
 * 节锥角 δ1、δ2（°），轴交角 Σ=90°：tan δ1 = z1/z2
 */
export function pitchAngles90(z1, z2) {
  const a = Math.max(1, Number(z1) || 1)
  const b = Math.max(a + 1, Number(z2) || 2)
  const delta1 = Math.atan(a / b) / DEG
  const delta2 = 90 - delta1
  return { delta1, delta2, shaftAngle: 90 }
}

/** 外锥距 R = 0.5 √(d1²+d2²) = (m/2)√(z1²+z2²) */
export function coneDistance(module, z1, z2) {
  const m = Math.max(0.5, Number(module) || 2)
  return (m / 2) * Math.sqrt(z1 * z1 + z2 * z2)
}

/** 平均分度圆直径 dm = d (1 − 0.5 b/R) */
export function meanPitchDiameter(outerD, faceWidth, coneR) {
  const d = Math.max(0, Number(outerD) || 0)
  const b = Math.max(0, Number(faceWidth) || 0)
  const R = Math.max(1e-6, Number(coneR) || 1)
  const factor = Math.max(0.2, 1 - 0.5 * (b / R))
  return d * factor
}

/** 当量齿数 zv = z / cos δ */
export function virtualTeeth(z, deltaDeg) {
  const c = Math.cos((Number(deltaDeg) || 0) * DEG)
  if (c < 0.15) return Number(z) || 0
  return (Number(z) || 0) / c
}

/**
 * 锥齿力分解（平均圆）：Ft；Fr = Ft tanα cosδ；Fa = Ft tanα sinδ
 * T N·m，dm mm → Ft N
 */
export function calcBevelForces(torqueNm, meanDiameterMm, pressureAngleDeg, pitchAngleDeg) {
  const T = Math.max(0, Number(torqueNm) || 0)
  const dm = Math.max(1e-6, Number(meanDiameterMm) || 1)
  const alpha = (Number(pressureAngleDeg) || 20) * DEG
  const delta = (Number(pitchAngleDeg) || 0) * DEG
  const Ft = (2000 * T) / dm
  const Fr = Ft * Math.tan(alpha) * Math.cos(delta)
  const Fa = Ft * Math.tan(alpha) * Math.sin(delta)
  return { tangentialForce: Ft, radialForce: Fr, axialForce: Fa }
}

/** Lewis 粗估 σ_F = Ft / (b m YF) */
export function calcBevelBendingStress(Ft, faceWidth, module, YF = BEVEL_YF_DEFAULT) {
  if (!faceWidth || !module || faceWidth <= 0 || module <= 0) return 0
  return Math.max(0, Ft) / (faceWidth * module * Math.max(0.05, YF))
}

/** 接触 σ_H = ZE √(Ft / (dm b)) */
export function calcBevelContactStress(Ft, meanDiameter, faceWidth, ZE = BEVEL_ZE_STEEL) {
  if (!meanDiameter || !faceWidth || meanDiameter <= 0 || faceWidth <= 0 || Ft <= 0) return 0
  return Math.max(0, ZE) * Math.sqrt(Ft / (meanDiameter * faceWidth))
}

/**
 * @param {{
 *   calcMode?: 'simple'|'complete'|'professional',
 *   module?: number,
 *   pinionTeeth?: number,
 *   gearTeeth?: number,
 *   shaftAngle?: number,
 *   faceWidth?: number,
 *   pressureAngle?: number,
 *   torquePinion?: number,
 *   rpmPinion?: number,
 *   power?: number,
 *   allowBending?: number,
 *   allowContact?: number,
 *   formFactor?: number,
 *   contactFactor?: number,
 *   serviceFactor?: number,
 *   maxPitchSpeed?: number,
 * }} input
 */
export function analyzeBevelGear(input = {}) {
  const calcMode = input.calcMode ?? 'simple'
  const m = Math.max(0.5, Number(input.module) || 3)
  const z1 = Math.max(12, Math.round(Number(input.pinionTeeth) || 20))
  const z2 = Math.max(z1 + 1, Math.round(Number(input.gearTeeth) || 40))
  const shaftAngle = Number(input.shaftAngle) || 90
  const alpha = Math.max(14.5, Math.min(25, Number(input.pressureAngle) || 20))
  const n1 = Math.max(0, Number(input.rpmPinion) || 0)
  let T1 = Math.max(0, Number(input.torquePinion) || 0)
  const Pkw = Math.max(0, Number(input.power) || 0)
  const allowF = Math.max(1, Number(input.allowBending) || 150)
  const allowH = Math.max(1, Number(input.allowContact) || 500)
  const YF = Math.max(0.1, Number(input.formFactor) || BEVEL_YF_DEFAULT)
  const ZE = Math.max(50, Number(input.contactFactor) || BEVEL_ZE_STEEL)
  const KA = calcMode === 'professional' ? Math.max(1, Number(input.serviceFactor) || 1.25) : 1
  const maxV = Math.max(1, Number(input.maxPitchSpeed) || 8)

  if (T1 <= 0 && Pkw > 0 && n1 > 0) {
    T1 = (9550 * Pkw) / n1
  }

  const ratio = z2 / z1
  const { delta1, delta2 } = pitchAngles90(z1, z2)
  const d1 = m * z1
  const d2 = m * z2
  const R = coneDistance(m, z1, z2)
  const bMax = 0.3 * R
  const b = Math.max(m, Math.min(bMax, Number(input.faceWidth) || 0.25 * R))
  const dm1 = meanPitchDiameter(d1, b, R)
  const dm2 = meanPitchDiameter(d2, b, R)
  const zv1 = virtualTeeth(z1, delta1)
  const zv2 = virtualTeeth(z2, delta2)

  const T1d = T1 * KA
  const n2 = n1 > 0 ? n1 / ratio : 0
  const T2 = T1d * ratio
  const powerIn = n1 > 0 ? (T1 * n1) / 9550 : Pkw
  const powerDesign = n1 > 0 ? (T1d * n1) / 9550 : powerIn * KA

  const f1 = calcBevelForces(T1d, dm1, alpha, delta1)
  // 90° 锥齿：大轮圆周力 = 小轮圆周力；径向/轴向互换
  const Ft = f1.tangentialForce
  const Fr1 = f1.radialForce
  const Fa1 = f1.axialForce
  const Fr2 = Fa1
  const Fa2 = Fr1

  const pitchSpeed = dm1 > 0 && n1 > 0 ? (Math.PI * dm1 * n1) / 60000 : 0

  const result = {
    calcMode,
    module: m,
    pinionTeeth: z1,
    gearTeeth: z2,
    shaftAngle,
    pressureAngle: alpha,
    ratio,
    delta1,
    delta2,
    outerDiameter1: d1,
    outerDiameter2: d2,
    meanDiameter1: dm1,
    meanDiameter2: dm2,
    coneDistance: R,
    faceWidth: b,
    faceWidthMax: bMax,
    virtualTeeth1: zv1,
    virtualTeeth2: zv2,
    torquePinion: T1,
    torquePinionDesign: T1d,
    torqueGear: T2,
    rpmPinion: n1,
    rpmGear: n2,
    powerIn,
    powerDesign,
    serviceFactor: KA,
    tangentialForce: Ft,
    radialForcePinion: Fr1,
    axialForcePinion: Fa1,
    radialForceGear: Fr2,
    axialForceGear: Fa2,
    pitchSpeed,
    formFactor: YF,
    contactFactor: ZE,
    estimateOnly: calcMode === 'simple',
    pass: false,
    unsupportedShaftAngle: Math.abs(shaftAngle - 90) > 0.5,
  }

  if (calcMode === 'simple') return result

  const bendingStress = calcBevelBendingStress(Ft, b, m, YF)
  const contactStress = calcBevelContactStress(Ft, dm1, b, ZE)
  const bendingPass = bendingStress <= allowF + 1e-9
  const contactPass = contactStress <= allowH + 1e-9
  const hasLoad = T1d > 0

  result.bendingStress = bendingStress
  result.contactStress = contactStress
  result.allowBending = allowF
  result.allowContact = allowH
  result.bendingPass = bendingPass
  result.contactPass = contactPass
  result.bendingUtilization = allowF > 0 ? bendingStress / allowF : 0
  result.contactUtilization = allowH > 0 ? contactStress / allowH : 0

  if (calcMode === 'complete') {
    result.pass = hasLoad && bendingPass && contactPass && !result.unsupportedShaftAngle
    return result
  }

  result.maxPitchSpeed = maxV
  result.speedPass = pitchSpeed <= maxV + 1e-9
  result.pass =
    hasLoad && bendingPass && contactPass && result.speedPass && !result.unsupportedShaftAngle

  return result
}
