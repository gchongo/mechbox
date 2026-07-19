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

export function calcTorsionStressCombined(torque, diameter, innerDiameter = 0) {
  const J =
    innerDiameter > 0 && innerDiameter < diameter
      ? (Math.PI * (diameter ** 4 - innerDiameter ** 4)) / 32
      : (Math.PI * diameter ** 4) / 32
  if (!J) return 0
  return (torque * 1000 * (diameter / 2)) / J
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

  let torsion = calcTorsionStressCombined(input.torque, d, di)
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
    unitNote: 'N_mm_MPa',
    estimateOnly: calcMode !== 'professional',
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    if (allow != null) {
      result.bendingPass = bending <= allow
      result.torsionPass = torsion <= torsionAllow
      result.combinedPass = equiv <= allow
      result.pass = result.combinedPass
      result.staticPass = result.combinedPass
    }
  }

  if (calcMode === 'professional') {
    const Kt = input.stressConcentrationBending ?? 1
    const Ktau = input.stressConcentrationTorsion ?? 1
    result.stressConcentrationBending = Kt
    result.stressConcentrationTorsion = Ktau

    const hasFatigueLoad =
      (input.bendingAmplitude != null && input.bendingAmplitude > 0) ||
      (input.torqueAmplitude != null && input.torqueAmplitude > 0)

    if (hasFatigueLoad) {
      const Ma = input.bendingAmplitude ?? 0
      const Ta = input.torqueAmplitude ?? 0
      const Mm =
        input.bendingMean ?? Math.max(0, (input.bendingMoment ?? 0) - Ma)
      const Tm = input.torqueMean ?? Math.max(0, (input.torque ?? 0) - Ta)

      const sigmaA = calcBendingStress(Ma, d, di) * Kt
      const tauA = calcTorsionStressCombined(Ta, d, di) * Ktau
      const sigmaM = calcBendingStress(Mm, d, di) * Kt
      const tauM = calcTorsionStressCombined(Tm, d, di) * Ktau
      // von Mises (or 3rd theory) equivalent amplitude — not bending-only
      const sigmaVmA = calcCombinedEquivalentStress(sigmaA, tauA, theory)
      const sigmaVmM = calcCombinedEquivalentStress(sigmaM, tauM, theory)

      const fatigue = assessComponentFatigue({
        materialId: input.materialId,
        snMaterial: input.snMaterial,
        yieldStrength: input.yieldStrength ?? mat?.sigmaS,
        stressAmplitude: sigmaVmA,
        meanStress: sigmaVmM,
        meanStressMethod: input.meanStressMethod,
        surfaceFactor: input.surfaceFactor,
        sizeFactor: input.sizeFactor,
        targetCycles: input.targetCycles ?? 1e6,
      })
      result.fatigueBendingAmplitude = sigmaA
      result.fatigueTorsionAmplitude = tauA
      result.fatigueAmplitude = sigmaVmA
      result.fatigueMean = sigmaVmM
      result.effectiveFatigueAmplitude = fatigue.effectiveAmplitude
      result.fatigueEndurance = fatigue.adjustedEndurance
      result.fatigueLife = fatigue.fatigueLife
      result.snMaterial = fatigue.snMaterial
      result.fatiguePass = fatigue.fatiguePass
      result.fatigueEstimateOnly = true
      result.pass = result.pass && result.fatiguePass
    }

    result.structureNotChecked = true
    result.verdictKey = result.pass ? 'static_ok_need_full' : 'need_adjust'
  }

  return result
}
