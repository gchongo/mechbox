/** ISO 724 / ISO 261 公制螺纹 — 由标准系列定义生成 */

import { METRIC_DEFINITIONS } from './metric-definitions'
import { calcMetricBasicDims, stripNum } from './thread-dim'

export { calcMetricBasicDims } from './thread-dim'

function buildCoarseRow(nominal, pitch, priority) {
  const dims = calcMetricBasicDims(nominal, pitch)
  return {
    id: `metric-coarse-${nominal}-${pitch}`,
    system: 'metric',
    subSeries: 'coarse',
    designation: `M${stripNum(nominal)}`,
    priority,
    standardRef: 'ISO 724 / ISO 68-1',
    unit: 'mm',
    nominal,
    ...dims,
    toleranceExternal: '6g',
    toleranceInternal: '6H',
    sealing: '—',
    taper: '—',
    compatibility: '—',
    usageKey: 'fastener',
  }
}

function buildFineRow(nominal, pitch) {
  const dims = calcMetricBasicDims(nominal, pitch)
  return {
    id: `metric-fine-${nominal}-${pitch}`,
    system: 'metric',
    subSeries: 'fine',
    designation: `M${stripNum(nominal)}×${stripNum(pitch)}`,
    priority: 1,
    standardRef: 'ISO 724 / ISO 261',
    unit: 'mm',
    nominal,
    ...dims,
    toleranceExternal: '6g',
    toleranceInternal: '6H',
    sealing: '—',
    taper: '—',
    compatibility: '—',
    usageKey: 'fastener',
  }
}

export const METRIC_COARSE_ROWS = METRIC_DEFINITIONS.map(([nominal, pitch, priority]) =>
  buildCoarseRow(nominal, pitch, priority),
)

export const METRIC_FINE_ROWS = METRIC_DEFINITIONS.flatMap(([nominal, , , finePitches]) =>
  finePitches.map((pitch) => buildFineRow(nominal, pitch)),
)

/** @deprecated use METRIC_DEFINITIONS */
export const METRIC_COARSE_SERIES = METRIC_DEFINITIONS.map(([d, p, pri]) => [d, p, pri])
export const METRIC_FINE_SERIES = METRIC_FINE_ROWS.map((r) => [r.nominal, r.pitch])
