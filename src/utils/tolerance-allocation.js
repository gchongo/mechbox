import { rssMethod } from './size-chain-math'
import { normalizeFactors, verifyAllocation } from './tolerance-allocation-helpers'

export { normalizeFactors, verifyAllocation } from './tolerance-allocation-helpers'

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

/** 灵敏度加权 RSS：Tᵢ ∝ sᵢ · fᵢ */
export function sensitivityAllocation(targetTolerance, rings) {
  const items = normalizeFactors(rings)
  const weights = items.map((r) => Math.abs(r.factor) * Math.max(r.sensitivity ?? 1, 0.001))
  const denom = Math.sqrt(weights.reduce((s, w) => s + w ** 2, 0))
  if (!denom) return equalEffectAllocation(targetTolerance, rings)
  const k = targetTolerance / denom
  return items.map((r, i) => ({
    name: r.name,
    factor: r.factor,
    cost: r.cost,
    sensitivity: r.sensitivity ?? 1,
    tolerance: k * weights[i],
  }))
}

/** 迭代灵敏度分配（3 轮收敛） */
export function iterativeSensitivityAllocation(targetTolerance, rings, rounds = 3) {
  let items = normalizeFactors(rings).map((r) => ({
    ...r,
    sensitivity: r.sensitivity ?? 1,
  }))
  let allocated = equalEffectAllocation(targetTolerance, items)
  for (let n = 0; n < rounds; n++) {
    items = items.map((r, i) => ({
      ...r,
      sensitivity: Math.max(0.001, (allocated[i]?.tolerance ?? r.sensitivity) / targetTolerance),
    }))
    allocated = sensitivityAllocation(targetTolerance, items)
  }
  return allocated
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
  sensitivity: {
    id: 'sensitivity',
    label: '灵敏度 RSS',
    desc: '按灵敏度系数 sᵢ 加权，Tᵢ ∝ sᵢ·fᵢ',
    allocate: sensitivityAllocation,
  },
  'sensitivity-iter': {
    id: 'sensitivity-iter',
    label: '迭代灵敏度',
    desc: '多轮调整灵敏度系数直至 RSS 收敛',
    allocate: iterativeSensitivityAllocation,
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
