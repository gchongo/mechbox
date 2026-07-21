/**
 * ISO metric catalog rows — master data from `_source/公制螺纹2.xlsx`
 * (regenerate: node scripts/import-metric-catalog.mjs)
 */

import { METRIC_CATALOG_ROWS, METRIC_CATALOG_SOURCE } from './metric-catalog-data'
import { round, stripNum } from './thread-dim'

export { calcMetricBasicDims } from './thread-dim'
export { METRIC_CATALOG_SOURCE }

function flattenLimits(row) {
  const g = row.ext6g || {}
  const h = row.int6H || {}
  const g4 = row.ext4h || {}
  const h4 = row.int4H || {}
  return {
    extDmax: g.dmax ?? null,
    extDmin: g.dmin ?? null,
    extD2max: g.d2max ?? null,
    extD2min: g.d2min ?? null,
    extD3max: g.d3max ?? null,
    intD2max: h.D2max ?? null,
    intD2min: h.D2min ?? null,
    intD1max: h.D1max ?? null,
    intD1min: h.D1min ?? null,
    ext4hDmax: g4.dmax ?? null,
    ext4hDmin: g4.dmin ?? null,
    ext4hD2max: g4.d2max ?? null,
    ext4hD2min: g4.d2min ?? null,
    ext4hD3max: g4.d3max ?? null,
    int4hD2max: h4.D2max ?? null,
    int4hD2min: h4.D2min ?? null,
    int4hD1max: h4.D1max ?? null,
    int4hD1min: h4.D1min ?? null,
  }
}

function buildRow(raw) {
  const isCoarse = raw.toothType === 'coarse'
  return {
    id: `metric-${raw.toothType}-${raw.nominal}-${raw.pitch}`,
    system: 'metric',
    subSeries: isCoarse ? 'coarse' : 'fine',
    designation: isCoarse
      ? `M${stripNum(raw.nominal)}`
      : `M${stripNum(raw.nominal)}×${stripNum(raw.pitch)}`,
    priority: raw.priority,
    standardRef: 'ISO 68-1 / ISO 724 / ISO 965 · GB/T 196-2003',
    unit: 'mm',
    nominal: raw.nominal,
    major: raw.major,
    pitchDiameter: raw.pitchDiameter,
    minor: raw.minor,
    rootDiameter: raw.rootDiameter,
    pitch: raw.pitch,
    threadAngle: 60,
    // Cutting-tap drill reference: d − P. This is intentionally not the
    // ISO basic internal minor diameter, which is a different dimension.
    tapDrill: round(raw.nominal - raw.pitch, 2),
    rMinUm: raw.rMinUm,
    ...flattenLimits(raw),
    ext6g: raw.ext6g,
    int6H: raw.int6H,
    ext4h: raw.ext4h,
    int4H: raw.int4H,
    eiG: raw.eiG,
    eiH: raw.eiH,
    esE: raw.esE,
    esF: raw.esF,
    esG: raw.esG,
    esH: raw.esH,
    td1: raw.td1,
    td2: raw.td2,
    tdMajor: raw.tdMajor,
    td2Ext: raw.td2Ext,
    engSN: raw.engSN,
    engNL: raw.engNL,
    toleranceExternal: '6g',
    toleranceInternal: '6H',
    sealing: '—',
    taper: '—',
    compatibility: '—',
    usageKey: 'fastener',
    hasMetricCatalog: true,
  }
}

const ALL_ROWS = METRIC_CATALOG_ROWS.map(buildRow)

/** Sorted master list — coarse + fine in one catalog table */
export const METRIC_ALL_ROWS = [...ALL_ROWS].sort((a, b) => {
  if (a.nominal !== b.nominal) return a.nominal - b.nominal
  if (a.pitch !== b.pitch) return a.pitch - b.pitch
  return (a.subSeries === 'coarse' ? 0 : 1) - (b.subSeries === 'coarse' ? 0 : 1)
})

export const METRIC_COARSE_ROWS = METRIC_ALL_ROWS.filter((r) => r.subSeries === 'coarse')
export const METRIC_FINE_ROWS = METRIC_ALL_ROWS.filter((r) => r.subSeries === 'fine')

/** @deprecated */
export const METRIC_COARSE_SERIES = METRIC_COARSE_ROWS.map((r) => [r.nominal, r.pitch, r.priority])
export const METRIC_FINE_SERIES = METRIC_FINE_ROWS.map((r) => [r.nominal, r.pitch])
