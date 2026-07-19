/** 摩擦离合器扭矩计算 */

export function calcClutchTorque({ frictionCoeff, force, radius, surfaces = 1 }) {
  return (frictionCoeff * force * radius * surfaces) / 1000
}

export function calcRequiredForce({ torque, frictionCoeff, radius, surfaces = 1 }) {
  if (!frictionCoeff || !radius || !surfaces) return 0
  return (torque * 1000) / (frictionCoeff * radius * surfaces)
}

/** 均匀磨损模型有效半径 R = 2/3 · (Ro³−Ri³)/(Ro²−Ri²) */
export function calcMeanFrictionRadius(innerDiameter, outerDiameter) {
  const Ri = innerDiameter / 2
  const Ro = outerDiameter / 2
  if (Ro <= Ri) return Ro
  return (2 * (Ro ** 3 - Ri ** 3)) / (3 * (Ro ** 2 - Ri ** 2))
}

/** 离心效应减载 (简化)：ΔF ≈ m ω² (Do/2) */
export function calcCentrifugalReduction(rpm, outerDiameter, massPerPlate = 0.5) {
  const omega = (rpm * 2 * Math.PI) / 60
  const r = outerDiameter / 2000
  return massPerPlate * omega ** 2 * r
}

export function analyzeClutch(input) {
  const calcMode = input.calcMode ?? 'simple'
  let radius = input.radius ?? 80
  let force = input.force ?? 0

  if (calcMode !== 'simple' && input.innerDiameter && input.outerDiameter) {
    radius = calcMeanFrictionRadius(input.innerDiameter, input.outerDiameter)
  }

  const torque =
    input.torque ??
    calcClutchTorque({
      frictionCoeff: input.frictionCoeff ?? 0.15,
      force: force || calcRequiredForce({ ...input, radius, torque: input.requiredTorque }),
      radius,
      surfaces: input.surfaces ?? 1,
    })

  if (!force && input.requiredTorque) {
    force = calcRequiredForce({
      torque: input.requiredTorque,
      frictionCoeff: input.frictionCoeff ?? 0.15,
      radius,
      surfaces: input.surfaces ?? 1,
    })
  } else if (!force) {
    force = input.force ?? 0
  }

  const rpm = input.rpm ?? 0
  const power = (torque * 2 * Math.PI * rpm) / 60000
  const hasAllowable =
    input.allowableTorque != null && Number.isFinite(input.allowableTorque) && input.allowableTorque > 0
  const allow = hasAllowable ? input.allowableTorque : null
  const torquePass = hasAllowable ? torque <= allow : false
  const hasRequired =
    input.requiredTorque != null && Number.isFinite(input.requiredTorque) && input.requiredTorque > 0

  const result = {
    calcMode,
    torque,
    clampForce: force,
    effectiveRadius: radius,
    power,
    torquePass,
    pass: torquePass,
    allowableTorque: allow,
    allowableRequired: !hasAllowable && !(calcMode === 'professional' && hasRequired),
  }

  if (calcMode === 'simple') {
    result.estimateOnly = true
    result.pass = false
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const area =
      input.innerDiameter && input.outerDiameter
        ? (Math.PI * (input.outerDiameter ** 2 - input.innerDiameter ** 2)) / 4
        : (Math.PI * (2 * radius) ** 2) / 4
    result.contactArea = area
    result.contactPressure = area ? force / area : 0
    result.maxPressure = input.maxPressure ?? 1.5
    result.pressurePass = !result.contactPressure || result.contactPressure <= result.maxPressure
    result.utilization = hasAllowable ? torque / allow : null
    result.pass = torquePass && result.pressurePass
    if (!hasAllowable) result.estimateOnly = true
  }

  if (calcMode === 'professional') {
    const centrifugal = calcCentrifugalReduction(
      rpm,
      input.outerDiameter ?? radius * 2,
      input.plateMass ?? 0.5,
    )
    result.centrifugalForce = centrifugal
    const effectiveForce = Math.max(0, force - centrifugal)
    result.effectiveClampForce = effectiveForce
    const torqueAtSpeed = calcClutchTorque({
      frictionCoeff: input.frictionCoeff ?? 0.15,
      force: effectiveForce,
      radius,
      surfaces: input.surfaces ?? 1,
    })
    result.torqueAtSpeed = torqueAtSpeed
    const fade = input.thermalFade ?? 1
    result.thermalFade = fade
    result.deratedTorque = torqueAtSpeed * fade
    const sf = input.safetyFactor ?? 1.2
    result.safetyFactor = sf
    if (hasRequired) {
      result.designTorqueRequired = input.requiredTorque * sf
      result.designPass =
        result.deratedTorque >= result.designTorqueRequired && result.pressurePass !== false
      result.pass = result.designPass
      result.estimateOnly = false
    } else if (!hasAllowable) {
      result.estimateOnly = true
      result.pass = false
    }
  }

  return result
}
