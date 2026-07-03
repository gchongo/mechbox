/**
 * FMEA 失效模式与影响分析
 */

import { AP_RANK, lookupActionPriority } from './fmea-ap-table'

export function calcRPN(severity, occurrence, detection) {
  const S = Math.min(Math.max(severity ?? 1, 1), 10)
  const O = Math.min(Math.max(occurrence ?? 1, 1), 10)
  const D = Math.min(Math.max(detection ?? 1, 1), 10)
  return S * O * D
}

/** AIAG-VDA 2019 Action Priority (H/M/L) */
export function calcActionPriority(S, O, D) {
  return lookupActionPriority(S, O, D)
}

function compareFmeaRows(a, b) {
  const apDiff = (AP_RANK[b.actionPriority] ?? 0) - (AP_RANK[a.actionPriority] ?? 0)
  if (apDiff !== 0) return apDiff
  if (b.severity !== a.severity) return b.severity - a.severity
  if (b.rpn !== a.rpn) return b.rpn - a.rpn
  return a.id - b.id
}

export function analyzeFMEA(items) {
  if (!items?.length) return { errorKey: 'fmea_min_items' }

  const rows = items.map((item, i) => {
    const rpn = calcRPN(item.severity, item.occurrence, item.detection)
    const actionPriority = calcActionPriority(item.severity, item.occurrence, item.detection)
    return {
      id: i + 1,
      ...item,
      rpn,
      actionPriority,
    }
  })

  rows.sort(compareFmeaRows)
  const highAp = rows.filter((r) => r.actionPriority === 'H')
  const mediumAp = rows.filter((r) => r.actionPriority === 'M')
  const highRisk = rows.filter((r) => r.rpn >= 100)
  const maxRpn = rows.reduce((m, r) => Math.max(m, r.rpn), 0)

  return {
    rows,
    count: rows.length,
    highApCount: highAp.length,
    mediumApCount: mediumAp.length,
    highRiskCount: highRisk.length,
    maxRpn,
    topRisk: rows[0] ?? null,
  }
}

export function parseFMEATable(text) {
  return String(text)
    .trim()
    .split(/\n/)
    .map((line) => line.split(/[,，\t|]+/).map((s) => s.trim()))
    .filter((p) => p.length >= 4)
    .map(([component, mode, effect, cause, S, O, D, action]) => ({
      component: component ?? '',
      failureMode: mode ?? '',
      effect: effect ?? '',
      cause: cause ?? '',
      severity: Number(S) || 5,
      occurrence: Number(O) || 5,
      detection: Number(D) || 5,
      recommendedAction: action ?? '',
    }))
}
