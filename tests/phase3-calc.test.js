import { describe, it, expect } from 'vitest'
import { calcISO1328Tolerances, linkISO1328ToISO6336 } from '@/utils/iso-1328'
import { linearRegression, parseXY } from '@/utils/regression-calc'
import { analyzeMainEffects, ORTHOGONAL_ARRAYS } from '@/utils/doe-calc'
import { calcPipePressureDrop } from '@/utils/pipe-flow-calc'
import { calcPlateBucklingStress } from '@/utils/plate-buckling-calc'
import { analyzeModal, calcResonanceMargin } from '@/utils/modal-calc'
import { analyzeFMEA, calcRPN, calcActionPriority } from '@/utils/fmea-calc'
import { designAQLPlan, getSampleSizeCode } from '@/utils/aql-calc'

describe('iso-1328', () => {
  it('higher grade gives larger tolerance', () => {
    const g6 = calcISO1328Tolerances({ module: 2, pitchDiameter: 48, grade: 6 })
    const g9 = calcISO1328Tolerances({ module: 2, pitchDiameter: 48, grade: 9 })
    expect(g9.f_pt).toBeGreaterThan(g6.f_pt)
  })

  it('links to ISO6336 KV', () => {
    const r = linkISO1328ToISO6336({ module: 2, pinionTeeth: 24, faceWidth: 20, iso1328Grade: 8 })
    expect(r.dynamicFactorKV).toBeGreaterThan(1)
    expect(r.tolerances.grade).toBe(8)
  })
})

describe('regression-calc', () => {
  it('linear fit on perfect line', () => {
    const r = linearRegression([1, 2, 3], [2, 4, 6])
    expect(r.slope).toBeCloseTo(2, 4)
    expect(r.r2).toBeCloseTo(1, 4)
  })

  it('parseXY', () => {
    expect(parseXY('1,2\n3,4').length).toBe(2)
  })
})

describe('doe-calc', () => {
  it('L4 main effects', () => {
    const factors = [
      { name: 'A', low: 10, high: 20 },
      { name: 'B', low: 5, high: 15 },
      { name: 'C', low: 0, high: 100 },
    ]
    const r = analyzeMainEffects('L4', factors, [12, 18, 14, 16])
    expect(r.effects.length).toBe(3)
    expect(ORTHOGONAL_ARRAYS.L4.matrix.length).toBe(4)
  })
})

describe('pipe-flow-calc', () => {
  it('pressure drop positive', () => {
    const r = calcPipePressureDrop({ diameter: 25, length: 10, flowRate: 20 })
    expect(r.totalPressureDropKPa).toBeGreaterThan(0)
    expect(r.reynolds).toBeGreaterThan(0)
  })
})

describe('plate-buckling-calc', () => {
  it('critical stress increases with thickness', () => {
    const thin = calcPlateBucklingStress({ thickness: 1, width: 200, appliedStress: 0 })
    const thick = calcPlateBucklingStress({ thickness: 3, width: 200, appliedStress: 0 })
    expect(thick.criticalStress).toBeGreaterThan(thin.criticalStress)
  })
})

describe('modal-calc', () => {
  it('SDOF frequency', () => {
    const r = analyzeModal({ caseId: 'sdof', stiffness: 10000, mass: 10 })
    expect(r.modal.fn).toBeGreaterThan(0)
  })

  it('resonance margin', () => {
    const r = calcResonanceMargin(50, 52)
    expect(r.margin).toBeLessThan(0.1)
    expect(r.assessmentKey).toBe('danger')
  })
})

describe('fmea-calc', () => {
  it('RPN product', () => {
    expect(calcRPN(8, 4, 3)).toBe(96)
  })

  it('AP 2019 lookup (AIAG-VDA table)', () => {
    expect(calcActionPriority(9, 5, 3)).toBe('H')
    expect(calcActionPriority(10, 1, 1)).toBe('L')
    expect(calcRPN(10, 1, 1)).toBe(10)
  })

  it('analyze sorts by AP then severity', () => {
    const r = analyzeFMEA([
      { severity: 3, occurrence: 2, detection: 2 },
      { severity: 9, occurrence: 5, detection: 3 },
    ])
    expect(r.rows[0].actionPriority).toBe('H')
    expect(r.highApCount).toBe(1)
  })
})

describe('aql-calc', () => {
  it('sample code by lot size', () => {
    expect(getSampleSizeCode(500)).toBe('H')
  })

  it('accept when defects below Ac', () => {
    const p = designAQLPlan({ lotSize: 500, aql: 2.5, defectCount: 0 })
    expect(p.pass).toBe(true)
    expect(p.sampleSize).toBeGreaterThan(0)
  })
})
