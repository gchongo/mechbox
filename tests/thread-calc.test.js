import { describe, it, expect } from 'vitest'
import {
  calcTensileStressArea,
  calcExternalThreadShearArea,
  calcInternalThreadShearArea,
  analyzeThreadStrength,
} from '@/utils/thread-calc'

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

  it('thread shear areas stay in mm^2 order', () => {
    const ext = calcExternalThreadShearArea(12, 1.75, 18)
    const intl = calcInternalThreadShearArea(12, 1.75, 18)
    expect(ext).toBeGreaterThan(100)
    expect(intl).toBeGreaterThan(100)
    expect(ext).toBeLessThan(1000)
    expect(intl).toBeLessThan(1000)
  })

  it('doubling engagement length nearly halves complete-mode shear stress', () => {
    const shortL = analyzeThreadStrength({
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      axialForce: 20000,
      engagedLength: 10,
      calcMode: 'complete',
    })
    const longL = analyzeThreadStrength({
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      axialForce: 20000,
      engagedLength: 20,
      calcMode: 'complete',
    })
    expect(longL.shearStress).toBeLessThan(shortL.shearStress * 0.6)
  })
})
