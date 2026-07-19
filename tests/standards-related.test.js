import { describe, it, expect } from 'vitest'
import {
  lookupKeySize,
  lookupPinLength,
  lookupRetainingRing,
  PIN_DIAMETER_SERIES,
  ORING_SECTION_GUIDE,
} from '@/constants/standards-ref'
import { getRelatedToolLinks } from '@/constants/related-tools'

describe('standards-ref', () => {
  it('looks up key section by shaft diameter', () => {
    const k = lookupKeySize(30)
    expect(k.width).toBe(8)
    expect(k.height).toBe(7)
  })

  it('suggests pin length band', () => {
    const L = lookupPinLength(10)
    expect(L.typical).toBe(20)
    expect(L.min).toBeLessThan(L.max)
  })

  it('has pin series and O-ring CS guide', () => {
    expect(PIN_DIAMETER_SERIES).toContain(10)
    expect(ORING_SECTION_GUIDE.some((s) => s.cs === 3.53)).toBe(true)
  })

  it('looks up retaining ring groove', () => {
    const r = lookupRetainingRing(20)
    expect(r.grooveDia).toBe(19)
  })
})

describe('related-tools', () => {
  it('returns next-step paths for bevel gear', () => {
    const links = getRelatedToolLinks('bevel-gear')
    expect(links.some((l) => l.path === '/gear')).toBe(true)
    expect(links.some((l) => l.path === '/shaft')).toBe(true)
  })
})
