import { describe, it, expect } from 'vitest'
import {
  calcCarbonEquivalent,
  estimateJominyHardness,
  assessHardenability,
  calcTemperedHardness,
  analyzeHeatTreatment,
  STEEL_PRESETS,
} from '@/utils/heat-treatment-calc'
import { generateCCD, fitRSM, analyzeRSM } from '@/utils/rsm-calc'
import { searchTools, getAllToolsFlat } from '@/constants/tool-catalog'

describe('heat-treatment-calc', () => {
  it('computes carbon equivalent', () => {
    const r = calcCarbonEquivalent(STEEL_PRESETS['4140'])
    expect(r.ce).toBeGreaterThan(0.5)
    expect(r.weldabilityKey).toBeTruthy()
  })

  it('Jominy hardness decreases with distance', () => {
    const ce = calcCarbonEquivalent(STEEL_PRESETS['4140']).ce
    const h0 = estimateJominyHardness(ce, 0)
    const h20 = estimateJominyHardness(ce, 20)
    expect(h0).toBeGreaterThan(h20)
  })

  it('assesses hardenability for part diameter', () => {
    const ce = calcCarbonEquivalent(STEEL_PRESETS['1045']).ce
    const r = assessHardenability(ce, 80)
    expect(r.idealCriticalDiameter).toBeGreaterThan(0)
    expect(r.verdictKey).toBeTruthy()
  })

  it('tempering reduces hardness', () => {
    const r = calcTemperedHardness(55, 600, 2)
    expect(r.temperedHRC).toBeLessThan(55)
    expect(r.hollomonJaffe).toBeGreaterThan(0)
  })

  it('H-J uses time in seconds', () => {
    const r = calcTemperedHardness(49.9, 551, 2)
    const T = 551 + 273
    const expected = T * (20 + Math.log10(2 * 3600))
    expect(r.hollomonJaffe).toBeCloseTo(expected, 0)
    expect(r.temperedHRC).toBeCloseTo(29.4, 0)
    expect(r.temperStateKey).toBe('soft')
  })

  it('4140 Ø50 uses CE-based Di not Grossmann', () => {
    const r = analyzeHeatTreatment({
      composition: STEEL_PRESETS['4140'],
      grainSize: 7,
      partDiameter: 50,
    })
    expect(r.carbonEquivalent).toBeCloseTo(0.772, 3)
    expect(r.hardenability.idealCriticalDiameter).toBeCloseTo(18.8, 0)
    expect(r.hardenability.verdictKey).toBe('surface_only')
    expect(r.preheatTemp).toBe(200)
  })

  it('full analysis returns curve', () => {
    const r = analyzeHeatTreatment({ composition: STEEL_PRESETS['4340'], partDiameter: 60 })
    expect(r.jominyCurve.length).toBeGreaterThan(10)
    expect(r.temper.temperedHRC).toBeLessThan(r.hardenability.surfaceHRC)
  })
})

describe('rsm-calc', () => {
  const f1 = { name: 'A', low: 10, high: 20 }
  const f2 = { name: 'B', low: 1, high: 3 }

  it('generates 11-point CCD', () => {
    const d = generateCCD(f1, f2)
    expect(d).toHaveLength(11)
    expect(d[0].x1).toBeCloseTo(10, 0)
    expect(d[0].x2).toBeCloseTo(1, 0)
  })

  it('fits quadratic RSM model', () => {
    const responses = [10, 12, 11, 14, 11, 13, 10.5, 12.8, 12, 11.9, 12.1]
    const r = analyzeRSM(f1, f2, responses)
    expect(r.errorKey).toBeUndefined()
    expect(r.fit.r2).toBeGreaterThan(0)
    expect(r.fit.optimum.predictedY).toBeGreaterThan(0)
  })

  it('rejects insufficient responses', () => {
    const r = fitRSM([{ x1: 0, x2: 0, y: 1 }])
    expect(r.errorKey).toBeTruthy()
  })
})

describe('tool-catalog', () => {
  it('lists all tools', () => {
    expect(getAllToolsFlat().length).toBeGreaterThan(30)
  })

  it('searches by keyword', () => {
    const hits = searchTools('Jominy')
    expect(hits.some((t) => t.path === '/heat-treatment')).toBe(true)
  })
})
