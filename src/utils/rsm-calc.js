/**
 * 响应面法 (RSM) — 二因子中心复合设计 (CCD) 与二次模型拟合
 */

function gaussSolve(A, b) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null
    ;[M[col], M[pivot]] = [M[pivot], M[col]]

    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col]
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
    }
  }

  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n]
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j]
    x[i] /= M[i][i]
  }
  return x
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/** 二因子 CCD 编码试验点 (-1, 0, +1) */
export function generateCCD(factor1, factor2) {
  const { name: n1, low: l1, high: h1 } = factor1
  const { name: n2, low: l2, high: h2 } = factor2
  const c1 = (l1 + h1) / 2
  const c2 = (l2 + h2) / 2

  const coded = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1.414, 0],
    [1.414, 0],
    [0, -1.414],
    [0, 1.414],
    [0, 0],
    [0, 0],
    [0, 0],
  ]

  return coded.map((row, i) => {
    const x1 = c1 + (row[0] * (h1 - l1)) / 2
    const x2 = c2 + (row[1] * (h2 - l2)) / 2
    return {
      run: i + 1,
      codedX1: row[0],
      codedX2: row[1],
      [n1]: round(x1, 4),
      [n2]: round(x2, 4),
      x1: round(x1, 4),
      x2: round(x2, 4),
    }
  })
}

/** 拟合 y = b0 + b1·x1 + b2·x2 + b12·x1·x2 + b11·x1² + b22·x2² */
export function fitRSM(runs) {
  if (!runs?.length || runs.length < 6) {
    return { error: '至少需要 6 个试验点（含中心点）' }
  }

  const n = runs.length
  const y = runs.map((r) => r.y)
  if (y.some((v) => Number.isNaN(v))) return { error: '响应值须为有效数字' }

  const X = runs.map((r) => {
    const x1 = r.codedX1 ?? r.x1
    const x2 = r.codedX2 ?? r.x2
    return [1, x1, x2, x1 * x2, x1 ** 2, x2 ** 2]
  })

  const m = 6
  const XtX = Array.from({ length: m }, () => Array(m).fill(0))
  const Xty = Array(m).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      Xty[j] += X[i][j] * y[i]
      for (let k = 0; k < m; k++) XtX[j][k] += X[i][j] * X[i][k]
    }
  }

  const coeffs = gaussSolve(XtX, Xty)
  if (!coeffs) return { error: '设计矩阵奇异，无法拟合' }

  const [b0, b1, b2, b12, b11, b22] = coeffs
  const yPred = X.map((row) => row.reduce((s, v, j) => s + v * coeffs[j], 0))
  const my = mean(y)
  const ssRes = y.reduce((s, yi, i) => s + (yi - yPred[i]) ** 2, 0)
  const ssTot = y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0

  const predict = (x1, x2) => b0 + b1 * x1 + b2 * x2 + b12 * x1 * x2 + b11 * x1 ** 2 + b22 * x2 ** 2

  const optimum = findOptimum(predict, -1.414, 1.414, -1.414, 1.414)

  return {
    coeffs: { b0, b1, b2, b12, b11, b22 },
    r2: round(r2, 4),
    equation: formatRSMEquation(coeffs),
    predictions: yPred.map((v) => round(v, 4)),
    predict,
    optimum,
    residualSS: round(ssRes, 4),
  }
}

function findOptimum(predict, x1Min, x1Max, x2Min, x2Max, grid = 40) {
  let bestY = -Infinity
  let bestX1 = 0
  let bestX2 = 0
  let worstY = Infinity

  for (let i = 0; i <= grid; i++) {
    const x1 = x1Min + (i / grid) * (x1Max - x1Min)
    for (let j = 0; j <= grid; j++) {
      const x2 = x2Min + (j / grid) * (x2Max - x2Min)
      const y = predict(x1, x2)
      if (y > bestY) {
        bestY = y
        bestX1 = x1
        bestX2 = x2
      }
      if (y < worstY) worstY = y
    }
  }

  return {
    codedX1: round(bestX1, 3),
    codedX2: round(bestX2, 3),
    predictedY: round(bestY, 4),
    minPredictedY: round(worstY, 4),
  }
}

/** 生成等高线网格数据（编码空间） */
export function generateContourGrid(predict, x1Min = -1.414, x1Max = 1.414, x2Min = -1.414, x2Max = 1.414, size = 25) {
  const x1Vals = []
  const x2Vals = []
  const z = []
  for (let i = 0; i < size; i++) {
    x1Vals.push(round(x1Min + (i / (size - 1)) * (x1Max - x1Min), 3))
  }
  for (let j = 0; j < size; j++) {
    x2Vals.push(round(x2Min + (j / (size - 1)) * (x2Max - x2Min), 3))
  }
  for (let j = 0; j < size; j++) {
    const row = []
    for (let i = 0; i < size; i++) {
      row.push(round(predict(x1Vals[i], x2Vals[j]), 3))
    }
    z.push(row)
  }
  return { x1Vals, x2Vals, z }
}

function formatRSMEquation(coeffs) {
  const labels = ['β₀', 'β₁·x₁', 'β₂·x₂', 'β₁₂·x₁x₂', 'β₁₁·x₁²', 'β₂₂·x₂²']
  return coeffs
    .map((c, i) => {
      const sign = c >= 0 && i > 0 ? '+' : ''
      return `${sign}${c.toFixed(4)}${i === 0 ? '' : labels[i].slice(2)}`
    })
    .join(' ')
    .replace(/^\+/, '')
}

export function parseRSMResponses(text) {
  return String(text)
    .split(/[,，\s\n]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
}

export function analyzeRSM(factor1, factor2, responses) {
  const design = generateCCD(factor1, factor2)
  if (responses.length !== design.length) {
    return { error: `响应值须 ${design.length} 个（与 CCD 试验数一致）` }
  }

  const runs = design.map((d, i) => ({
    ...d,
    y: responses[i],
  }))

  const fit = fitRSM(runs)
  if (fit.error) return fit

  const contour = generateContourGrid(fit.predict)

  return {
    design,
    runs,
    fit,
    contour,
    factor1: factor1.name,
    factor2: factor2.name,
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}
