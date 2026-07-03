/**
 * AGMA 2101 齿轮强度校核（简化，与 ISO 6336 并列）
 * 接触：σc = Cp √[Wt·Ko·Kv·Km/(b·d·I) · (u+1)/u]
 * 弯曲：σt = Wt·Ko·Kv·Km·Ks / (b·m·J)
 */
import { GEAR_MATERIALS, lookupYF, calcYS } from '@/constants/gear-materials'
import { calcTangentialForce, calcPitchLineVelocity } from './gear-calc'
import { calcContactRatio } from './gear-iso6336'
import { estimateKVFromISO1328, linkISO1328ToISO6336 } from './iso-1328'

export const Cp_STEEL = 190 // (N/mm²)^0.5 弹性系数

/** 几何系数 I（接触，简化） */
export function calcGeometryFactorI(z1, z2, pressureAngle = 20) {
  const u = z2 / z1
  const alpha = (pressureAngle * Math.PI) / 180
  const base = 0.35 + 0.25 / Math.sqrt(u)
  const angleAdj = 1 + (20 - pressureAngle) * 0.005
  return Math.max(0.08, base * angleAdj * Math.cos(alpha) ** 0.5)
}

/** 几何系数 J（弯曲，简化） */
export function calcGeometryFactorJ(z1, pressureAngle = 20) {
  const Y = lookupYF(z1)
  const YS = calcYS(z1)
  const r = 0.5 * (1 - Math.sin((pressureAngle * Math.PI) / 180))
  return Math.max(0.05, Y * YS * r * 0.04)
}

/** 尺寸系数 Ks */
export function calcSizeFactorKs(module) {
  if (module >= 5) return 0.85
  if (module >= 2) return 0.95
  return 1.0
}

export function analyzeGearAGMA(input) {
  const z1 = input.pinionTeeth ?? 24
  const z2 = input.gearTeeth ?? z1 * 3
  const u = z2 / z1
  const m = input.module
  const d1 = m * z1
  const b = input.faceWidth ?? 20
  const alpha = input.pressureAngle ?? 20

  const Ft = calcTangentialForce(input.torque, d1)
  const velocity = calcPitchLineVelocity(d1, input.rpm ?? 0)

  const Ko = input.applicationFactor ?? 1.25
  const Km = input.loadDistributionFactor ?? 1.2
  const Ks = calcSizeFactorKs(m)

  const iso1328 = linkISO1328ToISO6336({
    module: m,
    pinionTeeth: z1,
    faceWidth: b,
    iso1328Grade: input.iso1328Grade ?? input.qualityGrade ?? 6,
    pitchLineVelocity: velocity,
  })
  const Kv = input.dynamicFactor ?? iso1328.dynamicFactorKV

  const I = calcGeometryFactorI(z1, z2, alpha)
  const J = calcGeometryFactorJ(z1, alpha)

  const contactStress =
    Cp_STEEL *
    Math.sqrt(
      ((Ft * Ko * Kv * Km) / (b * d1 * I)) * ((u + 1) / u),
    )

  const bendingStress = (Ft * Ko * Kv * Km * Ks) / (b * m * J)

  const matPinion = GEAR_MATERIALS[input.pinionMaterial ?? 'st-soft'] ?? GEAR_MATERIALS['st-soft']
  const matGear = GEAR_MATERIALS[input.gearMaterial ?? 'st-soft'] ?? GEAR_MATERIALS['st-soft']
  const Sac = Math.min(matPinion.sigmaHlim, matGear.sigmaHlim)
  const Sat = Math.min(matPinion.sigmaFlim, matGear.sigmaFlim)

  const SHmin = input.minSafetyContact ?? 1.0
  const SFmin = input.minSafetyBending ?? 1.4

  const SH = contactStress > 0 ? Sac / contactStress : Infinity
  const SF = bendingStress > 0 ? Sat / bendingStress : Infinity

  const epsilonAlpha = calcContactRatio({ module: m, z1, z2, pressureAngle: alpha })

  return {
    standard: 'AGMA 2101 (simplified)',
    geometry: { pitchDiameter1: d1, gearRatio: u, contactRatio: epsilonAlpha },
    tangentialForce: Ft,
    pitchLineVelocity: velocity,
    factors: { Cp: Cp_STEEL, Ko, Kv, Km, Ks, I, J },
    contactStress,
    bendingStress,
    limits: { Sac, Sat },
    safetyContact: SH,
    safetyBending: SF,
    contactPass: SH >= SHmin,
    bendingPass: SF >= SFmin,
    iso1328,
    materials: { pinion: matPinion.label, gear: matGear.label },
  }
}

/** ISO vs AGMA 结果对比 */
export function compareGearStandards(isoResult, agmaResult) {
  return {
    contactStress: {
      iso: isoResult.contactStress,
      agma: agmaResult.contactStress,
      diffPct:
        ((agmaResult.contactStress - isoResult.contactStress) / isoResult.contactStress) * 100,
    },
    bendingStress: {
      iso: isoResult.bendingStress,
      agma: agmaResult.bendingStress,
      diffPct:
        ((agmaResult.bendingStress - isoResult.bendingStress) / isoResult.bendingStress) * 100,
    },
    safetyContact: { iso: isoResult.safetyContact, agma: agmaResult.safetyContact },
    safetyBending: { iso: isoResult.safetyBending, agma: agmaResult.safetyBending },
    bothPass:
      isoResult.contactPass &&
      isoResult.bendingPass &&
      agmaResult.contactPass &&
      agmaResult.bendingPass,
  }
}
