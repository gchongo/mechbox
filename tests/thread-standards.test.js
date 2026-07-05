import { describe, it, expect } from 'vitest'
import {
  calcMetricBasicDims,
  getThreadRows,
  getAllThreadRows,
  THREAD_SYSTEMS,
} from '@/constants/thread-standards'
import {
  filterThreadRows,
  parseThreadMark,
  getThreadNeighbors,
  buildCompareMatrix,
  getComparePresets,
  tpiToPitch,
  pitchToTpi,
} from '@/utils/thread-standards'

describe('ISO 68-1 formula verification', () => {
  it('M68×6 matches handbook pitch/minor diameters', () => {
    const d = calcMetricBasicDims(68, 6)
    expect(d.pitchDiameter).toBeCloseTo(64.103, 2)
    expect(d.minor).toBeCloseTo(61.505, 2)
  })

  it('M10×1.5 coarse pitch diameters', () => {
    const d = calcMetricBasicDims(10, 1.5)
    expect(d.pitchDiameter).toBeCloseTo(10 - 0.649519052846 * 1.5, 3)
  })
})

describe('catalog completeness', () => {
  it('metric coarse M1–M100 coverage', () => {
    const coarse = getThreadRows('metric', 'coarse')
    expect(coarse.length).toBeGreaterThanOrEqual(47)
    expect(coarse.some((r) => r.designation === 'M1')).toBe(true)
    expect(coarse.some((r) => r.designation === 'M100')).toBe(true)
  })

  it('metric fine includes M3×0.35 and M68×4', () => {
    const fine = getThreadRows('metric', 'fine')
    expect(fine.length).toBeGreaterThanOrEqual(100)
    expect(fine.some((r) => r.designation === 'M3×0.35')).toBe(true)
    expect(fine.some((r) => r.designation === 'M68×4')).toBe(true)
  })

  it('UNC standard series through 4 inch', () => {
    const unc = getThreadRows('unc', 'unc')
    expect(unc.length).toBe(33)
    expect(unc.some((r) => r.designation.includes('4-4 UNC'))).toBe(true)
  })

  it('UNF includes #0-80', () => {
    const unf = getThreadRows('unf', 'unf')
    expect(unf.length).toBe(24)
    expect(unf[0].designation).toContain('#0-80')
  })

  it('NPT full ASME nominal pipe size set', () => {
    const npt = getThreadRows('npt', 'npt')
    expect(npt.length).toBe(24)
    expect(npt.some((r) => r.designation === '24-8 NPT')).toBe(true)
    expect(npt.some((r) => r.designation === '1/2-14 NPT')).toBe(true)
  })

  it('G and R through 6 inch nominal', () => {
    const g = getThreadRows('g', 'g')
    const r = getThreadRows('r', 'r')
    expect(g.length).toBe(15)
    expect(r.length).toBe(15)
    expect(g.some((r) => r.designation === 'G6')).toBe(true)
    expect(r.some((r) => r.designation === 'R6')).toBe(true)
  })

  it('pipe threads have minor diameter populated', () => {
    const pipes = getAllThreadRows().filter((r) => ['npt', 'g', 'r'].includes(r.system))
    expect(pipes.every((r) => r.minor != null && r.minor > 0)).toBe(true)
  })

  it('THREAD_SYSTEMS has six tabs', () => {
    expect(THREAD_SYSTEMS.map((s) => s.id)).toEqual(['metric', 'unc', 'unf', 'npt', 'g', 'r'])
  })
})

describe('NPT reference dimensions (ASME B1.20.1 Table 2)', () => {
  it('1/2-14 NPT pitch diameter at L1', () => {
    const row = getThreadRows('npt', 'npt').find((r) => r.designation === '1/2-14 NPT')
    expect(row.major).toBeCloseTo(0.84, 3)
    expect(row.pitchDiameter).toBeCloseTo(0.7337, 3)
    expect(row.minor).toBeCloseTo(0.7031, 3)
  })
})

describe('filterThreadRows', () => {
  it('filters metric fine M3–M7', () => {
    const fine = getThreadRows('metric', 'fine')
    const small = filterThreadRows(fine, { diameterMin: 3, diameterMax: 7 })
    expect(small.some((r) => r.designation === 'M3×0.35')).toBe(true)
    expect(small.every((r) => r.nominal >= 3 && r.nominal <= 7)).toBe(true)
  })

  it('filters UNC by TPI range', () => {
    const unc = getThreadRows('unc', 'unc')
    const hits = filterThreadRows(unc, { tpiMin: 13, tpiMax: 20 })
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((r) => r.tpi >= 13 && r.tpi <= 20)).toBe(true)
  })
})

describe('parseThreadMark', () => {
  it('parses metric with tolerance', () => {
    const p = parseThreadMark('M10×1.25-6g')
    expect(p?.primaryMatch?.designation).toBe('M10×1.25')
  })

  it('parses 1/2-14 NPT', () => {
    expect(parseThreadMark('1/2-14 NPT')?.system).toBe('npt')
  })
})

describe('neighbors and compare', () => {
  it('finds adjacent coarse metric sizes', () => {
    const m10 = getThreadRows('metric', 'coarse').find((r) => r.designation === 'M10')
    const { prev, next } = getThreadNeighbors(m10)
    expect(prev?.designation).toBe('M9')
    expect(next?.designation).toBe('M11')
  })

  it('compare presets have at least two ids', () => {
    for (const preset of getComparePresets()) {
      expect(preset.rowIds.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('TPI pitch conversion', () => {
  it('20 TPI = 1.27 mm', () => {
    expect(tpiToPitch(20)).toBeCloseTo(1.27, 2)
  })
  it('1.5 mm pitch TPI', () => {
    expect(pitchToTpi(1.5)).toBeCloseTo(16.93, 1)
  })
})
