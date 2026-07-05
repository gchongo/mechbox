/** ISO 724 / ISO 68-1 公制 60° 螺纹基本尺寸 (mm) */

const H_COEF = 0.866025404
const PITCH_DIA_COEF = 0.649519052846
const MINOR_COEF = 1.082531754877

/** @param {number} nominal mm @param {number} pitch mm */
export function calcMetricBasicDims(nominal, pitch) {
  return {
    major: round(nominal, 3),
    pitchDiameter: round(nominal - PITCH_DIA_COEF * pitch, 3),
    minor: round(nominal - MINOR_COEF * pitch, 3),
    pitch: round(pitch, 3),
    threadAngle: 60,
    tapDrill: round(nominal - MINOR_COEF * pitch, 2),
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}

/** ISO 724 粗牙优选系列: [公称直径, 螺距, 优先等级 1|2] */
export const METRIC_COARSE_SERIES = [
  [1, 0.25, 2],
  [1.2, 0.25, 2],
  [1.4, 0.3, 2],
  [1.6, 0.35, 2],
  [1.8, 0.35, 2],
  [2, 0.4, 2],
  [2.5, 0.45, 2],
  [3, 0.5, 1],
  [3.5, 0.6, 2],
  [4, 0.7, 1],
  [4.5, 0.75, 2],
  [5, 0.8, 1],
  [6, 1, 1],
  [7, 1, 2],
  [8, 1.25, 1],
  [10, 1.5, 1],
  [12, 1.75, 1],
  [14, 2, 1],
  [16, 2, 1],
  [18, 2.5, 1],
  [20, 2.5, 1],
  [22, 2.5, 2],
  [24, 3, 1],
  [27, 3, 2],
  [30, 3.5, 1],
  [33, 3.5, 2],
  [36, 4, 1],
  [39, 4, 2],
  [42, 4.5, 1],
  [45, 4.5, 2],
  [48, 5, 1],
]

/** [公称直径, 螺距] */
export const METRIC_FINE_SERIES = [
  [8, 1],
  [8, 0.75],
  [10, 1.25],
  [10, 1],
  [10, 0.75],
  [12, 1.5],
  [12, 1.25],
  [12, 1],
  [14, 1.5],
  [14, 1.25],
  [14, 1],
  [16, 1.5],
  [16, 1],
  [18, 2],
  [18, 1.5],
  [18, 1],
  [20, 2],
  [20, 1.5],
  [20, 1],
  [22, 2],
  [22, 1.5],
  [24, 2],
  [24, 1.5],
  [27, 2],
  [30, 2],
  [30, 1.5],
  [33, 2],
  [36, 2],
  [39, 2],
  [42, 2],
  [45, 2],
  [48, 2],
]

export function buildMetricRows(series, subSeries) {
  return series.map((entry) => {
    const [nominal, pitch, priority = 1] = entry.length === 3 ? entry : [entry[0], entry[1], 1]
    const dims = calcMetricBasicDims(nominal, pitch)
    const designation =
      subSeries === 'coarse' && Math.abs(pitch - defaultCoarsePitch(nominal)) < 1e-6
        ? `M${stripNum(nominal)}`
        : `M${stripNum(nominal)}×${stripNum(pitch)}`
    return {
      id: `metric-${subSeries}-${nominal}-${pitch}`,
      system: 'metric',
      subSeries,
      designation,
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
  })
}

function defaultCoarsePitch(d) {
  const row = METRIC_COARSE_SERIES.find((r) => r[0] === d)
  return row ? row[1] : null
}

function stripNum(n) {
  return Number.isInteger(n) ? String(n) : String(n).replace(/\.0$/, '')
}

export const METRIC_COARSE_ROWS = buildMetricRows(METRIC_COARSE_SERIES, 'coarse')
export const METRIC_FINE_ROWS = buildMetricRows(METRIC_FINE_SERIES, 'fine')
