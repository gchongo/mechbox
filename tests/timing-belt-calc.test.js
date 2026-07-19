import { describe, expect, it } from 'vitest'
import {
  recommendTimingPitch,
  calcTimingInstallTension,
  analyzeTimingBeltDrive,
} from '@/utils/timing-belt-calc'

describe('timing-belt-calc', () => {
  it('recommends pitch from power–speed envelope', () => {
    expect(recommendTimingPitch({ power: 0.3, rpm: 3000 }).id).toBe('MXL')
    expect(recommendTimingPitch({ power: 2, rpm: 1450 }).id).toBe('3M')
    expect(recommendTimingPitch({ power: 6, rpm: 2000 }).id).toBe('5M')
    expect(recommendTimingPitch({ power: 20, rpm: 1000 }).id).toBe('8M')
  })

  it('install tension is fraction of Fe', () => {
    expect(calcTimingInstallTension(1000)).toBe(500)
    expect(calcTimingInstallTension(1000, 0.4)).toBe(400)
  })

  it('simple mode is estimateOnly without formal pass', () => {
    const r = analyzeTimingBeltDrive({
      calcMode: 'simple',
      power: 2,
      rpm: 1450,
      z1: 24,
      z2: 48,
      centerDistance: 300,
      beltWidth: 15,
    })
    expect(r.kind).toBe('timing')
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.effectiveForce).toBeGreaterThan(0)
    expect(r.installTension).toBeCloseTo(0.5 * r.effectiveForce, 6)
    expect(r.pitchId).toBeTruthy()
  })

  it('complete mode checks speed and width capacity', () => {
    const ok = analyzeTimingBeltDrive({
      calcMode: 'complete',
      pitchId: '5M',
      power: 1,
      rpm: 1000,
      z1: 24,
      z2: 48,
      centerDistance: 300,
      beltWidth: 20,
      allowPowerPerMm: 0.15,
      maxBeltSpeed: 40,
    })
    expect(ok.pass).toBe(true)
    expect(ok.speedPass).toBe(true)
    expect(ok.widthPass).toBe(true)

    const narrow = analyzeTimingBeltDrive({
      calcMode: 'complete',
      pitchId: '5M',
      power: 5,
      rpm: 1000,
      z1: 24,
      z2: 48,
      centerDistance: 300,
      beltWidth: 10,
      allowPowerPerMm: 0.15,
      maxBeltSpeed: 40,
    })
    expect(narrow.widthPass).toBe(false)
    expect(narrow.pass).toBe(false)
  })

  it('professional mode adds life estimate', () => {
    const r = analyzeTimingBeltDrive({
      calcMode: 'professional',
      pitchId: '8M',
      power: 5,
      rpm: 1200,
      z1: 28,
      z2: 56,
      centerDistance: 400,
      beltWidth: 40,
      serviceFactor: 1.3,
    })
    expect(r.estimatedLifeHours).toBeGreaterThan(0)
    expect(r.serviceFactor).toBe(1.3)
  })
})
