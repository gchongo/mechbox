import { describe, it, expect } from 'vitest'
import {
  worstCaseMethod,
  rssMethod,
  sigma6RssMethod,
  calculateRssLimits,
  calculateWorstCaseLimits,
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
})
