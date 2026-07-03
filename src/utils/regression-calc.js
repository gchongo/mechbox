/**
 * 回归分析 — 最小二乘线性/多项式拟合
 */

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/** 简单线性回归 y = a + b·x */
export function linearRegression(x, y) {
  const n = x.length
  if (n < 2 || n !== y.length) return { errorKey: 'reg_xy_min_pairs' }

  const mx = mean(x)
  const my = mean(y)
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my)
    den += (x[i] - mx) ** 2
  }
  if (!den) return { errorKey: 'reg_x_no_variance' }

  const slope = num / den
  const intercept = my - slope * mx

  const yPred = x.map((xi) => intercept + slope * xi)
  const ssRes = y.reduce((s, yi, i) => s + (yi - yPred[i]) ** 2, 0)
  const ssTot = y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
  const r = Math.sqrt(Math.max(0, r2)) * (slope >= 0 ? 1 : -1)

  return {
    type: 'linear',
    intercept,
    slope,
    r2,
    r,
    equation: `y = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x`,
    predictions: yPred,
  }
}

/** 二次多项式 y = a + b·x + c·x² — 正规方程 */
export function polynomialRegression(x, y, degree = 2) {
  const n = x.length
  if (n < degree + 1 || n !== y.length) {
    return { errorKey: 'reg_poly_min_points', errorParams: { count: degree + 1 } }
  }

  const m = degree + 1
  const X = []
  for (let i = 0; i < n; i++) {
    const row = []
    for (let d = 0; d < m; d++) row.push(x[i] ** d)
    X.push(row)
  }

  // X'X 与 X'y
  const XtX = Array.from({ length: m }, () => Array(m).fill(0))
  const Xty = Array(m).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      Xty[j] += X[i][j] * y[i]
      for (let k = 0; k < m; k++) XtX[j][k] += X[i][j] * X[i][k]
    }
  }

  const coeffs = gaussSolve(XtX, Xty)
  if (!coeffs) return { errorKey: 'reg_singular_matrix' }

  const yPred = x.map((xi) => coeffs.reduce((s, c, d) => s + c * xi ** d, 0))
  const my = mean(y)
  const ssRes = y.reduce((s, yi, i) => s + (yi - yPred[i]) ** 2, 0)
  const ssTot = y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return {
    type: 'polynomial',
    degree,
    coeffs,
    r2,
    equation: formatPolyEquation(coeffs),
    predictions: yPred,
  }
}

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

function formatPolyEquation(coeffs) {
  return coeffs
    .map((c, i) => {
      if (i === 0) return c.toFixed(4)
      if (i === 1) return `${c >= 0 ? '+' : ''}${c.toFixed(4)}·x`
      return `${c >= 0 ? '+' : ''}${c.toFixed(4)}·x^${i}`
    })
    .join(' ')
    .replace(/^\+/, '')
}

export function parseXY(text) {
  return String(text)
    .trim()
    .split(/\n/)
    .map((line) => line.split(/[,，\t\s]+/).filter(Boolean))
    .filter((p) => p.length >= 2)
    .map(([a, b]) => ({ x: Number(a), y: Number(b) }))
    .filter((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y))
}

export function analyzeRegression(input) {
  const pairs = input.pairs ?? parseXY(input.text ?? '')
  const x = pairs.map((p) => p.x)
  const y = pairs.map((p) => p.y)

  if (input.type === 'polynomial') {
    return polynomialRegression(x, y, input.degree ?? 2)
  }
  return linearRegression(x, y)
}
