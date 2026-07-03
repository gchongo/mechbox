/** 实心/空心圆轴扭转应力与变形 */

import { findMaterial } from '@/constants/materials'
import { assessComponentFatigue } from '@/utils/fatigue-calc'

export function calcPolarMoment(diameter, innerDiameter = 0) {
  const d = diameter
  const di = innerDiameter ?? 0
  if (di > 0 && di < d) {
    return (Math.PI * (d ** 4 - di ** 4)) / 32
  }
  return (Math.PI * d ** 4) / 32
}

export function calcTorsionStress(torque, diameter, innerDiameter = 0) {
  const J = calcPolarMoment(diameter, innerDiameter)
  if (!J) return 0
  const Tnmm = torque * 1000
  return (Tnmm * (diameter / 2)) / J
}

export function calcTorsionAngle(torque, length, diameter, shearModulus = 79000, innerDiameter = 0) {
  const J = calcPolarMoment(diameter, innerDiameter)
  if (!J || !shearModulus) return 0
  const Tnmm = torque * 1000
  return (Tnmm * length) / (shearModulus * J) * (180 / Math.PI)
}

export function calcMinDiameterForTorque(torque, allowableShear, innerDiameter = 0) {
  if (!allowableShear) return 0
  const Tnmm = torque * 1000
  if (innerDiameter > 0) {
    const ratio = innerDiameter
    let d = 30
    for (let i = 0; i < 40; i++) {
      const tau = calcTorsionStress(torque, d, ratio)
      if (tau <= allowableShear) return d
      d += 1
    }
    return d
  }
  return Math.cbrt((16 * Tnmm) / (Math.PI * allowableShear))
}

export function analyzeShaftTorsion(input) {
  const calcMode = input.calcMode ?? 'simple'
  const d = input.diameter
  const di = calcMode === 'simple' ? 0 : input.innerDiameter ?? 0
  const mat = input.materialId ? findMaterial(input.materialId) : null
  const G = input.shearModulus ?? mat?.G ?? 79000
  let allow = input.allowableShear

  if (allow == null && mat) {
    allow = mat.tauAllow
  }
  if (allow == null && calcMode !== 'simple' && input.yieldStrength) {
    allow = 0.5 * input.yieldStrength
  }
  if (allow == null && calcMode === 'simple') {
    return { errorKey: 'material_required', calcMode }
  }

  let tau = calcTorsionStress(input.torque, d, di)
  const theta = calcTorsionAngle(input.torque, input.length ?? 500, d, G, di)
  const dMin = calcMinDiameterForTorque(input.torque, allow, di)

  const result = {
    calcMode,
    materialId: input.materialId ?? null,
    materialName: mat?.name ?? null,
    shearStress: tau,
    twistAngle: theta,
    polarMoment: calcPolarMoment(d, di),
    minDiameter: dMin,
    pass: tau <= allow,
    allowableShear: allow,
    hollowShaft: di > 0,
    innerDiameter: di,
    utilization: allow ? tau / allow : 0,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.torsionPass = tau <= allow
    result.anglePass = input.maxTwistAngle == null || theta <= input.maxTwistAngle
    result.pass = result.torsionPass && result.anglePass
  }

  if (calcMode === 'professional') {
    const Kt = input.stressConcentrationTorsion ?? 1
    const tauPeak = tau * Kt
    result.stressConcentrationTorsion = Kt
    result.peakShearStress = tauPeak
    result.peakPass = tauPeak <= allow

    if (input.torqueAmplitude != null && input.torqueAmplitude > 0) {
      const tauAmp = calcTorsionStress(input.torqueAmplitude, d, di) * Kt
      const torqueMean = input.torqueMean ?? Math.max(0, (input.torque ?? 0) - input.torqueAmplitude)
      const fatigue = assessComponentFatigue({
        materialId: input.materialId,
        snMaterial: input.snMaterial,
        yieldStrength: input.yieldStrength ?? mat?.sigmaS,
        stressMode: 'shear',
        stressAmplitude: tauAmp,
        meanStress: calcTorsionStress(torqueMean, d, di) * Kt,
        meanStressMethod: input.meanStressMethod,
        surfaceFactor: input.surfaceFactor,
        sizeFactor: input.sizeFactor,
        targetCycles: input.targetCycles ?? 1e6,
      })
      result.fatigueAmplitude = tauAmp
      result.fatigueMean = fatigue.meanStress
      result.effectiveFatigueAmplitude = fatigue.effectiveAmplitude
      result.fatigueEndurance = fatigue.adjustedEndurance
      result.fatigueLife = fatigue.fatigueLife
      result.snMaterial = fatigue.snMaterial
      result.fatiguePass = fatigue.fatiguePass
      result.pass = result.pass && result.peakPass && result.fatiguePass
    } else {
      result.pass = result.pass && result.peakPass
    }
  }

  return result
}
