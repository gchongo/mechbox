/** 可复现伪随机（测试 / 回归验证） */
import { resolveRingToleranceBounds, validateComponentRingTolerances } from '@/utils/ring-tolerance'
import { resolveComponentRingTypes } from '@/utils/ring-direction'

export function createSeededRandom(seed = 1) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function randNormalFrom(random) {
  let u = 0
  let v = 0
  while (u === 0) u = random()
  while (v === 0) v = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function clamp(value, lo, hi) {
  return Math.min(hi, Math.max(lo, value))
}

const DISTRIBUTION_K = {
  normal: 6,
  uniform: 3.46,
  rectangular: 3.46,
  triangular: 4.24,
  skewed: 5.0,
}

/**
 * 按分布采样尺寸偏差（相对环名义值，单位 mm）
 * @param {number} tolerance - 公差带宽度 ES−EI；未给 es/ei 时按对称 ±T/2
 * @param {object} [options.es] - 上偏差
 * @param {object} [options.ei] - 下偏差
 * @param {boolean} [options.truncatedNormal=true] - 正态采样截断在 [ei, es]（硬公差带）
 */
export function sampleToleranceError(
  tolerance,
  distribution = 'normal',
  customK = 0,
  random = Math.random,
  options = {},
) {
  const defaultK = DISTRIBUTION_K[distribution] ?? 6
  const k = customK > 0 ? customK : defaultK
  const spread = options.es != null && options.ei != null ? options.es - options.ei : tolerance
  const es = options.es ?? spread / 2
  const ei = options.ei ?? -spread / 2
  const meanDev = (es + ei) / 2
  const { truncatedNormal = true } = options
  const spreadScale = defaultK / k

  switch (distribution) {
    case 'uniform':
    case 'rectangular': {
      const half = spread / 2
      return meanDev + (random() * 2 - 1) * half * spreadScale
    }
    case 'triangular': {
      const half = spread / 2
      const u = random() + random()
      return meanDev + (u - 1) * half * spreadScale
    }
    case 'skewed':
      return meanDev + (random() ** 2 - 0.5) * spread * spreadScale
    default: {
      let err = meanDev + randNormalFrom(random) * (spread / k)
      if (truncatedNormal) err = clamp(err, ei, es)
      return err
    }
  }
}

function calcStdDev(values, useSampleStd = true) {
  const n = values.length
  if (n === 0) return { mean: 0, std: 0, stdPopulation: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / n
  const sumSq = values.reduce((s, x) => s + (x - mean) ** 2, 0)
  const stdPopulation = Math.sqrt(sumSq / n)
  const std = n > 1 && useSampleStd ? Math.sqrt(sumSq / (n - 1)) : stdPopulation
  return { mean, std, stdPopulation }
}

/** Monte Carlo 尺寸链模拟 */
export function runMonteCarloSimulation({
  closedRing,
  componentRings,
  iterations = 10000,
  distribution = 'normal',
  customK = 0,
  random,
  truncatedNormal = true,
  useSampleStd = true,
}) {
  const normalizedRings = (componentRings ?? []).map((ring) => ({
    ...ring,
    direction:
      ring.direction ??
      (ring.type === 'increasing'
        ? 'right'
        : ring.type === 'decreasing'
          ? 'left'
          : ring.direction),
  }))
  const resolved = resolveComponentRingTypes(normalizedRings, closedRing?.direction ?? 'right')
  if (!resolved.valid) {
    return {
      errorKey: resolved.errorKey,
      validationRing: resolved.ringName,
      results: [],
      passRate: 0,
      iterations: 0,
    }
  }
  const rings = resolved.rings
  const tolCheck = validateComponentRingTolerances(rings)
  if (!tolCheck.valid) {
    return {
      errorKey: tolCheck.errorKey,
      validationRing: tolCheck.ringName,
      results: [],
      passRate: 0,
      iterations: 0,
    }
  }

  const rng = random ?? Math.random
  const nominal = rings.reduce((sum, ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    const bounds = resolveRingToleranceBounds(ring)
    return sum + sign * (bounds.nominal + bounds.meanDev)
  }, 0)

  const results = []
  let passCount = 0

  for (let i = 0; i < iterations; i++) {
    let value = nominal
    for (const ring of rings) {
      const sign = ring.type === 'increasing' ? 1 : -1
      const bounds = resolveRingToleranceBounds(ring)
      const err = sampleToleranceError(bounds.tolerance, distribution, customK, rng, {
        es: bounds.es,
        ei: bounds.ei,
        truncatedNormal,
      })
      value += sign * (err - bounds.meanDev)
    }
    results.push(value)
    if (value >= closedRing.min && value <= closedRing.max) passCount++
  }

  const { mean, std, stdPopulation } = calcStdDev(results, useSampleStd)
  const sorted = [...results].sort((a, b) => a - b)

  return {
    results,
    nominal,
    mean,
    std,
    stdPopulation,
    useSampleStd,
    truncatedNormal,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    passRate: passCount / iterations,
    passCount,
    iterations,
    p50: sorted[Math.floor(iterations * 0.5)],
    p95: sorted[Math.floor(iterations * 0.95)],
    p05: sorted[Math.floor(iterations * 0.05)],
  }
}

/**
 * 敏感度 / 龙卷风分析：逐环单独波动，其余环误差为 0
 */
export function runSensitivityTornado({
  closedRing,
  componentRings,
  iterations = 5000,
  distribution = 'normal',
  customK = 0,
  random,
  truncatedNormal = true,
  useSampleStd = true,
}) {
  const items = componentRings.map((ring, index) => {
    const isolated = componentRings.map((r, j) => ({
      ...r,
      tolerance: j === index ? r.tolerance : 0,
      es: j === index ? r.es : 0,
      ei: j === index ? r.ei : 0,
      name: r.name ?? `环${j + 1}`,
    }))
    const sim = runMonteCarloSimulation({
      closedRing,
      componentRings: isolated,
      iterations,
      distribution,
      customK,
      random,
      truncatedNormal,
      useSampleStd,
    })
    const spread = sim.p95 - sim.p05
    const varianceShare = sim.std ** 2
    return {
      index,
      name: ring.name ?? `环${index + 1}`,
      tolerance: ring.tolerance,
      factor: ring.factor ?? 1,
      type: ring.type,
      mean: sim.mean,
      std: sim.std,
      spread,
      p05: sim.p05,
      p95: sim.p95,
      varianceShare,
    }
  })

  const totalVar = items.reduce((s, x) => s + x.varianceShare, 0) || 1
  const withPct = items
    .map((x) => ({
      ...x,
      variancePct: (100 * x.varianceShare) / totalVar,
    }))
    .sort((a, b) => b.spread - a.spread)

  return {
    items: withPct,
    iterations,
    topContributor: withPct[0]?.name ?? null,
  }
}

/** 控制图统计量 — 默认样本标准差 (n−1) */
export function calcControlLimits(values, useSampleStd = true) {
  if (!values.length) return null
  const { mean, std, stdPopulation } = calcStdDev(values, useSampleStd)
  return {
    mean,
    sigma: std,
    sigmaPopulation: stdPopulation,
    ucl: mean + 3 * std,
    lcl: mean - 3 * std,
  }
}

// Legacy re-export
export { DISTRIBUTIONS } from './size-chain'
