import { getThreadRows } from '@/constants/thread-standards'

/** @typedef {'purpose'|'sealing'|'unit'|'process'} WizardStepId */

/** @typedef {'fastener'|'pipe'|'leadscrew'} PurposeId */
/** @typedef {'none'|'gasket'|'thread_seal'} SealingId */
/** @typedef {'metric'|'inch_na'|'inch_legacy'|'match_existing'} UnitId */
/** @typedef {'bolt_nut'|'tapped_hole'|'pipe_fitting'|'sheet_metal'|'die_cast'|'plastic_insert'} ProcessId */
/** @typedef {'normal'|'vibration'|'high_load'|'frequent'} LoadId */
/** @typedef {'steel'|'aluminum'|'stainless'|'plastic'} MaterialId */

/**
 * @typedef {object} WizardAnswers
 * @property {PurposeId} purpose
 * @property {SealingId} sealing
 * @property {UnitId} unit
 * @property {ProcessId} process
 * @property {LoadId} [load]
 * @property {MaterialId} [material]
 */

export const WIZARD_STEP_ORDER = /** @type {WizardStepId[]} */ ([
  'purpose',
  'sealing',
  'unit',
  'process',
])

export const DEFAULT_ANSWERS = /** @type {WizardAnswers} */ ({
  purpose: 'fastener',
  sealing: 'none',
  unit: 'metric',
  process: 'bolt_nut',
  load: 'normal',
  material: 'steel',
})

/**
 * @param {Partial<WizardAnswers>} answers
 * @returns {WizardAnswers}
 */
export function normalizeWizardAnswers(answers = {}) {
  return { ...DEFAULT_ANSWERS, ...answers }
}

/**
 * @param {Partial<WizardAnswers>} answers
 */
export function needsSealingStep(answers) {
  const a = normalizeWizardAnswers(answers)
  return a.purpose === 'pipe'
}

/**
 * @param {Partial<WizardAnswers>} answers
 * @returns {WizardStepId[]}
 */
export function getActiveWizardSteps(answers) {
  const steps = ['purpose']
  if (needsSealingStep(answers)) steps.push('sealing')
  steps.push('unit', 'process')
  return steps
}

/**
 * @param {WizardAnswers} answers
 * @returns {import('@/utils/thread-design-wizard').DesignRecommendation}
 */
export function runThreadDesignWizard(answers) {
  const a = normalizeWizardAnswers(answers)

  if (a.purpose === 'leadscrew') {
    return buildLeadscrewResult(a)
  }

  if (a.purpose === 'pipe') {
    return buildPipeResult(a)
  }

  return buildFastenerResult(a)
}

/**
 * @typedef {object} DesignWarning
 * @property {'error'|'warning'|'info'} level
 * @property {string} key
 */

/**
 * @typedef {object} DesignAlternative
 * @property {string} key
 * @property {string} [system]
 */

/**
 * @typedef {object} DesignRecommendation
 * @property {boolean} success
 * @property {string|null} primarySystem
 * @property {string[]} systems
 * @property {string|null} subSeries
 * @property {string} toleranceInternal
 * @property {string} toleranceExternal
 * @property {string} toleranceScenarioKey
 * @property {string} sizeRangeKey
 * @property {boolean} preferFinePitch
 * @property {string[]} processTipKeys
 * @property {DesignWarning[]} warnings
 * @property {DesignAlternative[]} alternatives
 * @property {string[]} standardRefKeys
 * @property {string|null} sealingNoteKey
 * @property {import('@/constants/thread-standards').ThreadRow[]} sampleRows
 * @property {boolean} showTapDrill
 * @property {string|null} unsupportedKey
 */

/** @param {WizardAnswers} a */
function buildLeadscrewResult(a) {
  return {
    success: false,
    primarySystem: null,
    systems: [],
    subSeries: null,
    toleranceInternal: '—',
    toleranceExternal: '—',
    toleranceScenarioKey: 'wiz_tol_leadscrew',
    sizeRangeKey: 'wiz_size_leadscrew',
    preferFinePitch: false,
    processTipKeys: ['wiz_proc_leadscrew'],
    warnings: [{ level: 'info', key: 'wiz_warn_leadscrew' }],
    alternatives: [{ key: 'wiz_alt_leadscrew_tr' }],
    standardRefKeys: ['wiz_std_tr', 'wiz_std_acme'],
    sealingNoteKey: null,
    sampleRows: [],
    showTapDrill: false,
    unsupportedKey: 'wiz_unsupported_leadscrew',
  }
}

/** @param {WizardAnswers} a */
function buildPipeResult(a) {
  /** @type {DesignRecommendation} */
  const base = {
    success: true,
    primarySystem: null,
    systems: [],
    subSeries: null,
    toleranceInternal: '—',
    toleranceExternal: '—',
    toleranceScenarioKey: 'wiz_tol_pipe',
    sizeRangeKey: 'wiz_size_pipe_common',
    preferFinePitch: false,
    processTipKeys: [],
    warnings: [],
    alternatives: [],
    standardRefKeys: [],
    sealingNoteKey: null,
    sampleRows: [],
    showTapDrill: false,
    unsupportedKey: null,
  }

  if (a.sealing === 'none') {
    base.success = false
    base.warnings.push({ level: 'error', key: 'wiz_warn_pipe_need_seal' })
    return base
  }

  if (a.sealing === 'gasket') {
    base.primarySystem = 'g'
    base.systems = ['g']
    base.sealingNoteKey = 'wiz_seal_gasket'
    base.standardRefKeys = ['wiz_std_g']
    base.warnings.push({ level: 'warning', key: 'wiz_warn_g_not_npt' })
    base.alternatives.push({ key: 'wiz_alt_g_to_npt', system: 'npt' })
  } else {
    if (a.unit === 'inch_na' || a.unit === 'match_existing') {
      base.primarySystem = 'npt'
      base.systems = ['npt']
      base.sealingNoteKey = 'wiz_seal_npt'
      base.standardRefKeys = ['wiz_std_npt']
      base.warnings.push({ level: 'warning', key: 'wiz_warn_npt_not_bsp' })
      base.alternatives.push({ key: 'wiz_alt_npt_to_r', system: 'r' })
    } else {
      base.primarySystem = 'r'
      base.systems = ['r']
      base.sealingNoteKey = 'wiz_seal_bspt'
      base.standardRefKeys = ['wiz_std_r']
      base.warnings.push({ level: 'warning', key: 'wiz_warn_r_not_npt' })
      base.alternatives.push({ key: 'wiz_alt_r_to_npt', system: 'npt' })
    }
    if (a.unit === 'inch_legacy') {
      base.primarySystem = 'r'
      base.systems = ['r']
    }
  }

  base.processTipKeys = pickPipeProcessTips(a)
  base.sampleRows = pickSampleRows(base.primarySystem, base.subSeries, 6)
  base.warnings.push({ level: 'info', key: 'wiz_warn_pipe_mix' })
  return base
}

/** @param {WizardAnswers} a */
function buildFastenerResult(a) {
  /** @type {DesignRecommendation} */
  const base = {
    success: true,
    primarySystem: 'metric',
    systems: ['metric'],
    subSeries: 'coarse',
    toleranceInternal: '6H',
    toleranceExternal: '6g',
    toleranceScenarioKey: 'wiz_tol_general',
    sizeRangeKey: 'wiz_size_metric_common',
    preferFinePitch: false,
    processTipKeys: [],
    warnings: [],
    alternatives: [],
    standardRefKeys: ['wiz_std_metric'],
    sealingNoteKey: null,
    sampleRows: [],
    showTapDrill: false,
    unsupportedKey: null,
  }

  if (a.unit === 'inch_na') {
    base.primarySystem = a.load === 'vibration' || a.load === 'frequent' ? 'unf' : 'unc'
    base.systems = a.load === 'vibration' || a.load === 'frequent' ? ['unf', 'unc'] : ['unc', 'unf']
    base.subSeries = base.primarySystem
    base.toleranceInternal = '2B'
    base.toleranceExternal = '2A'
    base.toleranceScenarioKey = 'wiz_tol_unified'
    base.sizeRangeKey = 'wiz_size_unified_common'
    base.standardRefKeys = ['wiz_std_unified']
  } else if (a.unit === 'inch_legacy') {
    base.warnings.push({ level: 'info', key: 'wiz_warn_legacy_wh' })
    base.primarySystem = 'metric'
    base.systems = ['metric', 'unc']
    base.alternatives.push({ key: 'wiz_alt_wh_to_metric', system: 'metric' })
  } else if (a.unit === 'match_existing') {
    base.warnings.push({ level: 'info', key: 'wiz_warn_match_existing' })
  }

  if (a.load === 'vibration' || a.load === 'frequent') {
    base.preferFinePitch = true
    if (base.primarySystem === 'metric') {
      base.subSeries = 'fine'
      base.alternatives.push({ key: 'wiz_alt_fine_pitch', system: 'metric' })
    }
    base.warnings.push({ level: 'info', key: 'wiz_warn_vibration_lock' })
  }

  if (a.load === 'high_load') {
    base.toleranceScenarioKey = 'wiz_tol_close'
    base.toleranceInternal = base.primarySystem === 'metric' ? '5H' : '3B'
    base.toleranceExternal = base.primarySystem === 'metric' ? '6g' : '3A'
    base.sizeRangeKey = 'wiz_size_metric_heavy'
  }

  if (a.sealing === 'gasket' || a.process === 'pipe_fitting') {
    base.warnings.push({ level: 'warning', key: 'wiz_warn_fastener_not_pipe' })
  }

  base.processTipKeys = pickFastenerProcessTips(a)
  base.showTapDrill = a.process === 'tapped_hole' || a.process === 'sheet_metal' || a.process === 'die_cast' || a.process === 'plastic_insert'
  base.sampleRows = pickSampleRows(base.primarySystem, base.subSeries, 8)

  if (a.load === 'frequent') {
    base.alternatives.push({ key: 'wiz_alt_frequent_coating', system: base.primarySystem })
  }

  return base
}

/** @param {WizardAnswers} a */
function pickPipeProcessTips(a) {
  const tips = ['wiz_proc_pipe_sealant', 'wiz_proc_pipe_torque']
  if (a.process === 'tapped_hole') tips.push('wiz_proc_pipe_tap_caution')
  if (a.material === 'stainless') tips.push('wiz_proc_stainless_gall')
  return tips
}

/** @param {WizardAnswers} a */
function pickFastenerProcessTips(a) {
  const tips = []
  if (a.process === 'tapped_hole') {
    tips.push('wiz_proc_tap_chamfer', 'wiz_proc_tap_blind', 'wiz_proc_tap_drill_ref')
    if (a.material === 'aluminum') tips.push('wiz_proc_aluminum_engagement')
    if (a.material === 'plastic') tips.push('wiz_proc_plastic_tap')
    if (a.material === 'stainless') tips.push('wiz_proc_stainless_gall')
  }
  if (a.process === 'sheet_metal') tips.push('wiz_proc_sheet_forming')
  if (a.process === 'die_cast') tips.push('wiz_proc_die_cast_draft')
  if (a.process === 'plastic_insert') tips.push('wiz_proc_insert_brass')
  if (a.process === 'bolt_nut') tips.push('wiz_proc_bolt_engagement')
  if (a.load === 'vibration') tips.push('wiz_proc_vibration_fine')
  return tips.length ? tips : ['wiz_proc_general_fastener']
}

/**
 * @param {string|null} system
 * @param {string|null} subSeries
 * @param {number} limit
 */
function pickSampleRows(system, subSeries, limit) {
  if (!system) return []
  try {
    let rows
    if (system === 'metric') {
      rows = getThreadRows('metric', subSeries === 'fine' ? 'fine' : 'coarse')
    } else {
      rows = getThreadRows(system, system)
    }
    const priority = rows.filter((r) => r.priority === 1)
    const pool = priority.length >= 3 ? priority : rows
    const typical = pool.filter((r) => isTypicalSize(r))
    const list = (typical.length >= 3 ? typical : pool).slice(0, limit)
    return list
  } catch {
    return []
  }
}

/** @param {import('@/constants/thread-standards').ThreadRow} row */
function isTypicalSize(row) {
  if (row.system === 'metric' && row.nominal != null) {
    return [4, 5, 6, 8, 10, 12, 16, 20].includes(row.nominal)
  }
  if (row.system === 'unc' || row.system === 'unf') {
    return /#(4|6|8|10)|1\/4|5\/16|3\/8|1\/2/.test(row.designation)
  }
  if (['npt', 'g', 'r'].includes(row.system)) {
    return /1\/8|1\/4|3\/8|1\/2|3\/4|1[^0-9]/.test(row.designation)
  }
  return row.priority === 1
}
