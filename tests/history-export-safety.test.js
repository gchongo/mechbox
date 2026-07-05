import { describe, expect, it } from 'vitest'
import { pickMergedMethodResult, buildExportTraceSection } from '@/utils/export'
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

  it('tool record without input opens summary-only with no_input_snapshot', () => {
    const target = resolveHistoryOpenTarget({
      id: 'x1',
      source: 'tool',
      tool: 'bearing',
      data: {},
    })
    expect(target.kind).toBe('summary-only')
    expect(target.reason).toBe('no_input_snapshot')
  })

  it('export trace section carries engineering metadata', () => {
    const sec = buildExportTraceSection({ toolLabel: 'Beam', calcMode: 'simple', status: 'pass' }, 'en')
    expect(sec.rows.length).toBeGreaterThan(2)
  })
})
