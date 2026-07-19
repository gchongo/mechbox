/**
 * 材料选型辅助 — 多目标加权评分（无简化/完整/专业分档）
 */
import { MATERIALS, getAllowableAtTemp } from '@/constants/materials'

/** 成本指数（相对，越低越便宜） */
const COST_INDEX = {
  碳素钢: 1.0,
  低合金钢: 1.2,
  合金钢: 1.5,
  不锈钢: 2.2,
  铝合金: 2.0,
  铸铁: 0.8,
  铜合金: 2.5,
  钛合金: 8.0,
}

/** 可焊性 1–5 */
const WELDABILITY = {
  碳素钢: 4,
  低合金钢: 4,
  合金钢: 3,
  不锈钢: 3,
  铝合金: 2,
  铸铁: 1,
  铜合金: 3,
  钛合金: 2,
}

/** 可加工性 1–5 */
const MACHINABILITY = {
  碳素钢: 4,
  低合金钢: 3,
  合金钢: 3,
  不锈钢: 2,
  铝合金: 5,
  铸铁: 4,
  铜合金: 5,
  钛合金: 1,
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x))
}

function getMaterialProps(m) {
  return {
    costIndex: COST_INDEX[m.category] ?? 2,
    weldability: WELDABILITY[m.category] ?? 3,
    machinability: MACHINABILITY[m.category] ?? 3,
  }
}

/**
 * 对材料库评分
 * requirements: { minSigmaAllow, maxDensity, minWeldability, maxCostIndex, tempC }
 * weights: { strength, weight, cost, weldability, machinability } 总和自动归一化
 */
export function scoreMaterials(requirements = {}, weights = {}) {
  const w = {
    strength: weights.strength ?? 0.35,
    weight: weights.weight ?? 0.2,
    cost: weights.cost ?? 0.2,
    weldability: weights.weldability ?? 0.15,
    machinability: weights.machinability ?? 0.1,
  }
  const wSum = Object.values(w).reduce((a, b) => a + b, 0) || 1
  Object.keys(w).forEach((k) => {
    w[k] /= wSum
  })

  const tempC = requirements.tempC ?? 20
  const minSigma = requirements.minSigmaAllow ?? 0
  const maxDensity = requirements.maxDensity ?? Infinity
  const minWeld = requirements.minWeldability ?? 0
  const maxCost = requirements.maxCostIndex ?? Infinity

  const maxSigma = Math.max(...MATERIALS.map((m) => getAllowableAtTemp(m, tempC).sigmaAllow))
  const minDensity = Math.min(...MATERIALS.map((m) => m.density))
  const maxCostRef = Math.max(...Object.values(COST_INDEX))

  const scored = MATERIALS.map((m) => {
    const allow = getAllowableAtTemp(m, tempC)
    const props = getMaterialProps(m)

    const hardFilter =
      allow.sigmaAllow >= minSigma &&
      m.density <= maxDensity &&
      props.weldability >= minWeld &&
      props.costIndex <= maxCost

    const strengthScore = clamp01(allow.sigmaAllow / maxSigma)
    const weightScore = clamp01(minDensity / m.density)
    const costScore = clamp01(1 - props.costIndex / maxCostRef)
    const weldScore = clamp01(props.weldability / 5)
    const machScore = clamp01(props.machinability / 5)

    const total =
      w.strength * strengthScore +
      w.weight * weightScore +
      w.cost * costScore +
      w.weldability * weldScore +
      w.machinability * machScore

    return {
      id: m.id,
      name: m.name,
      category: m.category,
      sigmaAllow: allow.sigmaAllow,
      density: m.density,
      ...props,
      hardFilter,
      scores: {
        strength: strengthScore,
        weight: weightScore,
        cost: costScore,
        weldability: weldScore,
        machinability: machScore,
      },
      totalScore: hardFilter ? total * 100 : 0,
      rank: 0,
    }
  })

  const filtered = scored.filter((s) => s.hardFilter).sort((a, b) => b.totalScore - a.totalScore)
  filtered.forEach((s, i) => {
    s.rank = i + 1
  })

  const topPick = filtered[0] ?? null
  const bestStrength = [...filtered].sort((a, b) => b.sigmaAllow - a.sigmaAllow)[0] ?? null
  const bestWeight = [...filtered].sort((a, b) => a.density - b.density)[0] ?? null
  const bestCost = [...filtered].sort((a, b) => a.costIndex - b.costIndex)[0] ?? null

  return {
    recommendations: filtered,
    topPick,
    bestStrength,
    bestWeight,
    bestCost,
    tradeoffNoteKey: bestStrength?.id !== topPick?.id ? 'mismatch' : 'match',
    showScoreBreakdown: true,
    weights: w,
    requirements,
    filteredCount: filtered.length,
    totalCount: MATERIALS.length,
  }
}

export { COST_INDEX, WELDABILITY, MACHINABILITY }
