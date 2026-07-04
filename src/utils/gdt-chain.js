import {
  calculateWorstCaseLimits,
  calculateRssLimits,
  calculateModifiedRssLimits,
  calcSignedNominalSum,
  worstCaseMethod,
  rssMethod,
  modifiedRssMethod,
  sigma6RssMethod,
} from './size-chain-math'
import { findAnalysisType } from '@/constants/analysis-types'

/** GD&T / 2D 计算模式 */
export const GDT_CALC_MODES = {
  parallelism: {
    id: 'parallelism',
    label: '平行度链',
    stack: 'form-linear',
    desc: '基准面与上表面 flatness + 厚度灵敏度叠加',
  },
  perpendicularity: {
    id: 'perpendicularity',
    label: '垂直度链',
    stack: 'form-linear',
    desc: '垂直度由相关面 flatness 与定位尺寸公差叠加',
  },
  'profile-2d': {
    id: 'profile-2d',
    label: '2D 轮廓度链',
    stack: 'form-linear',
    desc: '轮廓偏差沿法向叠加',
  },
  flatness: {
    id: 'flatness',
    label: '平面度链',
    stack: 'form-direct',
    desc: '多平面 flatness 直接叠加至封闭环',
  },
  position: {
    id: 'position',
    label: '位置度链',
    stack: '2d-position',
    desc: 'X/Y 方向偏差 RSS 合成位置度公差带',
  },
  coaxiality: {
    id: 'coaxiality',
    label: '同轴度链',
    stack: 'radial',
    desc: '径向误差 RSS 合成同轴度',
  },
  'profile-gdt': {
    id: 'profile-gdt',
    label: 'GD&T 轮廓度链',
    stack: 'form-linear',
    desc: '轮廓要素公差叠加',
  },
  runout: {
    id: 'runout',
    label: '跳动链',
    stack: 'radial',
    desc: '圆跳动/全跳动径向分量叠加',
  },
  straightness: {
    id: 'straightness',
    label: '直线度链',
    stack: 'form-direct',
    desc: '直线要素偏差沿长度方向叠加',
  },
  roundness: {
    id: 'roundness',
    label: '圆度链',
    stack: 'radial',
    desc: '圆截面径向误差 RSS 合成圆度',
  },
  'assembly-3d': { id: 'assembly-3d', label: '3D 装配链', stack: '1d-weighted', desc: '空间尺寸链，传递系数表示方向灵敏度' },
  'housing-assembly': { id: 'housing-assembly', label: '箱体装配链', stack: '1d-weighted', desc: '1D 叠加 + 传递系数' },
  'frame-assembly': { id: 'frame-assembly', label: '机架装配链', stack: '1d-weighted', desc: '1D 叠加 + 传递系数' },
  'stack-up-3d': { id: 'stack-up-3d', label: '空间叠加链', stack: '1d-weighted', desc: '1D 叠加 + 传递系数' },
}

export function getGdtCalcMode(typeId) {
  if (!typeId) return null
  return GDT_CALC_MODES[typeId] ?? null
}

export function isExtendedAnalysisType(typeId) {
  const type = findAnalysisType(typeId)
  return type ? ['2d', '3d', 'gdt'].includes(type.groupId) : false
}

function splitXY(rings) {
  const x = []
  const y = []
  const other = []
  for (const ring of rings) {
    const dir = ring.direction ?? 'right'
    if (dir === 'left' || dir === 'right') x.push(ring)
    else if (dir === 'up' || dir === 'down') y.push(ring)
    else other.push(ring)
  }
  return { x, y, other }
}

/** 2D 位置度：T_pos ≈ 2√(RSS_x² + RSS_y²) */
function calc2dPositionTolerance(rings, method, options) {
  const { x, y, other } = splitXY(rings)
  const allX = [...x, ...other]
  const tolX = aggregateTolerance(allX, method, options)
  const tolY = aggregateTolerance(y, method, options)
  if (method === 'worst') {
    return tolX + tolY
  }
  if (method === 'modified-rss') {
    return 2 * Math.sqrt(tolX ** 2 + tolY ** 2) * 0.5
  }
  if (method === 'sigma6-rss') {
    return 2 * Math.sqrt((tolX / 2) ** 2 + (tolY / 2) ** 2)
  }
  return 2 * Math.sqrt((tolX / 2) ** 2 + (tolY / 2) ** 2)
}

function aggregateTolerance(rings, method, options) {
  const mapped = rings.map((r) => ({ tolerance: r.tolerance * (r.factor ?? 1) }))
  if (method === 'worst') return worstCaseMethod(mapped)
  if (method === 'modified-rss') {
    return modifiedRssMethod(mapped, options.distribution ?? 'normal', options.skewness ?? 0)
  }
  if (method === 'sigma6-rss') {
    return sigma6RssMethod(rings, options.distribution ?? 'normal')
  }
  return rssMethod(mapped)
}

function buildLimitsFromTolerance(nominal, totalTolerance, closedRing) {
  const upper = nominal + totalTolerance / 2
  const lower = nominal - totalTolerance / 2
  const pass = lower >= closedRing.min && upper <= closedRing.max
  return { nominal, upper, lower, totalTolerance, pass, calcMode: 'gdt' }
}

/** 组成环尺寸公差（es−ei 或显式 sizeTolerance） */
export function sizeToleranceOfRing(ring) {
  if (!ring) return 0
  if (ring.sizeTolerance != null && Number.isFinite(Number(ring.sizeTolerance))) {
    return Math.abs(Number(ring.sizeTolerance))
  }
  if (
    ring.es != null &&
    ring.ei != null &&
    Number.isFinite(Number(ring.es)) &&
    Number.isFinite(Number(ring.ei))
  ) {
    return Math.abs(Number(ring.es) - Number(ring.ei))
  }
  return 0
}

/** 是否为尺寸要素（仅这些环参与 MMC/LMC 奖励） */
export function isFeatureOfSize(ring) {
  const kind = ring?.featureKind
  return kind === 'hole' || kind === 'shaft' || kind === 'fos'
}

/**
 * 按 ASME Y14.5：最大可用奖励 = 尺寸公差全额
 * （要素从 MMC/LMC 偏离至另一极限尺寸时）
 */
export function calcAutoBonusTolerance(rings, options = {}) {
  const mod = options.toleranceModifier ?? 'RFS'
  if (mod === 'RFS') return { total: 0, items: [] }
  const items = []
  for (const r of rings ?? []) {
    if (!isFeatureOfSize(r)) continue
    const tSize = sizeToleranceOfRing(r)
    if (tSize <= 0) continue
    items.push({
      name: r.name ?? 'FOS',
      featureKind: r.featureKind,
      sizeTolerance: tSize,
      bonus: tSize,
    })
  }
  return {
    total: items.reduce((s, i) => s + i.bonus, 0),
    items,
  }
}

/**
 * 解析奖励公差：默认自动（FOS 环尺寸公差之和），无 FOS 时回退手动值
 * options.autoBonus === false 时强制使用 bonusTolerance
 */
export function resolveBonusTolerance(rings, options = {}) {
  const mod = options.toleranceModifier ?? 'RFS'
  if (mod === 'RFS') return { bonus: 0, source: 'none', items: [] }

  const manual = options.bonusTolerance
  const manualVal = manual != null && Number.isFinite(Number(manual)) ? Number(manual) : 0

  if (options.autoBonus === false) {
    return { bonus: manualVal, source: 'manual', items: [] }
  }

  const { total, items } = calcAutoBonusTolerance(rings, options)
  if (total > 0) return { bonus: total, source: 'auto', items }
  if (manualVal > 0) return { bonus: manualVal, source: 'manual', items: [] }
  return { bonus: 0, source: 'auto', items: [] }
}

/** GD&T 材料条件 modifier：MMC 全额奖励 / LMC 半额（保守简化） */
export function applyToleranceModifier(totalTolerance, options = {}) {
  const bonus = options.bonusTolerance ?? 0
  const mod = options.toleranceModifier ?? 'RFS'
  if (!bonus || mod === 'RFS') return totalTolerance
  if (mod === 'MMC') return totalTolerance + bonus
  if (mod === 'LMC') return totalTolerance + bonus * 0.5
  return totalTolerance
}

function withModifier(result, closedRing, options, rings = []) {
  const resolved = resolveBonusTolerance(rings, options)
  const adjusted = applyToleranceModifier(result.totalTolerance, {
    ...options,
    bonusTolerance: resolved.bonus,
  })
  if (adjusted === result.totalTolerance) {
    return {
      ...result,
      bonusApplied: 0,
      bonusSource: resolved.source,
      bonusBreakdown: resolved.items,
      toleranceModifier: options.toleranceModifier ?? 'RFS',
    }
  }
  const next = buildLimitsFromTolerance(result.nominal ?? 0, adjusted, closedRing)
  return {
    ...result,
    ...next,
    effectiveTolerance: adjusted,
    bonusApplied: adjusted - result.totalTolerance,
    bonusSource: resolved.source,
    bonusBreakdown: resolved.items,
    toleranceModifier: options.toleranceModifier ?? 'MMC',
  }
}

/** 仅公差叠加（form 类环，名义值为形位误差基准） */
function calcFormStackLimits(rings, closedRing, method, options) {
  const nominal = rings.reduce((s, r) => {
    const sign = r.type === 'increasing' ? 1 : -1
    return s + sign * (r.size ?? 0) * (r.factor ?? 1)
  }, 0)

  const mapped = rings.map((r) => ({ tolerance: r.tolerance * (r.factor ?? 1) }))
  let totalTolerance
  if (method === 'worst') totalTolerance = worstCaseMethod(mapped)
  else if (method === 'modified-rss') {
    totalTolerance = modifiedRssMethod(mapped, options.distribution ?? 'normal', options.skewness ?? 0)
  } else if (method === 'sigma6-rss') {
    totalTolerance = sigma6RssMethod(rings, options.distribution ?? 'normal')
  } else {
    totalTolerance = rssMethod(mapped)
  }

  return buildLimitsFromTolerance(nominal, totalTolerance, closedRing)
}

/** GD&T / 2D / 3D 专用尺寸链计算 */
export function calculateGdtChain(closedRing, componentRings, method = 'rss', options = {}) {
  const mode = options.mode ?? getGdtCalcMode(options.typeId)
  if (!mode) {
    return calculateRssLimits(componentRings)
  }

  switch (mode.stack) {
    case '2d-position': {
      const nominal = calcSignedNominalSum(componentRings)
      const totalTolerance = calc2dPositionTolerance(componentRings, method, options)
      return {
        ...buildLimitsFromTolerance(nominal, totalTolerance, closedRing),
        modeLabel: mode.label,
        formulaNote: 'T_{pos} \\approx 2\\sqrt{RSS_x^2 + RSS_y^2}',
      }
    }
    case 'radial': {
      const mapped = componentRings.map((r) => ({
        tolerance: r.tolerance * (r.factor ?? 1),
      }))
      const nominal = calcSignedNominalSum(componentRings)
      let totalTolerance
      if (method === 'worst') totalTolerance = worstCaseMethod(mapped)
      else if (method === 'modified-rss') {
        totalTolerance = modifiedRssMethod(mapped, options.distribution ?? 'normal', options.skewness ?? 0)
      } else if (method === 'sigma6-rss') {
        totalTolerance = sigma6RssMethod(componentRings, options.distribution ?? 'normal')
      } else {
        totalTolerance = rssMethod(mapped)
      }
      return {
        ...buildLimitsFromTolerance(nominal, totalTolerance, closedRing),
        modeLabel: mode.label,
        formulaNote: 'T_{rad} = \\sqrt{\\sum T_i^2}',
      }
    }
    case 'form-direct':
    case 'form-linear':
    case '1d-weighted':
    default: {
      if (method === 'worst') {
        const limits = calculateWorstCaseLimits(componentRings)
        return {
          ...limits,
          pass: limits.lower >= closedRing.min && limits.upper <= closedRing.max,
          modeLabel: mode.label,
        }
      }
      if (method === 'modified-rss') {
        const limits = calculateModifiedRssLimits(
          componentRings,
          options.distribution ?? 'normal',
          options.skewness ?? 0,
        )
        return {
          ...limits,
          pass: limits.lower >= closedRing.min && limits.upper <= closedRing.max,
          modeLabel: mode.label,
        }
      }
      if (method === 'sigma6-rss') {
        const base = calcFormStackLimits(componentRings, closedRing, method, options)
        return { ...base, modeLabel: mode.label, formulaNote: 'T = 6\\sqrt{\\sum (T_i/K)^2}' }
      }
      const limits = calculateRssLimits(componentRings)
      return {
        ...limits,
        pass: limits.lower >= closedRing.min && limits.upper <= closedRing.max,
        modeLabel: mode.label,
      }
    }
  }
}

/** 统一入口：自动选择 1D 或 GD&T 引擎 */
export function calculateChainResult(closedRing, componentRings, method, options = {}) {
  const typeId = options.typeId
  const mode = getGdtCalcMode(typeId)
  if (mode && isExtendedAnalysisType(typeId)) {
    const result = calculateGdtChain(closedRing, componentRings, method, { ...options, mode, typeId })
    return withModifier(result, closedRing, options, componentRings)
  }
  if (method === 'worst') {
    const limits = calculateWorstCaseLimits(componentRings)
    return { ...limits, pass: limits.lower >= closedRing.min && limits.upper <= closedRing.max }
  }
  if (method === 'modified-rss') {
    const limits = calculateModifiedRssLimits(
      componentRings,
      options.distribution ?? 'normal',
      options.skewness ?? 0,
    )
    return { ...limits, pass: limits.lower >= closedRing.min && limits.upper <= closedRing.max }
  }
  if (method === 'sigma6-rss') {
    const nominal = componentRings.reduce((sum, ring) => {
      const sign = ring.type === 'increasing' ? 1 : -1
      return sum + sign * ring.size * (ring.factor ?? 1)
    }, 0)
    const totalTolerance = sigma6RssMethod(componentRings, options.distribution ?? 'normal')
    return buildLimitsFromTolerance(nominal, totalTolerance, closedRing)
  }
  const limits = calculateRssLimits(componentRings)
  return { ...limits, pass: limits.lower >= closedRing.min && limits.upper <= closedRing.max }
}
