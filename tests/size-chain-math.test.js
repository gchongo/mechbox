import { describe, it, expect } from 'vitest'
import {
  worstCaseMethod,
  rssMethod,
  sigma6RssMethod,
  calculateRssLimits,
  calculateWorstCaseLimits,
  buildSigmaSummary,
} from '@/utils/size-chain-math'

const rings = [
  { size: 40, tolerance: 0.06, factor: 1, type: 'decreasing' },
  { size: 15, tolerance: 0.05, factor: 1, type: 'decreasing' },
  { size: 55.25, tolerance: 0.04, factor: 1, type: 'increasing' },
]

describe('size-chain-math', () => {
  it('worstCaseMethod sums tolerances', () => {
    expect(worstCaseMethod(rings)).toBeCloseTo(0.15, 6)
  })

  it('rssMethod uses root sum square', () => {
    expect(rssMethod(rings)).toBeCloseTo(Math.sqrt(0.06 ** 2 + 0.05 ** 2 + 0.04 ** 2), 6)
  })

  it('sigma6RssMethod returns positive tolerance', () => {
    expect(sigma6RssMethod(rings, 'normal')).toBeGreaterThan(0)
  })

  it('calculateRssLimits pass/fail bounds', () => {
    const limits = calculateRssLimits(rings)
    expect(limits.upper).toBeGreaterThan(limits.lower)
    expect(limits.totalTolerance).toBeCloseTo(rssMethod(rings), 4)
  })

  it('worst case limits wider than rss', () => {
    const w = calculateWorstCaseLimits(rings)
    const r = calculateRssLimits(rings)
    expect(w.totalTolerance).toBeGreaterThan(r.totalTolerance)
  })

  it('buildSigmaSummary flags off-center stacks as low capability', () => {
    const rss = calculateRssLimits([
      { size: 10, tolerance: 0.05, factor: 1, type: 'increasing' },
      { size: 10, tolerance: 0.05, factor: 1, type: 'increasing' },
      { size: 10, tolerance: 0.05, factor: 1, type: 'decreasing' },
    ])
    const summary = buildSigmaSummary({ min: 5, max: 7 }, rss)
    expect(parseFloat(summary.cpk)).toBeLessThan(0)
    expect(parseFloat(summary.passRate)).toBeLessThan(1)
    expect(summary.dppm).toBeGreaterThan(900_000)
  })

  it('buildSigmaSummary matches centered in-spec stacks', () => {
    const rss = calculateRssLimits([
      { size: 6, tolerance: 0.05, factor: 1, type: 'increasing' },
      { size: 0, tolerance: 0.05, factor: 1, type: 'decreasing' },
    ])
    const summary = buildSigmaSummary({ min: 5.5, max: 6.5 }, rss)
    expect(parseFloat(summary.cpk)).toBeGreaterThan(1)
    expect(parseFloat(summary.passRate)).toBeGreaterThan(99)
  })
})
