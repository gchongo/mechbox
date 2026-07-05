import { describe, it, expect } from 'vitest'
import { calcMetricBasicDims, getThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import {
  filterThreadRows,
  parseThreadMark,
  parseThreadDesignation,
  getThreadNeighbors,
  buildCompareMatrix,
  getComparePresets,
  tpiToPitch,
  pitchToTpi,
} from '@/utils/thread-standards'

describe('metric basic dimensions', () => {
  it('M10×1.5 pitch diameters per ISO formula', () => {
    const d = calcMetricBasicDims(10, 1.5)
    expect(d.major).toBe(10)
    expect(d.pitch).toBe(1.5)
    expect(d.pitchDiameter).toBeCloseTo(10 - 0.649519052846 * 1.5, 3)
    expect(d.minor).toBeCloseTo(10 - 1.082531754877 * 1.5, 3)
  })

  it('coarse M12 row matches generated dims', () => {
    const row = getThreadRows('metric', 'coarse').find((r) => r.designation === 'M12')
    expect(row).toBeTruthy()
    expect(row.pitch).toBe(1.75)
    expect(row.major).toBe(12)
    expect(row.pitchDiameter).toBeCloseTo(10.863, 2)
  })
})

describe('filterThreadRows', () => {
  const coarse = getThreadRows('metric', 'coarse')
  const fine = getThreadRows('metric', 'fine')

  it('matches designation substring', () => {
    const hits = filterThreadRows(coarse, { query: 'M10' })
    expect(hits.some((r) => r.designation === 'M10')).toBe(true)
  })

  it('filters by priority', () => {
    const p1 = filterThreadRows(coarse, { priority: 1 })
    expect(p1.length).toBeGreaterThan(0)
    expect(p1.every((r) => r.priority === 1)).toBe(true)
  })

  it('filters metric fine M3–M7', () => {
    const small = filterThreadRows(fine, { diameterMin: 3, diameterMax: 7 })
    expect(small.some((r) => r.designation === 'M3×0.35')).toBe(true)
    expect(small.every((r) => r.nominal >= 3 && r.nominal <= 7)).toBe(true)
  })

  it('filters by diameter range', () => {
    const mid = filterThreadRows(coarse, { diameterMin: 8, diameterMax: 12 })
    expect(mid.every((r) => r.nominal >= 8 && r.nominal <= 12)).toBe(true)
  })

  it('filters UNC by TPI range', () => {
    const unc = getThreadRows('unc', 'unc')
    const hits = filterThreadRows(unc, { tpiMin: 13, tpiMax: 20 })
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((r) => r.tpi >= 13 && r.tpi <= 20)).toBe(true)
  })
})

describe('parseThreadMark', () => {
  it('parses metric with tolerance segments', () => {
    const p = parseThreadMark('M10×1.25-6g')
    expect(p?.system).toBe('metric')
    expect(p?.nominal).toBe(10)
    expect(p?.pitch).toBe(1.25)
    expect(p?.toleranceExternal).toBe('6g')
    expect(p?.segments.length).toBeGreaterThan(1)
    expect(p?.primaryMatch?.designation).toBe('M10×1.25')
  })

  it('parses unified with class', () => {
    const p = parseThreadMark('1/4-20 UNC-2A')
    expect(p?.system).toBe('unc')
    expect(p?.tpi).toBe(20)
    expect(p?.toleranceExternal).toBe('2A')
    expect(p?.matchedRows.length).toBeGreaterThan(0)
  })

  it('detects pipe threads', () => {
    expect(parseThreadMark('G1/2')?.system).toBe('g')
    expect(parseThreadMark('1/2-14 NPT')?.system).toBe('npt')
    expect(parseThreadMark('Rc1/2')?.system).toBe('r')
  })

  it('parseThreadDesignation remains compatible', () => {
    expect(parseThreadDesignation('M10×1.5')?.system).toBe('metric')
    expect(parseThreadDesignation('1/4-20 UNC')?.system).toBe('unc')
  })
})

describe('neighbors and compare', () => {
  it('finds adjacent metric sizes', () => {
    const m10 = getThreadRows('metric', 'coarse').find((r) => r.designation === 'M10')
    const { prev, next, siblings } = getThreadNeighbors(m10)
    expect(prev?.designation).toBe('M8')
    expect(next?.designation).toBe('M12')
    expect(siblings.some((s) => s.designation.includes('M10×'))).toBe(true)
  })

  it('buildCompareMatrix highlights diffs', () => {
    const coarse = getThreadRows('metric', 'coarse').find((r) => r.designation === 'M10')
    const fine = getThreadRows('metric', 'fine').find((r) => r.designation === 'M10×1.25')
    const { fields } = buildCompareMatrix([coarse, fine])
    const pitchField = fields.find((f) => f.key === 'pitchOrTpi')
    expect(pitchField?.isDiff).toBe(true)
  })

  it('compare presets have at least two ids', () => {
    for (const preset of getComparePresets()) {
      expect(preset.rowIds.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('pipe thread datasets', () => {
  it('each pipe system has rows', () => {
    for (const id of ['npt', 'g', 'r']) {
      const rows = getThreadRows(id, id)
      expect(rows.length).toBeGreaterThan(3)
    }
  })

  it('THREAD_SYSTEMS covers six tabs', () => {
    expect(THREAD_SYSTEMS.map((s) => s.id)).toEqual(['metric', 'unc', 'unf', 'npt', 'g', 'r'])
  })
})

describe('tpiToPitch', () => {
  it('converts 20 TPI to mm pitch', () => {
    expect(tpiToPitch(20)).toBeCloseTo(1.27, 2)
  })
})

describe('pitchToTpi', () => {
  it('converts 1.5 mm pitch to TPI', () => {
    expect(pitchToTpi(1.5)).toBeCloseTo(16.93, 1)
  })
})
