import { rssMethod } from './size-chain-math'

function normalizeFactors(rings) {
  return rings.map((r) => ({
    name: r.name?.trim() || '环',
    factor: Math.max(r.factor ?? 1, 0),
    cost: Math.max(r.cost ?? 1, 0.001),
    nominal: Math.max(r.nominal ?? 1, 0.001),
  }))
}

function verifyAllocation(tolerances, factors, targetTolerance) {
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

/** 等贡献 RSS：各环 (Tᵢ/fᵢ)² 相等 */
export function equalEffectAllocation(targetTolerance, rings) {
  const items = normalizeFactors(rings)
  const denom = Math.sqrt(items.reduce((s, r) => s + r.factor ** 2, 0))
  if (!denom) {
    return items.map((r) => ({ name: r.name, tolerance: 0, factor: r.factor, cost: r.cost }))
  }
  const k = targetTolerance / denom
  return items.map((r) => ({
    name: r.name,
    factor: r.factor,
    cost: r.cost,
    tolerance: k * r.factor,
  }))
}

/** 等公差分配（忽略传递系数） */
export function equalToleranceAllocation(targetTolerance, rings) {
  const items = normalizeFactors(rings)
  const n = items.length || 1
  const each = targetTolerance / Math.sqrt(n)
  return items.map((r) => ({
    name: r.name,
    factor: r.factor,
    cost: r.cost,
    tolerance: each,
  }))
}

/** 按名义尺寸比例分配（适用于极值法场景参考） */
export function proportionalAllocation(targetTolerance, rings) {
  const items = normalizeFactors(rings)
  const sumNom = items.reduce((s, r) => s + r.nominal, 0)
  if (!sumNom) {
    return equalToleranceAllocation(targetTolerance, rings)
  }
  return items.map((r) => ({
    name: r.name,
    factor: r.factor,
    cost: r.cost,
    nominal: r.nominal,
    tolerance: targetTolerance * (r.nominal / sumNom),
  }))
}

/** 最小成本 RSS：Tᵢ ∝ √(cᵢ) · fᵢ */
export function minimumCostAllocation(targetTolerance, rings) {
  const items = normalizeFactors(rings)
  const denom = Math.sqrt(
    items.reduce((s, r) => s + r.cost * r.factor ** 2, 0),
  )
  if (!denom) {
    return equalToleranceAllocation(targetTolerance, rings)
  }
  const k = targetTolerance / denom
  return items.map((r) => ({
    name: r.name,
    factor: r.factor,
    cost: r.cost,
    tolerance: k * Math.sqrt(r.cost) * r.factor,
  }))
}

export const ALLOCATION_METHODS = {
  'equal-effect': {
    id: 'equal-effect',
    label: '等贡献 RSS',
    desc: '各环方差贡献相等，Tᵢ = T·fᵢ/√(Σf²)',
    allocate: equalEffectAllocation,
  },
  'equal-tol': {
    id: 'equal-tol',
    label: '等公差 RSS',
    desc: '各环分配相同公差，再验证 RSS 叠加',
    allocate: equalToleranceAllocation,
  },
  proportional: {
    id: 'proportional',
    label: '比例分配',
    desc: '按名义尺寸比例分配总公差（极值法参考）',
    allocate: proportionalAllocation,
  },
  'min-cost': {
    id: 'min-cost',
    label: '最小成本 RSS',
    desc: '成本系数越大分配越小，Tᵢ ∝ √(cᵢ)·fᵢ',
    allocate: minimumCostAllocation,
  },
}

export function runToleranceAllocation(methodId, targetTolerance, rings) {
  const method = ALLOCATION_METHODS[methodId] ?? ALLOCATION_METHODS['equal-effect']
  const allocated = method.allocate(targetTolerance, rings)
  const factors = allocated.map((r) => r.factor)
  const tolerances = allocated.map((r) => r.tolerance)
  const verify = verifyAllocation(tolerances, factors, targetTolerance)
  return {
    method: method.label,
    methodId: method.id,
    allocated,
    verify,
  }
}
