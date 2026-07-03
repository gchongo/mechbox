/**
 * VDI 2230 分步校核向导 — R0~R13 简化流程
 */
import {
  analyzeBoltPreload,
  METRIC_THREAD_PITCH,
  THREAD_GRADES,
} from '@/utils/bolt-preload-calc'
import { calcPitchDiameter, calcTensileStressArea } from '@/utils/thread-calc'

export const TIGHTENING_METHODS = {
  torque: { label: '扭矩法', factorScatter: 0.25 },
  angle: { label: '转角法', factorScatter: 0.15 },
  yield: { label: '屈服点法', factorScatter: 0.1 },
  hydraulic: { label: '液压拉伸', factorScatter: 0.08 },
}

/** 运行 VDI 2230 分步校核 */
export function runVdi2230Wizard(input) {
  const d = input.diameter
  const P = input.pitch ?? METRIC_THREAD_PITCH[Math.round(d)] ?? 1.5
  const grade = THREAD_GRADES[input.grade ?? '8.8'] ?? THREAD_GRADES['8.8']
  const As = calcTensileStressArea(d, P)
  const method = TIGHTENING_METHODS[input.tighteningMethod ?? 'torque'] ?? TIGHTENING_METHODS.torque

  const preloadResult = analyzeBoltPreload({
    ...input,
    calcMode: 'professional',
    mode: input.mode ?? 'force2torque',
  })

  const joint = preloadResult.joint
  if (!joint) return { error: '需要专业版参数以运行 VDI 2230 向导' }
  const FM = preloadResult.preloadResidual
  const FV = preloadResult.preloadTightening
  const FZ = joint.embedmentLoss
  const deltaFVT = joint.thermalDelta
  const Phi = joint.loadFactor
  const FAx = input.externalAxialLoad ?? 0
  const FAlt = input.alternatingLoad ?? 0

  const F_Kerf = input.requiredClampLoad ?? Math.max(0, FAx * (1 - Phi))
  const scatter = method.factorScatter
  const F_Mmin = F_Kerf + (1 - Phi) * FAx + FZ - deltaFVT
  const F_Mmax = F_Mmin * (1 + scatter)

  const sigmaRed = preloadResult.stressResidual
  const sigmaAllow = grade.allowStress
  const utilization = sigmaAllow ? sigmaRed / sigmaAllow : 0

  const dW = input.headContactDiameter ?? 1.5 * d
  const pMax = FM / (Math.PI * dW ** 2 / 4) * 1000 // MPa rough
  const pAllow = input.allowSurfacePressure ?? 600

  const steps = []

  steps.push(step('R0', '拧紧方法', 'ok', {
    summary: method.label,
    detail: `离散系数 ±${(scatter * 100).toFixed(0)}%`,
  }))

  steps.push(step('R1', '摩擦与几何', 'ok', {
    summary: `μ_G=${input.muG ?? 0.12}, μ_K=${input.muK ?? 0.12}`,
    detail: `d₂=${calcPitchDiameter(d, P).toFixed(3)} mm, A_s=${As.toFixed(2)} mm²`,
  }))

  const r2Pass = FM >= F_Kerf
  steps.push(step('R2', '最小夹紧力 F_Kerf', r2Pass ? 'ok' : 'fail', {
    summary: `F_Kerf=${F_Kerf.toFixed(0)} N`,
    detail: `残余预紧 F_M=${FM.toFixed(0)} N ${r2Pass ? '≥' : '<'} F_Kerf`,
    formula: 'F_Kerf = F_Ax·(1−Φ) 或用户指定',
  }))

  steps.push(step('R3', '载荷系数 Φ', 'ok', {
    summary: `Φ=${(Phi * 100).toFixed(1)}%`,
    detail: `k_S=${joint.kS.toFixed(0)} N/mm, k_P=${joint.kP.toFixed(0)} N/mm`,
    formula: 'Φ = k_P / (k_S + k_P)',
  }))

  steps.push(step('R4', '预紧力变化', 'ok', {
    summary: `F_Z=${FZ.toFixed(0)} N, ΔF_VT=${deltaFVT.toFixed(0)} N`,
    detail: `嵌入 f_Z=${joint.embedmentUm.toFixed(0)} μm`,
    formula: 'F_V = F_M + F_Z − ΔF_VT',
  }))

  steps.push(step('R5', '装配预紧力范围', 'ok', {
    summary: `F_Mmin=${F_Mmin.toFixed(0)} N, F_Mmax=${F_Mmax.toFixed(0)} N`,
    detail: `拧紧预紧 F_V=${FV.toFixed(0)} N, T=${preloadResult.torque.toFixed(2)} N·m`,
  }))

  const r6Pass = sigmaRed <= sigmaAllow
  steps.push(step('R6', '螺栓应力校核', r6Pass ? 'ok' : 'fail', {
    summary: `σ=${sigmaRed.toFixed(1)} / ${sigmaAllow} MPa`,
    detail: `利用率 ${(utilization * 100).toFixed(1)}%`,
    formula: 'σ = F_V / A_s',
  }))

  const r7Pass = pMax <= pAllow
  steps.push(step('R7', '支承面比压', r7Pass ? 'ok' : 'warn', {
    summary: `p≈${pMax.toFixed(0)} / ${pAllow} MPa`,
    detail: `头部支承直径 d_W≈${dW.toFixed(1)} mm（简化）`,
  }))

  const r8Status = FAlt > 0 ? (utilization < 0.85 ? 'ok' : 'warn') : 'skip'
  steps.push(step('R8', '疲劳（简化）', r8Status, {
    summary: FAlt > 0 ? `交变载荷 ${FAlt.toFixed(0)} N` : '未输入交变载荷',
    detail: FAlt > 0 ? '建议进一步按 VDI 2230 完整疲劳公式校核' : '跳过',
  }))

  steps.push(step('R9', '抗滑移（简化）', FAx > 0 ? 'warn' : 'skip', {
    summary: FAx > 0 ? `轴向载荷 ${FAx.toFixed(0)} N` : '无横向/轴向外载',
    detail: '完整校核需摩擦面 μ_T 与横向力 F_Q',
  }))

  steps.push(step('R10', '抗内压/密封', 'skip', {
    summary: '未启用',
    detail: '密封连接需额外输入密封压力与有效面积',
  }))

  steps.push(step('R11', '螺纹旋合长度', 'ok', {
    summary: `m_eff ≥ ${(0.8 * d).toFixed(1)} mm 建议`,
    detail: '按材料与等级查 VDI 2230 表',
  }))

  steps.push(step('R12', '拧紧力矩上限', preloadResult.torque <= input.maxTorque || !input.maxTorque ? 'ok' : 'fail', {
    summary: `T=${preloadResult.torque.toFixed(2)} N·m`,
    detail: input.maxTorque ? `上限 ${input.maxTorque} N·m` : '未设上限',
  }))

  const failed = steps.filter((s) => s.status === 'fail').length
  const warned = steps.filter((s) => s.status === 'warn').length
  const overall = failed > 0 ? 'fail' : warned > 0 ? 'warn' : 'ok'

  steps.push(step('R13', '校核汇总', overall, {
    summary: failed ? `${failed} 项未通过` : warned ? `${warned} 项需关注` : '全部通过',
    detail: `性能等级 ${grade.label}，M${d}×${P}`,
  }))

  return {
    steps,
    overall,
    failedCount: failed,
    warnCount: warned,
    keyResults: {
      FM,
      FV,
      F_Kerf,
      F_Mmin,
      F_Mmax,
      torque: preloadResult.torque,
      sigmaRed,
      sigmaAllow,
      Phi,
      FZ,
      deltaFVT,
    },
    preloadResult,
  }
}

function step(id, title, status, payload) {
  return { id, title, status, ...payload }
}

export function buildWizardReportText(wizardResult) {
  const lines = ['=== VDI 2230 分步校核报告 ===', '']
  for (const s of wizardResult.steps) {
    lines.push(`[${s.id}] ${s.title} — ${statusLabel(s.status)}`)
    lines.push(`  ${s.summary}`)
    if (s.detail) lines.push(`  ${s.detail}`)
    if (s.formula) lines.push(`  式: ${s.formula}`)
    lines.push('')
  }
  lines.push(`总体: ${statusLabel(wizardResult.overall)}`)
  return lines.join('\n')
}

function statusLabel(s) {
  return { ok: '通过', fail: '未通过', warn: '关注', skip: '跳过' }[s] ?? s
}
