import { describe, it, expect } from 'vitest'
import { convertUnit, convertToAll, convertTemperature, QUICK_PAIRS, quickConvert } from '@/utils/unit-conversion-calc'
import { calcITTolerance, analyzeFit, parseToleranceDesignation, COMMON_FITS } from '@/utils/iso-286-calc'
import { runVdi2230Wizard, buildWizardReportText, TIGHTENING_METHODS } from '@/utils/vdi2230-wizard'

describe('unit-conversion-calc', () => {
  it('converts MPa to psi', () => {
    const r = convertUnit(1, 'MPa', 'psi', 'stress')
    expect(r.value).toBeCloseTo(145.038, 1)
  })

  it('converts mm to inch', () => {
    const r = convertUnit(25.4, 'mm', 'in', 'length')
    expect(r.value).toBeCloseTo(1, 4)
  })

  it('converts temperature', () => {
    expect(convertTemperature(0, '°C', '°F').value).toBeCloseTo(32)
    expect(convertTemperature(100, '°C', 'K').value).toBeCloseTo(373.15, 1)
  })

  it('batch converts stress units', () => {
    const r = convertToAll(100, 'MPa', 'stress')
    expect(r.rows.length).toBeGreaterThan(5)
    const psi = r.rows.find((x) => x.unit === 'psi')
    expect(psi.value).toBeGreaterThan(1000)
  })

  it('quick pairs work', () => {
    const idx = QUICK_PAIRS.findIndex((p) => p.label === 'N·m → lbf·ft')
    const r = quickConvert(idx, 10)
    expect(r.value).toBeGreaterThan(7)
  })
})

describe('iso-286-calc', () => {
  it('parses designation', () => {
    expect(parseToleranceDesignation('H7').isHole).toBe(true)
    expect(parseToleranceDesignation('g6').isHole).toBe(false)
  })

  it('computes IT tolerance', () => {
    const t = calcITTolerance(25, 7)
    expect(t).toBeGreaterThan(0.01)
    expect(t).toBeLessThan(0.05)
  })

  it('analyzes H7/g6 clearance fit', () => {
    const r = analyzeFit(25, 'H7', 'g6')
    expect(r.fitType).toBe('clearance')
    expect(r.maxClearance).toBeGreaterThan(0)
    expect(r.minClearance).toBeGreaterThan(0)
  })

  it('common presets are valid', () => {
    for (let i = 0; i < COMMON_FITS.length; i++) {
      const r = analyzeFit(30, COMMON_FITS[i].hole, COMMON_FITS[i].shaft)
      expect(r.error).toBeUndefined()
    }
  })
})

describe('vdi2230-wizard', () => {
  const baseInput = {
    diameter: 10,
    pitch: 1.5,
    grade: '8.8',
    muG: 0.12,
    muK: 0.12,
    preload: 25000,
    gripLength: 20,
    holeDiameter: 11,
    headContactDiameter: 15,
    externalAxialLoad: 3000,
    tighteningMethod: 'torque',
  }

  it('runs all R steps', () => {
    const r = runVdi2230Wizard(baseInput)
    expect(r.errorKey).toBeUndefined()
    expect(r.steps).toHaveLength(14)
    expect(r.steps[0].id).toBe('R0')
    expect(r.steps[13].id).toBe('R13')
  })

  it('detects tightening methods', () => {
    expect(TIGHTENING_METHODS.torque).toBeTruthy()
  })

  it('builds report text', () => {
    const r = runVdi2230Wizard(baseInput)
    const text = buildWizardReportText(r)
    expect(text).toContain('R6')
    expect(text).toContain('螺栓应力')
  })
})
