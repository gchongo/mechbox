/**
 * SPC 控制图 — X-R 图、P 图
 */

const SPC_CONSTANTS = {
  2: { A2: 1.88, D3: 0, D4: 3.267, d2: 1.128 },
  3: { A2: 1.023, D3: 0, D4: 2.574, d2: 1.693 },
  4: { A2: 0.729, D3: 0, D4: 2.282, d2: 2.059 },
  5: { A2: 0.577, D3: 0, D4: 2.114, d2: 2.326 },
  6: { A2: 0.483, D3: 0, D4: 2.004, d2: 2.534 },
  7: { A2: 0.419, D3: 0.076, D4: 1.924, d2: 2.704 },
  8: { A2: 0.373, D3: 0.136, D4: 1.864, d2: 2.847 },
  9: { A2: 0.337, D3: 0.184, D4: 1.816, d2: 2.97 },
  10: { A2: 0.308, D3: 0.223, D4: 1.777, d2: 3.078 },
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function parseSubgroups(text) {
  return String(text)
    .trim()
    .split(/\n/)
    .map((line) =>
      line
        .split(/[,，\s]+/)
        .filter(Boolean)
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    )
    .filter((g) => g.length > 0)
}

/** X-R 控制图 */
export function calcXRChart(subgroups) {
  if (!subgroups.length) return { error: '无子组数据' }

  const n = subgroups[0].length
  if (n < 2 || n > 10) return { error: '子组大小须为 2–10' }

  for (const g of subgroups) {
    if (g.length !== n) return { error: '各子组样本数须一致' }
  }

  const consts = SPC_CONSTANTS[n]
  const xBars = subgroups.map((g) => mean(g))
  const ranges = subgroups.map((g) => Math.max(...g) - Math.min(...g))

  const xBarBar = mean(xBars)
  const rBar = mean(ranges)

  const xUcl = xBarBar + consts.A2 * rBar
  const xLcl = xBarBar - consts.A2 * rBar
  const rUcl = consts.D4 * rBar
  const rLcl = consts.D3 * rBar

  const sigma = rBar / consts.d2

  return {
    subgroupSize: n,
    subgroupCount: subgroups.length,
    xBars,
    ranges,
    xBarBar,
    rBar,
    xUcl,
    xLcl,
    rUcl,
    rLcl,
    sigma,
    xOutOfControl: xBars.map((x, i) => x > xUcl || x < xLcl),
    rOutOfControl: ranges.map((r) => r > rUcl || r < rLcl),
  }
}

/** P 控制图（不合格率） */
export function calcPChart(defectCounts, sampleSizes) {
  if (defectCounts.length !== sampleSizes.length) {
    return { error: '缺陷数与样本量数组长度须一致' }
  }
  if (!defectCounts.length) return { error: '无数据' }

  const pValues = defectCounts.map((d, i) => d / sampleSizes[i])
  const totalDefects = defectCounts.reduce((a, b) => a + b, 0)
  const totalSamples = sampleSizes.reduce((a, b) => a + b, 0)
  const pBar = totalDefects / totalSamples

  const ucl = []
  const lcl = []
  for (let i = 0; i < pValues.length; i++) {
    const n = sampleSizes[i]
    const se = Math.sqrt((pBar * (1 - pBar)) / n)
    ucl.push(Math.min(1, pBar + 3 * se))
    lcl.push(Math.max(0, pBar - 3 * se))
  }

  return {
    pValues,
    pBar,
    ucl,
    lcl,
    sampleSizes,
    defectCounts,
    outOfControl: pValues.map((p, i) => p > ucl[i] || p < lcl[i]),
  }
}

/** 单值移动极差 MR 图（兼容原 X 图） */
export function calcIMRChart(values) {
  if (values.length < 2) return { error: '至少需要 2 个点' }
  const mr = values.slice(1).map((v, i) => Math.abs(v - values[i]))
  const xBar = mean(values)
  const mrBar = mean(mr)
  const d2 = 1.128
  const sigma = mrBar / d2
  return {
    values,
    mr,
    xBar,
    mrBar,
    ucl: xBar + 3 * sigma,
    lcl: xBar - 3 * sigma,
    mrUcl: 3.267 * mrBar,
    mrLcl: 0,
    sigma,
  }
}
