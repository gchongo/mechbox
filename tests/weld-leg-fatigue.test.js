import { describe, it, expect } from 'vitest'
import {
  recommendFilletLeg,
  analyzeWeldFatigue,
  WELD_DETAIL_CATEGORIES,
  FILLET_LEG_BY_THICKNESS,
} from '@/utils/weld-calc'

describe('fillet leg recommendation', () => {
  it('recommends for mid-range plate thickness', () => {
    const r = recommendFilletLeg(10)
    expect(r.zMin).toBe(4)
    expect(r.zRec).toBe(6)
    expect(r.zMax).toBe(8)
  })

  it('covers all thickness bands without gaps', () => {
    expect(FILLET_LEG_BY_THICKNESS[0].tMin).toBe(0)
    for (let i = 1; i < FILLET_LEG_BY_THICKNESS.length; i++) {
      expect(FILLET_LEG_BY_THICKNESS[i].tMin).toBe(FILLET_LEG_BY_THICKNESS[i - 1].tMax)
    }
  })

  it('rejects non-positive thickness', () => {
    expect(recommendFilletLeg(0)).toBeNull()
    expect(recommendFilletLeg(-1)).toBeNull()
  })
})

describe('weld fatigue FAT classes', () => {
  it('keeps legacy medium = 71 MPa', () => {
    const r = analyzeWeldFatigue({ stressRange: 30, cycles: 2e6, detailCategory: 'medium' })
    expect(r.enduranceLimit).toBe(71)
    expect(r.pass).toBe(true)
  })

  it('FAT 36 is stricter than FAT 71 at same stress', () => {
    const high = analyzeWeldFatigue({ stressRange: 50, cycles: 2e6, detailCategory: 'fat71' })
    const low = analyzeWeldFatigue({ stressRange: 50, cycles: 2e6, detailCategory: 'fat36' })
    expect(high.pass).toBe(true)
    expect(low.pass).toBe(false)
    expect(low.enduranceLimit).toBe(36)
  })

  it('S-N life scales with m=3', () => {
    const r = analyzeWeldFatigue({ stressRange: 71, cycles: 2e6, detailCategory: 'fat71' })
    expect(r.estimatedLife).toBeCloseTo(2e6, -2)
  })

  it('exports expanded FAT keys', () => {
    expect(WELD_DETAIL_CATEGORIES.fat100.enduranceMPa).toBe(100)
    expect(WELD_DETAIL_CATEGORIES.fat36.enduranceMPa).toBe(36)
  })
})
