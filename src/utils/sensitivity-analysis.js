/**
 * 单参数敏感度分析（Tornado）
 *
 * 给定 evaluate(inputs) → { metrics: { key: number } }
 * 对指定参数各扰动 ±delta，量化对每个目标指标的影响。
 */

/**
 * @param {Object} config
 * @param {Object} config.baseInputs
 * @param {Array<{key:string, delta?:number, absoluteDelta?:number, min?:number, max?:number}>} config.parameters
 * @param {function(Object):Object} config.evaluate  返回 { metrics }
 * @param {string[]} config.metrics  需要追踪的指标 key
 * @param {number} [config.defaultDelta=0.1]  默认相对扰动 (±10%)
 */
export function runSensitivityAnalysis(config) {
  const {
    baseInputs,
    parameters,
    evaluate,
    metrics: targetMetrics,
    defaultDelta = 0.1,
  } = config

  const baseResult = evaluate(baseInputs)
  const baseMetrics = extractMetrics(baseResult, targetMetrics)

  const rows = []
  for (const param of parameters) {
    const baseValue = baseInputs[param.key]
    if (baseValue == null || !Number.isFinite(baseValue)) continue

    const delta = param.absoluteDelta ?? baseValue * (param.delta ?? defaultDelta)
    const rawLow = baseValue - Math.abs(delta)
    const rawHigh = baseValue + Math.abs(delta)
    const low = param.min != null ? Math.max(rawLow, param.min) : rawLow
    const high = param.max != null ? Math.min(rawHigh, param.max) : rawHigh

    const lowResult = evaluate({ ...baseInputs, [param.key]: low })
    const highResult = evaluate({ ...baseInputs, [param.key]: high })
    const lowMetrics = extractMetrics(lowResult, targetMetrics)
    const highMetrics = extractMetrics(highResult, targetMetrics)

    const effects = {}
    for (const m of targetMetrics) {
      const bv = baseMetrics[m]
      const lv = lowMetrics[m]
      const hv = highMetrics[m]
      const swing = safeSwing(bv, lv, hv)
      effects[m] = {
        base: bv,
        low: lv,
        high: hv,
        swingAbsolute: swing.absolute,
        swingPercent: swing.percent,
      }
    }

    rows.push({
      parameter: param.key,
      label: param.label ?? param.key,
      baseValue,
      low,
      high,
      deltaApplied: delta,
      effects,
    })
  }

  const rankings = {}
  for (const m of targetMetrics) {
    rankings[m] = rows
      .map((r) => ({ parameter: r.parameter, label: r.label, swingPercent: r.effects[m]?.swingPercent ?? 0 }))
      .filter((r) => Number.isFinite(r.swingPercent))
      .sort((a, b) => Math.abs(b.swingPercent) - Math.abs(a.swingPercent))
  }

  return {
    baseInputs,
    baseMetrics,
    rows,
    rankings,
  }
}

function extractMetrics(result, keys) {
  const src = result?.metrics ?? result ?? {}
  const out = {}
  for (const k of keys) {
    const v = src[k]
    out[k] = typeof v === 'number' && Number.isFinite(v) ? v : null
  }
  return out
}

function safeSwing(base, low, high) {
  if (base == null || !Number.isFinite(base)) return { absolute: null, percent: null }
  const values = [low, high].filter((v) => v != null && Number.isFinite(v))
  if (!values.length) return { absolute: null, percent: null }
  const absolute = Math.max(...values.map((v) => v - base)) - Math.min(...values.map((v) => v - base))
  const denom = Math.abs(base) < 1e-12 ? 1 : Math.abs(base)
  return { absolute, percent: (absolute / denom) * 100 }
}

/** 取前 N 项作为报告用敏感度 Top */
export function topSensitivities(analysis, metric, n = 3) {
  return (analysis.rankings?.[metric] ?? []).slice(0, n)
}
