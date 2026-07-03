/**
 * 反算求解器 —— 给定目标，反推输入
 *
 * 支持:
 *   - bisect(evaluate, lo, hi, options)      连续单变量二分
 *   - gridSearch(evaluate, values, options)  离散候选中选最小满足目标
 *   - solveInverse(config)                   通用入口
 *
 * evaluate(x) 应返回 { pass: boolean, metric?: number, extra?: object }
 * 或直接返回 boolean。
 */

const DEFAULT_TOLERANCE = 1e-4
const DEFAULT_MAX_ITER = 60

/**
 * 二分搜索满足目标的最小值（假设 monotonic：x 越大越易 pass）
 * 若 direction='descending' 则 x 越小越易 pass。
 */
export function bisect(evaluate, lo, hi, options = {}) {
  const {
    tolerance = DEFAULT_TOLERANCE,
    maxIter = DEFAULT_MAX_ITER,
    direction = 'ascending',
  } = options

  const passOf = (x) => {
    const r = evaluate(x)
    if (typeof r === 'boolean') return { pass: r }
    return { pass: !!r.pass, metric: r.metric, extra: r.extra ?? r }
  }

  const evalLo = passOf(lo)
  const evalHi = passOf(hi)

  if (direction === 'ascending') {
    if (evalLo.pass) return { solution: lo, iterations: 0, converged: true, evalAtSolution: evalLo }
    if (!evalHi.pass) {
      return { solution: null, iterations: 0, converged: false, reason: 'no_solution_in_range', evalAtHi: evalHi }
    }
  } else {
    if (evalHi.pass) return { solution: hi, iterations: 0, converged: true, evalAtSolution: evalHi }
    if (!evalLo.pass) {
      return { solution: null, iterations: 0, converged: false, reason: 'no_solution_in_range', evalAtLo: evalLo }
    }
  }

  let low = lo
  let high = hi
  let iter = 0
  let lastEval = null

  while (iter < maxIter && high - low > tolerance) {
    const mid = (low + high) / 2
    const midEval = passOf(mid)
    lastEval = midEval
    const midPass = midEval.pass

    if (direction === 'ascending') {
      if (midPass) high = mid
      else low = mid
    } else {
      if (midPass) low = mid
      else high = mid
    }
    iter += 1
  }

  const solution = direction === 'ascending' ? high : low
  return {
    solution,
    iterations: iter,
    converged: iter < maxIter,
    evalAtSolution: lastEval ?? passOf(solution),
  }
}

/** 在候选列表中找出第一个满足目标的值（列表应按“推荐优先”排序） */
export function gridSearch(evaluate, values, options = {}) {
  const {
    preferMin = true,
  } = options
  const sorted = preferMin ? [...values].sort((a, b) => a - b) : [...values]
  for (let i = 0; i < sorted.length; i++) {
    const x = sorted[i]
    const r = evaluate(x)
    const pass = typeof r === 'boolean' ? r : !!r.pass
    if (pass) {
      return {
        solution: x,
        iterations: i + 1,
        converged: true,
        evalAtSolution: typeof r === 'boolean' ? { pass } : r,
        candidates: sorted,
      }
    }
  }
  return {
    solution: null,
    iterations: sorted.length,
    converged: false,
    reason: 'no_candidate_passes',
    candidates: sorted,
  }
}

/**
 * 通用入口
 * @param {Object} config
 * @param {'bisect'|'grid'} config.strategy
 * @param {function(number):({pass:boolean,metric?:number}|boolean)} config.evaluate
 * @param {Object} [config.bounds]  { lo, hi }
 * @param {number[]} [config.values]
 * @param {Object} [config.options]
 */
export function solveInverse(config) {
  if (config.strategy === 'grid') {
    return gridSearch(config.evaluate, config.values ?? [], config.options)
  }
  const { lo, hi } = config.bounds ?? {}
  return bisect(config.evaluate, lo, hi, config.options)
}

/** 预设：常用尺寸/公差候选序列 */
export const STANDARD_SHAFT_DIAMETERS = [
  6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 160, 180, 200,
]

export const STANDARD_IT_GRADES = [4, 5, 6, 7, 8, 9, 10, 11, 12]
