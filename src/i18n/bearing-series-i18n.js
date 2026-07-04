/** Bearing series display labels keyed by BEARING_SERIES id */

export const bearingSeriesLabelsZh = {
  'deep-groove-light': '深沟球轴承 (轻系列 6000)',
  'deep-groove-medium': '深沟球轴承 (中系列 6200)',
  'deep-groove-heavy': '深沟球轴承 (重系列 6300)',
  'angular-25': '角接触球轴承 (α=25°)',
  'angular-40': '角接触球轴承 (α=40°)',
  'self-aligning': '调心球轴承',
  'cylindrical-roller': '圆柱滚子轴承',
  'spherical-roller': '调心滚子轴承',
  'taper-roller': '圆锥滚子轴承',
  'thrust-ball': '推力球轴承',
}

export const bearingSeriesLabelsEn = {
  'deep-groove-light': 'Deep groove ball (light 6000 series)',
  'deep-groove-medium': 'Deep groove ball (medium 6200 series)',
  'deep-groove-heavy': 'Deep groove ball (heavy 6300 series)',
  'angular-25': 'Angular contact ball (α=25°)',
  'angular-40': 'Angular contact ball (α=40°)',
  'self-aligning': 'Self-aligning ball bearing',
  'cylindrical-roller': 'Cylindrical roller bearing',
  'spherical-roller': 'Spherical roller bearing',
  'taper-roller': 'Tapered roller bearing',
  'thrust-ball': 'Thrust ball bearing',
}

/** @param {string} seriesId @param {'zh'|'en'} locale @param {string} [fallback] */
export function localizedBearingSeriesLabel(seriesId, locale = 'zh', fallback = '') {
  const map = locale === 'en' ? bearingSeriesLabelsEn : bearingSeriesLabelsZh
  return map[seriesId] ?? fallback
}
