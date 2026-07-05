import { describe, expect, it } from 'vitest'
import {
  buildToolReplayRoute,
  hasReplayableInput,
  resolveHistoryOpenTarget,
} from '@/utils/calc-history'
import { applyReplayToTarget } from '@/utils/history-replay'
import { buildExportTraceSection } from '@/utils/export'

describe('history replay infrastructure', () => {
  it('hasReplayableInput ignores metadata-only snapshots', () => {
    expect(hasReplayableInput({ data: { input: { _schemaVersion: 1 } } })).toBe(false)
    expect(hasReplayableInput({ data: { input: { nominal: 25, holeCode: 'H7' } } })).toBe(true)
  })

  it('buildToolReplayRoute enables replay when input snapshot exists', () => {
    const route = buildToolReplayRoute({
      id: 'b1',
      source: 'tool',
      tool: 'bearing',
      data: { input: { rpm: 1500, radialLoad: 5000 } },
    })
    expect(route).toEqual({
      path: '/bearing',
      query: { historyId: 'b1', replay: 'history' },
    })
  })

  it('resolveHistoryOpenTarget returns replay for saved inputs', () => {
    const target = resolveHistoryOpenTarget({
      id: 'b2',
      source: 'tool',
      tool: 'beam',
      data: { input: { calcMode: 'simple', load: 1000 } },
    })
    expect(target.kind).toBe('replay')
  })

  it('resolveHistoryOpenTarget returns no_input_snapshot when route exists but no inputs', () => {
    const target = resolveHistoryOpenTarget({
      id: 'b3',
      source: 'tool',
      tool: 'bearing',
      data: {},
    })
    expect(target.kind).toBe('summary-only')
    expect(target.reason).toBe('no_input_snapshot')
  })

  it('applyReplayToTarget restores reactive form fields and arrays', () => {
    const form = {
      calcMode: 'simple',
      rings: [{ name: 'A', tolerance: 0.01 }],
      nested: { method: 'worst' },
    }
    const applied = applyReplayToTarget(form, {
      calcMode: 'complete',
      rings: [{ name: 'B', tolerance: 0.05 }],
      nested: { method: 'rss' },
      unknown: 1,
    })
    expect(applied.applied).toBe(true)
    expect(form.calcMode).toBe('complete')
    expect(form.rings[0].name).toBe('B')
    expect(form.nested.method).toBe('rss')
  })

  it('buildExportTraceSection includes tool, mode, status, date', () => {
    const section = buildExportTraceSection(
      {
        toolLabel: '轴承寿命',
        calcMode: '完整',
        status: 'review',
        units: 'N, h',
        assumptions: ['简化温度模型'],
      },
      'zh',
    )
    expect(section.heading).toBeTruthy()
    expect(section.rows.some((r) => r.value === '轴承寿命')).toBe(true)
    expect(section.rows.length).toBeGreaterThan(3)
  })
})
