import { describe, it, expect } from 'vitest'
import { parseMathContent } from '@/utils/parse-math-content'
import { normalizeHelpText } from '@/utils/help-text-normalize'

describe('parseMathContent', () => {
  it('parses inline and block math', () => {
    const parts = parseMathContent('已知 $d=10$ mm 与 $$F=ma$$')
    expect(parts.some((p) => p.type === 'math' && p.content === 'd=10' && !p.block)).toBe(true)
    expect(parts.some((p) => p.type === 'math' && p.content === 'F=ma' && p.block)).toBe(true)
  })

  it('parses bold segments', () => {
    const parts = parseMathContent('**综合通过** = $D<1$')
    expect(parts.find((p) => p.type === 'bold')?.content).toBe('综合通过')
    expect(parts.some((p) => p.type === 'math' && p.content === 'D<1$')).toBe(false)
    expect(parts.some((p) => p.type === 'math' && p.content === 'D<1')).toBe(true)
  })

  it('does not treat ** inside math as bold', () => {
    const parts = parseMathContent('$n/N_f\\approx1.28$')
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe('math')
  })
})

describe('normalizeHelpText', () => {
  it('localizes code terms in zh', () => {
    expect(normalizeHelpText('releaseBlocked 时 pass 恒为 false', 'zh')).toContain('结果未放行')
    expect(normalizeHelpText('releaseBlocked 时 pass 恒为 false', 'zh')).toContain('通过判定恒为否')
  })

  it('leaves en unchanged', () => {
    const s = 'pass always false (estimateOnly)'
    expect(normalizeHelpText(s, 'en')).toBe(s)
  })
})

describe('MathContent integration via enrich + parse', () => {
  it('enriches Sa in plain text', async () => {
    const { enrichMathText } = await import('@/utils/math-label')
    expect(enrichMathText('原始 Sa + σ₋₁')).toContain('$S_a$')
  })
})
