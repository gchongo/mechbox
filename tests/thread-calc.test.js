import { describe, it, expect } from 'vitest'
import { calcTensileStressArea, analyzeThreadStrength } from '@/utils/thread-calc'

describe('thread-calc', () => {
  it('computes stress area for M12', () => {
    const as = calcTensileStressArea(12, 1.75)
    expect(as).toBeGreaterThan(80)
    expect(as).toBeLessThan(90)
  })

  it('8.8 grade passes at moderate load', () => {
    const r = analyzeThreadStrength({
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      axialForce: 10000,
      engagedLength: 18,
    })
    expect(r.tensilePass).toBe(true)
    expect(r.stressArea).toBeGreaterThan(0)
  })
})
