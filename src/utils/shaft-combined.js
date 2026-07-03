/** 轴弯扭合成强度 (第三/第四强度理论) */

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

  let torsion = calcTorsionStressLocal(input.torque, d, di)
  let bending = calcBendingStress(input.bendingMoment ?? 0, d, di)

  if (calcMode === 'professional') {
    const Kt = input.stressConcentrationBending ?? 1
    const Ktau = input.stressConcentrationTorsion ?? 1
    bending *= Kt
    torsion *= Ktau
  }

  const equiv = calcCombinedEquivalentStress(bending, torsion, theory)
  let allow = input.allowableStress ?? 60

  if (calcMode !== 'simple' && input.yieldStrength) {
    allow = input.allowableStress ?? 0.577 * input.yieldStrength
  }

  const result = {
    calcMode,
    torsionStress: torsion,
    bendingStress: bending,
    equivalentStress: equiv,
    pass: equiv <= allow,
    allowableStress: allow,
    strengthTheory: theory,
    hollowShaft: di > 0,
    utilization: allow ? equiv / allow : 0,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.bendingPass = bending <= allow
    result.torsionPass = torsion <= allow * 0.577
    result.combinedPass = equiv <= allow
    result.pass = result.combinedPass
  }

  if (calcMode === 'professional') {
    result.stressConcentrationBending = input.stressConcentrationBending ?? 1
    result.stressConcentrationTorsion = input.stressConcentrationTorsion ?? 1

    if (input.bendingAmplitude != null && input.bendingAmplitude > 0) {
      const sigmaAmp = calcBendingStress(input.bendingAmplitude, d, di) * (input.stressConcentrationBending ?? 1)
      const endurance = input.enduranceLimit ?? 0.5 * (input.yieldStrength ?? 235)
      result.fatigueAmplitude = sigmaAmp
      result.fatigueEndurance = endurance
      result.fatiguePass = sigmaAmp <= endurance
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
