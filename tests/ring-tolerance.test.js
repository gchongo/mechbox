import { describe, it, expect } from 'vitest'
import {
  calcNominalClosed,
  calcRingContributions,
  closedRingAsDesign,
  ensureRingEsEi,
  syncToleranceFromEsEi,
} from '@/utils/ring-tolerance'

describe('ring-tolerance', () => {
  it('calcNominalClosed sums inc minus dec', () => {
    const rings = [
      { size: 80, factor: 1, type: 'increasing' },
      { size: 30, factor: 1, type: 'increasing' },
      { size: 40, factor: 1, type: 'decreasing' },
      { size: 30, factor: 1, type: 'decreasing' },
    ]
    expect(calcNominalClosed(rings)).toBe(40)
  })

  it('contributions sum to 100%', () => {
    const rings = [
      { uid: '1', tolerance: 0.06, factor: 1 },
      { uid: '2', tolerance: 0.05, factor: 1 },
      { uid: '3', tolerance: 0.04, factor: 1 },
    ]
    const c = calcRingContributions(rings)
    const sum = c.reduce((s, x) => s + x.percent, 0)
    expect(sum).toBeCloseTo(100, 5)
  })

  it('syncs es/ei and tolerance', () => {
    const ring = { tolerance: 0.1 }
    ensureRingEsEi(ring)
    expect(ring.es).toBeCloseTo(0.05)
    expect(ring.ei).toBeCloseTo(-0.05)
    ring.es = 0.08
    ring.ei = -0.02
    syncToleranceFromEsEi(ring)
    expect(ring.tolerance).toBeCloseTo(0.1)
  })

  it('closedRingAsDesign from min max', () => {
    const d = closedRingAsDesign({ min: 9.95, max: 10.25 })
    expect(d.target).toBeCloseTo(10.1)
    expect(d.tolerance).toBeCloseTo(0.3)
  })
})
