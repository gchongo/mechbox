/**
 * 统一计算结果快照 (CalcResult) —— 决策层通用数据结构
 *
 * 各工具（轴/轴承/螺栓/尺寸链…）通过 buildCalcResult 或工具专属 adapter
 * 输出统一 shape，供方案对比 / 反算 / 敏感度 / 增强报告消费。
 */

/**
 * @typedef {Object} KeyMetric
 * @property {string} key      内部键
 * @property {string} label    显示标签（i18n key 或已本地化文本）
 * @property {number|string} value
 * @property {string} [unit]
 * @property {'pass'|'fail'|'warn'|null} [status]
 * @property {number} [utilization]   0-1，用于进度条
 * @property {'higher-better'|'lower-better'} [direction]
 */

/**
 * @typedef {Object} CalcResult
 * @property {string} toolId
 * @property {string} toolLabel
 * @property {string} [calcMode]
 * @property {Object} inputs
 * @property {Object} outputs
 * @property {KeyMetric[]} keyMetrics
 * @property {boolean} pass
 * @property {Array<{key:string,level:'info'|'warn'|'critical',message?:string}>} warnings
 * @property {string[]} assumptions
 * @property {string[]} standards
 * @property {string[]} suggestions
 * @property {number} timestamp
 */

/** 构造统一结果 */
export function buildCalcResult({
  toolId,
  toolLabel,
  calcMode,
  inputs = {},
  outputs = {},
  keyMetrics = [],
  pass = true,
  warnings = [],
  assumptions = [],
  standards = [],
  suggestions = [],
} = {}) {
  return {
    toolId,
    toolLabel,
    calcMode,
    inputs: clone(inputs),
    outputs: clone(outputs),
    keyMetrics: keyMetrics.map(normalizeMetric),
    pass: !!pass,
    warnings: warnings.map((w) => ({ level: 'info', ...w })),
    assumptions: [...assumptions],
    standards: [...standards],
    suggestions: [...suggestions],
    timestamp: Date.now(),
  }
}

function clone(obj) {
  if (obj == null) return obj
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj)
    } catch {
      /* fall through */
    }
  }
  return JSON.parse(JSON.stringify(obj))
}

function normalizeMetric(m) {
  return {
    key: m.key,
    label: m.label ?? m.key,
    value: m.value,
    unit: m.unit ?? '',
    status: m.status ?? null,
    utilization: m.utilization ?? null,
    direction: m.direction ?? 'lower-better',
  }
}

/** 计算指标之间的差异百分比 (b 相对 a) */
export function diffPercent(a, b) {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return null
  if (a === 0) return b === 0 ? 0 : Infinity
  return ((b - a) / Math.abs(a)) * 100
}

/** 判定改进方向：direction=lower-better 且 b<a → improved */
export function isImprovement(direction, a, b) {
  if (a == null || b == null) return null
  if (direction === 'higher-better') return b > a
  return b < a
}

/** 从 KeyMetric 列表提取纯数值字典（用于报告 / 对比表） */
export function metricsToDict(metrics = []) {
  const out = {}
  for (const m of metrics) out[m.key] = m
  return out
}
