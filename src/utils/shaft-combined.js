/** 轴弯扭合成强度 (第三/第四强度理论) */

import { findMaterial } from '@/constants/materials'
import { assessComponentFatigue } from '@/utils/fatigue-calc'

export function calcBendingStress(moment, diameter, innerDiameter = 0) {
  const d = diameter
  const di = innerDiameter ?? 0
  const W =
    di > 0 && di < d
      ? (Math.PI * (d ** 4 - di ** 4)) / (32 * d)
      : (Math.PI * d ** 3) / 32
  if (!W) return 0
  return (moment * 1000) / W
}

export function calcCombinedEquivalentStress(bending, torsion, theory = 'vonMises') {
  if (theory === 'third') {
    return Math.sqrt(bending ** 2 + 4 * torsion ** 2)
  }
  return Math.sqrt(bending ** 2 + 3 * torsion ** 2)
}

export function analyzeShaftCombined(input) {
  const calcMode = input.calcMode ?? 'simple'
  const d = input.diameter
  const di = calcMode === 'simple' ? 0 : input.innerDiameter ?? 0
  const theory = input.strengthTheory ?? 'vonMises'
  const mat = input.materialId ? findMaterial(input.materialId) : null

  let torsion = calcTorsionStressLocal(input.torque, d, di)
  let bending = calcBendingStress(input.bendingMoment ?? 0, d, di)

  if (calcMode === 'professional') {
    const Kt = input.stressConcentrationBending ?? 1
    const Ktau = input.stressConcentrationTorsion ?? 1
    bending *= Kt
    torsion *= Ktau
  }

  const equiv = calcCombinedEquivalentStress(bending, torsion, theory)
  let allow = input.allowableStress

  if (allow == null && mat) {
    allow = mat.sigmaAllow
  }
  if (allow == null && input.yieldStrength) {
    allow = input.yieldStrength
  }
  if (allow == null && calcMode === 'simple') {
    return { errorKey: 'material_required', calcMode, needsMaterialInput: true }
  }
  if (allow == null) {
    allow = input.yieldStrength ?? 235
  }

  const torsionAllow = theory === 'third' ? allow / 2 : allow / Math.sqrt(3)

  const result = {
    calcMode,
    materialId: input.materialId ?? null,
    materialName: mat?.name ?? null,
    torsionStress: torsion,
    bendingStress: bending,
    equivalentStress: equiv,
    pass: allow != null ? equiv <= allow : false,
    allowableStress: allow,
    strengthTheory: theory,
    hollowShaft: di > 0,
    utilization: allow ? equiv / allow : 0,
    needsMaterialInput: allow == null,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    if (allow != null) {
      result.bendingPass = bending <= allow
      result.torsionPass = torsion <= torsionAllow
      result.combinedPass = equiv <= allow
      result.pass = result.combinedPass
    }
  }

  if (calcMode === 'professional') {
    result.stressConcentrationBending = input.stressConcentrationBending ?? 1
    result.stressConcentrationTorsion = input.stressConcentrationTorsion ?? 1

    if (input.bendingAmplitude != null && input.bendingAmplitude > 0) {
      const Kt = input.stressConcentrationBending ?? 1
      const sigmaAmp = calcBendingStress(input.bendingAmplitude, d, di) * Kt
      const sigmaMean =
        calcBendingStress(input.bendingMean ?? Math.max(0, (input.bendingMoment ?? 0) - input.bendingAmplitude), d, di) *
        Kt
      const fatigue = assessComponentFatigue({
        materialId: input.materialId,
        snMaterial: input.snMaterial,
        yieldStrength: input.yieldStrength ?? mat?.sigmaS,
        stressAmplitude: sigmaAmp,
        meanStress: sigmaMean,
        meanStressMethod: input.meanStressMethod,
        surfaceFactor: input.surfaceFactor,
        sizeFactor: input.sizeFactor,
        targetCycles: input.targetCycles ?? 1e6,
      })
      result.fatigueAmplitude = sigmaAmp
      result.fatigueMean = fatigue.meanStress
      result.effectiveFatigueAmplitude = fatigue.effectiveAmplitude
      result.fatigueEndurance = fatigue.adjustedEndurance
      result.fatigueLife = fatigue.fatigueLife
      result.snMaterial = fatigue.snMaterial
      result.fatiguePass = fatigue.fatiguePass
      result.pass = result.pass && result.fatiguePass
    }
  }

  return result
}

function calcTorsionStressLocal(torque, diameter, innerDiameter = 0) {
  const J =
    innerDiameter > 0 && innerDiameter < diameter
      ? (Math.PI * (diameter ** 4 - innerDiameter ** 4)) / 32
      : (Math.PI * diameter ** 4) / 32
  if (!J) return 0
  return (torque * 1000 * (diameter / 2)) / J
}
