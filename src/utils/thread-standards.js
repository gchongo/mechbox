/**
 * @typedef {object} ThreadRow
 * @property {string} id
 * @property {string} system
 * @property {string} subSeries
 * @property {string} designation
 * @property {number} [priority]
 * @property {string} standardRef
 * @property {'mm'|'in'} unit
 * @property {number} [nominal]
 * @property {number} major
 * @property {number} pitchDiameter
 * @property {number|null} minor
 * @property {number} [pitch]
 * @property {number} [tpi]
 * @property {number} threadAngle
 * @property {number|null} tapDrill
 * @property {string} toleranceExternal
 * @property {string} toleranceInternal
 * @property {string} taper
 * @property {string} sealing
 * @property {string} [compatibilityKey]
 * @property {string} [compatibility]
 * @property {string} usageKey
 */

/**
 * @param {ThreadRow[]} rows
 * @param {{ query?: string, priority?: string|number }} filters
 */
export function filterThreadRows(rows, filters = {}) {
  let list = rows
  const q = normalizeQuery(filters.query)
  if (q) {
    list = list.filter((row) => rowMatchesQuery(row, q))
  }
  if (filters.priority !== '' && filters.priority != null && filters.priority !== 'all') {
    const p = Number(filters.priority)
    list = list.filter((row) => row.priority === p)
  }
  return list
}

function normalizeQuery(q) {
  return String(q ?? '')
    .trim()
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/\s+/g, '')
}

function rowMatchesQuery(row, q) {
  const tokens = [
    row.designation,
    row.system,
    row.subSeries,
    row.standardRef,
    row.nominal != null ? String(row.nominal) : '',
    row.pitch != null ? String(row.pitch) : '',
    row.tpi != null ? String(row.tpi) : '',
  ]
    .join(' ')
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/\s+/g, '')
  return tokens.includes(q) || tokens.includes(q.replace(/^m/, 'm'))
}

/** Parse common designation strings to search hints (does not validate standard). */
export function parseThreadDesignation(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  const metric = raw.match(/^M\s*(\d+(?:\.\d+)?)\s*(?:[x×]\s*(\d+(?:\.\d+)?))?(?:\s*-\s*(\d+[ghGH]))?/i)
  if (metric) {
    return {
      system: 'metric',
      nominal: Number(metric[1]),
      pitch: metric[2] ? Number(metric[2]) : null,
      tolerance: metric[3] ?? null,
      designation: raw,
    }
  }
  const npt = raw.match(/^(\d+\/\d+|\d+)\s*[-–]\s*(\d+(?:\.\d+)?)\s*NPT/i)
  if (npt) return { system: 'npt', designation: raw }
  const g = raw.match(/^G\s*(\d+\/\d+|\d+)/i)
  if (g) return { system: 'g', designation: raw }
  const r = raw.match(/^R\s*(\d+\/\d+|\d+)/i)
  if (r) return { system: 'r', designation: raw }
  const unc = raw.match(/^([\d#/.\-]+)\s*[-–]\s*(\d+)\s*UNC/i)
  if (unc) return { system: 'unc', designation: raw }
  const unf = raw.match(/^([\d#/.\-]+)\s*[-–]\s*(\d+)\s*UNF/i)
  if (unf) return { system: 'unf', designation: raw }
  return { system: null, designation: raw }
}

export function formatPitchDisplay(row) {
  if (row.tpi) return `${row.tpi} TPI`
  if (row.pitch != null) return String(row.pitch)
  return '—'
}

export function formatDim(row, value) {
  if (value == null || Number.isNaN(value)) return '—'
  const d = row.unit === 'in' ? 4 : 3
  return value.toFixed(d)
}
