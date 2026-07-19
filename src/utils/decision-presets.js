/**
 * 决策层预设 —— 每个工具的反算配置 / 敏感度参数 / 主要指标
 *
 * View 层通过 DECISION_PRESETS[toolId] 直接消费。
 */

import {
  bisect,
  gridSearch,
  STANDARD_SHAFT_DIAMETERS,
} from '@/utils/inverse-solver'
import {
  adaptBearing,
  adaptShaftTorsion,
  adaptBoltPreload,
  adaptKeyConnection,
  adaptBeam,
  adaptSpring,
  adaptFilletWeld,
  adaptBoltGroup,
  adaptSizeChain,
} from '@/utils/calc-adapters'
import { filterBearings } from '@/utils/bearing-catalog'

/** ---------------- Bearing ---------------- */
export const BEARING_PRESET = {
  toolId: 'bearing',
  primaryMetric: 'lifeHours',
  sensitivity: {
    parameters: [
      { key: 'radialLoad', label: '径向载荷 Fr', delta: 0.1, min: 0 },
      { key: 'axialLoad', label: '轴向载荷 Fa', delta: 0.1, min: 0 },
      { key: 'axialPreload', label: '轴向预紧 F₀', delta: 0.1, min: 0 },
      { key: 'rpm', label: '转速 n', delta: 0.1, min: 1 },
      { key: 'dynamicLoad', label: '动载荷 C', delta: 0.1, min: 100 },
      { key: 'operatingTemp', label: '工作温度', delta: 0.1, min: 20, max: 250 },
    ],
    metrics: ['lifeHours', 'equivalentLoad', 'staticSafety'],
  },
  inverse: [
    {
      id: 'min-dynamic-load',
      label: '反推所需 C（满足目标寿命）',
      variable: 'dynamicLoad',
      strategy: 'bisect',
      bounds: { lo: 500, hi: 500_000 },
      buildEvaluator: (baseInputs) => (x) => {
        const r = adaptBearing({ ...baseInputs, dynamicLoad: x })
        const life = r.outputs.lifeHours
        const target = baseInputs.targetHours ?? 10000
        return { pass: life >= target, metric: life }
      },
    },
    {
      id: 'pick-standard-model',
      label: '从标准型号中挑选（满足寿命 + 内径）',
      variable: 'bearingModel',
      strategy: 'catalog',
      buildCatalog: (baseInputs) => {
        const type = baseInputs.bearingType ?? null
        const minBore = baseInputs.shaftDiameter ?? baseInputs.minBore ?? 0
        return filterBearings({ minBore, type })
      },
      buildEvaluator: (baseInputs) => (bearing) => {
        const r = adaptBearing({
          ...baseInputs,
          dynamicLoad: bearing.C,
          staticLoad: bearing.C0,
          bearingType: bearing.type,
        })
        const target = baseInputs.targetHours ?? 10000
        const lifeOk = (r.outputs.lifeHours ?? 0) >= target
        const staticOk = r.outputs.staticSafetyFactor == null || r.outputs.staticPass !== false
        return {
          pass: lifeOk && staticOk,
          metric: r.outputs.lifeHours,
          extra: {
            model: bearing.model,
            bore: bearing.bore,
            C: bearing.C,
            C0: bearing.C0,
            lifeHours: r.outputs.lifeHours,
          },
        }
      },
    },
  ],
}

/** ---------------- Shaft torsion ---------------- */
export const SHAFT_PRESET = {
  toolId: 'shaft',
  primaryMetric: 'shearStress',
  sensitivity: {
    parameters: [
      { key: 'diameter', label: '直径 d', delta: 0.1, min: 5 },
      { key: 'torque', label: '扭矩 T', delta: 0.1, min: 0.1 },
      { key: 'yieldStrength', label: '屈服强度', delta: 0.1, min: 100 },
    ],
    metrics: ['shearStress', 'minDiameter', 'twistAngle'],
  },
  inverse: [
    {
      id: 'min-diameter-standard',
      label: '反推最小标准直径',
      variable: 'diameter',
      strategy: 'grid',
      values: STANDARD_SHAFT_DIAMETERS,
      buildEvaluator: (baseInputs) => (d) => {
        const r = adaptShaftTorsion({ ...baseInputs, diameter: d })
        return { pass: r.pass, metric: r.outputs.shearStress }
      },
    },
    {
      id: 'min-diameter-continuous',
      label: '反推最小直径（连续）',
      variable: 'diameter',
      strategy: 'bisect',
      bounds: { lo: 5, hi: 300 },
      buildEvaluator: (baseInputs) => (d) => {
        const r = adaptShaftTorsion({ ...baseInputs, diameter: d })
        return { pass: r.pass, metric: r.outputs.shearStress }
      },
    },
  ],
}

/** ---------------- Bolt preload ---------------- */
export const BOLT_PRELOAD_PRESET = {
  toolId: 'bolt-preload',
  primaryMetric: 'preloadResidual',
  sensitivity: {
    parameters: [
      { key: 'diameter', label: '公称直径 d', delta: 0.1, min: 3 },
      { key: 'muG', label: '螺纹摩擦 μG', delta: 0.2, min: 0.05, max: 0.4 },
      { key: 'muK', label: '头部摩擦 μK', delta: 0.2, min: 0.05, max: 0.4 },
      { key: 'preload', label: '预紧力 F', delta: 0.1, min: 0 },
      { key: 'externalAxialLoad', label: '外部轴向载荷 F_A', delta: 0.2, min: 0 },
    ],
    metrics: ['preloadResidual', 'stress'],
  },
  inverse: [
    {
      id: 'no-separation',
      label: '反推所需预紧力（避免分离）',
      variable: 'preload',
      strategy: 'bisect',
      bounds: { lo: 100, hi: 60_000 },
      buildEvaluator: (baseInputs) => (F) => {
        const r = adaptBoltPreload({
          ...baseInputs,
          mode: 'force2torque',
          calcMode: 'professional',
          preload: F,
        })
        const jl = r.outputs.jointLoad
        const separationOk = !jl || jl.separationPass
        return { pass: separationOk, metric: F }
      },
    },
  ],
}

/** ---------------- Key ---------------- */
export const KEY_PRESET = {
  toolId: 'key',
  primaryMetric: 'shearStress',
  sensitivity: {
    parameters: [
      { key: 'torque', label: '扭矩 T', delta: 0.1, min: 0.1 },
      { key: 'shaftDiameter', label: '轴径 d', delta: 0.1, min: 5 },
      { key: 'keyWidth', label: '键宽 b', delta: 0.1, min: 2 },
      { key: 'keyLength', label: '键长 L', delta: 0.1, min: 5 },
      { key: 'hubLength', label: '轮毂长 L_h', delta: 0.1, min: 5 },
    ],
    metrics: ['shearStress', 'crushStress', 'tangentialForce'],
  },
  inverse: [
    {
      id: 'min-key-length',
      label: '反推最小键长（剪切+挤压同时满足）',
      variable: 'keyLength',
      strategy: 'bisect',
      bounds: { lo: 5, hi: 500 },
      buildEvaluator: (baseInputs) => (L) => {
        const r = adaptKeyConnection({ ...baseInputs, keyLength: L, hubLength: L })
        return {
          pass: (r.outputs.shearPass ?? false) && (r.outputs.crushPass ?? false),
          metric: r.outputs.shearStress,
        }
      },
    },
  ],
}

/** ---------------- Beam ---------------- */
export const BEAM_PRESET = {
  toolId: 'beam',
  primaryMetric: 'stress',
  sensitivity: {
    parameters: [
      { key: 'load', label: '载荷 P', delta: 0.1, min: 1 },
      { key: 'spanLength', label: '跨度 L', delta: 0.1, min: 10 },
      { key: 'diameter', label: '直径 d', delta: 0.1, min: 5 },
      { key: 'height', label: '高度 h', delta: 0.1, min: 5 },
      { key: 'width', label: '宽度 b', delta: 0.1, min: 5 },
    ],
    metrics: ['stress', 'deflection', 'moment'],
  },
  inverse: [
    {
      id: 'min-diameter-round',
      label: '反推所需最小直径（实心圆截面）',
      variable: 'diameter',
      strategy: 'bisect',
      bounds: { lo: 5, hi: 500 },
      buildEvaluator: (baseInputs) => (d) => {
        const r = adaptBeam({ ...baseInputs, sectionType: 'solid_round', diameter: d })
        return { pass: r.outputs.pass, metric: r.outputs.stress }
      },
    },
    {
      id: 'max-span',
      label: '反推最大跨度（当前截面）',
      variable: 'spanLength',
      strategy: 'bisect',
      bounds: { lo: 50, hi: 5000 },
      options: { direction: 'descending' },
      buildEvaluator: (baseInputs) => (L) => {
        const r = adaptBeam({ ...baseInputs, spanLength: L })
        return { pass: r.outputs.pass, metric: r.outputs.stress }
      },
    },
  ],
}

/** ---------------- Spring ---------------- */
export const SPRING_PRESET = {
  toolId: 'spring',
  primaryMetric: 'shearStress',
  sensitivity: {
    parameters: [
      { key: 'wireDiameter', label: '线径 d', delta: 0.1, min: 0.2 },
      { key: 'meanDiameter', label: '中径 D', delta: 0.1, min: 3 },
      { key: 'activeCoils', label: '有效圈 n_a', delta: 0.1, min: 2 },
      { key: 'load', label: '载荷 P', delta: 0.1, min: 1 },
    ],
    metrics: ['shearStress', 'springRate', 'deflection'],
  },
  inverse: [
    {
      id: 'min-wire-diameter',
      label: '反推最小线径（满足许用应力）',
      variable: 'wireDiameter',
      strategy: 'bisect',
      bounds: { lo: 0.3, hi: 20 },
      buildEvaluator: (baseInputs) => (d) => {
        // 保持中径 D 不变，外径随线径几何更新：D₂ = D + d
        const next = { ...baseInputs, wireDiameter: d }
        if (next.meanDiameter != null && Number.isFinite(next.meanDiameter)) {
          next.outerDiameter = next.meanDiameter + d
        }
        const r = adaptSpring(next)
        return {
          pass: r.outputs.shearPass ?? false,
          metric: r.outputs.tauWorking ?? r.outputs.shearStress,
        }
      },
    },
  ],
}

/** ---------------- Weld ---------------- */
export const WELD_PRESET = {
  toolId: 'weld',
  primaryMetric: 'shearStress',
  sensitivity: {
    parameters: [
      { key: 'force', label: '载荷 F', delta: 0.1, min: 100 },
      { key: 'legSize', label: '焊脚 h_f', delta: 0.1, min: 2 },
      { key: 'weldLength', label: '焊缝长 L', delta: 0.1, min: 10 },
      { key: 'eccentricity', label: '偏心 e', delta: 0.2, min: 0 },
    ],
    metrics: ['shearStress'],
  },
  inverse: [
    {
      id: 'min-leg-size',
      label: '反推最小焊脚（标准值）',
      variable: 'legSize',
      strategy: 'grid',
      values: [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20],
      buildEvaluator: (baseInputs) => (h) => {
        const r = adaptFilletWeld({ ...baseInputs, legSize: h })
        return {
          pass: r.outputs.shearPass ?? r.outputs.allPass ?? r.outputs.gb?.pass,
          metric: r.keyMetrics[0]?.value,
        }
      },
    },
    {
      id: 'min-weld-length',
      label: '反推最小焊缝长（当前焊脚）',
      variable: 'weldLength',
      strategy: 'bisect',
      bounds: { lo: 10, hi: 2000 },
      buildEvaluator: (baseInputs) => (L) => {
        const r = adaptFilletWeld({ ...baseInputs, weldLength: L })
        return {
          pass: r.outputs.shearPass ?? r.outputs.allPass ?? r.outputs.gb?.pass,
          metric: r.keyMetrics[0]?.value,
        }
      },
    },
  ],
}

/** ---------------- Bolt group ---------------- */
export const BOLT_GROUP_PRESET = {
  toolId: 'bolt-group',
  primaryMetric: 'maxBoltForce',
  sensitivity: {
    parameters: [
      { key: 'boltCount', label: '螺栓数 n', delta: 0.1, min: 2 },
      { key: 'boltCircleRadius', label: '分布圆 R', delta: 0.1, min: 10 },
      { key: 'shearX', label: 'Fx', delta: 0.1, min: 0 },
      { key: 'shearY', label: 'Fy', delta: 0.1, min: 0 },
      { key: 'moment', label: '弯矩 M', delta: 0.1, min: 0 },
      { key: 'clampForcePerBolt', label: '夹紧力/栓', delta: 0.1, min: 0 },
    ],
    metrics: ['maxBoltForce', 'slipCapacity'],
  },
  inverse: [
    {
      id: 'min-bolt-count',
      label: '反推最少螺栓数（满足许用）',
      variable: 'boltCount',
      strategy: 'grid',
      values: [4, 6, 8, 10, 12, 16, 20, 24],
      buildEvaluator: (baseInputs) => (n) => {
        const r = adaptBoltGroup({ ...baseInputs, calcMode: 'simple', boltCount: n })
        return { pass: r.outputs.forcePass ?? (r.outputs.maxBoltForce <= r.outputs.allowPerBolt), metric: r.outputs.maxBoltForce }
      },
    },
  ],
}

/** ---------------- Size chain editor ---------------- */
export const EDITOR_PRESET = {
  toolId: 'editor',
  primaryMetric: 'worstMargin',
  sensitivity: {
    parameters: [],
    metrics: ['worstMargin', 'totalTolerance'],
    /** 按组成环公差生成敏感度参数，并在 baseInputs 上挂 tol_i */
    buildParameters(baseInputs) {
      const rings = baseInputs?.componentRings ?? []
      return rings.map((r, i) => ({
        key: `tol_${i}`,
        label: `${r.name || `环${i + 1}`} 公差`,
        delta: 0.1,
        min: 0.001,
      }))
    },
    /** 把 tol_i 扰动写回 componentRings */
    remapInputs(inputs) {
      const rings = inputs.componentRings
      if (!Array.isArray(rings)) return inputs
      const next = rings.map((r, i) => {
        const tol = inputs[`tol_${i}`]
        if (tol == null || !Number.isFinite(tol)) return r
        return { ...r, tolerance: tol, es: tol / 2, ei: -tol / 2 }
      })
      return { ...inputs, componentRings: next }
    },
  },
  inverse: [
    {
      id: 'relax-critical-tolerance',
      label: '反推关键环最大公差（满足闭环）',
      variable: 'criticalTolerance',
      strategy: 'bisect',
      bounds: { lo: 0.001, hi: 1.5 },
      options: { direction: 'descending' },
      buildEvaluator: (baseInputs) => (tol) => {
        const idx = baseInputs.criticalRingIndex ?? 0
        const rings = baseInputs.componentRings.map((r, i) =>
          i === idx ? { ...r, tolerance: tol, es: tol / 2, ei: -tol / 2 } : r,
        )
        const r = adaptSizeChain({
          ...baseInputs,
          componentRings: rings,
        })
        return { pass: r.pass, metric: tol }
      },
    },
  ],
}

export const DECISION_PRESETS = {
  bearing: BEARING_PRESET,
  shaft: SHAFT_PRESET,
  'bolt-preload': BOLT_PRELOAD_PRESET,
  'bolt-group': BOLT_GROUP_PRESET,
  key: KEY_PRESET,
  beam: BEAM_PRESET,
  spring: SPRING_PRESET,
  weld: WELD_PRESET,
  editor: EDITOR_PRESET,
}

/** 通用求解入口（View 使用） */
export function runPresetInverse(preset, invId, baseInputs) {
  const inv = preset.inverse.find((i) => i.id === invId)
  if (!inv) return { error: 'preset_not_found' }

  if (inv.strategy === 'catalog') {
    return runCatalogInverse(inv, baseInputs)
  }

  const evaluate = inv.buildEvaluator(baseInputs)
  if (inv.strategy === 'grid') {
    return { ...gridSearch(evaluate, inv.values), variable: inv.variable, label: inv.label }
  }
  return { ...bisect(evaluate, inv.bounds.lo, inv.bounds.hi, inv.options), variable: inv.variable, label: inv.label }
}

/** Catalog 策略：遍历目录候选，返回首个 pass 作为推荐 + 全部候选 */
function runCatalogInverse(inv, baseInputs) {
  const catalog = inv.buildCatalog(baseInputs)
  const evaluate = inv.buildEvaluator(baseInputs)
  const rows = []
  let recommended = null
  for (const item of catalog) {
    const r = evaluate(item)
    const extra = r.extra ?? {}
    const row = { ...extra, pass: !!r.pass, metric: r.metric }
    rows.push(row)
    if (!recommended && r.pass) recommended = row
  }
  return {
    strategy: 'catalog',
    variable: inv.variable,
    label: inv.label,
    converged: !!recommended,
    solution: recommended?.model ?? null,
    solutionRow: recommended,
    candidates: rows,
    iterations: rows.length,
    reason: recommended ? null : 'no_catalog_item_passes',
  }
}
