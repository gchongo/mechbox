import { describe, it, expect } from 'vitest'
import { calcCylinderForce, calcCylinderArea, analyzeHydraulicCylinder } from '@/utils/hydraulic-calc'
import { calcTensileStressArea, analyzeThreadStrength } from '@/utils/thread-calc'
import { analyzeThermalExpansion, calcLinearExpansion } from '@/utils/thermal-expansion-calc'
import { calcL10MillionRevolutions, calcEquivalentLoad } from '@/utils/bearing-calc'

/** P2-07 标准算例 / 手册可复核参考值 */
describe('reference hydraulic cylinder force', () => {
  it('F = p·A with p=16 MPa, D=50 mm bore', () => {
    const { bore } = calcCylinderArea(50, 20)
    const F = calcCylinderForce(16, bore)
    expect(F).toBeCloseTo(31415.9, 0)
  })

  it('retract annular area smaller than bore', () => {
    const areas = calcCylinderArea(50, 20)
    const expectedAnnular = (Math.PI / 4) * (50 ** 2 - 20 ** 2)
    expect(areas.annular).toBeCloseTo(expectedAnnular, 4)
    expect(calcCylinderForce(16, areas.annular)).toBeCloseTo(16 * expectedAnnular, 0)
  })
})

describe('reference thermal expansion', () => {
  it('ΔL = α L ΔT for steel L=100 mm, ΔT=100 K', () => {
    const dL = calcLinearExpansion(100, 11.5e-6, 100)
    expect(dL).toBeCloseTo(0.115, 3)
  })

  it('analyzeThermalExpansion simple matches formula', () => {
    const r = analyzeThermalExpansion({
      calcMode: 'simple',
      length: 100,
      deltaT: 100,
      alpha: 11.5e-6,
    })
    expect(r.linearExpansion).toBeCloseTo(0.115, 3)
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })
})

describe('reference metric thread M12', () => {
  it('As for M12 × 1.75 per ISO metric formula', () => {
    const As = calcTensileStressArea(12, 1.75)
    const d2 = 12 - 0.9382 * 1.75
    const expected = (Math.PI / 4) * d2 ** 2
    expect(As).toBeCloseTo(expected, 4)
    expect(As).toBeCloseTo(84.27, 1)
  })

  it('8.8 grade tensile pass at 25000 N only when inputs confirmed (complete)', () => {
    const ok = analyzeThreadStrength({
      calcMode: 'complete',
      enforceCriticalConfirm: true,
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      axialForce: 25000,
      engagedLength: 18,
      confirmedFields: {
        diameter: true,
        grade: true,
        axialForce: true,
        engagedLength: true,
      },
    })
    expect(ok.tensilePass).toBe(true)
    expect(ok.pass).toBe(true)
  })
})

describe('reference ISO 281 equivalent load', () => {
  it('P = X·Fr + Y·Fa for Fr=5000, Fa=1000, X=1, Y=0', () => {
    expect(calcEquivalentLoad({ radialLoad: 5000, axialLoad: 1000, x: 1, y: 0 })).toBe(5000)
  })

  it('L10 = (C/P)^3 for ball bearing C=20000, P=5000', () => {
    expect(calcL10MillionRevolutions(20000, 5000, 'ball')).toBeCloseTo(64, 0)
  })
})

describe('reference hydraulic buckling with confirmed inputs', () => {
  it('complete mode pass when load within capacity and inputs confirmed', () => {
    const r = analyzeHydraulicCylinder({
      calcMode: 'complete',
      enforceCriticalConfirm: true,
      boreDiameter: 50,
      rodDiameter: 20,
      pressure: 16,
      externalLoad: 20,
      strokeLength: 300,
      yieldStrength: 235,
      endFixity: 'pinned_pinned',
      compressOnRetract: false,
      confirmedFields: {
        endFixity: true,
        strokeLength: true,
        yieldStrength: true,
        compressOnRetract: true,
      },
    })
    expect(r.loadPass).toBe(true)
    expect(r.releaseBlocked).toBeFalsy()
    expect(r.pass).toBe(true)
  })
})
