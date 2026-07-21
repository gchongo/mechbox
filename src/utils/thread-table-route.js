import { THREAD_PURPOSE_ORDER, getThreadSystemDef } from '@/constants/thread-standards/taxonomy'

export const DEFAULT_NAV_KEY = 'catalog|fastener|metric_coarse'

/** 已从左侧导航移除的公制入口，统一落到 metric_coarse */
const MERGED_METRIC_NAV_IDS = new Set(['metric_fine', 'metric_extra_fine', 'metric_small_s'])

const DESIGN_STEPS = new Set(['wizard', 'tolerance', 'engagement', 'tapDrill', 'mfg'])
const TOOL_STEPS = new Set(['overview', 'parse', 'compare', 'misconfig', 'glossary'])

/**
 * @param {string|undefined|null} raw
 * @returns {string}
 */
export function normalizeNavKey(raw) {
  if (!raw || typeof raw !== 'string') return DEFAULT_NAV_KEY
  const key = decodeURIComponent(raw.trim())
  const parts = key.split('|')
  if (parts.length < 2) return DEFAULT_NAV_KEY

  const [mode, a, b] = parts
  if (mode === 'catalog') {
    if (!THREAD_PURPOSE_ORDER.includes(a)) return DEFAULT_NAV_KEY
    if (MERGED_METRIC_NAV_IDS.has(b)) return DEFAULT_NAV_KEY
    const def = getThreadSystemDef(b)
    if (!def || def.purpose !== a) {
      const fallback = getThreadSystemDef('metric_coarse')
      return fallback ? `catalog|${fallback.purpose}|${fallback.id}` : DEFAULT_NAV_KEY
    }
    return `catalog|${a}|${b}`
  }
  if (mode === 'design') {
    return DESIGN_STEPS.has(a) ? `design|${a}` : 'design|wizard'
  }
  if (mode === 'tools') {
    return TOOL_STEPS.has(a) ? `tools|${a}` : 'tools|parse'
  }
  return DEFAULT_NAV_KEY
}

/**
 * @param {import('vue-router').LocationQuery} query
 */
export function navKeyFromQuery(query) {
  const raw = query.nav ?? query.view
  if (raw == null || raw === '') return DEFAULT_NAV_KEY
  return normalizeNavKey(Array.isArray(raw) ? raw[0] : String(raw))
}

/**
 * @param {import('vue-router').LocationQuery} query
 * @returns {string[]}
 */
export function compareIdsFromQuery(query) {
  const raw = query.cmp ?? query.compare
  if (raw == null || raw === '') return []
  const s = Array.isArray(raw) ? raw[0] : String(raw)
  return s
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3)
}

/**
 * @param {import('vue-router').LocationQuery} query
 */
export function highlightFromQuery(query) {
  const raw = query.hl ?? query.row
  if (raw == null || raw === '') return ''
  return Array.isArray(raw) ? raw[0] : String(raw)
}

/**
 * @param {{ navKey?: string, compareIds?: string[], highlightRowId?: string }} state
 */
export function buildThreadTableQuery(state) {
  /** @type {Record<string, string>} */
  const q = { nav: normalizeNavKey(state.navKey ?? DEFAULT_NAV_KEY) }
  const cmp = (state.compareIds ?? []).filter(Boolean).slice(0, 3)
  if (cmp.length) q.cmp = cmp.join(',')
  if (state.highlightRowId) q.hl = state.highlightRowId
  return q
}

/**
 * @param {Record<string, string|undefined|null>} a
 * @param {Record<string, string|undefined|null>} b
 */
export function threadTableQueryEquals(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    const va = a[k] ?? undefined
    const vb = b[k] ?? undefined
    if (va !== vb) return false
  }
  return true
}
