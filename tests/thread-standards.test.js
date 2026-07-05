import { describe, it, expect } from 'vitest'
import { calcMetricBasicDims, getThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import { filterThreadRows, parseThreadDesignation } from '@/utils/thread-standards'

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

  it('matches designation substring', () => {
    const hits = filterThreadRows(coarse, { query: 'M10' })
    expect(hits.some((r) => r.designation === 'M10')).toBe(true)
    expect(hits.every((r) => r.designation.includes('M10') || String(r.nominal) === '10')).toBe(true)
  })

  it('filters by priority', () => {
    const p1 = filterThreadRows(coarse, { priority: 1 })
    expect(p1.length).toBeGreaterThan(0)
    expect(p1.every((r) => r.priority === 1)).toBe(true)
  })
})

describe('parseThreadDesignation', () => {
  it('detects metric fine pitch', () => {
    expect(parseThreadDesignation('M10×1.5')?.system).toBe('metric')
    expect(parseThreadDesignation('M10×1.5')?.pitch).toBe(1.5)
  })

  it('detects UNC and pipe threads', () => {
    expect(parseThreadDesignation('1/4-20 UNC')?.system).toBe('unc')
    expect(parseThreadDesignation('G1/2')?.system).toBe('g')
    expect(parseThreadDesignation('1/2-14 NPT')?.system).toBe('npt')
  })
})

describe('pipe thread datasets', () => {
  it('each pipe system has rows', () => {
    for (const id of ['npt', 'g', 'r']) {
      const rows = getThreadRows(id, id)
      expect(rows.length).toBeGreaterThan(3)
      expect(rows.every((r) => r.system === id)).toBe(true)
    }
  })

  it('THREAD_SYSTEMS covers six tabs', () => {
    expect(THREAD_SYSTEMS.map((s) => s.id)).toEqual(['metric', 'unc', 'unf', 'npt', 'g', 'r'])
  })
})
