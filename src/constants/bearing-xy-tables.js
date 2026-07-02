/**
 * ISO 281 / SKF 风格 X、Y 系数查表
 * 参考：滚动轴承当量动载荷 P = X·Fr + Y·Fa
 */

export const BEARING_SERIES = {
  'deep-groove-light': {
    id: 'deep-groove-light',
    label: '深沟球轴承 (轻系列 6000)',
    type: 'ball',
    contactAngle: 0,
    e: 0.22,
    x1: 1,
    y1: 0,
    x2: 0.56,
    y2: 1.99,
    note: 'Fa/Fr ≤ e 时 X=1,Y=0；Fa/Fr > e 时 X=0.56,Y=1.99',
  },
  'deep-groove-medium': {
    id: 'deep-groove-medium',
    label: '深沟球轴承 (中系列 6200)',
    type: 'ball',
    contactAngle: 0,
    e: 0.23,
    x1: 1,
    y1: 0,
    x2: 0.56,
    y2: 1.99,
    note: 'Fa/Fr ≤ e 时 X=1,Y=0；Fa/Fr > e 时 X=0.56,Y=1.99',
  },
  'deep-groove-heavy': {
    id: 'deep-groove-heavy',
    label: '深沟球轴承 (重系列 6300)',
    type: 'ball',
    contactAngle: 0,
    e: 0.26,
    x1: 1,
    y1: 0,
    x2: 0.56,
    y2: 1.99,
    note: 'Fa/Fr ≤ e 时 X=1,Y=0；Fa/Fr > e 时 X=0.56,Y=1.99',
  },
  'angular-25': {
    id: 'angular-25',
    label: '角接触球轴承 (α=25°)',
    type: 'ball',
    contactAngle: 25,
    e: 0.68,
    x1: 1,
    y1: 0,
    x2: 0.41,
    y2: 0.87,
    note: '双列配对时 Y 值需修正，此处为单列参考',
  },
  'angular-40': {
    id: 'angular-40',
    label: '角接触球轴承 (α=40°)',
    type: 'ball',
    contactAngle: 40,
    e: 1.14,
    x1: 1,
    y1: 0,
    x2: 0.35,
    y2: 0.57,
    note: 'Fa/Fr > e 时 X=0.35,Y=0.57',
  },
  'self-aligning': {
    id: 'self-aligning',
    label: '调心球轴承',
    type: 'ball',
    contactAngle: 0,
    e: 0.3,
    x1: 1,
    y1: 0,
    x2: 0.65,
    y2: 3.5,
    note: 'Fa/Fr > e 时 X=0.65,Y=3.5',
  },
  'cylindrical-roller': {
    id: 'cylindrical-roller',
    label: '圆柱滚子轴承',
    type: 'roller',
    contactAngle: 0,
    e: 0.25,
    x1: 1,
    y1: 0,
    x2: 0.92,
    y2: 0,
    note: 'Fa/Fr > 0.25 时 X=0.92,Y=0（径向为主）',
  },
  'spherical-roller': {
    id: 'spherical-roller',
    label: '调心滚子轴承',
    type: 'roller',
    contactAngle: 0,
    e: 0.3,
    x1: 1,
    y1: 0,
    x2: 0.67,
    y2: 2.3,
    note: 'Fa/Fr > e 时 X=0.67,Y=2.3',
  },
  'taper-roller': {
    id: 'taper-roller',
    label: '圆锥滚子轴承',
    type: 'roller',
    contactAngle: 15,
    e: 0.35,
    x1: 1,
    y1: 0,
    x2: 0.4,
    y2: 1.5,
    note: 'Fa/Fr > e 时 X=0.4,Y=1.5',
  },
  'thrust-ball': {
    id: 'thrust-ball',
    label: '推力球轴承',
    type: 'ball',
    contactAngle: 90,
    e: 0,
    x1: 0,
    y1: 1,
    x2: 0,
    y2: 1,
    note: '仅承受轴向载荷：P = Fa',
    axialOnly: true,
  },
}

/** 常用轴承型号 → 系列映射（部分常用型号） */
export const BEARING_MODEL_MAP = {
  6200: 'deep-groove-medium',
  6201: 'deep-groove-medium',
  6202: 'deep-groove-medium',
  6203: 'deep-groove-medium',
  6204: 'deep-groove-medium',
  6205: 'deep-groove-medium',
  6206: 'deep-groove-medium',
  6207: 'deep-groove-medium',
  6208: 'deep-groove-medium',
  6305: 'deep-groove-heavy',
  6306: 'deep-groove-heavy',
  6307: 'deep-groove-heavy',
  6308: 'deep-groove-heavy',
  6000: 'deep-groove-light',
  6001: 'deep-groove-light',
  6002: 'deep-groove-light',
  7205: 'angular-25',
  7206: 'angular-25',
  7305: 'angular-40',
  NU205: 'cylindrical-roller',
  NU206: 'cylindrical-roller',
  22208: 'spherical-roller',
  30205: 'taper-roller',
  51105: 'thrust-ball',
}

/**
 * 查表获取 X、Y 系数
 * @param {object} params
 * @param {string} params.seriesId - 轴承系列 ID
 * @param {number} params.radialLoad - Fr (N)
 * @param {number} params.axialLoad - Fa (N)
 */
export function lookupBearingXY({ seriesId, radialLoad = 0, axialLoad = 0 }) {
  const series = BEARING_SERIES[seriesId] ?? BEARING_SERIES['deep-groove-medium']
  const Fr = Math.abs(radialLoad)
  const Fa = Math.abs(axialLoad)

  if (series.axialOnly) {
    return {
      x: 0,
      y: 1,
      e: 0,
      condition: 'Fa/Fr > e (推力轴承)',
      series: series.label,
      note: series.note,
      faOverFr: Fr > 0 ? Fa / Fr : Infinity,
      bearingType: series.type,
    }
  }

  const faOverFr = Fr > 0 ? Fa / Fr : Fa > 0 ? Infinity : 0
  const useAxialDominant = faOverFr > series.e

  return {
    x: useAxialDominant ? series.x2 : series.x1,
    y: useAxialDominant ? series.y2 : series.y1,
    e: series.e,
    condition: useAxialDominant ? `Fa/Fr = ${faOverFr.toFixed(3)} > e = ${series.e}` : `Fa/Fr = ${faOverFr.toFixed(3)} ≤ e = ${series.e}`,
    series: series.label,
    note: series.note,
    faOverFr,
    bearingType: series.type,
  }
}

export function resolveSeriesFromModel(model) {
  const key = String(model ?? '').trim().toUpperCase()
  if (BEARING_MODEL_MAP[key]) return BEARING_MODEL_MAP[key]
  if (key.startsWith('62')) return 'deep-groove-medium'
  if (key.startsWith('63')) return 'deep-groove-heavy'
  if (key.startsWith('60')) return 'deep-groove-light'
  if (key.startsWith('72')) return 'angular-25'
  if (key.startsWith('73')) return 'angular-40'
  if (key.startsWith('NU') || key.startsWith('NJ')) return 'cylindrical-roller'
  if (key.startsWith('22')) return 'spherical-roller'
  if (key.startsWith('30')) return 'taper-roller'
  return 'deep-groove-medium'
}

export function listBearingSeries() {
  return Object.values(BEARING_SERIES)
}
