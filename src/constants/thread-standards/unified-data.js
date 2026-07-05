/** ASME B1.1 统一螺纹 UNC / UNF 基本尺寸 (inch, 60°) */

const PITCH_DIA_COEF = 0.649519052846
const MINOR_COEF = 1.082531754877

function unifiedDims(majorIn, tpi) {
  const pitch = 1 / tpi
  return {
    major: round(majorIn, 4),
    pitchDiameter: round(majorIn - PITCH_DIA_COEF * pitch, 4),
    minor: round(majorIn - MINOR_COEF * pitch, 4),
    pitch,
    tpi,
    threadAngle: 60,
    tapDrill: round(majorIn - MINOR_COEF * pitch, 3),
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}

/** [designation label, major inch, TPI, series] */
const UNIFIED_RAW = [
  ['#0-80', 0.06, 80, 'unc'],
  ['#1-64', 0.073, 64, 'unc'],
  ['#2-56', 0.086, 56, 'unc'],
  ['#3-48', 0.099, 48, 'unc'],
  ['#4-40', 0.112, 40, 'unc'],
  ['#5-40', 0.125, 40, 'unc'],
  ['#6-32', 0.138, 32, 'unc'],
  ['#8-32', 0.164, 32, 'unc'],
  ['#10-24', 0.19, 24, 'unc'],
  ['#12-24', 0.216, 24, 'unc'],
  ['1/4-20', 0.25, 20, 'unc'],
  ['5/16-18', 0.3125, 18, 'unc'],
  ['3/8-16', 0.375, 16, 'unc'],
  ['7/16-14', 0.4375, 14, 'unc'],
  ['1/2-13', 0.5, 13, 'unc'],
  ['9/16-12', 0.5625, 12, 'unc'],
  ['5/8-11', 0.625, 11, 'unc'],
  ['3/4-10', 0.75, 10, 'unc'],
  ['7/8-9', 0.875, 9, 'unc'],
  ['1-8', 1, 8, 'unc'],
  ['1/4-28', 0.25, 28, 'unf'],
  ['5/16-24', 0.3125, 24, 'unf'],
  ['3/8-24', 0.375, 24, 'unf'],
  ['7/16-20', 0.4375, 20, 'unf'],
  ['1/2-20', 0.5, 20, 'unf'],
  ['9/16-18', 0.5625, 18, 'unf'],
  ['5/8-18', 0.625, 18, 'unf'],
  ['3/4-16', 0.75, 16, 'unf'],
  ['7/8-14', 0.875, 14, 'unf'],
  ['1-14', 1, 14, 'unf'],
  ['1-12', 1, 12, 'unf'],
]

export function buildUnifiedRows(seriesFilter) {
  return UNIFIED_RAW.filter((r) => r[3] === seriesFilter).map(([label, major, tpi, series]) => {
    const dims = unifiedDims(major, tpi)
    return {
      id: `un-${series}-${label.replace(/[^\w]/g, '')}`,
      system: series,
      subSeries: series,
      designation: `${label} ${series.toUpperCase()}`,
      priority: 1,
      standardRef: 'ASME B1.1',
      unit: 'in',
      nominal: major,
      ...dims,
      toleranceExternal: '2A',
      toleranceInternal: '2B',
      sealing: '—',
      taper: '—',
      compatibility: '—',
      usageKey: 'fastener',
    }
  })
}

export const UNC_ROWS = buildUnifiedRows('unc')
export const UNF_ROWS = buildUnifiedRows('unf')
