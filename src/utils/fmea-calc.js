/**
 * FMEA 失效模式与影响分析
 */

export function calcRPN(severity, occurrence, detection) {
  const S = Math.min(Math.max(severity ?? 1, 1), 10)
  const O = Math.min(Math.max(occurrence ?? 1, 1), 10)
  const D = Math.min(Math.max(detection ?? 1, 1), 10)
  return S * O * D
}

export function analyzeFMEA(items) {
  if (!items?.length) return { errorKey: 'fmea_min_items' }

  const rows = items.map((item, i) => {
    const rpn = calcRPN(item.severity, item.occurrence, item.detection)
    const ap = calcActionPriority(item.severity, item.occurrence, item.detection)
    return {
      id: i + 1,
      ...item,
      rpn,
      actionPriority: ap,
    }
  })

  rows.sort((a, b) => b.rpn - a.rpn)
  const highRisk = rows.filter((r) => r.rpn >= 100)
  const maxRpn = rows[0]?.rpn ?? 0

  return {
    rows,
    count: rows.length,
    highRiskCount: highRisk.length,
    maxRpn,
    topRisk: rows[0] ?? null,
  }
}

/** AIAG-VDA 2019 行动优先级 AP (H/M/L) 简化 */
export function calcActionPriority(S, O, D) {
  if (S >= 9 && O >= 4) return 'H'
  if (S >= 7 && O >= 6) return 'H'
  if (S * O >= 40 && D >= 7) return 'H'
  if (S >= 5 && O >= 4 && D >= 5) return 'M'
  if (S * O >= 20) return 'M'
  return 'L'
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
