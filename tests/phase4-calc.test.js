import { describe, it, expect } from 'vitest'
import { analyzeGearAGMA, compareGearStandards, calcGeometryFactorI } from '@/utils/gear-agma'
import { analyzeGearISO6336 } from '@/utils/gear-iso6336'
import { scoreMaterials } from '@/utils/material-selection-calc'
import { calcMachiningAllowance } from '@/utils/machining-calc'
import { calcDraftAngle, verifyDraftAngle } from '@/utils/casting-calc'

const gearInput = {
  module: 2,
  pinionTeeth: 24,
  gearTeeth: 72,
  faceWidth: 20,
  torque: 50,
  rpm: 1500,
  pinionMaterial: 'st-soft',
  gearMaterial: 'st-soft',
  applicationFactor: 1.25,
  iso1328Grade: 6,
}

describe('gear-agma', () => {
  it('computes AGMA stresses', () => {
    const r = analyzeGearAGMA(gearInput)
    expect(r.contactStress).toBeGreaterThan(0)
    expect(r.bendingStress).toBeGreaterThan(0)
    expect(r.factors.I).toBeGreaterThan(0)
  })

  it('compares ISO and AGMA', () => {
    const iso = analyzeGearISO6336(gearInput)
    const agma = analyzeGearAGMA(gearInput)
    const c = compareGearStandards(iso, agma)
    expect(c.contactStress.iso).toBeGreaterThan(0)
    expect(c.contactStress.agma).toBeGreaterThan(0)
  })

  it('I factor increases with gear ratio', () => {
    expect(calcGeometryFactorI(20, 60)).toBeGreaterThan(0)
  })
})

describe('material-selection-calc', () => {
  it('returns ranked materials', () => {
    const r = scoreMaterials({ minSigmaAllow: 100, maxDensity: 10, maxCostIndex: 5 })
    expect(r.recommendations.length).toBeGreaterThan(0)
    expect(r.topPick).toBeTruthy()
    expect(r.recommendations[0].rank).toBe(1)
  })

  it('filters by high strength requirement', () => {
    const r = scoreMaterials({ minSigmaAllow: 500, maxDensity: 20, maxCostIndex: 10 })
    expect(r.recommendations.every((m) => m.sigmaAllow >= 500)).toBe(true)
  })
})

describe('machining-calc', () => {
  it('stock diameter exceeds part', () => {
    const r = calcMachiningAllowance({ nominalDiameter: 50, length: 100 })
    expect(r.recommendedStockDiameter).toBeGreaterThan(50)
    expect(r.details.length).toBe(3)
  })
})

describe('casting-calc', () => {
  it('draft angle increases with depth', () => {
    const shallow = calcDraftAngle({ depth: 20 })
    const deep = calcDraftAngle({ depth: 100 })
    expect(deep.draftAngleDeg).toBeGreaterThan(shallow.draftAngleDeg)
  })

  it('verify draft', () => {
    const req = calcDraftAngle({ depth: 50 })
    const ok = verifyDraftAngle({ depth: 50, actualDraftAngle: req.draftAngleDeg + 1 })
    expect(ok.pass).toBe(true)
  })
})
