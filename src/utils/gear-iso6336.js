import { GEAR_MATERIALS, lookupYF, calcYS } from '@/constants/gear-materials'
import { calcTangentialForce, calcPitchLineVelocity } from './gear-calc'

const DEG = Math.PI / 180

/** 弹性系数 ZE (钢-钢, N/mm^0.5) */
export const ZE_STEEL = 189.8

/** 节点区域系数 ZH (直齿 α=20°) */
export function calcZH(pressureAngle = 20, helixAngle = 0) {
  const alphaT = pressureAngle * DEG
  const betaB = helixAngle * DEG
  const num = 2 * Math.cos(betaB)
  const den = Math.sqrt(Math.sin(alphaT) * Math.cos(alphaT))
  return num / den
}

/** 端面重合度 εα */
export function calcContactRatio({ module, z1, z2, pressureAngle = 20, addendum = 1 }) {
  const alpha = pressureAngle * DEG
  const m = module
  const d1 = m * z1
  const d2 = m * z2
  const db1 = d1 * Math.cos(alpha)
  const db2 = d2 * Math.cos(alpha)
  const da1 = d1 + 2 * addendum * m
  const da2 = d2 + 2 * addendum * m
  const ra1 = da1 / 2
  const ra2 = da2 / 2
  const rb1 = db1 / 2
  const rb2 = db2 / 2
  const a = (d1 + d2) / 2
  const term1 = Math.sqrt(Math.max(0, ra1 ** 2 - rb1 ** 2))
  const term2 = Math.sqrt(Math.max(0, ra2 ** 2 - rb2 ** 2))
  const epsAlpha = (term1 + term2 - a * Math.sin(alpha)) / (Math.PI * m * Math.cos(alpha))
  return Math.max(1.0, Math.min(epsAlpha, 1.8))
}

/** 重合度系数 Zε (直齿) */
export function calcZepsilon(epsilonAlpha) {
  return Math.sqrt((4 - epsilonAlpha) / 3)
}

/** 螺旋角系数 Zβ */
export function calcZbeta(helixAngle = 0) {
  const beta = helixAngle * DEG
  return Math.sqrt(Math.cos(beta))
}

/** 小齿轮单对齿啮合系数 ZB (简化, u>=1.2 时) */
export function calcZB(u) {
  if (u < 1.2) return 1
  if (u >= 8) return 1.07
  return 1 + 0.07 * ((u - 1.2) / 6.8)
}

/** 动载系数 KV (ISO 6336-1 简化, 由精度与线速度估算) */
export function estimateKV({ velocity, accuracyGrade = 6 }) {
  const v = velocity ?? 0
  const gradeFactor = Math.max(1, (10 - accuracyGrade) * 0.04)
  const speedFactor = 1 + Math.min(0.5, v / 50)
  return 1 + gradeFactor * speedFactor * 0.15
}

/** ISO 6336-2 接触应力 σH (N/mm²) */
export function calcContactStressISO6336(params) {
  const {
    tangentialForce: Ft,
    faceWidth: b,
    pitchDiameter1: d1,
    gearRatio: u,
    KA = 1.25,
    KV = 1.1,
    KHbeta = 1.1,
    KHalpha = 1.0,
    ZB = 1,
    ZH = 2.5,
    ZE = ZE_STEEL,
    Zepsilon = 0.95,
    Zbeta = 1,
  } = params

  if (!Ft || !b || !d1 || !u) return 0
  const loadTerm = (Ft / (b * d1)) * ((u + 1) / u)
  const factor = ZB * ZH * ZE * Zepsilon * Zbeta
  const stress = factor * Math.sqrt(loadTerm * KA * KV * KHbeta * KHalpha)
  return stress
}

/** ISO 6336-3 弯曲应力 σF (N/mm²) */
export function calcBendingStressISO6336(params) {
  const {
    tangentialForce: Ft,
    faceWidth: b,
    module: mn,
    z1,
    KA = 1.25,
    KV = 1.1,
    KFbeta = 1.1,
    KFalpha = 1.0,
    Ybeta = 1,
    YB = 1,
    helixAngle = 0,
  } = params

  if (!Ft || !b || !mn) return 0
  const YF = lookupYF(z1)
  const YS = calcYS(z1)
  const YDT = helixAngle > 0 ? 1 - 0.25 * (helixAngle / 30) : 1
  const stress =
    (Ft / (b * mn)) * YF * YS * Ybeta * YB * YDT * KA * KV * KFbeta * KFalpha
  return stress
}

/** ISO 6336 完整分析 */
export function analyzeGearISO6336(input) {
  const z1 = input.pinionTeeth ?? input.teeth ?? 24
  const z2 = input.gearTeeth ?? z1 * (input.gearRatio ?? 1)
  const u = z2 / z1
  const m = input.module
  const alpha = input.pressureAngle ?? 20
  const beta = input.helixAngle ?? 0
  const d1 = m * z1
  const d2 = m * z2

  const Ft = calcTangentialForce(input.torque, d1)
  const velocity = calcPitchLineVelocity(d1, input.rpm ?? 0)
  const epsilonAlpha = calcContactRatio({
    module: m,
    z1,
    z2,
    pressureAngle: alpha,
    addendum: input.addendum ?? 1,
  })

  const KA = input.applicationFactor ?? 1.25
  const KV = input.dynamicFactor ?? estimateKV({ velocity, accuracyGrade: input.accuracyGrade ?? 6 })
  const KHbeta = input.faceLoadFactorH ?? 1.1
  const KHalpha = input.transverseLoadFactorH ?? 1.0
  const KFbeta = input.faceLoadFactorF ?? 1.1
  const KFalpha = input.transverseLoadFactorF ?? 1.0

  const ZH = calcZH(alpha, beta)
  const Zepsilon = calcZepsilon(epsilonAlpha)
  const Zbeta = calcZbeta(beta)
  const ZB = calcZB(u)
  const Ybeta = beta > 0 ? 1 - (0.25 * beta) / 120 : 1

  const sigmaH = calcContactStressISO6336({
    tangentialForce: Ft,
    faceWidth: input.faceWidth,
    pitchDiameter1: d1,
    gearRatio: u,
    KA,
    KV,
    KHbeta,
    KHalpha,
    ZB,
    ZH,
    ZE: ZE_STEEL,
    Zepsilon,
    Zbeta,
  })

  const sigmaF = calcBendingStressISO6336({
    tangentialForce: Ft,
    faceWidth: input.faceWidth,
    module: m,
    z1,
    KA,
    KV,
    KFbeta,
    KFalpha,
    Ybeta,
    helixAngle: beta,
  })

  const matPinion = GEAR_MATERIALS[input.pinionMaterial ?? 'st-soft'] ?? GEAR_MATERIALS['st-soft']
  const matGear = GEAR_MATERIALS[input.gearMaterial ?? 'st-soft'] ?? GEAR_MATERIALS['st-soft']
  const sigmaHlim = Math.min(matPinion.sigmaHlim, matGear.sigmaHlim)
  const sigmaFlim = Math.min(matPinion.sigmaFlim, matGear.sigmaFlim)

  const SFmin = input.minSafetyBending ?? 1.4
  const SHmin = input.minSafetyContact ?? 1.0

  const SH = sigmaH > 0 ? sigmaHlim / sigmaH : Infinity
  const SF = sigmaF > 0 ? sigmaFlim / sigmaF : Infinity

  return {
    geometry: {
      pitchDiameter1: d1,
      pitchDiameter2: d2,
      gearRatio: u,
      contactRatio: epsilonAlpha,
    },
    tangentialForce: Ft,
    pitchLineVelocity: velocity,
    factors: {
      YF: lookupYF(z1),
      YS: calcYS(z1),
      ZH,
      ZE: ZE_STEEL,
      Zepsilon,
      Zbeta,
      ZB,
      KA,
      KV,
      KHbeta,
      KHalpha,
      KFbeta,
      KFalpha,
    },
    contactStress: sigmaH,
    bendingStress: sigmaF,
    limits: { sigmaHlim, sigmaFlim },
    safetyContact: SH,
    safetyBending: SF,
    contactPass: SH >= SHmin,
    bendingPass: SF >= SFmin,
    minSafetyContact: SHmin,
    minSafetyBending: SFmin,
    materials: { pinion: matPinion.label, gear: matGear.label },
  }
}

export { GEAR_MATERIALS }
