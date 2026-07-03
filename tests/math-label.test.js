import { describe, it, expect } from 'vitest'
import { enrichMathText } from '@/utils/math-label'

describe('math-label enrichMathText', () => {
  it('converts friction coefficients', () => {
    expect(enrichMathText('螺纹摩擦 μ_G')).toContain('\\mu_G')
    expect(enrichMathText('摩擦直径 D_km')).toContain('D_{km}')
  })

  it('converts stress symbols', () => {
    expect(enrichMathText('切应力 τ')).toContain('\\tau')
    expect(enrichMathText('弯曲应力 σ')).toContain('\\sigma')
  })

  it('preserves pre-marked latex', () => {
    const s = 'RSS $T=\\sum T_i$'
    expect(enrichMathText(s)).toBe(s)
  })

  it('converts stack method symbols', () => {
    expect(enrichMathText('T=ΣTᵢ')).toContain('\\sum T_i')
    expect(enrichMathText('D_km · μ_K')).toContain('D_{km}')
  })
})
