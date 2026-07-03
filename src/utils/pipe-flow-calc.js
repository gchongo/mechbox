/**
 * 管路流阻 / 压降 — Darcy-Weisbach
 */

export const FLUID_PRESETS = {
  water: { label: '水 (20°C)', density: 998, viscosity: 1.002e-3 },
  oil: { label: '液压油', density: 870, viscosity: 46e-3 },
  air: { label: '空气 (20°C)', density: 1.2, viscosity: 18.1e-6 },
}

/** Reynolds 数 */
export function calcReynolds(velocity, diameter, density, viscosity) {
  return (density * velocity * diameter) / viscosity
}

/** Darcy 摩擦系数 — Swamee-Jain (湍流) / 64/Re (层流) */
export function calcFrictionFactor(Re, roughness, diameter) {
  if (Re < 2300) return 64 / Math.max(Re, 1)
  const relRough = roughness / diameter
  const term =
    relRough / 3.7 + 5.74 / Re ** 0.9
  return 0.25 / Math.log10(term) ** 2
}

/** 压降 ΔP (Pa) = f · (L/D) · (ρv²/2) */
export function calcPipePressureDrop(input) {
  const D = (input.diameter ?? 50) / 1000 // mm → m
  const L = (input.length ?? 100) / 1000
  const Q = input.flowRate ?? 10 // L/min
  const rho = input.density ?? 998
  const mu = input.viscosity ?? 1.002e-3
  const eps = (input.roughness ?? 0.045) / 1000 // mm → m

  const area = (Math.PI * D ** 2) / 4
  const Qm3s = (Q / 1000) / 60
  const v = area > 0 ? Qm3s / area : 0
  const Re = calcReynolds(v, D, rho, mu)
  const f = calcFrictionFactor(Re, eps, D)
  const dynamicHead = (rho * v ** 2) / 2
  const deltaP = f * (L / D) * dynamicHead
  const deltaPkPa = deltaP / 1000
  const headLoss = deltaP / (rho * 9.81)

  // 局部损失
  const kLocal = input.localLossK ?? 0
  const deltaPLocal = kLocal * dynamicHead
  const totalDeltaP = deltaP + deltaPLocal

  return {
    diameter: D * 1000,
    length: L * 1000,
    flowRate: Q,
    velocity: v,
    reynolds: Re,
    frictionFactor: f,
    pressureDrop: deltaP,
    pressureDropKPa: deltaPkPa,
    localLoss: deltaPLocal,
    totalPressureDrop: totalDeltaP,
    totalPressureDropKPa: totalDeltaP / 1000,
    headLoss,
    flowRegime: Re < 2300 ? '层流' : Re < 4000 ? '过渡' : '湍流',
  }
}

/** Hazen-Williams 水力（水管道，m/s 流速） */
export function calcHazenWilliams(diameter, length, flowRate, C = 130) {
  const D = diameter / 1000
  const L = length / 1000
  const Q = flowRate / 1000 / 60 // m³/s
  const A = (Math.PI * D ** 2) / 4
  const v = Q / A
  const hf = 10.67 * L * Q ** 1.852 / (C ** 1.852 * D ** 4.871)
  return { headLoss: hf, velocity: v, pressureDropKPa: hf * 9.81 }
}
