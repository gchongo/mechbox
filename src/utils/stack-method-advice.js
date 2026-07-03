/**
 * 尺寸链极值法 vs RSS 法差异评估 — 辅助设计师选择保守策略
 */

import { calculateRssLimits, calculateWorstCaseLimits } from './size-chain-math'

/** 公差带宽比值过大时 RSS 可能过于乐观 */
export function assessStackMethodDivergence(worstTolerance, rssTolerance, { ratioThreshold = 1.5 } = {}) {
  if (!rssTolerance || rssTolerance <= 0) {
    return { level: 'none', ratio: null }
  }
  const ratio = worstTolerance / rssTolerance
  if (ratio >= 2) {
    return { level: 'warn', ratio, warningKey: 'stack_method_warn' }
  }
  if (ratio >= ratioThreshold) {
    return { level: 'caution', ratio, warningKey: 'stack_method_caution' }
  }
  return { level: 'none', ratio }
}

/** RSS 通过但极值未通过 — 安全关键场景须引起注意 */
export function assessPassMethodGap(worstPass, rssPass) {
  if (rssPass && !worstPass) {
    return { level: 'critical', warningKey: 'rss_pass_worst_fail' }
  }
  if (!rssPass && worstPass) {
    return { level: 'info', warningKey: 'worst_pass_rss_fail' }
  }
  return { level: 'none', warningKey: null }
}

export function combineStackAdvice(worstPass, rssPass, worstTolerance, rssTolerance) {
  const gap = assessPassMethodGap(worstPass, rssPass)
  const divergence = assessStackMethodDivergence(worstTolerance, rssTolerance)
  const level =
    gap.level === 'critical'
      ? 'critical'
      : divergence.level === 'warn'
        ? 'warn'
        : gap.level !== 'none'
          ? gap.level
          : divergence.level
  return {
    level,
    gap,
    divergence,
    warningKey: gap.warningKey ?? divergence.warningKey ?? null,
  }
}

/** 从组成环计算极值/RSS 判定与综合建议 */
export function evaluateStackFromRings(closedRing, componentRings) {
  const worst = calculateWorstCaseLimits(componentRings)
  const rss = calculateRssLimits(componentRings)
  const worstPass = worst.lower >= closedRing.min && worst.upper <= closedRing.max
  const rssPass = rss.lower >= closedRing.min && rss.upper <= closedRing.max
  return {
    worst,
    rss,
    worstPass,
    rssPass,
    advice: combineStackAdvice(worstPass, rssPass, worst.totalTolerance, rss.totalTolerance),
  }
}

/** Monte Carlo 合格率高但极值法未通过 */
export function assessMcWorstGap(worstPass, passRate, { passThreshold = 0.99 } = {}) {
  if (!worstPass && passRate >= passThreshold) {
    return { level: 'critical', warningKey: 'mc_pass_worst_fail' }
  }
  return { level: 'none', warningKey: null }
}
