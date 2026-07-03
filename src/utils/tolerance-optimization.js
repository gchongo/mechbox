/**
 * 公差分配 — 遗传算法与多目标优化
 */
import { rssMethod } from './size-chain-math'
import { normalizeFactors, verifyAllocation } from './tolerance-allocation-helpers'

export { normalizeFactors, verifyAllocation } from './tolerance-allocation-helpers'

function totalCost(tolerances, rings) {
  return tolerances.reduce((s, t, i) => {
    const c = rings[i]?.cost ?? 1
    const n = rings[i]?.nominal ?? 1
    return s + c * (n / Math.max(t, 1e-6))
  }, 0)
}

function randomTolerance(min, max) {
  return min + Math.random() * (max - min)
}

/** 遗传算法：最小化成本，约束 RSS ≤ target */
export function geneticAlgorithmAllocation(
  targetTolerance,
  rings,
  options = {},
) {
  const items = normalizeFactors(rings)
  const n = items.length
  const popSize = options.populationSize ?? 80
  const generations = options.generations ?? 120
  const mutationRate = options.mutationRate ?? 0.15
  const tMin = options.tMin ?? targetTolerance * 0.005
  const tMax = options.tMax ?? targetTolerance * 2

  function fitness(tolerances) {
    const factors = items.map((r) => r.factor)
    const stacked = rssMethod(
      tolerances.map((t, i) => ({ tolerance: t, factor: factors[i] })),
    )
    const cost = totalCost(tolerances, items)
    const penalty = stacked > targetTolerance ? (stacked - targetTolerance) * 1e6 : 0
    return { stacked, cost: cost + penalty, feasible: stacked <= targetTolerance + 1e-9 }
  }

  function mutate(t) {
    return t.map((v) => {
      if (Math.random() < mutationRate) {
        return Math.min(tMax, Math.max(tMin, v * (0.8 + Math.random() * 0.4)))
      }
      return v
    })
  }

  function crossover(a, b) {
    const point = Math.floor(Math.random() * n)
    return [...a.slice(0, point), ...b.slice(point)]
  }

  let population = Array.from({ length: popSize }, () =>
    Array.from({ length: n }, () => randomTolerance(tMin, tMax)),
  )

  let best = null

  for (let g = 0; g < generations; g++) {
    const scored = population
      .map((tols) => ({ tols, ...fitness(tols) }))
      .sort((a, b) => a.cost - b.cost)

    if (!best || scored[0].cost < best.cost) {
      best = scored[0]
    }

    const next = scored.slice(0, Math.floor(popSize * 0.2)).map((s) => s.tols)
    while (next.length < popSize) {
      const p1 = scored[Math.floor(Math.random() * popSize * 0.5)].tols
      const p2 = scored[Math.floor(Math.random() * popSize * 0.5)].tols
      next.push(mutate(crossover(p1, p2)))
    }
    population = next
  }

  const factors = items.map((r) => r.factor)
  const tolerances = best.tols
  const verify = verifyAllocation(tolerances, factors, targetTolerance)

  return {
    allocated: items.map((r, i) => ({
      name: r.name,
      factor: r.factor,
      cost: r.cost,
      tolerance: tolerances[i],
    })),
    verify,
    totalCost: totalCost(tolerances, items),
    generations,
    feasible: verify.pass,
  }
}

/**
 * 多目标 Pareto：成本 vs RSS 利用率
 * 返回非支配解集
 */
export function multiObjectivePareto(
  targetTolerance,
  rings,
  options = {},
) {
  const items = normalizeFactors(rings)
  const n = items.length
  const samples = options.samples ?? 200
  const tMin = options.tMin ?? targetTolerance * 0.01
  const tMax = options.tMax ?? targetTolerance * 1.5

  const candidates = []

  // 解析法采样 + 随机扰动
  for (let s = 0; s < samples; s++) {
    let tols
    if (s < samples / 2) {
      const scale = tMin + (s / (samples / 2)) * (tMax - tMin)
      tols = items.map((r) => scale * Math.sqrt(r.cost) * r.factor)
    } else {
      tols = items.map(() => randomTolerance(tMin, tMax))
    }

    const factors = items.map((r) => r.factor)
    const stacked = rssMethod(
      tols.map((t, i) => ({ tolerance: t, factor: factors[i] })),
    )
    if (stacked > targetTolerance * 1.05) continue

    const cost = totalCost(tols, items)
    const utilization = targetTolerance > 0 ? stacked / targetTolerance : 0
    candidates.push({ tolerances: tols, stacked, cost, utilization })
  }

  // 非支配筛选：最小化 cost，最大化 utilization（或最小化 slack）
  const pareto = candidates.filter((a, i) =>
    !candidates.some((b, j) => {
      if (i === j) return false
      return b.cost <= a.cost && b.utilization >= a.utilization && (b.cost < a.cost || b.utilization > a.utilization)
    }),
  )

  pareto.sort((a, b) => a.cost - b.cost)

  return {
    pareto: pareto.slice(0, 20).map((p, idx) => ({
      id: idx + 1,
      ...p,
      allocated: items.map((r, i) => ({
        name: r.name,
        factor: r.factor,
        cost: r.cost,
        tolerance: p.tolerances[i],
      })),
    })),
    sampleCount: candidates.length,
    targetTolerance,
  }
}
