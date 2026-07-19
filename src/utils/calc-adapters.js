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
import { analyzeSpringByType } from '@/utils/spring-types-calc'
import { analyzeButtWeld, analyzeFilletWeld, analyzeHAZ, analyzeWeldFatigue } from '@/utils/weld-calc'
import { analyzeBoltGroup } from '@/utils/bolt-group-calc'
import { analyzeFit } from '@/utils/iso-286-calc'
import { analyzeGdtStack } from '@/utils/gdt-stack-calc'
import { calculateChainResult } from '@/utils/gdt-chain'
import { analyzeGear } from '@/utils/gear-calc'
import { analyzeGasketFlange } from '@/utils/gasket-flange-calc'
import { analyzeWormGear } from '@/utils/worm-gear-calc'
import { analyzeVibrationIsolation } from '@/utils/vibration-isolation-calc'
import { analyzeHeatTransfer } from '@/utils/heat-transfer-calc'
import { analyzeBevelGear } from '@/utils/bevel-gear-calc'

/** ---------------- Bearing ---------------- */
export function adaptBearing(input) {
  const r = analyzeBearingLife(input)
  if (r.errorKey === 'bearing_simple_xy_required') {
    return buildCalcResult({
      toolId: 'bearing',
      toolLabel: '轴承寿命',
      calcMode: r.calcMode,
      inputs: input,
      outputs: r,
      keyMetrics: [],
      pass: false,
      estimateOnly: true,
      warnings: [
        {
          key: r.errorKey,
          level: 'error',
          message: '简化模式存在轴向载荷但未提供 Y 系数，禁止输出寿命结论',
        },
      ],
      standards: ['ISO 281:2007'],
      assumptions: [
        '简化模式：存在 Fa 时必须显式输入 X/Y 或直接给定当量载荷 P',
        '默认 Y=0 会忽略轴向力，已阻断计算',
      ],
      suggestions: ['输入 Y 系数、选用 complete 模式查表，或直接输入当量动载荷 P'],
    })
  }
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
      metric('staticSafety', '静载安全 S₀', r.staticSafetyFactor, '', {
        status: r.staticPass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.equivalentStaticLoad != null && Number.isFinite(r.equivalentStaticLoad)) {
    keyMetrics.push(metric('equivalentStaticLoad', '静当量 P₀', r.equivalentStaticLoad, 'N'))
  }
  if (r.dn) {
    keyMetrics.push(
      metric('dn', 'dn 值', r.dn, '', {
        status: r.dnPass ? 'pass' : 'warn',
        direction: 'lower-better',
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
    estimateOnly: r.estimateOnly ?? false,
    unconfirmedCriticalInputs: r.unconfirmedCriticalInputs ?? [],
    warnings: [
      ...(r.releaseBlocked
        ? [{ key: 'critical_inputs_unconfirmed', level: 'critical', message: '关键输入未确认，禁止放行寿命结论' }]
        : []),
      ...(r.speedWarningKey
        ? [{ key: r.speedWarningKey, level: 'warn', message: '转速超出限制' }]
        : []),
      ...(r.dnWarningKey
        ? [{ key: r.dnWarningKey, level: 'warn', message: 'dn 超过脂润滑参考上限' }]
        : []),
    ],
    standards: ['ISO 281:2007', 'ISO 76'],
    assumptions: buildBearingAssumptions(r),
    suggestions: buildBearingSuggestions(r, targetHours),
  })
}

function buildBearingAssumptions(r) {
  const list = []
  if (r.calcMode === 'simple') list.push('简化模式：忽略温度/污染修正，X/Y 需用户提供')
  if (r.calcMode !== 'professional') list.push('未启用完整 aISO 计算（污染/粘度）')
  if (r.a2 != null && r.a2 !== 1) list.push('温度系数按 ISO 281 简化查表')
  if (r.mountingArrangement && r.mountingArrangement !== 'single') {
    list.push(`安装方式：${r.mountingLabel ?? r.mountingArrangement}`)
    if (r.mountingNote) list.push(r.mountingNote)
  }
  if (r.axialPreloadApplied > 0) {
    list.push(`轴向预紧 F₀=${r.axialPreloadApplied} N 计入有效轴向载荷`)
  }
  if (r.radialStiffness != null) {
    list.push(`径向刚度粗估 k_r≈${r.radialStiffness.toFixed(2)} N/μm（经验公式）`)
  }
  if (r.equivalentStaticLoad != null) {
    list.push('静载安全按 ISO 76：S₀ = C₀/P₀（球轴承 P₀=max(Fr, 0.6Fr+0.5Fa)）')
  }
  if (r.suggestedPreload != null) {
    list.push(`轴向预紧建议约 ${r.suggestedPreload} N（≈${((r.preloadFactor ?? 0) * 100).toFixed(1)}%·C）`)
  }
  return list
}

function buildBearingSuggestions(r, targetHours) {
  const list = []
  if (!r.pass && r.lifeHours < targetHours) {
    const shortfall = ((targetHours - r.lifeHours) / targetHours) * 100
    list.push(`寿命不足 ${shortfall.toFixed(0)}%，建议：加大轴承规格 / 降低当量载荷 / 提高清洁度`)
  }
  if (r.staticSafetyFactor != null && !r.staticPass) {
    list.push('静载安全不足，检查峰值载荷或选用更大 C₀')
  }
  if (r.dn && !r.dnPass) {
    list.push(`dn=${Math.round(r.dn)} 超过脂润滑参考 ${r.dnLimit}，考虑油润滑或更小内径/转速`)
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

  const torsionPass = r.torsionPass ?? r.pass
  const keyMetrics = [
    metric('shearStress', '扭转应力 τ', r.shearStress, 'MPa', {
      status: torsionPass ? 'pass' : 'fail',
      utilization: r.utilization,
    }),
    metric('allowableShear', '许用切应力', r.allowableShear, 'MPa', { direction: 'higher-better' }),
    metric('minDiameter', '所需最小直径', r.minDiameter, 'mm'),
    metric('twistAngle', '扭转角 θ', r.twistAngle, '°', {
      status: typeof r.anglePass === 'boolean' ? (r.anglePass ? 'pass' : 'fail') : null,
    }),
  ]
  if (r.peakShearStress != null) {
    keyMetrics.push(
      metric('peakShearStress', '峰值切应力 τ_peak', r.peakShearStress, 'MPa', {
        status: typeof r.peakPass === 'boolean' ? (r.peakPass ? 'pass' : 'fail') : null,
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
  if ((r.torsionPass ?? r.pass) === false && r.minDiameter > input.diameter) {
    list.push(`当前直径 ${input.diameter} mm 不足，建议 ≥ ${r.minDiameter.toFixed(1)} mm`)
  }
  if (r.anglePass === false) {
    list.push('扭转角超限：增大直径、缩短轴长或降低扭矩')
  }
  if (r.peakPass === false) {
    list.push('应力集中后峰值切应力超限：优化圆角/退刀槽并降低 Kτ')
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
  const combinedPass = r.combinedPass ?? r.pass
  const keyMetrics = [
    metric('equivalentStress', '等效应力 σ_eq', r.equivalentStress, 'MPa', {
      status: combinedPass ? 'pass' : 'fail',
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
  const stressOk = r.stressPass ?? r.stress <= r.allowStress
  const keyMetrics = [
    metric('preloadResidual', '残余预紧力 F_M', r.preloadResidual ?? r.preload, 'N', { direction: 'higher-better' }),
    metric('preloadTightening', '拧紧预紧力 F_V', r.preloadTightening ?? r.preload, 'N'),
    metric('torque', '拧紧扭矩 T', r.torque, 'N·m'),
    metric('stress', '拉应力 σ', r.stress, 'MPa', {
      status: stressOk ? 'pass' : 'fail',
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
    estimateOnly: r.estimateOnly ?? false,
    standards: input.calcMode === 'simple' ? [] : ['VDI 2230-1'],
    assumptions:
      input.calcMode === 'professional'
        ? ['接头刚度采用圆环简化，未含 VDI 圆锥体细化', '嵌入损失按 VDI 简化预设']
        : input.calcMode === 'vdi2230'
          ? ['扭矩系数按 VDI 2230 R0 简化']
          : ['简化 T = μ·d·F/1000，未含螺距/螺纹摩擦/嵌入；simple 模式不作正式放行'],
    suggestions,
  })
}

/** ---------------- shared helper ---------------- */
/** ---------------- Gear ---------------- */
export function adaptGear(input) {
  const r = analyzeGear(input)
  const keyMetrics = []
  if (r.safetyContact != null) {
    keyMetrics.push(
      metric('safetyContact', '接触安全 S_H', r.safetyContact, '', {
        status: r.contactPass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.safetyBending != null) {
    keyMetrics.push(
      metric('safetyBending', '弯曲安全 S_F', r.safetyBending, '', {
        status: r.bendingPass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.contactStress != null) {
    keyMetrics.push(
      metric('contactStress', '接触应力 σ_H', r.contactStress, 'MPa', {
        status: r.contactPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.bendingStress != null) {
    keyMetrics.push(
      metric('bendingStress', '弯曲应力 σ_F', r.bendingStress, 'MPa', {
        status: r.bendingPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.tangentialForce != null) {
    keyMetrics.push(metric('tangentialForce', '圆周力 F_t', r.tangentialForce, 'N'))
  }
  return buildCalcResult({
    toolId: 'gear',
    toolLabel: '齿轮强度',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? r.calcMode === 'simple',
    standards: r.calcMode === 'professional' ? ['ISO 6336', 'AGMA 2101'] : r.calcMode === 'simple' ? ['Lewis'] : ['ISO 6336'],
    assumptions: [
      r.calcMode === 'simple' ? '简化 Lewis 估算，不作正式放行' : 'ISO 6336 系数表简化实现',
    ],
    suggestions: !r.pass
      ? ['加大模数/齿宽，或选用更高强度材料，或降低扭矩']
      : [],
  })
}

/** ---------------- Gasket / flange seal ---------------- */
export function adaptGasketFlange(input) {
  const r = analyzeGasketFlange(input)
  const keyMetrics = [
    metric('seatingStress', '坐落比压 σ_seat', r.seatingStress, 'MPa', {
      status: r.seatingPass ? 'pass' : 'fail',
      direction: 'higher-better',
      utilization: r.seatingStressY > 0 ? r.seatingStressY / Math.max(r.seatingStress, 1e-6) : null,
    }),
    metric('operatingStress', '工况比压 σ_op', r.operatingStress, 'MPa', {
      status: r.operatingPass ? 'pass' : 'fail',
      direction: 'higher-better',
    }),
    metric('requiredPerBolt', '建议单栓预紧', r.requiredPerBolt, 'N', { direction: 'lower-better' }),
  ]
  const suggestions = []
  if (!r.seatingPass) suggestions.push('坐落比压不足：提高预紧力或减小垫片面积 / 换更软垫片（更低 y）')
  if (!r.operatingPass) suggestions.push('工况比压不足：提高预紧或增加螺栓数，或降低工作压力')
  return buildCalcResult({
    toolId: 'gasket-flange',
    toolLabel: '垫片法兰密封',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: ['ASME BPVC VIII App.2 (m,y 简化)', '机械设计手册·法兰密封'],
    assumptions: [
      '环形垫片面积 Ag=π/4(Do²−Di²)；内压卸荷 Ai=π/4 Di²',
      'm、y 取材料表默认值，正式设计按垫片厂家与法兰标准',
    ],
    suggestions,
  })
}

/** ---------------- Bevel gear ---------------- */
export function adaptBevelGear(input) {
  const r = analyzeBevelGear(input)
  const keyMetrics = [
    metric('ratio', '传动比 i', r.ratio, ''),
    metric('tangentialForce', '圆周力 F_t', r.tangentialForce, 'N'),
    metric('coneDistance', '外锥距 R', r.coneDistance, 'mm'),
  ]
  if (r.bendingStress != null) {
    keyMetrics.push(
      metric('bendingStress', '弯曲 σ_F', r.bendingStress, 'MPa', {
        status: r.bendingPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.contactStress != null) {
    keyMetrics.push(
      metric('contactStress', '接触 σ_H', r.contactStress, 'MPa', {
        status: r.contactPass ? 'pass' : 'fail',
      }),
    )
  }
  return buildCalcResult({
    toolId: 'bevel-gear',
    toolLabel: '锥齿轮',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: ['机械设计手册·锥齿轮（教材级，非 ISO 10300）'],
    assumptions: ['仅 Σ=90°；Lewis/接触为当量直齿粗估'],
    suggestions: r.pass ? [] : ['增大模数/齿宽或降低载荷，检查许用应力'],
  })
}

/** ---------------- Worm gear ---------------- */
export function adaptWormGear(input) {
  const r = analyzeWormGear(input)
  const keyMetrics = [
    metric('ratio', '传动比 i', r.ratio, ''),
    metric('efficiency', '效率 η', r.efficiency, '', { direction: 'higher-better' }),
    metric('torqueWheel', '蜗轮扭矩 T₂', r.torqueWheel, 'N·m'),
  ]
  if (r.bendingStress != null) {
    keyMetrics.push(
      metric('bendingStress', '弯曲 σ_F', r.bendingStress, 'MPa', {
        status: r.bendingPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.contactStress != null) {
    keyMetrics.push(
      metric('contactStress', '接触 σ_H', r.contactStress, 'MPa', {
        status: r.contactPass ? 'pass' : 'fail',
      }),
    )
  }
  return buildCalcResult({
    toolId: 'worm-gear',
    toolLabel: '蜗轮蜗杆',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: ['机械设计手册·蜗杆传动（教材级）'],
    assumptions: ['非 ISO 14521 全系数；η=tanγ/tan(γ+ρ)'],
    suggestions: r.pass ? [] : ['提高导程角 / 降低摩擦，或增大模数与齿宽'],
  })
}

/** ---------------- Vibration isolation ---------------- */
export function adaptVibrationIsolation(input) {
  const r = analyzeVibrationIsolation(input)
  const keyMetrics = [
    metric('naturalFreq', '固有频率 fn', r.naturalFreq, 'Hz'),
    metric('frequencyRatio', '频率比 r', r.frequencyRatio, ''),
    metric('transmissibility', '传递率 TR', r.transmissibility, '', {
      status: r.trPass ? 'pass' : r.calcMode === 'simple' ? 'warn' : 'fail',
      direction: 'lower-better',
    }),
    metric('isolationDb', '隔振量', r.isolationDb, 'dB', { direction: 'higher-better' }),
  ]
  return buildCalcResult({
    toolId: 'vibration-isolation',
    toolLabel: '隔振传递率',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: ['SDOF 力/位移传递率'],
    assumptions: ['单自由度；隔振区 r>√2'],
    suggestions: r.aboveIsolationRegion === false ? ['降低刚度或提高激励频率使 r>√2'] : [],
  })
}

/** ---------------- Heat transfer ---------------- */
export function adaptHeatTransfer(input) {
  const r = analyzeHeatTransfer(input)
  const keyMetrics = [
    metric('power', '传热量 Q', r.power, 'W', {
      status: r.capacityPass ? 'pass' : r.calcMode === 'simple' ? 'warn' : 'fail',
      direction: 'higher-better',
    }),
    metric('thermalResistance', '热阻 Rth', r.thermalResistance, 'K/W', {
      direction: 'lower-better',
    }),
    metric('heatFlux', '热流密度', r.heatFlux, 'W/m²'),
  ]
  if (r.equivDeltaT != null) {
    keyMetrics.push(
      metric('equivDeltaT', '等效温升', r.equivDeltaT, 'K', {
        status: r.tempPass ? 'pass' : 'fail',
        direction: 'lower-better',
      }),
    )
  }
  return buildCalcResult({
    toolId: 'heat-transfer',
    toolLabel: '简单换热',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: ['一维稳态导热/对流'],
    assumptions: ['忽略辐射与瞬态'],
    suggestions: r.pass ? [] : ['增大面积/h/k 或降低需散热负荷'],
  })
}

function metric(key, label, value, unit, extra = {}) {
  return { key, label, value, unit, ...extra }
}

/** ---------------- Key connection ---------------- */
export function adaptKeyConnection(input) {
  const r = analyzeKeyConnection(input)
  const simpleLocalPass = (r.shearPass ?? false) && (r.crushPass ?? false)
  const keyMetrics = [
    metric('tangentialForce', '切向力 Ft', r.tangentialForce, 'N'),
    metric('shearStress', '剪切应力 τ', r.shearStress, 'MPa', {
      status: (r.shearPass ?? simpleLocalPass ?? r.pass) ? 'pass' : 'fail',
      utilization: r.shearUtilization,
    }),
    metric('crushStress', '挤压应力 σ_c', r.crushStress, 'MPa', {
      status: (r.crushPass ?? simpleLocalPass ?? r.pass) ? 'pass' : 'fail',
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
    estimateOnly: r.estimateOnly ?? false,
    standards: ['GB/T 1096'],
    assumptions:
      r.calcMode === 'simple'
        ? ['忽略偏载 / 冲击系数', '轮毂长默认按键长等效，simple 模式不作正式放行', '许用应力按经验取值']
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
    estimateOnly: r.slendernessWarning,
    standards: ['GB 50017（弹性梁）', '欧拉-伯努利梁理论'],
    warnings: r.slendernessWarning
      ? [{ key: 'slenderness', level: 'warn', message: `长径比 ${r.spanRatio?.toFixed(1)} > 40，需复核剪切/失稳` }]
      : [],
    assumptions:
      [
        r.calcMode === 'simple' ? '简化：忽略动载荷、应力集中' : null,
        r.fatigueLife != null ? '疲劳采用 loadMin/loadMax 换算幅值 + 平均应力' : null,
        r.slendernessWarning ? '长细比偏大时当前结果仅供复核，需补做剪切变形/稳定性校核' : null,
      ].filter(Boolean),
    suggestions:
      [
        !r.stressPass ? `应力超许用，增大截面或改用高强度材料` : null,
        !r.deflectionPass ? `挠度超限，加大截面或缩短跨度` : null,
        r.slendernessWarning ? '长细比偏大：补做 Timoshenko 剪切变形或稳定性复核，不宜直接放行' : null,
      ].filter(Boolean),
  })
}

/** ---------------- Spring (helical compression / tension / torsion) ---------------- */
export function adaptSpring(input) {
  const r = analyzeSpringByType(input)
  const isTorsion = r.springType === 'torsion'
  const stressVal = r.tauWorking ?? r.shearStress ?? r.bendingStress
  const keyMetrics = [
    metric(
      isTorsion ? 'bendingStress' : 'shearStress',
      isTorsion ? '弯曲应力 σ' : '剪切应力 τ',
      stressVal,
      'MPa',
      {
        status: (r.shearPass ?? r.bendPass) ? 'pass' : 'fail',
        utilization: isTorsion
          ? r.allowableBending
            ? stressVal / r.allowableBending
            : null
          : r.allowableShear
            ? stressVal / r.allowableShear
            : null,
      },
    ),
    metric(
      isTorsion ? 'angularRate' : 'springRate',
      isTorsion ? '角刚度 kθ' : '刚度 k',
      isTorsion ? r.angularRate : r.springRate,
      isTorsion ? 'N·mm/rad' : 'N/mm',
    ),
    metric(
      'deflection',
      isTorsion ? '转角 θ' : '变形 δ',
      isTorsion ? r.angleDeg : r.deflection,
      isTorsion ? '°' : 'mm',
    ),
    metric('springIndex', '旋绕比 C', r.springIndex, ''),
  ]
  if (!isTorsion) {
    keyMetrics.push(metric('wahlFactor', 'Wahl 系数 K', r.wahlFactor, ''))
  }
  if (r.workingLoad != null) {
    keyMetrics.push(metric('workingLoad', '工作负荷 F₂', r.workingLoad, 'N'))
  }
  if (r.buckling) {
    keyMetrics.push(
      metric('slenderness', '长径比 b', r.buckling.slenderness, '', {
        status: r.buckling.bucklingPass ? 'pass' : 'fail',
      }),
    )
    if (r.buckling.criticalLoad != null) {
      keyMetrics.push(
        metric('criticalLoad', '临界载荷 Fc', r.buckling.criticalLoad, 'N', {
          status: r.buckling.bucklingPass ? 'pass' : 'fail',
          direction: 'higher-better',
          utilization:
            r.buckling.criticalLoad > 0 ? r.buckling.maxWorkingLoad / r.buckling.criticalLoad : null,
        }),
      )
    }
  }
  if (r.characteristic) {
    keyMetrics.push(
      metric('characteristic', '特性 f/fs', r.characteristic.ratio, '', {
        status: r.characteristicPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.naturalFrequency != null) {
    keyMetrics.push(metric('naturalFrequency', '自振频率 fe', r.naturalFrequency, 'Hz'))
  }
  if (r.resonance?.checked) {
    keyMetrics.push(
      metric('resonanceRatio', '共振比 fe/fr', r.resonance.ratio, '', {
        status: r.resonancePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.solidPass != null) {
    keyMetrics.push(
      metric('solidMargin', '压并余量（预留后）', r.remainingDeflectionMargin ?? 0, 'mm', {
        status: r.solidPass ? 'pass' : 'fail',
      }),
    )
  }
  if (r.fatigueSafetyFactor != null) {
    keyMetrics.push(
      metric('fatigueSafety', '疲劳安全系数 S', r.fatigueSafetyFactor, '', {
        status: r.fatiguePass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.fatigueLife != null) {
    keyMetrics.push(
      metric('fatigueLife', '估算疲劳分档 N', r.fatigueLife, 'cyc', {
        direction: 'higher-better',
      }),
    )
  }
  const suggestions = []
  if (!r.shearPass) {
    suggestions.push(
      r.usesHeightLoads
        ? '静强度不合格：τ₂>[τ]。当前按高度算 F₂=k·δ，补全材料/疲劳无效；优先抬高 H₂、增加有效圈数或加大中径。固定行程时盲目加粗线径会提高刚度与 F₂，未必降应力'
        : '静强度不合格：τ₂>[τ]。增大线径/中径或减小工作载荷 F（仅改完整/专业附加项无效）',
    )
  }
  if (!r.indexPass) suggestions.push('旋绕比 C < 4，调整线径/中径')
  else if (r.indexRecommend === false) suggestions.push('旋绕比 C > 16（建议范围），制造/稳定性风险')
  if (r.heightLoadBlocked) suggestions.push('高度顺序非法：需满足 H₀ ≥ H₁ ≥ H₂ ≥ Hb')
  if (r.heightLoadsFallback) {
    suggestions.push('高度顺序非法，静强度/稳定性/压并已改用 F_max（或 load）输入，请勿沿用 H₁/H₂ 载荷')
  }
  if (r.buckling && !r.buckling.bucklingPass) {
    if (r.buckling.cbOutOfRange) {
      suggestions.push(`稳定性：b=${r.buckling.slenderness?.toFixed(1)} 超出图3查表范围(≤${r.buckling.cbMaxTableSlenderness})，需人工查 CB`)
    } else if (r.buckling.checkMode === 'critical_load') {
      suggestions.push('稳定性不足：Fc ≤ F₂，缩短 H₀ / 加导杆 / 增大线径')
    } else {
      suggestions.push('稳定性不足：b=H₀/D 超限或弹簧过短')
    }
  }
  if (r.characteristicPass === false) {
    if (r.characteristic?.loadWithinTest === false) {
      suggestions.push('工作载荷 F₂ 超过试验载荷 Fs（GB/T 23935 §6.3.1b）')
    } else {
      suggestions.push('工作变形量不在 0.2fs～0.8fs（GB/T 23935 §6.3.1）')
    }
  }
  if (r.resonance?.checked && !r.resonancePass) {
    suggestions.push('共振风险：fe/fr ≤ 10，调整刚度/质量/工作频率或避开激励频率')
  }
  if (r.geometryPass === false && !r.heightLoadBlocked) suggestions.push('几何不合格：检查 H₀ 与并紧高度 Hb')
  else if (r.solidPass === false) suggestions.push('工作压缩量接近并圈：加长自由高度或减小载荷')
  if (r.fatiguePass === false) {
    suggestions.push('疲劳安全系数不足（GB/T 23935 式30）：降低应力幅或提高材料 Rm / 降低目标循环次数')
  }
  if (r.fatigueIssue === 'fatigue_partial_heights') {
    suggestions.push('疲劳载荷不完整：需同时输入 H₁ 与 H₂，或同时输入 F_min 与 F_max，不可只填一项高度')
  } else if (r.fatigueIssue === 'fatigue_heights_invalid') {
    suggestions.push('高度顺序非法，疲劳校核已阻断；修正 H₀/H₁/H₂ 后再算 F₁/F₂，或提供 F_min/F_max')
  } else if (r.fatigueLoadsFallback) {
    suggestions.push('高度不可信，疲劳已改用 F_min/F_max（与静强度回退策略一致）')
  } else if (r.fatigueIssue === 'fatigue_load_range_invalid') {
    suggestions.push('F_max < F_min，疲劳载荷范围非法')
  } else if (r.fatigueIssue === 'fatigue_load_inputs_missing') {
    suggestions.push('专业模式疲劳校核需 H₁+H₂ 或 F_min+F_max')
  }
  return buildCalcResult({
    toolId: 'spring',
    toolLabel: '弹簧设计',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    unconfirmedCriticalInputs: r.unconfirmedCriticalInputs ?? [],
    standards: [
      'Wahl 应力修正',
      r.calcMode !== 'simple' ? 'GB/T 23935 §6.3.1 特性 / §6.5.2 稳定性' : null,
      r.resonance?.checked ? 'GB/T 23935 §6.5.3 共振验算' : null,
      r.fatigueLife != null ? 'GB/T 23935 §6.5.1 式(30) 脉动疲劳' : null,
    ].filter(Boolean),
    warnings: r.releaseBlocked
      ? [{ key: 'critical_inputs_unconfirmed', level: 'critical', message: '关键输入未确认，禁止放行弹簧结论' }]
      : [],
    assumptions:
      r.calcMode === 'simple'
        ? ['未校核旋绕比 / 失稳 / 并圈裕量 / 疲劳 / 特性']
        : [
            r.testShearStress != null
              ? `τs=${r.testShearStress.toFixed(0)} MPa (${r.springProcess === 'hot' ? '热卷表5硬度范围' : '冷卷表3'}·式14)`
              : null,
            r.springProcess === 'hot' && r.hotCoilHardnessHrc == null ? '热卷未输入硬度，τs 保守取表5下限' : null,
            r.rmFromAppendixF && r.rmGrade
              ? `Rm=${r.tensileStrength} MPa（GB/T 23935 附录F·${r.rmGrade}·d 查表下限）`
              : null,
            r.tensileStrengthManual ? `Rm=${r.tensileStrength} MPa（用户手动覆盖查表值）` : null,
            r.loadCategory
              ? `[τ]=${Math.round(r.allowableShear)} MPa（GB/T 23935 ${r.allowableShearSource ?? '表3'}·${r.loadCategory}${r.stressRatioGamma != null ? `·γ=${r.stressRatioGamma.toFixed(2)}` : ''}）`
              : null,
            r.testLoadCappedAtSolid ? '试验载荷 Fs 已按附录限制为压并负荷 Fb' : null,
            r.heightLoadsFallback ? '高度非法，设计载荷回退至 F_max/load 输入' : null,
            r.fatigueLoadsFallback ? '高度不可信，疲劳 F₁/F₂ 回退至 F_min/F_max' : null,
            r.resonance?.checked ? `共振按 fe/fr=${r.resonance.ratio.toFixed(2)}>${r.resonance.minRatio} 校核` : null,
            r.buckling?.cbOutOfRange
              ? `b>${r.buckling.cbMaxTableSlenderness} 超出图3 CB 查表范围，稳定性保守判 fail`
              : r.buckling?.checkMode === 'critical_load'
                ? `b>${r.buckling.criticalSlenderness} 时按 Fc=CB·k·H₀>F₂ 校核`
                : 'b≤限值时按简化高径比筛查',
            ...(r.fatigueLife != null
              ? [
                  `Rm=${r.tensileStrength} MPa；τu0 按 GB/T 23935 表9；目标 N=${r.fatigueTargetCycles ?? '—'}`,
                  '静强度 [τ] 按 GB/T 23935 载荷类型/图1 选取；疲劳判定以式(30) 安全系数 S@目标 N 为准',
                  '估算分档 N 仅供参考，不可替代标准图线校核',
                  r.fatigueFromHeights ? '疲劳载荷由 H₁/H₂ → F₁/F₂' : '疲劳载荷由 loadMin/loadMax',
                ]
              : []),
          ].filter(Boolean),
    suggestions,
  })
}

/** ---------------- Fillet weld ---------------- */
export function adaptFilletWeld(input) {
  const r = analyzeFilletWeld(input)
  const shearStress = r.shearStress ?? r.gb?.shearStress ?? 0
  const allow = r.allow ?? r.gb?.allow ?? 0
  const shearPass = r.shearPass ?? r.allPass ?? r.pass ?? r.gb?.pass ?? false
  const pass = r.pass ?? (r.calcMode === 'simple' ? false : shearPass)
  const keyMetrics = [
    metric('shearStress', '剪切应力 τ', shearStress, 'MPa', {
      status: shearPass ? 'pass' : 'fail',
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
    estimateOnly: r.estimateOnly ?? false,
    standards,
    assumptions: r.calcMode === 'simple' ? ['仅 GB 简化剪切，未含合成应力；simple 模式不作正式放行'] : [],
    suggestions:
      !shearPass
        ? [`剪切应力超限 ${(((shearStress || 0) / (allow || 1) - 1) * 100).toFixed(0)}%，加大焊脚或延长焊缝`]
        : [],
  })
}

export function adaptButtWeld(input) {
  const r = analyzeButtWeld(input)
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'weld',
      toolLabel: '焊缝强度',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical' }],
    })
  }
  const stressOk = !!(r.stressPass ?? r.pass)
  const keyMetrics = [
    metric('normalStress', '正应力 σ', r.normalStress, 'MPa', {
      status: stressOk ? 'pass' : 'fail',
    }),
    metric('area', '承载面积 A', r.area, 'mm²'),
  ]
  if (r.effectiveStress != null) {
    keyMetrics.push(
      metric('effectiveStress', '有效应力 σ_eff', r.effectiveStress, 'MPa', {
        status: r.pass ? 'pass' : 'fail',
      }),
    )
  }
  const pass = r.pass ?? false
  return buildCalcResult({
    toolId: 'weld',
    toolLabel: '焊缝强度',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: ['GB/T 985', 'EN 1993-1-8', 'AWS D1.1'],
    assumptions: [
      '纯轴向静拉伸；默认全熔透对接（专业模式可用熔透效率 η 折减）',
      '不含面内剪力、弯矩、偏心、面外剥离与疲劳细节类别',
      ...(r.calcMode === 'simple'
        ? ['简化模式仅作快速估算，不作正式放行']
        : r.calcMode === 'professional'
          ? ['专业模式含熔透效率 η 与应力集中 Kf 的静力初步修正']
          : ['完整模式为多规范静力对照（全熔透假设）']),
    ],
    suggestions: pass ? [] : ['应力超限：增大焊缝有效截面、降低载荷或提高材料等级'],
  })
}

export function adaptWeldFatigue(input) {
  const r = analyzeWeldFatigue(input)
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'weld',
      toolLabel: '焊缝疲劳',
      calcMode: 'fatigue',
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical', message: '疲劳应力幅输入非法或缺失' }],
    })
  }
  return buildCalcResult({
    toolId: 'weld',
    toolLabel: '焊缝疲劳',
    calcMode: 'fatigue',
    inputs: input,
    outputs: r,
    keyMetrics: [
      metric('stressRange', '名义应力范围 Δσ', r.stressRange, 'MPa', {
        status: r.pass ? 'pass' : 'fail',
      }),
      metric('allowableAtCycles', '目标 N 下允许应力范围', r.allowableAtCycles, 'MPa', {
        direction: 'higher-better',
      }),
      metric('estimatedLife', '估算寿命', r.estimatedLife, 'cyc', {
        direction: 'higher-better',
      }),
      metric('enduranceLimit', '参考疲劳强度 Δσ_C', r.enduranceLimit, 'MPa'),
    ],
    pass: r.pass,
    estimateOnly: true,
    standards: ['焊缝简化 S-N'],
    assumptions: [
      '输入为名义应力范围 Δσ=σ_max−σ_min，不是振幅 σ_a',
      '单斜率 m=3、N_C=2e6 早期筛查；拐点后斜率/截止寿命未建模',
      '结论依赖细节类别与焊接质量，不作通用疲劳放行',
    ],
    suggestions: r.pass
      ? []
      : ['疲劳筛查未通过：降低名义应力范围、改善焊趾质量或提升细节等级'],
  })
}

export function adaptWeldHaz(input) {
  const r = analyzeHAZ(input)
  return buildCalcResult({
    toolId: 'weld',
    toolLabel: '焊缝 HAZ',
    calcMode: 'haz',
    inputs: input,
    outputs: r,
    keyMetrics: [
      metric('hazWidth', 'HAZ 宽度', r.hazWidthMm, 'mm'),
      metric('hazAllowShear', 'HAZ 许用剪应力', r.hazAllowShear, 'MPa', {
        direction: 'higher-better',
      }),
      metric('weldStress', '焊缝剪应力', r.weldStress, 'MPa', {
        status: r.pass ? 'pass' : 'fail',
      }),
    ],
    pass: r.pass,
    standards: ['焊接热输入简化评估'],
    assumptions: ['HAZ 宽度按热输入与板厚经验近似计算'],
    suggestions: r.pass ? [] : ['HAZ 区承载不足：降低热输入、增大焊缝截面或降低外载'],
  })
}

export function adaptWeldByTab(tab, payload) {
  if (tab === 'butt') return adaptButtWeld(payload)
  if (tab === 'fatigue') return adaptWeldFatigue(payload)
  if (tab === 'haz') return adaptWeldHaz(payload)
  return adaptFilletWeld(payload)
}

/** ---------------- Bolt group ---------------- */
export function adaptBoltGroup(input) {
  const r = analyzeBoltGroup(input)
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'bolt-group',
      toolLabel: '螺栓组',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical' }],
    })
  }
  const allow = r.allowPerBolt ?? input.allowPerBolt ?? 8000
  const util = allow ? r.maxBoltForce / allow : null
  const maxBoltForcePass = r.forcePass ?? r.pass
  const keyMetrics = [
    metric('maxBoltForce', '最大栓载 |F|', r.maxBoltForce, 'N', {
      status: maxBoltForcePass ? 'pass' : 'fail',
      utilization: util,
    }),
    metric('maxShearForce', '最大剪切', r.maxShearForce ?? r.maxBoltForce, 'N'),
    metric('directPerBolt', '直接分量', r.directPerBolt, 'N'),
    metric('torsionPerBolt', '扭转分量', r.torsionPerBolt, 'N'),
  ]
  if (r.friction) {
    keyMetrics.push(
      metric('slipCapacity', '摩擦抗滑', r.friction.slipCapacity, 'N', {
        status: r.slipPass ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }
  if (r.prying?.pryingTension > 0) {
    keyMetrics.push(metric('pryingTension', '撬力附加拉力', r.prying.pryingTension, 'N'))
  }
  const suggestions = []
  if (!maxBoltForcePass) {
    suggestions.push('最大栓载超限：增加螺栓数或加大分布圆半径')
  }
  if (r.calcMode !== 'simple') {
    if (r.slipPass === false) suggestions.push('摩擦抗滑不足：提高预紧力或摩擦系数')
    if (r.interactionPass === false) suggestions.push('剪拉组合交互不通过：降低偏心弯矩或加大许用')
  }
  return buildCalcResult({
    toolId: 'bolt-group',
    toolLabel: '螺栓组',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: r.estimateOnly ?? false,
    standards: r.calcMode !== 'simple' ? ['VDI 2230 偏心简化', '剪拉交互'] : [],
    assumptions: r.calcMode === 'simple' ? ['均布简化，未含逐栓矢量/撬力/摩擦；simple 模式不作正式放行'] : [],
    suggestions,
  })
}

/** ---------------- ISO 286 fit ---------------- */
export function adaptFit(input) {
  const r = analyzeFit(input.nominal, input.holeCode, input.shaftCode, {
    calcMode: input.calcMode,
    deltaT: input.deltaT,
    alphaHole: input.alphaHole,
    alphaShaft: input.alphaShaft,
    useAlphaTemperature: input.useAlphaTemperature,
  })
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'fit',
      toolLabel: 'ISO 286 配合',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical' }],
    })
  }

  const thermalFail = Boolean(r.thermalRiskKey)
  const keyMetrics = [
    metric('maxClearance', '最大间隙 / 过盈', r.maxClearance * 1000, 'μm'),
    metric('minClearance', '最小间隙 / 过盈', r.minClearance * 1000, 'μm'),
  ]
  if (r.meanClearance != null) {
    keyMetrics.push(metric('meanClearance', '平均间隙 / 过盈', r.meanClearance * 1000, 'μm'))
  }
  if (r.fitQuality != null) {
    keyMetrics.push(metric('fitQuality', '配合质量系数', r.fitQuality, ''))
  }
  if (r.thermalShift != null) {
    keyMetrics.push(metric('thermalShift', '热致间隙变化', r.thermalShift * 1000, 'μm'))
  }

  const warnings = []
  if (r.thermalRiskKey) {
    warnings.push({
      key: r.thermalRiskKey,
      level: 'warn',
      message: fitThermalMessage(r.thermalRiskKey),
    })
  }

  const suggestions = []
  if (r.thermalRiskKey === 'thermal_interference_risk') {
    suggestions.push('温升后可能转为干涉：增大初始最小间隙、降低温差或提高孔件膨胀系数')
  }
  if (r.thermalRiskKey === 'thermal_clearance_risk') {
    suggestions.push('温升后可能转为间隙：提高初始最小过盈、控制温差或提高轴件膨胀系数')
  }

  return buildCalcResult({
    toolId: 'fit',
    toolLabel: 'ISO 286 配合',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: !thermalFail,
    estimateOnly: !thermalFail,
    standards: ['ISO 286'],
    warnings,
    assumptions: buildFitAssumptions(r, input),
    suggestions,
  })
}

function buildFitAssumptions(r, input) {
  const list = ['未输入装配功能目标（所需间隙/过盈、装配力、粗糙度）时，结果仅用于分类与复核']
  if (r.calcMode === 'simple') list.push('仅查表输出配合类型与极限尺寸，不直接代表装配放行')
  if (r.calcMode === 'complete') list.push('配合质量系数仅用于方案比较，不等同于功能合格判定')
  if (r.calcMode === 'professional') {
    list.push(`热修正按线膨胀近似，参考温度 20°C，当前 ΔT=${input.deltaT ?? 0}°C`)
    if (r.alphaTemperatureUsed) list.push('已启用 α(T) 线性温变修正')
  }
  return list
}

function fitThermalMessage(key) {
  if (key === 'thermal_interference_risk') return '温度变化后可能转为干涉，需复核装配与运行间隙'
  if (key === 'thermal_clearance_risk') return '温度变化后可能转为间隙，需复核过盈保持与传扭能力'
  return key
}

/** ---------------- GD&T stack ---------------- */
export function adaptGdtStack(input) {
  const r = analyzeGdtStack({
    calcMode: input.calcMode,
    typeId: input.typeId,
    method: input.method,
    closedRing: { min: 0, max: input.closedMax, direction: input.closedDirection },
    rings: input.rings,
    datums: input.datums,
    toleranceModifier: input.toleranceModifier,
    bonusTolerance: input.bonusTolerance,
    autoBonus: input.autoBonus,
  })
  if (r.errorKey) {
    return buildCalcResult({
      toolId: 'gdt-stack',
      toolLabel: 'GD&T 公差栈',
      calcMode: input.calcMode,
      inputs: input,
      outputs: r,
      pass: false,
      warnings: [{ key: r.errorKey, level: 'critical' }],
    })
  }

  const simpleDatumsIgnored = r.calcMode === 'simple' && Array.isArray(input.datums) && input.datums.length > 0
  const util = input.closedMax > 0 ? r.chainResult.totalTolerance / input.closedMax : null
  const keyMetrics = [
    metric('stackedTolerance', '叠加公差 T', r.chainResult.totalTolerance, 'mm', {
      status: r.pass ? 'pass' : 'fail',
      utilization: util,
    }),
    metric('effectiveTolerance', '有效公差 T_eff', r.modifier?.effective ?? r.chainResult.totalTolerance, 'mm'),
  ]
  if (r.effectiveWithDatum != null) {
    keyMetrics.push(
      metric('withDatumStack', '含基准累积 T_d', r.effectiveWithDatum, 'mm', {
        status: r.passWithDatum ? 'pass' : 'fail',
      }),
    )
  }
  if (r.worstCaseMargin != null) {
    keyMetrics.push(
      metric('worstMargin', 'Worst-case 裕量', r.worstCaseMargin, 'mm', {
        status: r.worstCaseMargin >= 0 ? 'pass' : 'fail',
        direction: 'higher-better',
      }),
    )
  }

  const warnings = []
  if (simpleDatumsIgnored) {
    warnings.push({
      key: 'simple_datums_ignored',
      level: 'warn',
      message: 'simple 模式未计入基准累积；当前基准输入仅记录，不参与判定',
    })
  }
  if (r.datumStack && r.passWithDatum === false) {
    warnings.push({
      key: 'datum_stack_exceeded',
      level: 'warn',
      message: `计入基准累积后 T_d=${r.effectiveWithDatum?.toFixed(4)} mm，超出闭环上限 ${Number(input.closedMax ?? 0).toFixed(4)} mm`,
    })
  }
  if (r.worstCaseMargin != null && r.worstCaseMargin < 0) {
    warnings.push({
      key: 'worst_case_margin_negative',
      level: 'warn',
      message: `Worst-case 裕量为 ${r.worstCaseMargin.toFixed(4)} mm，极值条件下不满足闭环`,
    })
  }

  const suggestions = []
  if (!r.pass && r.topContributor) {
    suggestions.push(`优先收紧贡献最大的组成环：${r.topContributor}`)
  }
  if (r.passWithDatum === false) {
    suggestions.push('基准累积后超差：降低基准面公差、优化基准顺序或放宽闭环要求')
  }
  if (r.worstCaseMargin != null && r.worstCaseMargin < 0) {
    suggestions.push('Worst-case 不通过：关键环需按极值法重新分配，不能仅依赖 RSS 结果')
  }
  if (simpleDatumsIgnored) {
    suggestions.push('已输入基准时请切换到 complete 或 professional 模式复核基准累积影响')
  }

  return buildCalcResult({
    toolId: 'gdt-stack',
    toolLabel: 'GD&T 公差栈',
    calcMode: r.calcMode,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass,
    estimateOnly: simpleDatumsIgnored,
    standards: ['GD&T 公差栈叠加', methodLabel(input.method)],
    warnings,
    assumptions: buildGdtAssumptions(r, input),
    suggestions,
  })
}

function buildGdtAssumptions(r, input) {
  const list = []
  if (r.calcMode === 'simple') list.push('仅计算封闭环叠加，不含贡献排序、基准累积与 worst-case 复核')
  if (r.calcMode === 'simple' && Array.isArray(input.datums) && input.datums.length > 0) {
    list.push('已输入基准但 simple 模式不计入基准累积，不能据此直接放行 GD&T 结论')
  }
  if (r.calcMode !== 'simple') list.push('基准累积按加权 RSS 近似合成，仅用于前期公差预算')
  if (r.modifier?.type && r.modifier.type !== 'RFS') {
    list.push(`${r.modifier.type} 修饰符已计入 bonus tolerance；自动 bonus 仍需图样定义复核`)
  }
  if (input.method !== 'worst') {
    list.push(`${methodLabel(input.method)} 结果不能替代极值法封闭性验证`)
  }
  return list
}

/** ---------------- Size chain editor ---------------- */
export function adaptSizeChain(input) {
  const { closedRing, componentRings, method = 'rss', chainOptions = {} } = input
  if (
    closedRing?.min == null ||
    closedRing?.max == null ||
    !componentRings?.length
  ) {
    return buildCalcResult({
      toolId: 'editor',
      toolLabel: '尺寸链',
      calcMode: method,
      inputs: input,
      outputs: {},
      pass: false,
      warnings: [{ key: 'incomplete_chain', level: 'warn', message: '闭环或组成环未配置' }],
    })
  }
  const spec = { min: closedRing.min, max: closedRing.max }
  const r = calculateChainResult(spec, componentRings, method, {
    ...chainOptions,
    closedDirection: closedRing.direction ?? chainOptions.closedDirection,
  })
  const worstReference =
    method === 'worst'
      ? r
      : calculateChainResult(spec, componentRings, 'worst', {
          ...chainOptions,
          closedDirection: closedRing.direction ?? chainOptions.closedDirection,
        })
  const marginLower = r.lower != null ? r.lower - closedRing.min : null
  const marginUpper = r.upper != null ? closedRing.max - r.upper : null
  const worstMargin =
    marginLower != null && marginUpper != null ? Math.min(marginUpper, marginLower) : null

  const keyMetrics = [
    metric('totalTolerance', '总公差 T', r.totalTolerance, closedRing.unit ?? 'mm'),
    metric('upper', '上偏差', r.upper, closedRing.unit ?? 'mm'),
    metric('lower', '下偏差', r.lower, closedRing.unit ?? 'mm'),
    metric('worstMargin', '最小裕量', worstMargin, closedRing.unit ?? 'mm', {
      status: r.pass ? 'pass' : 'fail',
      direction: 'higher-better',
    }),
  ]

  const warnings = []
  if (r.validationError) {
    warnings.push({
      key: r.validationError,
      level: 'error',
      message: `组成环「${r.validationRing ?? '?'}」方向/类型未定义，无法计算`,
    })
  }
  if (method !== 'worst') {
    warnings.push({
      key: 'statistical_method_review_only',
      level: 'warn',
      message: `${methodLabel(method)} 结果仅用于统计评估，不能替代极值法封闭性放行`,
    })
  }
  if (method !== 'worst' && r.pass && worstReference?.pass === false) {
    warnings.push({
      key: 'rss_pass_worst_fail',
      level: 'critical',
      message: `${methodLabel(method)} 通过但极值法不通过，当前结果仅可用于方案比较，禁止作为放行依据`,
    })
  }

  const suggestions = []
  if (!r.pass && !r.validationError) {
    if (marginLower != null && marginLower < 0) {
      suggestions.push(`下偏差超出 ${Math.abs(marginLower).toFixed(3)}，收紧负向环或放宽下限`)
    }
    if (marginUpper != null && marginUpper < 0) {
      suggestions.push(`上偏差超出 ${Math.abs(marginUpper).toFixed(3)}，收紧正向环或放宽上限`)
    }
  }

  return buildCalcResult({
    toolId: 'editor',
    toolLabel: '尺寸链',
    calcMode: method,
    inputs: input,
    outputs: r,
    keyMetrics,
    pass: r.pass && !r.validationError,
    estimateOnly: method !== 'worst',
    standards: [methodLabel(method)],
    assumptions: ['1D 线性叠加；GD&T 模式需选对应分析类型'],
    warnings,
    suggestions,
  })
}

function methodLabel(m) {
  const map = {
    worst: '极值法',
    rss: 'RSS 法',
    'modified-rss': '修正 RSS',
    'sigma6-rss': '6σ RSS',
  }
  return map[m] ?? m
}

/** 工具 id → adapter 映射（用于通用调用） */
export const CALC_ADAPTERS = {
  bearing: adaptBearing,
  shaft: adaptShaftTorsion,
  'shaft-combined': adaptShaftCombined,
  'bolt-preload': adaptBoltPreload,
  'bolt-group': adaptBoltGroup,
  key: adaptKeyConnection,
  beam: adaptBeam,
  spring: adaptSpring,
  weld: adaptFilletWeld,
  gear: adaptGear,
  'gasket-flange': adaptGasketFlange,
  'bevel-gear': adaptBevelGear,
  'worm-gear': adaptWormGear,
  'vibration-isolation': adaptVibrationIsolation,
  'heat-transfer': adaptHeatTransfer,
  fit: adaptFit,
  'gdt-stack': adaptGdtStack,
  editor: adaptSizeChain,
}
