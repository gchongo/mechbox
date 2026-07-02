/** 实心圆轴扭转应力与变形 */

export function calcPolarMoment(diameter) {
  return (Math.PI * diameter ** 4) / 32
}

export function calcTorsionStress(torque, diameter) {
  const J = calcPolarMoment(diameter)
  if (!J) return 0
  const Tnmm = torque * 1000
  return (Tnmm * (diameter / 2)) / J
}

export function calcTorsionAngle(torque, length, diameter, shearModulus = 79000) {
  const J = calcPolarMoment(diameter)
  if (!J || !shearModulus) return 0
  const Tnmm = torque * 1000
  return (Tnmm * length) / (shearModulus * J) * (180 / Math.PI)
}

export function calcMinDiameterForTorque(torque, allowableShear) {
  if (!allowableShear) return 0
  const tau = allowableShear
  const Tnmm = torque * 1000
  return Math.cbrt((16 * Tnmm) / (Math.PI * tau))
}

export function analyzeShaftTorsion(input) {
  const d = input.diameter
  const tau = calcTorsionStress(input.torque, d)
  const theta = calcTorsionAngle(input.torque, input.length ?? 500, d, input.shearModulus)
  const allow = input.allowableShear ?? 40
  const dMin = calcMinDiameterForTorque(input.torque, allow)

  return {
    shearStress: tau,
    twistAngle: theta,
    polarMoment: calcPolarMoment(d),
    minDiameter: dMin,
    pass: tau <= allow,
    allowableShear: allow,
  }
}
