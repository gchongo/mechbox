import { getSettings } from './settings'

/** 按设置精度格式化数值 */
export function fmtNum(value, precision) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  const p = precision ?? getSettings().numberPrecision ?? 2
  return Number(value).toFixed(p)
}
