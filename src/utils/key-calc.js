/** 平键连接强度 (GB/T 1096 简化) */

export const KEY_SIZE_TABLE = [
  { dMin: 6, dMax: 8, width: 2, height: 2 },
  { dMin: 8, dMax: 10, width: 3, height: 3 },
  { dMin: 10, dMax: 12, width: 4, height: 4 },
  { dMin: 12, dMax: 17, width: 5, height: 5 },
  { dMin: 17, dMax: 22, width: 6, height: 6 },
  { dMin: 22, dMax: 30, width: 8, height: 7 },
  { dMin: 30, dMax: 38, width: 10, height: 8 },
  { dMin: 38, dMax: 44, width: 12, height: 8 },
  { dMin: 44, dMax: 50, width: 14, height: 9 },
]

export function lookupKeySize(shaftDiameter) {
  const row = KEY_SIZE_TABLE.find((r) => shaftDiameter >= r.dMin && shaftDiameter <= r.dMax)
  return row ?? KEY_SIZE_TABLE[KEY_SIZE_TABLE.length - 1]
}

export function calcKeyShearStress(force, keyWidth, keyLength) {
  const area = keyWidth * keyLength
  if (!area) return 0
  return force / area
}

export function calcKeyCrushStress(force, keyHeight, hubLength) {
  const area = keyHeight * (hubLength / 2)
  if (!area) return 0
  return force / area
}

export function calcTangentialForce(torque, shaftDiameter) {
  if (!shaftDiameter) return 0
  return (torque * 2000) / shaftDiameter
}

export function analyzeKeyConnection(input) {
  const calcMode = input.calcMode ?? 'simple'
  const shaftD = input.shaftDiameter ?? 30
  const stdKey = lookupKeySize(shaftD)

  const keyWidth = calcMode === 'simple' ? input.keyWidth : input.keyWidth ?? stdKey.width
  const keyHeight = input.keyHeight ?? stdKey.height
  const keyLength = input.keyLength ?? stdKey.width * 3.5
  const hubLength = input.hubLength ?? keyLength
  const keyCount = calcMode === 'professional' ? input.keyCount ?? 1 : 1

  const force = input.tangentialForce ?? calcTangentialForce(input.torque ?? 0, shaftD)
  const forcePerKey = force / keyCount
  const tau = calcKeyShearStress(forcePerKey, keyWidth, keyLength)
  const sigmaC = calcKeyCrushStress(forcePerKey, keyHeight, hubLength)

  const allowTau = input.allowShear ?? 100
  const allowCrush = input.allowCrush ?? 150

  const result = {
    calcMode,
    tangentialForce: force,
    forcePerKey,
    keyWidth,
    keyHeight,
    keyLength,
    hubLength,
    keyCount,
    shearStress: tau,
    crushStress: sigmaC,
    pass: tau <= allowTau && sigmaC <= allowCrush,
    allowShear: allowTau,
    allowCrush: allowCrush,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.standardKey = stdKey
    result.shearPass = tau <= allowTau
    result.crushPass = sigmaC <= allowCrush
    result.shearUtilization = allowTau ? tau / allowTau : 0
    result.crushUtilization = allowCrush ? sigmaC / allowCrush : 0
    result.minKeyLengthShear = allowTau ? forcePerKey / (keyWidth * allowTau) : 0
    result.minKeyLengthCrush = allowCrush ? (2 * forcePerKey) / (keyHeight * allowCrush) : 0
    result.recommendedLength = Math.max(result.minKeyLengthShear, result.minKeyLengthCrush)
    result.lengthPass = keyLength >= result.recommendedLength
    result.pass = result.shearPass && result.crushPass && result.lengthPass
  }

  if (calcMode === 'professional') {
    const tAmp = input.torqueAmplitude ?? 0
    if (tAmp > 0) {
      const fAmp = calcTangentialForce(tAmp, shaftD) / keyCount
      const tauAmp = calcKeyShearStress(fAmp, keyWidth, keyLength)
      const endurance = input.enduranceLimit ?? allowTau * 0.45
      result.shearAmplitude = tauAmp
      result.fatigueEndurance = endurance
      result.fatiguePass = tauAmp <= endurance
      result.pass = result.pass && result.fatiguePass
    }
    if (input.requiredSafetyFactor) {
      result.pass = result.pass && tau <= allowTau / input.requiredSafetyFactor && sigmaC <= allowCrush / input.requiredSafetyFactor
    }
  }

  return result
}
