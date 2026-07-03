import { describe, it, expect } from 'vitest'
import { enrichMathText, dimLabel, identToLatex, legendLine } from '@/utils/math-label'

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

  it('preserves latex while enriching plain segments', () => {
    const s = '已知 $d_1$ 与 d_2 配合'
    const out = enrichMathText(s)
    expect(out).toContain('$d_1$')
    expect(out).toContain('d_2')
  })

  it('converts stack method symbols', () => {
    expect(enrichMathText('T=ΣTᵢ')).toContain('\\sum T_i')
    expect(enrichMathText('D_km · μ_K')).toContain('D_{km}')
  })

  it('auto-converts dimension labels', () => {
    expect(enrichMathText('d = 50 mm')).toContain('$d$')
    expect(enrichMathText('L = 100 mm')).toMatch(/\$L\$ = 100/)
    expect(dimLabel('b', 8)).toContain('$b$ = 8')
  })

  it('auto-converts axis and tolerance labels', () => {
    expect(enrichMathText('N (log)')).toContain('$N$')
    expect(enrichMathText('S')).toBe('$S$')
    expect(enrichMathText('ES')).toBe('$ES$')
    expect(enrichMathText('design ES value')).toContain('$ES$')
    expect(enrichMathText('DESIGN')).toBe('DESIGN')
  })

  it('converts statistical bar symbols', () => {
    expect(enrichMathText('X̿')).toContain('\\bar{X}')
    expect(enrichMathText('R̄')).toContain('\\bar{R}')
  })

  it('identToLatex handles subscripts', () => {
    expect(identToLatex('d_cs')).toBe('$d_{cs}$')
    expect(identToLatex('F_beta')).toBe('$F_{\\beta}$')
  })

  it('does not duplicate symbols when label already includes them', () => {
    const once = enrichMathText('切应力 τ')
    expect(once.match(/\\tau/g)?.length).toBe(1)
    expect(enrichMathText('切应力 τ τ').match(/\\tau/g)?.length).toBe(2)
  })

  it('shaft diagram hint without inner bore has no broken $$', () => {
    const hint = enrichMathText('轴径 $d$，扭矩 $T$')
    expect(hint).not.toContain('$$')
    expect(hint).toContain('$d$')
    expect(hint).toContain('$T$')
  })

  it('binds CJK label to following symbol with nbsp', () => {
    expect(enrichMathText('有效面积 A_s')).toContain('\u00a0')
    expect(enrichMathText('有效面积 A_s')).toContain('$A_s$')
    expect(enrichMathText('有效面积 A_s')).not.toMatch(/\$\$/)
    expect(enrichMathText('螺栓刚度 k_S')).not.toMatch(/\$\$/)
    expect(enrichMathText('载荷系数 Φ')).toContain('\\Phi')
  })

  it('legendLine keeps symbol and description inline', () => {
    const line = legendLine('L_K', '两被夹紧件贴合面之间的夹紧长度')
    expect(line).toMatch(/^\$L_K\$ — /)
    expect(line).not.toMatch(/\$\$/)
    expect(legendLine('d', '螺栓公称直径')).toContain('$d$')
  })

  it('does not double-wrap common engineering identifiers', () => {
    for (const id of ['A_s', 'd_2', 'k_S', 'k_P', 'L_K', 'd_h', 'd_W', 'D_A', 'f_Z', 'μ_G']) {
      expect(enrichMathText(`标签 ${id}`)).not.toMatch(/\$\$/)
    }
  })
})
