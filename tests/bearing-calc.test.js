import { describe, expect, it } from 'vitest'
import {
  analyzeBearingLife,
  calcEquivalentStaticLoad,
  suggestAxialPreload,
  calcDn,
} from '@/utils/bearing-calc'

describe('bearing-calc', () => {
  it('professional modified life applies temperature factor by life exponent', () => {
    const result = analyzeBearingLife({
      calcMode: 'professional',
      dynamicLoad: 35000,
      staticLoad: 18000,
      radialLoad: 5000,
      axialLoad: 1000,
      x: 1,
      y: 1.6,
      rpm: 1500,
      reliabilityFactor: 0.64,
      lifeConditionFactor: 1.0,
      temperatureFactor: 0.8,
      targetHours: 10000,
      autoLookup: false,
    })

    const expected = result.l10MillionRev * 0.64 * 1.0 * 0.8 ** 3
    expect(result.modifiedLifeMillionRev).toBeCloseTo(expected, 8)
  })

  it('static safety uses ISO 76 P0 not dynamic P', () => {
    const Fr = 5000
    const Fa = 1000
    const p0 = calcEquivalentStaticLoad({ radialLoad: Fr, axialLoad: Fa, bearingType: 'ball' })
    expect(p0).toBe(Math.max(Fr, 0.6 * Fr + 0.5 * Fa))

    const r = analyzeBearingLife({
      calcMode: 'complete',
      dynamicLoad: 35000,
      staticLoad: 18000,
      radialLoad: Fr,
      axialLoad: Fa,
      x: 1,
      y: 1.6,
      rpm: 1500,
      autoLookup: false,
    })
    expect(r.equivalentStaticLoad).toBeCloseTo(p0, 6)
    expect(r.staticSafetyFactor).toBeCloseTo(18000 / p0, 6)
    expect(r.equivalentLoad).toBeCloseTo(Fr + 1.6 * Fa, 6)
    expect(r.equivalentLoad).not.toBeCloseTo(p0, 0)
  })

  it('suggests axial preload from C and arrangement', () => {
    expect(suggestAxialPreload({ dynamicLoad: 10000, arrangement: 'single' }).suggestedPreload).toBe(100)
    expect(suggestAxialPreload({ dynamicLoad: 10000, arrangement: 'duplex-db' }).suggestedPreload).toBe(200)
  })

  it('computes dn and warns when over grease hint in professional', () => {
    expect(calcDn(25, 1500)).toBe(37500)
    const r = analyzeBearingLife({
      calcMode: 'professional',
      dynamicLoad: 14000,
      staticLoad: 7800,
      radialLoad: 2000,
      axialLoad: 0,
      x: 1,
      y: 0,
      rpm: 20000,
      bore: 25,
      limitingSpeed: 30000,
      autoLookup: false,
    })
    expect(r.dn).toBe(500000)
    expect(r.dnPass).toBe(false)
    expect(r.dnWarningKey).toBe('dn_exceeded')
    expect(r.suggestedPreload).toBeGreaterThan(0)
  })
})
