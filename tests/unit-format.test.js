import { describe, it, expect } from 'vitest'
import { formatEngineeringValue, formatScaleRatio } from '@/utils/unit-format'
import { getScaleReferences } from '@/constants/unit-scale-references'

describe('unit-format', () => {
  it('formats large values with separators', () => {
    expect(formatEngineeringValue(100000)).toBe('100,000')
  })

  it('formats medium values without trailing zeros', () => {
    expect(formatEngineeringValue(14.503768)).toBe('14.5')
  })

  it('uses superscript scientific for tiny values', () => {
    expect(formatEngineeringValue(0.000001)).toMatch(/×10⁻⁶/)
  })

  it('formats scale ratios', () => {
    expect(formatScaleRatio(0.426)).toBe('0.43')
    expect(formatScaleRatio(988)).toMatch(/988/)
  })
})

describe('unit-scale-references', () => {
  const label = (k) => k

  it('returns stress refs for 100 MPa', () => {
    const refs = getScaleReferences(100, 'MPa', 'stress', label)
    expect(refs.length).toBeGreaterThan(0)
    expect(refs.some((r) => r.id === 'q235')).toBe(true)
  })

  it('returns length refs for 25 mm', () => {
    const refs = getScaleReferences(25, 'mm', 'length', label)
    expect(refs.some((r) => r.id === 'shaft25' || r.id === 'm6_pitch')).toBe(true)
  })

  it('filters out-of-range ratios', () => {
    const refs = getScaleReferences(0.001, 'MPa', 'stress', label)
    expect(refs.find((r) => r.id === 'q235')).toBeUndefined()
  })
})
