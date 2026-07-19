/**
 * 表面粗糙度 Ra ↔ ISO 公差等级 / 配合建议（速查表，非正式选型规范）
 */

/** Ra (μm) 上限建议对应的最细 IT 等级（约） */
export const RA_IT_TABLE = [
  { raMax: 0.2, itMin: 5, itMax: 6, process: '研磨 / 超精', fitHint: '精密配合、液压偶件' },
  { raMax: 0.4, itMin: 6, itMax: 7, process: '精磨', fitHint: '精密滚动轴承位、精密间隙' },
  { raMax: 0.8, itMin: 7, itMax: 8, process: '精车 / 磨', fitHint: '一般轴承位、H7/g6 量级' },
  { raMax: 1.6, itMin: 8, itMax: 9, process: '半精车', fitHint: '常用过渡/间隙配合' },
  { raMax: 3.2, itMin: 9, itMax: 11, process: '粗精车', fitHint: '一般装配、非关键配合' },
  { raMax: 6.3, itMin: 11, itMax: 12, process: '粗车', fitHint: '粗定位、焊接前' },
  { raMax: 12.5, itMin: 12, itMax: 14, process: '粗加工', fitHint: '非配合面' },
]

/** 常用配合代号 → 建议 Ra 上限 (μm) */
export const FIT_RA_TABLE = [
  { fit: 'H7/g6', raHole: 0.8, raShaft: 0.8, note: '常用间隙' },
  { fit: 'H7/h6', raHole: 0.8, raShaft: 0.8, note: '定位间隙' },
  { fit: 'H7/k6', raHole: 0.8, raShaft: 0.8, note: '过渡' },
  { fit: 'H7/n6', raHole: 0.8, raShaft: 0.4, note: '过盈偏轻' },
  { fit: 'H7/p6', raHole: 0.8, raShaft: 0.4, note: '过盈' },
  { fit: 'H8/f7', raHole: 1.6, raShaft: 1.6, note: '较松间隙' },
  { fit: 'H8/h7', raHole: 1.6, raShaft: 1.6, note: '一般定位' },
  { fit: 'H9/d9', raHole: 3.2, raShaft: 3.2, note: '粗间隙' },
]

/**
 * @param {number} ra μm
 */
export function lookupByRa(ra) {
  const v = Math.max(0, Number(ra) || 0)
  const row = RA_IT_TABLE.find((r) => v <= r.raMax) ?? RA_IT_TABLE[RA_IT_TABLE.length - 1]
  return { ...row, ra: v }
}

/**
 * @param {string} fit
 */
export function lookupByFit(fit) {
  const key = String(fit || '').trim()
  return FIT_RA_TABLE.find((r) => r.fit.toLowerCase() === key.toLowerCase()) ?? null
}

export function analyzeRoughnessFit({ ra, fit } = {}) {
  const byRa = lookupByRa(ra ?? 1.6)
  const byFit = lookupByFit(fit || 'H7/g6')
  return {
    byRa,
    byFit,
    tableRaIt: RA_IT_TABLE,
    tableFitRa: FIT_RA_TABLE,
    estimateOnly: true,
    pass: false,
  }
}
