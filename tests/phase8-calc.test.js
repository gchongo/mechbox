import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import {
  serializeEditorForGdtStack,
  deserializeGdtStackPayload,
  GDT_STACK_STORAGE_KEY,
} from '@/constants/editor-bridge'
import {
  buildToolReplayRoute,
  buildSummaryRows,
  formatHistorySource,
  formatHistoryStatus,
  getToolRoute,
  getToolReplayRecord,
  resolveHistoryOpenTarget,
  saveToolHistory,
  toolSupportsReplay,
  TOOL_META,
} from '@/utils/calc-history'
import { getHistory, deleteAnalysis, saveAnalysis } from '@/utils/storage'
import { analyzeWeldFatigue, analyzeHAZ } from '@/utils/weld-calc'
import { pickMergedMethodResult } from '@/utils/export'

describe('editor-bridge gdt', () => {
  it('serializes editor to gdt stack payload', () => {
    const p = serializeEditorForGdtStack({
      closedRing: { min: 0, max: 0.12 },
      componentRings: [{ name: 'X', tolerance: 0.05, factor: 1, direction: 'right' }],
      method: 'rss',
      selectedType: { id: 'position', name: '位置度' },
      gdtModifier: 'MMC',
      bonusTolerance: 0.01,
    })
    expect(p.typeId).toBe('position')
    expect(p.rings).toHaveLength(1)
    expect(p.closedMax).toBe(0.12)
  })

  it('deserializes gdt payload', () => {
    const raw = serializeEditorForGdtStack({
      closedRing: { max: 0.1 },
      componentRings: [],
      selectedType: { id: 'flatness' },
    })
    const d = deserializeGdtStackPayload(raw)
    expect(d.typeId).toBe('flatness')
  })

  it('exports storage key constant', () => {
    expect(GDT_STACK_STORAGE_KEY).toBeTruthy()
  })
})

describe('calc-history', () => {
  const savedIds = []
  const store = {}

  beforeEach(() => {
    global.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v
      },
      removeItem: (k) => {
        delete store[k]
      },
    }
    store.mebox_history = undefined
    delete store.mechbox_history
  })

  afterEach(() => {
    for (const id of savedIds) deleteAnalysis(id)
    savedIds.length = 0
  })

  it('saves tool history entry', () => {
    const entry = saveToolHistory({
      tool: 'fit',
      title: 'H7/g6 测试',
      status: 'pass',
      summary: [{ label: '间隙', value: '20 μm' }],
    })
    savedIds.push(entry.id)
    const found = getHistory().find((h) => h.id === entry.id)
    expect(found.source).toBe('tool')
    expect(found.tool).toBe('fit')
  })

  it('formats source label', () => {
    expect(formatHistorySource({ source: 'tool', data: { toolLabel: '焊缝' } })).toBe('焊缝')
    expect(formatHistorySource({ source: 'editor', data: {} })).toBe('尺寸链')
  })

  it('resolves tool routes', () => {
    expect(getToolRoute('gdt-stack')).toBe('/gdt-stack')
    expect(TOOL_META.weld.label).toBe('焊缝强度')
  })

  it('builds replay route and fetches matching tool record', () => {
    const entry = saveToolHistory({
      tool: 'fit',
      title: 'H7/g6 回放',
      status: 'review',
      input: { nominal: 25, holeCode: 'H7', shaftCode: 'g6' },
    })
    savedIds.push(entry.id)
    const replayRoute = buildToolReplayRoute(entry)
    expect(replayRoute.path).toBe('/fit')
    expect(replayRoute.query.historyId).toBe(entry.id)
    const replay = getToolReplayRecord(entry.id, 'fit')
    expect(replay?.id).toBe(entry.id)
    expect(getToolReplayRecord(entry.id, 'weld')).toBe(null)
  })

  it('uses replayable input snapshots instead of a fixed tool whitelist', () => {
    expect(toolSupportsReplay('fit')).toBe(true)
    expect(toolSupportsReplay('gdt-stack')).toBe(true)
    expect(toolSupportsReplay('weld')).toBe(true)
    expect(toolSupportsReplay('beam')).toBe(true)
    expect(toolSupportsReplay('bolt-preload')).toBe(true)

    const beamEntry = saveToolHistory({ tool: 'beam', title: '梁', status: 'pass' })
    savedIds.push(beamEntry.id)
    expect(buildToolReplayRoute(beamEntry)).toBe(null)

    const replayableBeamEntry = saveToolHistory({
      tool: 'beam',
      title: '梁回放',
      status: 'pass',
      input: { spanLength: 500, load: 2000 },
    })
    savedIds.push(replayableBeamEntry.id)
    expect(buildToolReplayRoute(replayableBeamEntry)?.path).toBe('/beam')
  })

  it('resolveHistoryOpenTarget routes editor vs replay vs blank tool', () => {
    const editorEntry = saveAnalysis({
      source: 'editor',
      title: '链',
      data: { closedRing: { min: 0, max: 1 } },
    })
    savedIds.push(editorEntry.id)
    expect(resolveHistoryOpenTarget(editorEntry)).toEqual({
      kind: 'editor',
      id: String(editorEntry.id),
    })

    const fitEntry = saveToolHistory({
      tool: 'fit',
      title: '配合',
      status: 'pass',
      input: { nominal: 25, holeCode: 'H7', shaftCode: 'g6' },
    })
    savedIds.push(fitEntry.id)
    const fitTarget = resolveHistoryOpenTarget(fitEntry)
    expect(fitTarget.kind).toBe('replay')
    expect(fitTarget.route.path).toBe('/fit')

    const beamEntry = saveToolHistory({ tool: 'beam', title: '梁', status: 'pass' })
    savedIds.push(beamEntry.id)
    expect(resolveHistoryOpenTarget(beamEntry)).toEqual({
      kind: 'summary-only',
      record: beamEntry,
      reason: 'no_input_snapshot',
    })
  })

  it('preserves review status and snapshot warnings in tool history', () => {
    const entry = saveToolHistory({
      tool: 'beam',
      title: '细长梁复核',
      status: 'review',
      summary: [{ label: '整体判定', value: '需复核' }],
      result: {
        warnings: [{ key: 'slenderness', level: 'warn', message: '长径比 45.0 > 40，需复核剪切/失稳' }],
        assumptions: ['Euler-Bernoulli 梁；忽略动载荷、应力集中'],
      },
    })
    savedIds.push(entry.id)

    const found = getHistory().find((h) => h.id === entry.id)
    expect(found.status).toBe('review')
    expect(formatHistoryStatus(found.status)).toBe('需复核')

    const rows = buildSummaryRows(found)
    expect(rows.some((row) => row.label === '警告' && String(row.value).includes('长径比 45.0 > 40'))).toBe(true)
    expect(rows.some((row) => row.label === '假设与简化' && String(row.value).includes('Euler-Bernoulli'))).toBe(true)
  })

  it('buildSummaryRows includes editor snapshot warnings and assumptions', () => {
    const entry = saveAnalysis({
      source: 'editor',
      title: '尺寸链统计复核',
      status: 'review',
      data: {
        closedRing: { name: 'L0', min: -0.1, max: 0.1 },
        method: 'rss',
        snapshot: {
          warnings: [{ key: 'rss_pass_worst_fail', level: 'critical', message: 'RSS 通过但 worst 不通过' }],
          assumptions: ['RSS 仅用于统计评估，不能替代 worst 封闭性放行'],
        },
      },
    })
    savedIds.push(entry.id)
    const found = getHistory().find((h) => h.id === entry.id)
    const rows = buildSummaryRows(found)
    expect(rows.some((row) => row.label === '警告' && String(row.value).includes('RSS 通过但 worst 不通过'))).toBe(true)
    expect(rows.some((row) => row.label === '假设与简化' && String(row.value).includes('RSS 仅用于统计评估'))).toBe(true)
  })
})

describe('weld fatigue/haz', () => {
  it('analyzes weld fatigue', () => {
    const r = analyzeWeldFatigue({ stressRange: 30, cycles: 1e6, detailCategory: 'medium' })
    expect(r.pass).toBe(true)
    expect(r.estimatedLife).toBeGreaterThan(0)
  })

  it('rejects zero stress range', () => {
    expect(analyzeWeldFatigue({ stressRange: 0 }).errorKey).toBeTruthy()
  })

  it('analyzes HAZ', () => {
    const r = analyzeHAZ({ heatInput: 2, plateThickness: 10, force: 8000, legSize: 6, weldLength: 80 })
    expect(r.hazWidthMm).toBeGreaterThan(0)
    expect(r.hazAllowShear).toBeLessThan(r.baseAllowShear)
  })
})

describe('export history release gate', () => {
  it('uses worst method when snapshot is review', () => {
    const data = {
      method: 'rss',
      methodResults: [
        { method: 'worst', tolerance: 0.12, pass: false },
        { method: 'rss', tolerance: 0.08, pass: true },
      ],
    }
    const picked = pickMergedMethodResult(data, 'review')
    expect(picked?.method).toBe('worst')
    expect(picked?.pass).toBe(false)
  })

  it('uses active/passing method when snapshot is pass', () => {
    const data = {
      method: 'rss',
      methodResults: [
        { method: 'worst', tolerance: 0.12, pass: false },
        { method: 'rss', tolerance: 0.08, pass: true },
      ],
    }
    const picked = pickMergedMethodResult(data, 'pass')
    expect(picked?.method).toBe('rss')
    expect(picked?.pass).toBe(true)
  })
})
