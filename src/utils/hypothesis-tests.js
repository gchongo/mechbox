function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function variance(values, sample = true) {
  const m = mean(values)
  const n = values.length
  const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / (sample ? n - 1 || 1 : n)
  return v
}

function stdDev(values, sample = true) {
  return Math.sqrt(variance(values, sample))
}

/** 标准正态 CDF 近似 */
function cdfNormal(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

/** 双尾 p 值（正态近似） */
function twoTailPFromZ(z) {
  return 2 * (1 - cdfNormal(Math.abs(z)))
}

export function parseNumberList(str) {
  return String(str)
    .split(/[,，\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
}

/** 单样本 t 检验：H0: μ = mu0 */
export function oneSampleTTest(values, mu0 = 0) {
  const n = values.length
  if (n < 2) return { errorKey: 'stat_min_points' }
  const m = mean(values)
  const s = stdDev(values)
  const t = s ? (m - mu0) / (s / Math.sqrt(n)) : 0
  const p = twoTailPFromZ(t)
  return {
    n,
    mean: m,
    std: s,
    tStatistic: t,
    pValue: p,
    significant: p < 0.05,
    conclusion: p < 0.05 ? '拒绝 H0（均值与假设值有显著差异）' : '不能拒绝 H0',
  }
}

/** 双样本 t 检验（等方差） */
export function twoSampleTTest(sample1, sample2) {
  if (sample1.length < 2 || sample2.length < 2) {
    return { errorKey: 'stat_group_min_points' }
  }
  const m1 = mean(sample1)
  const m2 = mean(sample2)
  const v1 = variance(sample1)
  const v2 = variance(sample2)
  const n1 = sample1.length
  const n2 = sample2.length
  const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2)
  const se = Math.sqrt(sp2 * (1 / n1 + 1 / n2))
  const t = se ? (m1 - m2) / se : 0
  const p = twoTailPFromZ(t)
  return {
    n1,
    n2,
    mean1: m1,
    mean2: m2,
    diff: m1 - m2,
    tStatistic: t,
    pValue: p,
    significant: p < 0.05,
    conclusion: p < 0.05 ? '拒绝 H0（两组均值有显著差异）' : '不能拒绝 H0',
  }
}

/** 卡方拟合优度检验 */
export function chiSquareTest(observed, expected) {
  if (observed.length !== expected.length || !observed.length) {
    return { errorKey: 'stat_chi2_length' }
  }
  let chi2 = 0
  for (let i = 0; i < observed.length; i++) {
    if (expected[i] <= 0) return { errorKey: 'stat_expected_positive' }
    chi2 += ((observed[i] - expected[i]) ** 2) / expected[i]
  }
  const df = observed.length - 1
  const z = Math.sqrt(2 * chi2) - Math.sqrt(2 * df - 1)
  const p = twoTailPFromZ(z)
  return {
    chi2,
    df,
    pValue: Math.min(1, p),
    significant: p < 0.05,
    conclusion: p < 0.05 ? '拒绝 H0（分布与期望不符）' : '不能拒绝 H0',
  }
}

/** Pearson 相关系数 */
export function pearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length < 2) {
    return { errorKey: 'stat_pair_length' }
  }
  const mx = mean(x)
  const my = mean(y)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < x.length; i++) {
    const a = x[i] - mx
    const b = y[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  const r = dx && dy ? num / Math.sqrt(dx * dy) : 0
  const t = r * Math.sqrt((x.length - 2) / (1 - r * r || 1))
  const p = twoTailPFromZ(t)
  return {
    r,
    pValue: p,
    significant: p < 0.05,
    conclusion:
      Math.abs(r) > 0.7
        ? '强相关'
        : Math.abs(r) > 0.4
          ? '中等相关'
          : Math.abs(r) > 0.2
            ? '弱相关'
            : '几乎无相关',
  }
}

/** 单因素 ANOVA */
export function oneWayAnova(groups) {
  const valid = groups.filter((g) => g.length >= 1)
  if (valid.length < 2) return { errorKey: 'stat_min_groups' }
  const all = valid.flat()
  const grandMean = mean(all)
  const k = valid.length
  const n = all.length

  let ssBetween = 0
  for (const g of valid) {
    ssBetween += g.length * (mean(g) - grandMean) ** 2
  }
  let ssWithin = 0
  for (const g of valid) {
    const m = mean(g)
    ssWithin += g.reduce((s, x) => s + (x - m) ** 2, 0)
  }

  const dfBetween = k - 1
  const dfWithin = n - k
  if (dfWithin <= 0) return { errorKey: 'stat_insufficient_df' }

  const msBetween = ssBetween / dfBetween
  const msWithin = ssWithin / dfWithin
  const f = msWithin ? msBetween / msWithin : 0
  const z = Math.sqrt(2 * f) - Math.sqrt(2 * dfBetween - 1)
  const p = twoTailPFromZ(z)

  return {
    fStatistic: f,
    dfBetween,
    dfWithin,
    pValue: Math.min(1, p),
    significant: p < 0.05,
    conclusion: p < 0.05 ? '拒绝 H0（组间均值有显著差异）' : '不能拒绝 H0',
  }
}
