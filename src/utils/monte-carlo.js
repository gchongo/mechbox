import { DISTRIBUTIONS } from './size-chain'
import { rssMethod } from './size-chain-math'
function randNormal() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** 按分布采样误差（± 半公差范围内）；customK>0 时覆盖分布默认 K */
export function sampleToleranceError(tolerance, distribution = 'normal', customK = 0) {
  const defaultK = DISTRIBUTIONS[distribution]?.k ?? 6
  const k = customK > 0 ? customK : defaultK
  const half = tolerance / 2
  const spreadScale = defaultK / k

  switch (distribution) {
    case 'uniform':
    case 'rectangular':
      return (Math.random() * 2 - 1) * half * spreadScale
    case 'triangular': {
      const u = Math.random() + Math.random()
      return (u - 1) * half * spreadScale
    }
    case 'skewed':
      return (Math.random() ** 2 - 0.5) * 2 * half * spreadScale
    default:
      return randNormal() * (tolerance / k)
  }
}

/** Monte Carlo 尺寸链模拟 */
export function runMonteCarloSimulation({
  closedRing,
  componentRings,
  iterations = 10000,
  distribution = 'normal',
  customK = 0,
}) {
  const nominal = componentRings.reduce((sum, ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    return sum + sign * ring.size * (ring.factor ?? 1)
  }, 0)

  const results = []
  let passCount = 0

  for (let i = 0; i < iterations; i++) {
    let value = nominal
    for (const ring of componentRings) {
      const sign = ring.type === 'increasing' ? 1 : -1
      const err = sampleToleranceError(
        ring.tolerance * (ring.factor ?? 1),
        distribution,
        customK,
      )
      value += sign * err
    }
    results.push(value)
    if (value >= closedRing.min && value <= closedRing.max) passCount++
  }

  const mean = results.reduce((a, b) => a + b, 0) / results.length
  const variance = results.reduce((s, x) => s + (x - mean) ** 2, 0) / results.length
  const std = Math.sqrt(variance)
  const sorted = [...results].sort((a, b) => a - b)

  return {
    results,
    nominal,
    mean,
    std,
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

/** 控制图统计量 */
export function calcControlLimits(values) {
  if (!values.length) return null
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length
  const sigma = Math.sqrt(variance)
  return {
    mean,
    sigma,
    ucl: mean + 3 * sigma,
    lcl: mean - 3 * sigma,
  }
}
