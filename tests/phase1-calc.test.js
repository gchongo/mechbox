import { describe, it, expect } from 'vitest'
import { analyzeInterferenceFit, calcContactPressure } from '@/utils/interference-fit-calc'
import { analyzeBeam, BEAM_CASES } from '@/utils/beam-calc'
import { analyzeThermalExpansion, calcFitChange } from '@/utils/thermal-expansion-calc'
import { analyzeGageRR } from '@/utils/msa-calc'
import { calcXRChart, calcPChart } from '@/utils/spc-calc'
import { runSensitivityTornado } from '@/utils/monte-carlo'

describe('interference-fit-calc', () => {
  it('positive interference gives contact pressure', () => {
    const r = analyzeInterferenceFit({
      shaftDiameter: 50,
      holeDiameter: 49.975,
      hubOuterDiameter: 90,
      fitLength: 40,
      friction: 0.12,
    })
    expect(r.errorKey).toBeUndefined()
    expect(r.pressure).toBeGreaterThan(0)
    expect(r.pressForce).toBeGreaterThan(0)
    expect(r.torqueCapacityNm).toBeGreaterThan(0)
  })

  it('rejects non-interference', () => {
    const c = calcContactPressure({
      interference: -0.01,
      holeDiameter: 50,
      hubOuterDiameter: 90,
    })
    expect(c.errorKey).toBeTruthy()
  })
})

describe('beam-calc', () => {
  it('simply supported center load', () => {
    const r = analyzeBeam({
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 2000,
    })
    expect(r.errorKey).toBeUndefined()
    expect(r.deflection).toBeGreaterThan(0)
    expect(r.stress).toBeGreaterThan(0)
  })

  it('cantilever deflection greater than simply supported', () => {
    const base = {
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 2000,
    }
    const simply = analyzeBeam({ ...base, caseId: 'simply_center' })
    const cant = analyzeBeam({ ...base, caseId: 'cantilever_end' })
    expect(cant.deflection).toBeGreaterThan(simply.deflection)
  })

  it('exports beam cases', () => {
    expect(Object.keys(BEAM_CASES).length).toBeGreaterThanOrEqual(4)
  })
})

describe('thermal-expansion-calc', () => {
  it('linear expansion scales with deltaT', () => {
    const r = analyzeThermalExpansion({ length: 100, deltaT: 100, alpha: 11.5e-6 })
    expect(r.linearExpansion).toBeCloseTo(0.115, 3)
  })

  it('fit change when shaft expands more than hole', () => {
    const f = calcFitChange({
      shaftDiameter: 50,
      holeDiameter: 49.975,
      shaftAlpha: 23.6e-6,
      holeAlpha: 11.5e-6,
      deltaT: 50,
    })
    expect(f.interferenceChange).toBeGreaterThan(0)
  })
})

describe('msa-calc', () => {
  it('gage R&R on sample data', () => {
    const measurements = [
      [[10.02, 10.05, 10.03], [10.15, 10.12, 10.14]],
      [[10.04, 10.01, 10.06], [10.18, 10.16, 10.17]],
      [[10.0, 10.03, 10.02], [10.14, 10.13, 10.15]],
    ]
    const r = analyzeGageRR(measurements)
    expect(r.errorKey).toBeUndefined()
    expect(r.GRR).toBeGreaterThan(0)
    expect(r.pctGRR).toBeGreaterThan(0)
    expect(r.rating).toBeTruthy()
  })
})

describe('spc-calc', () => {
  it('X-R chart limits', () => {
    const subgroups = [
      [10.1, 10.3, 10.2],
      [10.0, 10.4, 10.1],
      [10.2, 10.2, 10.3],
    ]
    const r = calcXRChart(subgroups)
    expect(r.errorKey).toBeUndefined()
    expect(r.xUcl).toBeGreaterThan(r.xBarBar)
    expect(r.xLcl).toBeLessThan(r.xBarBar)
    expect(r.rUcl).toBeGreaterThan(r.rBar)
  })

  it('P chart', () => {
    const r = calcPChart([2, 0, 3], [100, 100, 100])
    expect(r.pBar).toBeCloseTo(0.0167, 3)
    expect(r.ucl.length).toBe(3)
  })
})

describe('monte-carlo sensitivity', () => {
  it('tornado ranks rings by spread', () => {
    const rings = [
      { name: 'A', size: 40, tolerance: 0.06, factor: 1, type: 'decreasing' },
      { name: 'B', size: 15, tolerance: 0.05, factor: 1, type: 'decreasing' },
      { name: 'C', size: 55.25, tolerance: 0.04, factor: 1, type: 'increasing' },
    ]
    const r = runSensitivityTornado({
      closedRing: { min: 0.1, max: 0.35 },
      componentRings: rings,
      iterations: 2000,
    })
    expect(r.items.length).toBe(3)
    expect(r.items[0].spread).toBeGreaterThanOrEqual(r.items[2].spread)
  })
})
