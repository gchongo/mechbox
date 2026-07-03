import { rssMethod } from './size-chain-math'

export function normalizeFactors(rings) {
  return rings.map((r) => ({
    name: r.name?.trim() || '环',
    factor: Math.max(r.factor ?? 1, 0),
    cost: Math.max(r.cost ?? 1, 0.001),
    nominal: Math.max(r.nominal ?? 1, 0.001),
    sensitivity: Math.max(r.sensitivity ?? 1, 0.001),
  }))
}

export function verifyAllocation(tolerances, factors, targetTolerance) {
  const mapped = tolerances.map((t, i) => ({
    tolerance: t,
    factor: factors[i] ?? 1,
  }))
  const stacked = rssMethod(mapped)
  return {
    stacked,
    pass: stacked <= targetTolerance + 1e-9,
    utilization: targetTolerance > 0 ? (stacked / targetTolerance) * 100 : 0,
  }
}
