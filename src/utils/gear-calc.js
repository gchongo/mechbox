/** 直齿轮几何参数 */
import { GEAR_MATERIALS } from '@/constants/gear-materials'
import { analyzeGearISO6336 } from '@/utils/gear-iso6336'
import { analyzeGearAGMA, compareGearStandards } from '@/utils/gear-agma'

export function calcGearGeometry({ module, teeth, pressureAngle = 20 }) {
  const m = module
  const z = teeth
  const alpha = (pressureAngle * Math.PI) / 180
  const d = m * z
  return {
    pitchDiameter: d,
    baseDiameter: d * Math.cos(alpha),
    addendum: m,
    dedendum: 1.25 * m,
    wholeDepth: 2.25 * m,
    circularPitch: Math.PI * m,
  }
}

/** 圆周力 Ft (N)，扭矩 T (N·m)，分度圆直径 d (mm) */
export function calcTangentialForce(torque, pitchDiameter) {
  if (!pitchDiameter) return 0
  return (2000 * torque) / pitchDiameter
}

/** Lewis 近似弯曲应力 (MPa) */
export function calcBendingStress({ force, faceWidth, module, formFactor = 2.65 }) {
  const denom = faceWidth * module * formFactor
  if (!denom) return 0
  return force / denom
}

/** 简化接触应力估算 (MPa)，u 为齿数比 */
export function calcContactStress({ force, faceWidth, pitchDiameter, gearRatio = 1 }) {
  const u = Math.max(gearRatio, 1)
  const denom = faceWidth * pitchDiameter * u
  if (!denom || force <= 0) return 0
  return 118 * Math.sqrt((force * (u + 1)) / denom)
}

/** 线速度 (m/s) */
export function calcPitchLineVelocity(pitchDiameter, rpm) {
  return (Math.PI * pitchDiameter * rpm) / 60000
}

/** 综合齿轮强度分析 */
export function analyzeGearStrength(input) {
  const geo = calcGearGeometry(input)
  const force = calcTangentialForce(input.torque, geo.pitchDiameter)
  const sigmaF = calcBendingStress({
    force,
    faceWidth: input.faceWidth,
    module: input.module,
    formFactor: input.formFactor ?? 2.65,
  })
  const sigmaH = calcContactStress({
    force,
    faceWidth: input.faceWidth,
    pitchDiameter: geo.pitchDiameter,
    gearRatio: input.gearRatio ?? 1,
  })
  const velocity = calcPitchLineVelocity(geo.pitchDiameter, input.rpm ?? 0)

  const matKey = input.material ?? 'st-soft'
  const mat = GEAR_MATERIALS[matKey] ?? GEAR_MATERIALS['st-soft']
  const bendingSf = input.bendingSafetyFactor ?? 1.4
  const contactSf = input.contactSafetyFactor ?? 1.2
  const allowBend = input.allowBending ?? mat.sigmaFlim / bendingSf
  const allowContact = input.allowContact ?? mat.sigmaHlim / contactSf

  return {
    calcMode: 'simple',
    geometry: geo,
    tangentialForce: force,
    bendingStress: sigmaF,
    contactStress: sigmaH,
    pitchLineVelocity: velocity,
    bendingPass: sigmaF <= allowBend,
    contactPass: sigmaH <= allowContact,
    strengthPass: sigmaF <= allowBend && sigmaH <= allowContact,
    allowBending: allowBend,
    allowContact: allowContact,
    material: matKey,
    materialLabel: mat.label,
    pass: false,
    estimateOnly: true,
  }
}

/** 归一化齿轮输入（小齿/大齿齿数） */
export function normalizeGearInput(input) {
  const z1 = input.pinionTeeth ?? input.teeth ?? 24
  const z2 =
    input.gearTeeth ??
    Math.round(z1 * (input.gearRatio ?? 3))
  return {
    ...input,
    pinionTeeth: z1,
    gearTeeth: z2,
    gearRatio: z2 / z1,
  }
}

/** 统一入口：按 calcMode 返回简化 / ISO6336 / ISO+AGMA 对照 */
export function analyzeGear(input) {
  const calcMode = input.calcMode ?? 'complete'
  const normalized = normalizeGearInput(input)

  if (calcMode === 'simple') {
    return analyzeGearStrength({
      ...normalized,
      teeth: normalized.pinionTeeth,
    })
  }

  const iso = analyzeGearISO6336(normalized)
  const result = {
    calcMode,
    standard: 'ISO6336',
    geometry: iso.geometry,
    tangentialForce: iso.tangentialForce,
    pitchLineVelocity: iso.pitchLineVelocity,
    bendingStress: iso.bendingStress,
    contactStress: iso.contactStress,
    factors: iso.factors,
    limits: iso.limits,
    safetyBending: iso.safetyBending,
    safetyContact: iso.safetyContact,
    bendingPass: iso.bendingPass,
    contactPass: iso.contactPass,
    materials: iso.materials,
    iso1328: iso.iso1328,
    pass: iso.bendingPass && iso.contactPass,
    estimateOnly: false,
  }

  if (calcMode === 'professional') {
    const agma = analyzeGearAGMA(normalized)
    result.agma = agma
    result.compare = compareGearStandards(iso, agma)
    result.pass = result.compare.bothPass
  }

  return result
}
