/**
 * VDI 2230 分步校核向导 — R0~R13 简化流程
 */
import {
  analyzeBoltPreload,
  METRIC_THREAD_PITCH,
  THREAD_GRADES,
} from '@/utils/bolt-preload-calc'
import { calcPitchDiameter, calcTensileStressArea } from '@/utils/thread-calc'
import { t } from '@/i18n'

export const TIGHTENING_METHODS = {
  torque: { label: '扭矩法', factorScatter: 0.25 },
  angle: { label: '转角法', factorScatter: 0.15 },
  yield: { label: '屈服点法', factorScatter: 0.1 },
  hydraulic: { label: '液压拉伸', factorScatter: 0.08 },
}

function msg(locale, key, params) {
  return t(`calc.messages.vdi2230.${key}`, locale, params)
}

function errMsg(locale, key) {
  return t(`calc.messages.errors.${key}`, locale)
}

function methodLabel(methodKey, locale) {
  const path = `calc.options.tighteningMethods.${methodKey}.label`
  const val = t(path, locale)
  return val !== path ? val : methodKey
}

function gradeLabel(gradeKey, locale) {
  const path = `calc.options.threadGrades.${gradeKey}.label`
  const val = t(path, locale)
  return val !== path ? val : gradeKey
}

/** 运行 VDI 2230 分步校核 */
export function runVdi2230Wizard(input) {
  const d = input.diameter
  const P = input.pitch ?? METRIC_THREAD_PITCH[Math.round(d)] ?? 1.5
  const gradeKey = input.grade ?? '8.8'
  const grade = THREAD_GRADES[gradeKey] ?? THREAD_GRADES['8.8']
  const As = calcTensileStressArea(d, P)
  const methodKey = input.tighteningMethod ?? 'torque'
  const method = TIGHTENING_METHODS[methodKey] ?? TIGHTENING_METHODS.torque

  const preloadResult = analyzeBoltPreload({
    ...input,
    calcMode: 'professional',
    mode: input.mode ?? 'force2torque',
  })

  const joint = preloadResult.joint
  if (!joint) return { errorKey: 'vdi_need_professional' }
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
  const clampingRemaining = FM - FAx * (1 - Phi)
  const separationPass = clampingRemaining >= 0

  const sigmaRed = preloadResult.stressResidual
  const sigmaAllow = grade.allowStress
  const utilization = sigmaAllow ? sigmaRed / sigmaAllow : 0

  const dW = input.headContactDiameter ?? 1.5 * d
  const pMax = FM / (Math.PI * dW ** 2 / 4) * 1000
  const pAllow = input.allowSurfacePressure ?? 600

  const steps = []

  steps.push(
    step('R0', 'ok', {
      summaryKey: 'steps.R0.summary',
      summaryParams: { method: methodKey, scatter: (scatter * 100).toFixed(0) },
      detailKey: 'steps.R0.detail',
      detailParams: { scatter: (scatter * 100).toFixed(0) },
    }),
  )

  steps.push(
    step('R1', 'ok', {
      summaryKey: 'steps.R1.summary',
      summaryParams: { muG: input.muG ?? 0.12, muK: input.muK ?? 0.12 },
      detailKey: 'steps.R1.detail',
      detailParams: {
        d2: calcPitchDiameter(d, P).toFixed(3),
        as: As.toFixed(2),
      },
    }),
  )

  const r2Pass = FM >= F_Kerf
  steps.push(
    step('R2', r2Pass ? 'ok' : 'fail', {
      summaryKey: 'steps.R2.summary',
      summaryParams: { fKerf: F_Kerf.toFixed(0) },
      detailKey: 'steps.R2.detail',
      detailParams: {
        fm: FM.toFixed(0),
        cmp: r2Pass ? 'detail_pass' : 'detail_fail',
      },
      formulaKey: 'steps.R2.formula',
    }),
  )

  steps.push(
    step('R3', 'ok', {
      summaryKey: 'steps.R3.summary',
      summaryParams: { phi: (Phi * 100).toFixed(1) },
      detailKey: 'steps.R3.detail',
      detailParams: { kS: joint.kS.toFixed(0), kP: joint.kP.toFixed(0) },
      formulaKey: 'steps.R3.formula',
    }),
  )

  steps.push(
    step('R4', 'ok', {
      summaryKey: 'steps.R4.summary',
      summaryParams: { fz: FZ.toFixed(0), dfvt: deltaFVT.toFixed(0) },
      detailKey: 'steps.R4.detail',
      detailParams: { embed: joint.embedmentUm.toFixed(0) },
      formulaKey: 'steps.R4.formula',
    }),
  )

  steps.push(
    step('R5', 'ok', {
      summaryKey: 'steps.R5.summary',
      summaryParams: { fmin: F_Mmin.toFixed(0), fmax: F_Mmax.toFixed(0) },
      detailKey: 'steps.R5.detail',
      detailParams: { fv: FV.toFixed(0), torque: preloadResult.torque.toFixed(2) },
    }),
  )

  const r6Pass = sigmaRed <= sigmaAllow
  steps.push(
    step('R6', r6Pass ? 'ok' : 'fail', {
      summaryKey: 'steps.R6.summary',
      summaryParams: { sigma: sigmaRed.toFixed(1), allow: sigmaAllow },
      detailKey: 'steps.R6.detail',
      detailParams: { util: (utilization * 100).toFixed(1) },
      formulaKey: 'steps.R6.formula',
    }),
  )

  const r7Pass = pMax <= pAllow
  steps.push(
    step('R7', r7Pass ? 'ok' : 'warn', {
      summaryKey: 'steps.R7.summary',
      summaryParams: { pmax: pMax.toFixed(0), pallow: pAllow },
      detailKey: 'steps.R7.detail',
      detailParams: { dw: dW.toFixed(1) },
    }),
  )

  const r8Status = FAlt > 0 ? (utilization < 0.85 ? 'ok' : 'warn') : 'skip'
  steps.push(
    step('R8', r8Status, {
      summaryKey: FAlt > 0 ? 'steps.R8.summary_alt' : 'steps.R8.summary_none',
      summaryParams: FAlt > 0 ? { falt: FAlt.toFixed(0) } : undefined,
      detailKey: FAlt > 0 ? 'steps.R8.detail_check' : 'steps.R8.detail_skip',
    }),
  )

  steps.push(
    step('R9', FAx > 0 ? (separationPass ? 'ok' : 'fail') : 'skip', {
      summaryKey: FAx > 0 ? 'steps.R9.summary_axial' : 'steps.R9.summary_none',
      summaryParams: FAx > 0 ? { fax: FAx.toFixed(0) } : undefined,
      detailKey: 'steps.R9.detail',
      detailParams: FAx > 0 ? { fkr: clampingRemaining.toFixed(0) } : undefined,
    }),
  )

  steps.push(
    step('R10', 'skip', {
      summaryKey: 'steps.R10.summary',
      detailKey: 'steps.R10.detail',
    }),
  )

  steps.push(
    step('R11', 'ok', {
      summaryKey: 'steps.R11.summary',
      summaryParams: { meff: (0.8 * d).toFixed(1) },
      detailKey: 'steps.R11.detail',
    }),
  )

  steps.push(
    step('R12', preloadResult.torque <= input.maxTorque || !input.maxTorque ? 'ok' : 'fail', {
      summaryKey: 'steps.R12.summary',
      summaryParams: { torque: preloadResult.torque.toFixed(2) },
      detailKey: input.maxTorque ? 'steps.R12.detail_limit' : 'steps.R12.detail_no_limit',
      detailParams: input.maxTorque ? { max: input.maxTorque } : undefined,
    }),
  )

  const failed = steps.filter((s) => s.status === 'fail').length
  const warned = steps.filter((s) => s.status === 'warn').length
  const overall = failed > 0 ? 'fail' : warned > 0 ? 'warn' : 'ok'

  steps.push(
    step('R13', overall, {
      summaryKey: failed
        ? 'steps.R13.summary_fail'
        : warned
          ? 'steps.R13.summary_warn'
          : 'steps.R13.summary_ok',
      summaryParams: failed || warned ? { count: failed || warned } : undefined,
      detailKey: 'steps.R13.detail',
      detailParams: { grade: gradeKey, d, pitch: P },
    }),
  )

  return {
    steps,
    overall,
    failedCount: failed,
    warnCount: warned,
    gradeKey,
    methodKey,
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

function step(id, status, payload) {
  return { id, status, titleKey: `steps.${id}.title`, ...payload }
}

/** Resolve step text for UI / PDF */
export function localizeVdiStep(step, locale = 'zh') {
  const resolve = (key, params) => {
    if (!key) return ''
    let text = msg(locale, key, params)
    if (key === 'steps.R0.summary' && step.summaryParams?.method) {
      text = text.replace('{method}', methodLabel(step.summaryParams.method, locale))
    }
    if (key === 'steps.R2.detail' && params?.cmp) {
      const cmp = msg(locale, `steps.R2.${params.cmp}`)
      text = text.replace('{cmp}', cmp)
    }
    if (key === 'steps.R13.detail' && params?.grade) {
      text = text.replace('{grade}', gradeLabel(params.grade, locale))
    }
    return text
  }

  return {
    ...step,
    title: resolve(step.titleKey),
    summary: resolve(step.summaryKey, step.summaryParams),
    detail: resolve(step.detailKey, step.detailParams),
    formula: step.formulaKey ? resolve(step.formulaKey) : undefined,
  }
}

export function localizeVdiWizard(wizardResult, locale = 'zh') {
  if (!wizardResult) return wizardResult
  if (wizardResult.errorKey) {
    return { ...wizardResult, error: errMsg(locale, wizardResult.errorKey) }
  }
  return {
    ...wizardResult,
    steps: wizardResult.steps.map((s) => localizeVdiStep(s, locale)),
  }
}

export function buildWizardReportText(wizardResult, locale = 'zh') {
  const localized = localizeVdiWizard(wizardResult, locale)
  if (localized?.error) return localized.error

  const statusLabel = (s) => {
    const path = `calc.fields.common.step${s.charAt(0).toUpperCase()}${s.slice(1)}`
    const map = { ok: 'stepPass', fail: 'stepFail', warn: 'stepWarn', skip: 'stepSkip' }
    const key = `calc.fields.common.${map[s] ?? s}`
    const val = t(key, locale)
    return val !== key ? val : s
  }

  const lines = [msg(locale, 'report_title'), '']
  for (const s of localized.steps) {
    lines.push(`[${s.id}] ${s.title} — ${statusLabel(s.status)}`)
    lines.push(`  ${s.summary}`)
    if (s.detail) lines.push(`  ${s.detail}`)
    if (s.formula) lines.push(`  ${msg(locale, 'report_formula_prefix', { formula: s.formula })}`)
    lines.push('')
  }
  lines.push(msg(locale, 'report_overall', { status: statusLabel(localized.overall) }))
  return lines.join('\n')
}
