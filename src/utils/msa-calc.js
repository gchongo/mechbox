/**
 * 测量系统分析 — Gage R&R (极差法 / AIAG MSA 简化)
 */

const D2_STAR = {
  2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534,
  7: 2.704, 8: 2.847, 9: 2.97, 10: 3.078,
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function kFactor(n) {
  const d2 = D2_STAR[Math.min(Math.max(n, 2), 10)] ?? D2_STAR[5]
  return 1 / d2
}

/**
 * 解析三维测量数据 measurements[operatorIndex][partIndex][trialIndex]
 */
export function analyzeGageRR(measurements) {
  const nOp = measurements.length
  if (nOp < 2) return { error: '至少需要 2 名操作员' }

  const nParts = measurements[0]?.length ?? 0
  const nTrials = measurements[0]?.[0]?.length ?? 0
  if (nParts < 2 || nTrials < 2) return { error: '至少需要 2 个零件、2 次重复测量' }

  for (const op of measurements) {
    if (op.length !== nParts) return { error: '各操作员零件数须一致' }
    for (const part of op) {
      if (part.length !== nTrials) return { error: '各零件重复次数须一致' }
    }
  }

  const opMeans = []
  const ranges = []

  for (let o = 0; o < nOp; o++) {
    let opSum = 0
    let count = 0
    for (let p = 0; p < nParts; p++) {
      const vals = measurements[o][p]
      ranges.push(Math.max(...vals) - Math.min(...vals))
      const partMean = mean(vals)
      opSum += partMean
      count++
    }
    opMeans.push(opSum / count)
  }

  const partMeans = []
  for (let p = 0; p < nParts; p++) {
    const vals = []
    for (let o = 0; o < nOp; o++) {
      for (let t = 0; t < nTrials; t++) vals.push(measurements[o][p][t])
    }
    partMeans.push(mean(vals))
  }

  const rBar = mean(ranges)
  const xDiff = Math.max(...opMeans) - Math.min(...opMeans)
  const rp = Math.max(...partMeans) - Math.min(...partMeans)

  const K1 = kFactor(nTrials)
  const K2 = kFactor(nOp)
  const K3 = kFactor(nParts)

  const EV = rBar * K1
  const avTerm = (xDiff * K2) ** 2 - (EV ** 2) / (nParts * nTrials)
  const AV = avTerm > 0 ? Math.sqrt(avTerm) : 0
  const GRR = Math.sqrt(EV ** 2 + AV ** 2)
  const PV = rp * K3
  const TV = Math.sqrt(GRR ** 2 + PV ** 2)

  const pctGRR = TV > 0 ? (100 * GRR) / TV : 0
  const pctEV = TV > 0 ? (100 * EV) / TV : 0
  const pctAV = TV > 0 ? (100 * AV) / TV : 0
  const pctPV = TV > 0 ? (100 * PV) / TV : 0
  const ndc = GRR > 0 ? 1.41 * (PV / GRR) : Infinity

  let rating = '不可接受'
  if (pctGRR < 10) rating = '可接受'
  else if (pctGRR < 30) rating = '有条件接受'

  return {
    nOperators: nOp,
    nParts,
    nTrials,
    EV,
    AV,
    GRR,
    PV,
    TV,
    pctEV,
    pctAV,
    pctGRR,
    pctPV,
    ndc,
    rating,
    rBar,
    xDiff,
    rp,
    opMeans,
    partMeans,
  }
}

/** 从文本解析：每行 "操作员,零件,重复1,重复2,..." 或按块输入 */
export function parseGageRRFromRows(rows) {
  const byOp = new Map()
  for (const row of rows) {
    const [op, part, ...trials] = row
    if (!byOp.has(op)) byOp.set(op, new Map())
    const opMap = byOp.get(op)
    opMap.set(part, trials.map(Number))
  }
  const opKeys = [...byOp.keys()]
  const partKeys = [...byOp.values()[0].keys()]
  return opKeys.map((op) => partKeys.map((part) => byOp.get(op).get(part)))
}

export function parseGageRRText(text) {
  const lines = String(text)
    .trim()
    .split(/\n/)
    .map((l) => l.split(/[,，\t\s]+/).filter(Boolean))
    .filter((l) => l.length >= 4)

  if (!lines.length) return { error: '无有效数据行' }
  try {
    const measurements = parseGageRRFromRows(lines)
    return { measurements, result: analyzeGageRR(measurements) }
  } catch (e) {
    return { error: e.message || '数据格式错误' }
  }
}
