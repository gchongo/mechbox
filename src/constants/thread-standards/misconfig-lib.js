/**
 * 常见螺纹误配案例库 — 静态条目，文案 key 在 calc.pages.thread-table
 * @typedef {object} MisconfigEntry
 * @property {string} id
 * @property {'error'|'warning'|'info'} severity
 * @property {string[]} tags
 * @property {string} titleKey
 * @property {string} descKey
 * @property {string} fixKey
 * @property {string[]} [systems]
 * @property {string} [comparePreset]
 */

export const MISCONFIG_ENTRIES = /** @type {MisconfigEntry[]} */ ([
  {
    id: 'npt_vs_g',
    severity: 'error',
    tags: ['pipe', 'seal', 'npt', 'g', 'bsp'],
    titleKey: 'mis_npt_vs_g_title',
    descKey: 'mis_npt_vs_g_desc',
    fixKey: 'mis_npt_vs_g_fix',
    systems: ['npt', 'g'],
    comparePreset: 'pipe-half',
  },
  {
    id: 'npt_vs_r',
    severity: 'error',
    tags: ['pipe', 'seal', 'npt', 'r', 'bspt'],
    titleKey: 'mis_npt_vs_r_title',
    descKey: 'mis_npt_vs_r_desc',
    fixKey: 'mis_npt_vs_r_fix',
    systems: ['npt', 'r'],
    comparePreset: 'pipe-half',
  },
  {
    id: 'npt_vs_nptf',
    severity: 'warning',
    tags: ['pipe', 'seal', 'npt', 'nptf', 'dry'],
    titleKey: 'mis_npt_vs_nptf_title',
    descKey: 'mis_npt_vs_nptf_desc',
    fixKey: 'mis_npt_vs_nptf_fix',
    systems: ['npt', 'nptf'],
    comparePreset: 'pipe-npt-nptf',
  },
  {
    id: 'g_as_taper',
    severity: 'error',
    tags: ['pipe', 'g', 'seal', 'gasket'],
    titleKey: 'mis_g_taper_title',
    descKey: 'mis_g_taper_desc',
    fixKey: 'mis_g_taper_fix',
    systems: ['g'],
  },
  {
    id: 'nominal_only',
    severity: 'warning',
    tags: ['pipe', 'general'],
    titleKey: 'mis_nominal_title',
    descKey: 'mis_nominal_desc',
    fixKey: 'mis_nominal_fix',
    systems: ['npt', 'g', 'r'],
  },
  {
    id: 'unc_unf_mix',
    severity: 'warning',
    tags: ['fastener', 'unc', 'unf', 'pitch'],
    titleKey: 'mis_unc_unf_title',
    descKey: 'mis_unc_unf_desc',
    fixKey: 'mis_unc_unf_fix',
    systems: ['unc', 'unf'],
    comparePreset: 'un-quarter',
  },
  {
    id: 'unef_pitch_mix',
    severity: 'warning',
    tags: ['fastener', 'unef', 'unc', 'unf', 'pitch'],
    titleKey: 'mis_unef_pitch_title',
    descKey: 'mis_unef_pitch_desc',
    fixKey: 'mis_unef_pitch_fix',
    systems: ['unef', 'unc', 'unf'],
    comparePreset: 'un-quarter-series',
  },
  {
    id: 'whitworth_unc',
    severity: 'error',
    tags: ['fastener', 'whitworth', 'bsw', 'unc', 'legacy'],
    titleKey: 'mis_whitworth_unc_title',
    descKey: 'mis_whitworth_unc_desc',
    fixKey: 'mis_whitworth_unc_fix',
    systems: ['bsw', 'unc'],
    comparePreset: 'whitworth-quarter',
  },
  {
    id: 'tr_as_fastener',
    severity: 'info',
    tags: ['power', 'tr', 'fastener'],
    titleKey: 'mis_tr_fastener_title',
    descKey: 'mis_tr_fastener_desc',
    fixKey: 'mis_tr_fastener_fix',
    systems: ['tr'],
    comparePreset: 'tr-drive',
  },
  {
    id: 'metric_coarse_fine',
    severity: 'warning',
    tags: ['fastener', 'metric', 'pitch'],
    titleKey: 'mis_metric_pitch_title',
    descKey: 'mis_metric_pitch_desc',
    fixKey: 'mis_metric_pitch_fix',
    systems: ['metric'],
    comparePreset: 'metric-m10',
  },
  {
    id: 'lh_not_marked',
    severity: 'info',
    tags: ['fastener', 'lh'],
    titleKey: 'mis_lh_title',
    descKey: 'mis_lh_desc',
    fixKey: 'mis_lh_fix',
    systems: ['metric', 'unc', 'unf'],
  },
  {
    id: 'tap_drill_only',
    severity: 'warning',
    tags: ['manufacturing', 'tap'],
    titleKey: 'mis_tap_drill_title',
    descKey: 'mis_tap_drill_desc',
    fixKey: 'mis_tap_drill_fix',
    systems: ['metric', 'unc', 'unf'],
  },
  {
    id: 'pipe_no_sealant',
    severity: 'warning',
    tags: ['pipe', 'npt', 'r', 'seal'],
    titleKey: 'mis_no_sealant_title',
    descKey: 'mis_no_sealant_desc',
    fixKey: 'mis_no_sealant_fix',
    systems: ['npt', 'r'],
  },
  {
    id: 'plastic_direct_tap',
    severity: 'warning',
    tags: ['manufacturing', 'plastic'],
    titleKey: 'mis_plastic_title',
    descKey: 'mis_plastic_desc',
    fixKey: 'mis_plastic_fix',
    systems: ['metric'],
  },
])

/**
 * @param {string} query
 * @param {string} [tagFilter]
 */
export function filterMisconfigEntries(query = '', tagFilter = '') {
  const q = query.trim().toLowerCase()
  return MISCONFIG_ENTRIES.filter((entry) => {
    if (tagFilter && !entry.tags.includes(tagFilter)) return false
    if (!q) return true
    return (
      entry.id.includes(q)
      || entry.tags.some((t) => t.includes(q))
    )
  })
}

export const MISCONFIG_TAG_OPTIONS = [
  'pipe',
  'fastener',
  'manufacturing',
  'seal',
  'npt',
  'g',
  'metric',
]
