import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import {
  serializeEditorForGdtStack,
  deserializeGdtStackPayload,
  GDT_STACK_STORAGE_KEY,
} from '@/constants/editor-bridge'
import { saveToolHistory, formatHistorySource, getToolRoute, TOOL_META } from '@/utils/calc-history'
import { getHistory, deleteAnalysis } from '@/utils/storage'
import { analyzeWeldFatigue, analyzeHAZ } from '@/utils/weld-calc'

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
})

describe('weld fatigue/haz', () => {
  it('analyzes weld fatigue', () => {
    const r = analyzeWeldFatigue({ stressRange: 30, cycles: 1e6, detailCategory: 'medium' })
    expect(r.pass).toBe(true)
    expect(r.estimatedLife).toBeGreaterThan(0)
  })

  it('rejects zero stress range', () => {
    expect(analyzeWeldFatigue({ stressRange: 0 }).error).toBeTruthy()
  })

  it('analyzes HAZ', () => {
    const r = analyzeHAZ({ heatInput: 2, plateThickness: 10, force: 8000, legSize: 6, weldLength: 80 })
    expect(r.hazWidthMm).toBeGreaterThan(0)
    expect(r.hazAllowShear).toBeLessThan(r.baseAllowShear)
  })
})
