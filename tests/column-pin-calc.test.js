import { describe, it, expect } from 'vitest'
import { calcColumnBuckling } from '@/utils/column-buckling-calc'
import { analyzePinConnection, analyzeRetainingRing } from '@/utils/pin-retainer-calc'

describe('column-buckling', () => {
  it('euler load increases when length shortens', () => {
    const longCol = calcColumnBuckling({
      calcMode: 'simple',
      length: 1000,
      diameter: 20,
      appliedForce: 10000,
    })
    const shortCol = calcColumnBuckling({
      calcMode: 'simple',
      length: 500,
      diameter: 20,
      appliedForce: 10000,
    })
    expect(shortCol.criticalLoad).toBeGreaterThan(longCol.criticalLoad)
    expect(longCol.regime).toBe('euler')
  })

  it('rankine reduces critical stress vs pure euler for stocky columns', () => {
    const eulerish = calcColumnBuckling({
      calcMode: 'simple',
      length: 200,
      diameter: 40,
      appliedForce: 50000,
      yieldStrength: 235,
    })
    const rankine = calcColumnBuckling({
      calcMode: 'complete',
      length: 200,
      diameter: 40,
      appliedForce: 50000,
      yieldStrength: 235,
    })
    expect(rankine.regime).toBe('rankine')
    expect(rankine.criticalStress).toBeLessThanOrEqual(eulerish.criticalStress + 1e-6)
  })
})

describe('pin-retainer', () => {
  it('double shear halves shear stress vs single shear', () => {
    const single = analyzePinConnection({ force: 8000, diameter: 10, shearPlanes: 1, plateThickness: 8 })
    const dbl = analyzePinConnection({ force: 8000, diameter: 10, shearPlanes: 2, plateThickness: 8 })
    expect(dbl.shearStress).toBeCloseTo(single.shearStress / 2, 5)
  })

  it('retaining ring reports axial capacity in complete mode', () => {
    const r = analyzeRetainingRing({
      calcMode: 'complete',
      axialForce: 2000,
      shaftDiameter: 20,
      ringThickness: 1.2,
      grooveDepth: 0.6,
    })
    expect(r.allowableAxial).toBeGreaterThan(0)
    expect(r.shearArea).toBeCloseTo(Math.PI * 20 * 1.2, 5)
  })
})
