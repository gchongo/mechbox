import { describe, it, expect } from 'vitest'
import {
  analyzeInterferenceFit,
  calcPressForce,
  calcPressForceCurve,
  calcExtractionForce,
  calcRequiredAssemblyDeltaT,
} from '@/utils/interference-fit-calc'

const base = {
  calcMode: 'complete',
  shaftDiameter: 50,
  holeDiameter: 49.975,
  hubOuterDiameter: 90,
  fitLength: 40,
  friction: 0.12,
  frictionExtract: 0.18,
  assemblyClearance: 0.02,
  shaftAlpha: 11.5e-6,
  holeAlpha: 11.5e-6,
  shaftAllowHoop: 500,
  hubAllowHoop: 500,
}

describe('interference assembly / press / extract', () => {
  it('required hub heat ΔT matches (i+c)/(α D)', () => {
    const i = 0.025
    const c = 0.02
    const D = 49.975
    const alpha = 11.5e-6
    const r = calcRequiredAssemblyDeltaT({
      interference: i,
      shaftDiameter: 50,
      holeDiameter: D,
      holeAlpha: alpha,
      shaftAlpha: alpha,
      assemblyClearance: c,
    })
    expect(r.deltaTHubHeat).toBeCloseTo((i + c) / (alpha * D), 6)
    expect(r.deltaTShaftCool).toBeCloseTo(-(i + c) / (alpha * 50), 6)
  })

  it('press curve is linear in contact length and ends at full press force', () => {
    const r = analyzeInterferenceFit(base)
    expect(r.pressForceCurve.length).toBeGreaterThanOrEqual(2)
    expect(r.pressForceCurve[0].force).toBeCloseTo(0, 5)
    const last = r.pressForceCurve[r.pressForceCurve.length - 1]
    expect(last.z).toBeCloseTo(40, 5)
    expect(last.force).toBeCloseTo(r.pressForce, 5)
    expect(last.force).toBeCloseTo(calcPressForce(r.pressure, 50, 40, 0.12), 5)
  })

  it('extraction force uses μ_e without +0.02 and exceeds press force when μ_e > μ', () => {
    const r = analyzeInterferenceFit(base)
    expect(r.extractionForce).toBeCloseTo(calcExtractionForce(r.pressure, 50, 40, 0.18), 5)
    expect(r.extractionForce).toBeGreaterThan(r.pressForce)
  })

  it('curve helper respects steps', () => {
    const pts = calcPressForceCurve(10, 50, 40, 0.12, 5)
    expect(pts).toHaveLength(5)
    expect(pts[2].z).toBeCloseTo(20, 5)
  })
})
