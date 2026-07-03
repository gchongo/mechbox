/**
 * 精简轴承选型目录 —— 以常见公制系列的额定动/静载荷为基础
 *
 * 数据来自各制造商公开样本典型值（仅用于选型辅助，实际项目请以样本为准）。
 * 单位: N。
 */

export const BEARING_CATALOG = [
  // 深沟球 6000 (轻系列)
  { model: '6004', seriesId: 'deep-groove-light', bore: 20, C: 9370, C0: 4750, type: 'ball' },
  { model: '6005', seriesId: 'deep-groove-light', bore: 25, C: 11200, C0: 5850, type: 'ball' },
  { model: '6006', seriesId: 'deep-groove-light', bore: 30, C: 13300, C0: 8300, type: 'ball' },
  { model: '6008', seriesId: 'deep-groove-light', bore: 40, C: 17800, C0: 11000, type: 'ball' },
  { model: '6010', seriesId: 'deep-groove-light', bore: 50, C: 21600, C0: 15000, type: 'ball' },

  // 深沟球 6200 (中系列)
  { model: '6204', seriesId: 'deep-groove-medium', bore: 20, C: 12700, C0: 6550, type: 'ball' },
  { model: '6205', seriesId: 'deep-groove-medium', bore: 25, C: 14000, C0: 7800, type: 'ball' },
  { model: '6206', seriesId: 'deep-groove-medium', bore: 30, C: 19500, C0: 11300, type: 'ball' },
  { model: '6207', seriesId: 'deep-groove-medium', bore: 35, C: 25500, C0: 15300, type: 'ball' },
  { model: '6208', seriesId: 'deep-groove-medium', bore: 40, C: 32500, C0: 19000, type: 'ball' },
  { model: '6209', seriesId: 'deep-groove-medium', bore: 45, C: 35100, C0: 21200, type: 'ball' },
  { model: '6210', seriesId: 'deep-groove-medium', bore: 50, C: 37100, C0: 23200, type: 'ball' },
  { model: '6212', seriesId: 'deep-groove-medium', bore: 60, C: 55300, C0: 36000, type: 'ball' },

  // 深沟球 6300 (重系列)
  { model: '6304', seriesId: 'deep-groove-heavy', bore: 20, C: 15900, C0: 7800, type: 'ball' },
  { model: '6305', seriesId: 'deep-groove-heavy', bore: 25, C: 22500, C0: 11400, type: 'ball' },
  { model: '6306', seriesId: 'deep-groove-heavy', bore: 30, C: 29600, C0: 16000, type: 'ball' },
  { model: '6307', seriesId: 'deep-groove-heavy', bore: 35, C: 35100, C0: 19000, type: 'ball' },
  { model: '6308', seriesId: 'deep-groove-heavy', bore: 40, C: 42300, C0: 24000, type: 'ball' },
  { model: '6309', seriesId: 'deep-groove-heavy', bore: 45, C: 55300, C0: 31500, type: 'ball' },
  { model: '6310', seriesId: 'deep-groove-heavy', bore: 50, C: 65000, C0: 38000, type: 'ball' },
  { model: '6312', seriesId: 'deep-groove-heavy', bore: 60, C: 85200, C0: 52000, type: 'ball' },

  // 圆柱滚子 NU200
  { model: 'NU205', seriesId: 'cylindrical-nu', bore: 25, C: 28500, C0: 27000, type: 'roller' },
  { model: 'NU206', seriesId: 'cylindrical-nu', bore: 30, C: 44000, C0: 36500, type: 'roller' },
  { model: 'NU207', seriesId: 'cylindrical-nu', bore: 35, C: 56000, C0: 48000, type: 'roller' },
  { model: 'NU208', seriesId: 'cylindrical-nu', bore: 40, C: 63700, C0: 55000, type: 'roller' },
  { model: 'NU209', seriesId: 'cylindrical-nu', bore: 45, C: 76000, C0: 69500, type: 'roller' },
  { model: 'NU210', seriesId: 'cylindrical-nu', bore: 50, C: 83900, C0: 78000, type: 'roller' },

  // 圆锥滚子 (30200)
  { model: '30205', seriesId: 'tapered', bore: 25, C: 32400, C0: 37000, type: 'roller' },
  { model: '30206', seriesId: 'tapered', bore: 30, C: 43600, C0: 50000, type: 'roller' },
  { model: '30207', seriesId: 'tapered', bore: 35, C: 57200, C0: 65500, type: 'roller' },
  { model: '30208', seriesId: 'tapered', bore: 40, C: 63700, C0: 78000, type: 'roller' },
  { model: '30209', seriesId: 'tapered', bore: 45, C: 76000, C0: 96500, type: 'roller' },
  { model: '30210', seriesId: 'tapered', bore: 50, C: 87100, C0: 108000, type: 'roller' },
]

/** 按内径过滤（≥bore） */
export function filterByBore(minBore) {
  return BEARING_CATALOG.filter((b) => b.bore >= minBore)
}

/** 按类型过滤 (ball/roller) */
export function filterByType(type) {
  if (!type) return BEARING_CATALOG
  return BEARING_CATALOG.filter((b) => b.type === type)
}

/** 按内径 + 类型 联合过滤 */
export function filterBearings({ minBore = 0, type = null } = {}) {
  return BEARING_CATALOG.filter((b) => b.bore >= minBore && (!type || b.type === type))
}
