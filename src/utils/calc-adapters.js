/**
 * 工具专属 Adapter —— 将现有 analyze* 输出转为统一 CalcResult
 *
 * 每个 adapter：analyzeXxx(input) → CalcResult
 * 便于对比 / 反算 / 敏感度 / 报告消费。
 */

import { buildCalcResult } from '@/utils/calc-result'
import { analyzeBearingLife } from '@/utils/bearing-calc'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
import { analyzeBoltPreload } from '@/utils/bolt-preload-calc'
import { analyzeKeyConnection } from '@/utils/key-calc'
import { analyzeBeam } from '@/utils/beam-calc'
import { analyzeSpring } from '@/utils/spring-calc'
import { analyzeFilletWeld } from '@/utils/weld-calc'

/** ---------------- Bearing ---------------- */
export function adaptBearing(input) {
  const r = analyzeBearingLife(input)
  const targetHours = input.targetHours ?? 10000
  const utilization = targetHours > 0 && Number.isFinite(r.lifeHours) ? targetHours / r.lifeHours : null

  const keyMetrics = [
    metric('lifeHours', '寿命 L10h', r.lifeHours, 'h', {
      status: r.lifeHours >= targetHours ? 'pass' : 'fail',
      direction: 'higher-better',
      utilization,
    }),
    metric('equivalentLoad', '当量动载荷 P', r.equivalentLoad, 'N'),
    metric('l10MillionRev', 'L10 (百万转)', r.l10MillionRev, 'Mrev', { direction: 'higher-better' }),
  ]
  if (r.staticSafetyFactor != null && Number.isFinite(r.staticSafetyFactor)) {
    keyMetrics.push(
      metric('staticSafety', '静载安全 S0', r.staticSafetyFactor, '', {
        status: r.staticPass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.temperatureFactor != null && r.temperatureFactor !== 1) {
    keyMetrics.push(metric('a2', '温度系数 a₂', r.temperatureFactor, '', { direction: 'higher-better' }))
  }

  return buildCalcResult({
    toolId: 'bearing',
    toolLabel: '轴承寿命',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    warnings: r.speedWarningKey
      ? [{ key: r.speedWarningKey, level: 'warn', message: '转速超出限制' }]
      : [],
    standards: ['ISO 281:2007'],
    assumptions: buildBearingAssumptions(r),
    suggestions: buildBearingSuggestions(r, targetHours),
  })
}

function buildBearingAssumptions(r) {
  const list = []
  if (r.calcMode === 'simple') list.push('简化模式：忽略温度/污染修正，X/Y 需用户提供')
  if (r.calcMode !== 'professional') list.push('未启用完整 aISO 计算（污染/粘度）')
  if (r.a2 != null && r.a2 !== 1) list.push('温度系数按 ISO 281 简化查表')
  return list
}

function buildBearingSuggestions(r, targetHours) {
  const list = []
  if (!r.pass && r.lifeHours < targetHours) {
    const shortfall = ((targetHours - r.lifeHours) / targetHours) * 100
    list.push(`寿命不足 ${shortfall.toFixed(0)}%，建议：加大轴承规格 / 降低当量载荷 / 提高清洁度`)
  }
  if (r.staticSafetyFactor != null && !r.staticPass) {
    list.push('静载安全不足，检查峰值载荷或选用更大 C0')
  }
  return list
}

/** ---------------- Shaft torsion ---------------- */
export function adaptShaftTorsion(input) {
  const r = analyzeShaftTorsion(input)
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'shaft',
      toolLabel: '轴强度',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical', message: '输入不完整' }],
    })
  }

  const keyMetrics = [
    metric('shearStress', '扭转应力 τ', r.shearStress, 'MPa', {
      status: r.pass ? 'pass' : 'fail',
      utilization: r.utilization,
    }),
    metric('allowableShear', '许用切应力', r.allowableShear, 'MPa', { direction: 'higher-better' }),
    metric('minDiameter', '所需最小直径', r.minDiameter, 'mm'),
    metric('twistAngle', '扭转角 θ', r.twistAngle, '°'),
  ]
  if (r.fatigueLife != null) {
    keyMetrics.push(
      metric('fatigueLife', '疲劳寿命', r.fatigueLife, 'cyc', {
        status: r.fatiguePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }

  return buildCalcResult({
    toolId: 'shaft',
    toolLabel: '轴强度',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    standards: r.fatigueLife != null ? ['GB/T 3077', 'Basquin S-N'] : ['GB/T 3077'],
    assumptions:
      r.calcMode === 'simple'
        ? ['未考虑应力集中 Kt', '未含疲劳校核']
        : r.fatigueLife != null
          ? ['Marin 因子按用户输入 ka/kb 应用', '疲劳采用等效切应力经 √3 换算']
          : [],
    suggestions: buildShaftSuggestions(r, input),
  })
}

function buildShaftSuggestions(r, input) {
  const list = []
  if (!r.pass && r.minDiameter > input.diameter) {
    list.push(`当前直径 ${input.diameter} mm 不足，建议 ≥ ${r.minDiameter.toFixed(1)} mm`)
  }
  if (r.fatiguePass === false) {
    list.push('疲劳不通过：降低应力幅、改善表面质量或换用高强度材料（40Cr）')
  }
  return list
}

/** ---------------- Shaft combined ---------------- */
export function adaptShaftCombined(input) {
  const r = analyzeShaftCombined(input)
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'shaft-combined',
      toolLabel: '轴弯扭合成',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical' }],
    })
  }
  const util = r.allowableStress ? r.equivalentStress / r.allowableStress : null
  const keyMetrics = [
    metric('equivalentStress', '等效应力 σ_eq', r.equivalentStress, 'MPa', {
      status: r.pass ? 'pass' : 'fail',
      utilization: util,
    }),
    metric('allowableStress', '许用应力', r.allowableStress, 'MPa', { direction: 'higher-better' }),
    metric('bendingStress', '弯曲应力 σ', r.bendingStress, 'MPa'),
    metric('torsionStress', '切应力 τ', r.torsionStress, 'MPa'),
  ]
  if (r.fatigueLife != null) {
    keyMetrics.push(
      metric('fatigueLife', '疲劳寿命', r.fatigueLife, 'cyc', {
        status: r.fatiguePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  return buildCalcResult({
    toolId: 'shaft-combined',
    toolLabel: '轴弯扭合成',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    standards: ['GB/T 3077', r.strengthTheory === 'third' ? '第三强度理论' : '第四强度理论 (von Mises)'],
    assumptions: r.fatigueLife != null ? ['疲劳幅值 + 平均应力经 Goodman 修正'] : [],
  })
}

/** ---------------- Bolt preload ---------------- */
export function adaptBoltPreload(input) {
  const r = analyzeBoltPreload(input)
  const keyMetrics = [
    metric('preloadResidual', '残余预紧力 F_M', r.preloadResidual ?? r.preload, 'N', { direction: 'higher-better' }),
    metric('preloadTightening', '拧紧预紧力 F_V', r.preloadTightening ?? r.preload, 'N'),
    metric('torque', '拧紧扭矩 T', r.torque, 'N·m'),
    metric('stress', '拉应力 σ', r.stress, 'MPa', {
      status: r.pass ? 'pass' : 'fail',
      utilization: r.allowStress ? r.stress / r.allowStress : null,
    }),
  ]
  if (r.jointLoad?.externalAxialLoad > 0) {
    keyMetrics.push(
      metric('clampingForceRemaining', '残余夹紧力 F_KR', r.jointLoad.clampingForceRemaining, 'N', {
        status: r.jointLoad.separationPass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
      metric('maxBoltForce', '最大螺栓力 F_S', r.jointLoad.maxBoltForce, 'N'),
    )
  }
  const suggestions = []
  if (r.jointLoad && !r.jointLoad.separationPass) {
    suggestions.push('接头分离风险：提高预紧力或减小外部轴向载荷')
  }
  if (r.stress > r.allowStress) {
    suggestions.push(`应力超许用 ${((r.stress / r.allowStress - 1) * 100).toFixed(0)}%，提升等级或增大规格`)
  }
  return buildCalcResult({
    toolId: 'bolt-preload',
    toolLabel: '螺栓预紧力',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    standards: input.calcMode === 'simple' ? [] : ['VDI 2230-1'],
    assumptions:
      input.calcMode === 'professional'
        ? ['接头刚度采用圆环简化，未含 VDI 圆锥体细化', '嵌入损失按 VDI 简化预设']
        : input.calcMode === 'vdi2230'
          ? ['扭矩系数按 VDI 2230 R0 简化']
          : ['简化 T = μ·d·F/1000，未含嵌入/热变化'],
    suggestions,
  })
}

/** ---------------- shared helper ---------------- */
function metric(key, label, value, unit, extra = {}) {
  return { key, label, value, unit, ...extra }
}

/** ---------------- Key connection ---------------- */
export function adaptKeyConnection(input) {
  const r = analyzeKeyConnection(input)
  const keyMetrics = [
    metric('tangentialForce', '切向力 Ft', r.tangentialForce, 'N'),
    metric('shearStress', '剪切应力 τ', r.shearStress, 'MPa', {
      status: (r.shearPass ?? r.pass) ? 'pass' : 'fail',
      utilization: r.shearUtilization,
    }),
    metric('crushStress', '挤压应力 σ_c', r.crushStress, 'MPa', {
      status: (r.crushPass ?? r.pass) ? 'pass' : 'fail',
      utilization: r.crushUtilization,
    }),
  ]
  if (r.recommendedLength) {
    keyMetrics.push(metric('recommendedLength', '推荐键长', r.recommendedLength, 'mm'))
  }
  if (r.fatigueLife != null) {
    keyMetrics.push(
      metric('fatigueLife', '疲劳寿命', r.fatigueLife, 'cyc', {
        status: r.fatiguePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  const suggestions = []
  if (!r.pass && r.recommendedLength && r.recommendedLength > (input.keyLength ?? 0)) {
    suggestions.push(`键长不足，建议 ≥ ${r.recommendedLength.toFixed(1)} mm`)
  }
  return buildCalcResult({
    toolId: 'key',
    toolLabel: '平键连接',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    standards: ['GB/T 1096'],
    assumptions:
      r.calcMode === 'simple'
        ? ['忽略偏载 / 冲击系数', '许用应力按经验取值']
        : r.fatigueLife != null
          ? ['疲劳幅值按 τ 换算，S-N 曲线走 assessComponentFatigue']
          : [],
    suggestions,
  })
}

/** ---------------- Beam ---------------- */
export function adaptBeam(input) {
  const r = analyzeBeam(input)
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'beam',
      toolLabel: '梁挠度/强度',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical' }],
    })
  }
  const keyMetrics = [
    metric('stress', '弯曲应力 σ', r.stress, 'MPa', {
      status: r.stressPass ? 'pass' : 'fail',
      utilization: r.stressUtilization,
    }),
    metric('deflection', '最大挠度 f', r.deflection, 'mm', {
      status: r.deflectionPass ? 'pass' : 'fail',
      utilization: r.deflectionUtilization,
    }),
    metric('moment', '弯矩 M', r.moment, 'N·mm'),
    metric('sectionModulus', '截面模量 W', r.sectionModulus, 'mm³', { direction: 'higher-better' }),
    metric('inertia', '截面惯性矩 I', r.inertia, 'mm⁴', { direction: 'higher-better' }),
  ]
  if (r.minSectionModulusStress) {
    keyMetrics.push(metric('minW', '所需最小 W', r.minSectionModulusStress, 'mm³'))
  }
  if (r.fatigueLife != null) {
    keyMetrics.push(
      metric('fatigueLife', '疲劳寿命', r.fatigueLife, 'cyc', {
        status: r.fatiguePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  return buildCalcResult({
    toolId: 'beam',
    toolLabel: '梁挠度/强度',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    standards: ['GB 50017（弹性梁）', '欧拉-伯努利梁理论'],
    warnings: r.slendernessWarning
      ? [{ key: 'slenderness', level: 'warn', message: `长径比 ${r.spanRatio?.toFixed(1)} > 40，需复核剪切/失稳` }]
      : [],
    assumptions:
      r.calcMode === 'simple'
        ? ['简化：忽略动载荷、应力集中']
        : r.fatigueLife != null
          ? ['疲劳采用 loadMin/loadMax 换算幅值 + 平均应力']
          : [],
    suggestions:
      !r.pass
        ? [
            !r.stressPass && `应力超许用，增大截面或改用高强度材料`,
            !r.deflectionPass && `挠度超限，加大截面或缩短跨度`,
          ].filter(Boolean)
        : [],
  })
}

/** ---------------- Spring (helical compression) ---------------- */
export function adaptSpring(input) {
  const r = analyzeSpring(input)
  const keyMetrics = [
    metric('shearStress', '剪切应力 τ', r.shearStress, 'MPa', {
      status: r.pass ? 'pass' : 'fail',
      utilization: r.allowableShear ? r.shearStress / r.allowableShear : null,
    }),
    metric('springRate', '刚度 k', r.springRate, 'N/mm'),
    metric('deflection', '压缩量 δ', r.deflection, 'mm'),
    metric('springIndex', '旋绕比 C', r.springIndex, ''),
    metric('wahlFactor', 'Wahl 系数 K', r.wahlFactor, ''),
  ]
  if (r.buckling) {
    keyMetrics.push(
      metric('slenderness', '长径比', r.buckling.slenderness, '', {
        status: r.buckling.bucklingPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.fatigueLife != null) {
    keyMetrics.push(
      metric('fatigueLife', '疲劳寿命', r.fatigueLife, 'cyc', {
        status: r.fatiguePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  const suggestions = []
  if (!r.pass && !r.indexPass) suggestions.push('旋绕比不在 [4, 16] 范围，调整线径/中径')
  if (r.buckling && !r.buckling.bucklingPass) suggestions.push('存在失稳风险：缩短自由高度或改端形')
  if (r.solidPass === false) suggestions.push('压缩量过大接近并圈：加长自由高度或减小载荷')
  return buildCalcResult({
    toolId: 'spring',
    toolLabel: '弹簧设计',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    standards: ['Wahl 应力修正', r.fatigueLife != null ? 'Goodman 平均应力修正' : null].filter(Boolean),
    assumptions:
      r.calcMode === 'simple'
        ? ['未校核旋绕比 / 失稳 / 并圈裕量']
        : r.fatigueLife != null
          ? ['疲劳采用 loadMin/loadMax 应力幅值 + 平均应力修正']
          : [],
    suggestions,
  })
}

/** ---------------- Fillet weld ---------------- */
export function adaptFilletWeld(input) {
  const r = analyzeFilletWeld(input)
  const shearStress = r.shearStress ?? r.gb?.shearStress ?? 0
  const allow = r.allow ?? r.gb?.allow ?? 0
  const pass = r.allPass ?? r.pass ?? r.gb?.pass ?? false
  const keyMetrics = [
    metric('shearStress', '剪切应力 τ', shearStress, 'MPa', {
      status: pass ? 'pass' : 'fail',
      utilization: allow ? shearStress / allow : null,
    }),
    metric('throat', '喉厚 a', r.throat ?? r.gb?.throat, 'mm'),
  ]
  if (r.combined) {
    keyMetrics.push(
      metric('equivalentStress', '合成应力 σ_eq', r.combined.equivalentStress, 'MPa', {
        status: r.combinedPass ? 'pass' : 'fail',
      }),
    )
  }
  const standards = []
  if (r.standards?.length) {
    for (const s of r.standards) standards.push(s.label ?? s.id)
  } else {
    standards.push('GB 50017（角焊缝）')
  }
  return buildCalcResult({
    toolId: 'weld',
    toolLabel: '焊缝强度',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass,
    standards,
    assumptions: r.calcMode === 'simple' ? ['仅 GB 简化剪切，未含合成应力'] : [],
    suggestions:
      !pass
        ? [`剪切应力超限 ${(((shearStress || 0) / (allow || 1) - 1) * 100).toFixed(0)}%，加大焊脚或延长焊缝`]
        : [],
  })
}

/** 工具 id → adapter 映射（用于通用调用） */
export const CALC_ADAPTERS = {
  bearing: adaptBearing,
  shaft: adaptShaftTorsion,
  'shaft-combined': adaptShaftCombined,
  'bolt-preload': adaptBoltPreload,
  key: adaptKeyConnection,
  beam: adaptBeam,
  spring: adaptSpring,
  weld: adaptFilletWeld,
}
