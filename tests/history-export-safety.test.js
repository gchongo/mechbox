import { describe, expect, it } from 'vitest'
import { pickMergedMethodResult } from '@/utils/export'
import { resolveHistoryOpenTarget } from '@/utils/calc-history'

describe('history/export safety', () => {
  it('merged export prefers recorded method regardless of review status', () => {
    const picked = pickMergedMethodResult(
      {
        method: 'rss',
        methodResults: [
          { method: 'worst', tolerance: 0.15, pass: false },
          { method: 'rss', tolerance: 0.08, pass: true },
        ],
      },
      'review',
    )
    expect(picked.method).toBe('rss')
    expect(picked.tolerance).toBeCloseTo(0.08)
  })

  it('unsupported tool replay opens summary-only target', () => {
    const target = resolveHistoryOpenTarget({
      id: 'x1',
      source: 'tool',
      tool: 'bearing',
      data: {},
    })
    expect(target.kind).toBe('summary-only')
  })
})
