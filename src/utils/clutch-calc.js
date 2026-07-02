/** 摩擦离合器扭矩计算 (简化) */

export function calcClutchTorque({ frictionCoeff, force, radius, surfaces = 1 }) {
  return frictionCoeff * force * radius * surfaces / 1000 // N·mm → N·m
}

export function calcRequiredForce({ torque, frictionCoeff, radius, surfaces = 1 }) {
  if (!frictionCoeff || !radius || !surfaces) return 0
  return (torque * 1000) / (frictionCoeff * radius * surfaces)
}

export function analyzeClutch(input) {
  const torque = input.torque ?? calcClutchTorque(input)
  const force = input.force ?? calcRequiredForce({ ...input, torque: input.requiredTorque })
  const power = (torque * 2 * Math.PI * (input.rpm ?? 0)) / 60000 // kW
  const allow = input.allowableTorque ?? Infinity

  return {
    torque,
    clampForce: force,
    power,
    pass: torque <= allow,
    allowableTorque: allow,
  }
}
