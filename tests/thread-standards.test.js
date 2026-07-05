import { describe, it, expect } from 'vitest'
import {
  calcMetricBasicDims,
  calcTrapezoidalBasicDims,
  calcWhitworthBasicDims,
  getThreadRows,
  getAllThreadRows,
  getWhitworthReferenceRows,
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
  it('Tr20×4 trapezoidal basic diameters', () => {
    const d = calcTrapezoidalBasicDims(20, 4)
    expect(d.pitchDiameter).toBeCloseTo(18, 3)
    expect(d.minor).toBeCloseTo(16, 3)
    expect(d.threadAngle).toBe(30)
  })

  it('1/4-20 BSW Whitworth basic diameters', () => {
    const d = calcWhitworthBasicDims(0.25, 20)
    expect(d.threadAngle).toBe(55)
    expect(d.pitchDiameter).toBeCloseTo(0.25 - 0.6403 / 20, 4)
    expect(d.minor).toBeCloseTo(0.25 - 1.2806 / 20, 4)
  })

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

  it('UNEF extra-fine series through 4 inch', () => {
    const unef = getThreadRows('unef', 'unef')
    expect(unef.length).toBe(34)
    expect(unef.some((r) => r.designation === '4-12 UNEF')).toBe(true)
  })

  it('Tr series Tr8 through Tr300', () => {
    const tr = getThreadRows('tr', 'tr')
    expect(tr.length).toBe(34)
    expect(tr.some((r) => r.designation === 'Tr20×4')).toBe(true)
    expect(tr.some((r) => r.designation === 'Tr300×24')).toBe(true)
  })

  it('Acme GP series through 5 inch', () => {
    const acme = getThreadRows('acme', 'acme')
    expect(acme.length).toBe(21)
    expect(acme.some((r) => r.designation === '1/2-10 ACME')).toBe(true)
    expect(acme.some((r) => r.designation === '5-2 ACME')).toBe(true)
  })

  it('NPTF mirrors NPT nominal set', () => {
    const npt = getThreadRows('npt', 'npt')
    const nptf = getThreadRows('nptf', 'nptf')
    expect(nptf.length).toBe(npt.length)
    expect(nptf.some((r) => r.designation === '1/2-14 NPTF')).toBe(true)
  })

  it('pipe threads have minor diameter populated', () => {
    const pipes = getAllThreadRows().filter((r) => ['npt', 'nptf', 'g', 'r'].includes(r.system))
    expect(pipes.every((r) => r.minor != null && r.minor > 0)).toBe(true)
  })

  it('THREAD_SYSTEMS has ten catalog tabs', () => {
    expect(THREAD_SYSTEMS.map((s) => s.id)).toEqual([
      'metric', 'unc', 'unf', 'unef', 'tr', 'acme', 'npt', 'nptf', 'g', 'r',
    ])
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

  it('parses Tr20×4 and 1/2-14 NPTF', () => {
    expect(parseThreadMark('Tr20×4')?.primaryMatch?.designation).toBe('Tr20×4')
    expect(parseThreadMark('1/2-14 NPTF')?.system).toBe('nptf')
    expect(parseThreadMark('1/4-32 UNEF')?.primaryMatch?.designation).toContain('UNEF')
    expect(parseThreadMark('1/4-28 UNS')?.system).toBe('uns')
    expect(parseThreadMark('1/4-20 BSW')?.primaryMatch?.designation).toBe('1/4-20 BSW')
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

  it('includes NPT vs NPTF and Tr drive presets', () => {
    const presets = getComparePresets()
    const nptNptf = presets.find((p) => p.id === 'pipe-npt-nptf')
    expect(nptNptf?.rowIds.length).toBe(2)
    const trDrive = presets.find((p) => p.id === 'tr-drive')
    expect(trDrive?.rowIds.length).toBe(2)
    const unSeries = presets.find((p) => p.id === 'un-quarter-series')
    expect(unSeries?.rowIds.length).toBe(3)
    const power = presets.find((p) => p.id === 'power-tr-acme')
    expect(power?.rowIds.length).toBe(2)
    const wh = presets.find((p) => p.id === 'whitworth-quarter')
    expect(wh?.rowIds.length).toBe(3)
  })

  it('Whitworth reference rows included in catalog search', () => {
    const bsw = getWhitworthReferenceRows('bsw')
    expect(bsw.length).toBeGreaterThanOrEqual(18)
    expect(bsw.some((r) => r.designation === '1/4-20 BSW')).toBe(true)
    expect(getAllThreadRows().some((r) => r.id === bsw[0].id)).toBe(true)
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
