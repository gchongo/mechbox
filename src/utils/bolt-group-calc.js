/** 螺栓组受力 (形心分解简化) */

export function analyzeBoltGroup(input) {
  const n = input.boltCount ?? 4
  const radius = input.boltCircleRadius ?? 50
  const Fx = input.shearX ?? 0
  const Fy = input.shearY ?? 0
  const M = input.moment ?? 0
  const rMax = radius
  const J = n * rMax ** 2
  const direct = Math.sqrt(Fx ** 2 + Fy ** 2) / n
  const torsion = (M * rMax) / J
  const maxForce = direct + torsion
  const allow = input.allowPerBolt ?? 8000
  return {
    directPerBolt: direct,
    torsionPerBolt: torsion,
    maxBoltForce: maxForce,
    pass: maxForce <= allow,
    allowPerBolt: allow,
  }
}
