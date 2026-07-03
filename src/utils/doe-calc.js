/**
 * DOE 实验设计 — 正交表 L4 / L8 与主效应分析
 */

export const ORTHOGONAL_ARRAYS = {
  L4: {
    label: 'L4 (2³)',
    factors: 3,
    levels: 2,
    matrix: [
      [-1, -1, -1],
      [-1, 1, 1],
      [1, -1, 1],
      [1, 1, -1],
    ],
  },
  L8: {
    label: 'L8 (2⁷)',
    factors: 7,
    levels: 2,
    matrix: [
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, 1, 1, 1, 1],
      [-1, 1, 1, -1, -1, 1, 1],
      [-1, 1, 1, 1, 1, -1, -1],
      [1, -1, 1, -1, 1, -1, 1],
      [1, -1, 1, 1, -1, 1, -1],
      [1, 1, -1, -1, 1, 1, -1],
      [1, 1, -1, 1, -1, -1, 1],
    ],
  },
  L9: {
    label: 'L9 (3⁴)',
    factors: 4,
    levels: 3,
    matrix: [
      [0, 0, 0, 0],
      [0, 1, 1, 1],
      [0, 2, 2, 2],
      [1, 0, 1, 2],
      [1, 1, 2, 0],
      [1, 2, 0, 1],
      [2, 0, 2, 1],
      [2, 1, 0, 2],
      [2, 2, 1, 0],
    ],
  },
}

/**
 * 主效应分析
 * factors: [{ name, low, high }]  coded -1/+1 对应 low/high
 * responses: 与正交表行数一致的实测值数组
 */
export function analyzeMainEffects(arrayId, factors, responses) {
  const array = ORTHOGONAL_ARRAYS[arrayId]
  if (!array) return { errorKey: 'doe_unknown_array' }
  if (responses.length !== array.matrix.length) {
    return {
      errorKey: 'doe_response_count',
      errorParams: { count: array.matrix.length, arrayId },
    }
  }
  if (factors.length > array.factors) {
    return { errorKey: 'doe_max_factors', errorParams: { arrayId, max: array.factors } }
  }

  const effects = []
  for (let f = 0; f < factors.length; f++) {
    let sumHigh = 0
    let countHigh = 0
    let sumLow = 0
    let countLow = 0

    for (let r = 0; r < array.matrix.length; r++) {
      const level = array.matrix[r][f]
      if (array.levels === 2) {
        if (level === 1 || level === '1') {
          sumHigh += responses[r]
          countHigh++
        } else {
          sumLow += responses[r]
          countLow++
        }
      } else {
        // L9: 0,1,2 levels — average deviation from grand mean per level
      }
    }

    if (array.levels === 2) {
      const meanHigh = countHigh ? sumHigh / countHigh : 0
      const meanLow = countLow ? sumLow / countLow : 0
      effects.push({
        factor: factors[f].name ?? `因子${f + 1}`,
        lowLevel: factors[f].low,
        highLevel: factors[f].high,
        meanLow,
        meanHigh,
        effect: meanHigh - meanLow,
        absEffect: Math.abs(meanHigh - meanLow),
      })
    }
  }

  // L9 three-level simplified main effect
  if (array.levels === 3) {
    for (let f = 0; f < factors.length; f++) {
      const levelMeans = [0, 0, 0]
      const levelCounts = [0, 0, 0]
      for (let r = 0; r < array.matrix.length; r++) {
        const lv = array.matrix[r][f]
        levelMeans[lv] += responses[r]
        levelCounts[lv]++
      }
      for (let lv = 0; lv < 3; lv++) {
        if (levelCounts[lv]) levelMeans[lv] /= levelCounts[lv]
      }
      const effect = Math.max(...levelMeans) - Math.min(...levelMeans)
      effects.push({
        factor: factors[f].name ?? `因子${f + 1}`,
        levelMeans,
        effect,
        absEffect: effect,
      })
    }
  }

  effects.sort((a, b) => b.absEffect - a.absEffect)
  const grandMean = responses.reduce((a, b) => a + b, 0) / responses.length

  return {
    arrayId,
    arrayLabel: array.label,
    runCount: array.matrix.length,
    grandMean,
    effects,
    topFactor: effects[0]?.factor ?? null,
    responses,
  }
}

/** 解码正交表试验条件 */
export function decodeRuns(arrayId, factors) {
  const array = ORTHOGONAL_ARRAYS[arrayId]
  if (!array) return []

  return array.matrix.map((row, i) => {
    const run = { run: i + 1 }
    for (let f = 0; f < factors.length; f++) {
      const fac = factors[f]
      if (array.levels === 2) {
        run[fac.name ?? `F${f + 1}`] = row[f] === 1 ? fac.high : fac.low
      } else {
        const levels = fac.levels ?? [fac.low, fac.mid ?? (fac.low + fac.high) / 2, fac.high]
        run[fac.name ?? `F${f + 1}`] = levels[row[f]] ?? row[f]
      }
    }
    return run
  })
}

export function parseResponses(text) {
  return String(text)
    .split(/[,，\s\n]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
}
