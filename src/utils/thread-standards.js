import { getAllThreadRows, getThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import { expandSearchAliases } from '@/constants/thread-standards/aliases'

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
 * @typedef {object} ParseSegment
 * @property {string} text
 * @property {string} role
 */

/**
 * @typedef {object} ParsedThreadMark
 * @property {string} raw
 * @property {string} normalized
 * @property {string|null} system
 * @property {string|null} series
 * @property {'RH'|'LH'|null} hand
 * @property {string|null} toleranceExternal
 * @property {string|null} toleranceInternal
 * @property {number|null} nominal
 * @property {number|null} pitch
 * @property {number|null} tpi
 * @property {ParseSegment[]} segments
 * @property {ThreadRow[]} matchedRows
 * @property {ThreadRow|null} primaryMatch
 */

/**
 * @param {ThreadRow[]} rows
 * @param {{
 *   query?: string,
 *   priority?: string|number,
 *   diameterMin?: number|string,
 *   diameterMax?: number|string,
 *   tpiMin?: number|string,
 *   tpiMax?: number|string,
 * }} filters
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
  const dMin = parseFilterNum(filters.diameterMin)
  const dMax = parseFilterNum(filters.diameterMax)
  if (dMin != null) {
    list = list.filter((row) => rowSize(row) >= dMin)
  }
  if (dMax != null) {
    list = list.filter((row) => rowSize(row) <= dMax)
  }
  const tpiMin = parseFilterNum(filters.tpiMin)
  const tpiMax = parseFilterNum(filters.tpiMax)
  if (tpiMin != null) {
    list = list.filter((row) => row.tpi != null && row.tpi >= tpiMin)
  }
  if (tpiMax != null) {
    list = list.filter((row) => row.tpi != null && row.tpi <= tpiMax)
  }
  return list
}

function parseFilterNum(v) {
  if (v === '' || v == null || Number.isNaN(Number(v))) return null
  return Number(v)
}

function rowSize(row) {
  return row.nominal ?? row.major
}

function normalizeQuery(q) {
  return expandSearchAliases(q)
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
  if (tokens.includes(q)) return true
  if (q.startsWith('m') && tokens.includes(q)) return true
  return tokens.includes(q.replace(/-/g, '')) || designationLooseMatch(row.designation, q)
}

function designationLooseMatch(designation, q) {
  const d = designation.toLowerCase().replace(/×/g, 'x').replace(/\s+/g, '')
  return d.includes(q) || q.includes(d.replace(/unc|unf|npt/g, ''))
}

function normalizeMarkInput(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/×/g, 'x')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
}

/** @deprecated use parseThreadMark */
export function parseThreadDesignation(input) {
  const p = parseThreadMark(input)
  if (!p) return null
  return {
    system: p.system,
    nominal: p.nominal,
    pitch: p.pitch,
    tolerance: p.toleranceExternal,
    designation: p.raw,
  }
}

/** Full mark parser with segments and row matching */
export function parseThreadMark(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  const normalized = normalizeMarkInput(raw)
  const hand = /\bLH\b/i.test(raw) ? 'LH' : /\bRH\b/i.test(raw) ? 'RH' : null
  const compact = normalized.toLowerCase().replace(/\s+/g, '')

  /** @type {ParsedThreadMark} */
  const base = {
    raw,
    normalized,
    system: null,
    series: null,
    hand,
    toleranceExternal: null,
    toleranceInternal: null,
    nominal: null,
    pitch: null,
    tpi: null,
    segments: [],
    matchedRows: [],
    primaryMatch: null,
  }

  const metric = compact.match(/^m(\d+(?:\.\d+)?)(?:x(\d+(?:\.\d+)?))?(?:-(\d+[gh]))?(?:-lh)?$/i)
    || normalized.match(/^M\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?(?:\s*-\s*(\d+[ghGH]))?/i)
  if (metric) {
    base.system = 'metric'
    base.series = metric[2] ? 'fine' : 'coarse'
    base.nominal = Number(metric[1])
    base.pitch = metric[2] ? Number(metric[2]) : null
    base.toleranceExternal = metric[3] ? metric[3].toLowerCase() : null
    base.segments = buildMetricSegments(raw, base)
    return attachMatches(base)
  }

  const unified = normalized.match(/^([\d#/.]+)\s*-\s*(\d+(?:\.\d+)?)\s*(UNC|UNF|UNEF|UNS|BSW|BSF)(?:\s*-\s*(\d+[AB]))?/i)
  if (unified) {
    base.system = unified[3].toLowerCase()
    base.series = base.system
    base.tpi = Number(unified[2])
    base.pitch = tpiToPitch(base.tpi)
    const tol = unified[4]
    if (tol) {
      if (/A/i.test(tol)) base.toleranceExternal = tol.toUpperCase()
      else base.toleranceInternal = tol.toUpperCase()
    }
    base.segments = buildUnifiedSegments(raw, unified)
    if (base.system === 'bsw' || base.system === 'bsf') {
      return attachWhitworthMatches(base)
    }
    return attachMatches(base)
  }

  const tr = compact.match(/^tr(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/i)
    || normalized.match(/^Tr\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i)
  if (tr) {
    base.system = 'tr'
    base.series = 'tr'
    base.nominal = Number(tr[1])
    base.pitch = Number(tr[2])
    base.segments = [
      { text: `Tr${tr[1]}`, role: 'trPrefix' },
      { text: `×${tr[2]}`, role: 'pitch' },
    ]
    return attachMatches(base)
  }

  const acme = normalized.match(/^([\d#/.]+)\s*-\s*(\d+)\s*ACME/i)
  if (acme) {
    base.system = 'acme'
    base.series = 'acme'
    base.tpi = Number(acme[2])
    base.pitch = tpiToPitch(base.tpi)
    base.segments = buildUnifiedSegments(raw, [acme[1], acme[2], 'ACME', null])
    return attachMatches(base)
  }

  const nptf = normalized.match(/^(\d+\/\d+|\d+(?:-\d+\/\d+)?|\d+)\s*-\s*(\d+(?:\.\d+)?)\s*NPTF/i)
  if (nptf) {
    base.system = 'nptf'
    base.series = 'nptf'
    base.tpi = Number(nptf[2])
    base.segments = [{ text: raw, role: 'pipeDrySeal' }]
    return attachMatches(base)
  }

  const npt = normalized.match(/^(\d+\/\d+|\d+)\s*-\s*(\d+(?:\.\d+)?)\s*NPT/i)
  if (npt) {
    base.system = 'npt'
    base.series = 'npt'
    base.tpi = Number(npt[2])
    base.segments = [{ text: raw, role: 'pipeFull' }]
    return attachMatches(base)
  }

  const g = normalized.match(/^G\s*(\d+\/\d+|\d+)/i)
  if (g) {
    base.system = 'g'
    base.series = 'g'
    base.segments = [{ text: `G${g[1]}`, role: 'pipeParallel' }]
    return attachMatches(base)
  }

  const r = normalized.match(/^(?:R|Rc)\s*(\d+\/\d+|\d+)/i)
  if (r) {
    base.system = 'r'
    base.series = 'r'
    base.segments = [{ text: raw.match(/^(?:R|Rc)\s*(\d+\/\d+|\d+)/i)?.[0] ?? raw, role: 'pipeTaper' }]
    return attachMatches(base)
  }

  base.segments = [{ text: raw, role: 'unknown' }]
  base.matchedRows = searchAllRows(compact)
  base.primaryMatch = base.matchedRows[0] ?? null
  if (base.primaryMatch) base.system = base.primaryMatch.system
  return base
}

function buildMetricSegments(raw, parsed) {
  const segs = [{ text: raw.match(/^M\s*\d+/i)?.[0] ?? `M${parsed.nominal}`, role: 'metricPrefix' }]
  if (parsed.pitch) {
    segs.push({ text: `×${parsed.pitch}`, role: 'pitch' })
  }
  if (parsed.toleranceExternal) {
    segs.push({ text: `-${parsed.toleranceExternal}`, role: 'toleranceExt' })
  }
  return segs
}

function buildUnifiedSegments(raw, m) {
  return [
    { text: m[1], role: 'unifiedSize' },
    { text: `-${m[2]}`, role: 'tpi' },
    { text: ` ${m[3].toUpperCase()}`, role: 'series' },
    ...(m[4] ? [{ text: `-${m[4].toUpperCase()}`, role: /A/i.test(m[4]) ? 'toleranceExt' : 'toleranceInt' }] : []),
  ]
}

function attachMatches(parsed) {
  parsed.matchedRows = findMatchingRows(parsed)
  parsed.primaryMatch = parsed.matchedRows[0] ?? null
  return parsed
}

function attachWhitworthMatches(parsed) {
  parsed.matchedRows = findMatchingRows(parsed)
  parsed.primaryMatch = parsed.matchedRows[0] ?? null
  parsed.referenceOnly = !parsed.primaryMatch
  return parsed
}

/** @param {ParsedThreadMark} parsed */
export function findMatchingRows(parsed) {
  if (!parsed.system) return searchAllRows(normalizeQuery(parsed.raw))
  const all = getAllThreadRows().filter((r) => r.system === parsed.system)

  if (parsed.system === 'metric') {
    let list = all.filter((r) => r.nominal === parsed.nominal)
    if (parsed.pitch != null) {
      list = list.filter((r) => r.pitch != null && Math.abs(r.pitch - parsed.pitch) < 0.001)
      if (/[x×]/i.test(parsed.raw)) {
        const explicit = list.filter((r) => /[x×]/i.test(r.designation))
        if (explicit.length) list = explicit
      } else if (parsed.series === 'coarse') {
        list = list.filter((r) => r.subSeries === 'coarse')
      }
    } else if (parsed.series === 'coarse') {
      list = list.filter((r) => r.subSeries === 'coarse')
    }
    return list.length ? list : all.filter((r) => designationLooseMatch(r.designation, normalizeQuery(parsed.raw)))
  }

  if (parsed.system === 'tr') {
    let list = all
    if (parsed.nominal != null) list = list.filter((r) => r.nominal === parsed.nominal)
    if (parsed.pitch != null) {
      list = list.filter((r) => r.pitch != null && Math.abs(r.pitch - parsed.pitch) < 0.001)
    }
    return list.length ? list : all.filter((r) => designationLooseMatch(r.designation, normalizeQuery(parsed.raw)))
  }

  if (parsed.system === 'unc' || parsed.system === 'unf' || parsed.system === 'unef' || parsed.system === 'uns') {
    const q = normalizeQuery(parsed.raw)
    const hits = all.filter((r) => designationLooseMatch(r.designation, q))
    if (hits.length) return hits
    if (parsed.tpi) {
      return all.filter((r) => r.tpi === parsed.tpi)
    }
  }

  if (parsed.system === 'acme') {
    const q = normalizeQuery(parsed.raw)
    return all.filter((r) => designationLooseMatch(r.designation, q))
  }

  if (parsed.system === 'bsw' || parsed.system === 'bsf') {
    const q = normalizeQuery(parsed.raw)
    const hits = all.filter((r) => r.system === parsed.system && designationLooseMatch(r.designation, q))
    if (hits.length) return hits
    if (parsed.tpi) {
      return all.filter((r) => r.system === parsed.system && r.tpi === parsed.tpi)
    }
  }

  if (['npt', 'nptf', 'g', 'r'].includes(parsed.system)) {
    const q = normalizeQuery(parsed.raw)
    return all.filter((r) => designationLooseMatch(r.designation, q))
  }

  return []
}

function searchAllRows(q) {
  if (!q || q.length < 2) return []
  return getAllThreadRows().filter((r) => rowMatchesQuery(r, q)).slice(0, 8)
}

export function findRowById(id) {
  return getAllThreadRows().find((r) => r.id === id) ?? null
}

/** @param {ThreadRow} row */
export function getThreadNeighbors(row) {
  const pool = getRowsForSystem(row)
  const sorted = [...pool].sort(sortBySize)
  const idx = sorted.findIndex((r) => r.id === row.id)
  const prev = idx > 0 ? sorted[idx - 1] : null
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null

  let siblings = []
  if (row.system === 'metric' && row.nominal != null) {
    siblings = getAllThreadRows().filter(
      (r) => r.system === 'metric' && r.nominal === row.nominal && r.id !== row.id,
    )
  }
  if (row.system === 'unc' || row.system === 'unf') {
    const major = row.nominal ?? row.major
    siblings = getAllThreadRows().filter(
      (r) =>
        (r.system === 'unc' || r.system === 'unf') &&
        Math.abs((r.nominal ?? r.major) - major) < 0.001 &&
        r.id !== row.id,
    )
  }

  return { prev, next, siblings }
}

function getRowsForSystem(row) {
  if (row.system === 'metric') {
    return getThreadRows('metric', row.subSeries)
  }
  return getThreadRows(row.system, row.system)
}

function sortBySize(a, b) {
  const na = a.nominal ?? a.major
  const nb = b.nominal ?? b.major
  if (na !== nb) return na - nb
  return (a.pitch ?? 0) - (b.pitch ?? 0)
}

export const COMPARE_FIELD_KEYS = [
  'system',
  'designation',
  'threadAngle',
  'pitchOrTpi',
  'major',
  'pitchDiameter',
  'minor',
  'taper',
  'sealing',
  'toleranceExternal',
  'toleranceInternal',
  'interchangeable',
]

/** @param {ThreadRow[]} rows */
export function buildCompareMatrix(rows) {
  const list = rows.filter(Boolean).slice(0, 3)
  if (list.length < 2) return { rows: list, fields: [], diffs: {} }

  const fields = COMPARE_FIELD_KEYS.map((key) => {
    const values = list.map((r) => getCompareValue(r, key))
    const unique = new Set(values.map(String))
    return { key, values, isDiff: unique.size > 1 }
  })

  const diffs = Object.fromEntries(fields.filter((f) => f.isDiff).map((f) => [f.key, true]))
  return { rows: list, fields, diffs }
}

function getCompareValue(row, key) {
  switch (key) {
    case 'system':
      return row.system
    case 'designation':
      return row.designation
    case 'threadAngle':
      return `${row.threadAngle}°`
    case 'pitchOrTpi':
      return row.tpi ? `${row.tpi} TPI` : row.pitch != null ? String(row.pitch) : '—'
    case 'major':
      return formatDim(row, row.major)
    case 'pitchDiameter':
      return formatDim(row, row.pitchDiameter)
    case 'minor':
      return formatDim(row, row.minor)
    case 'taper':
      return row.taper || '—'
    case 'sealing':
      return row.sealing || '—'
    case 'toleranceExternal':
      return row.toleranceExternal
    case 'toleranceInternal':
      return row.toleranceInternal
    case 'interchangeable':
      return row.compatibilityKey ? 'no' : row.system === 'g' && row.sealing === 'parallel_seal' ? 'partial' : 'same_system'
    default:
      return '—'
  }
}

/** Preset compare row ids */
export function getComparePresets() {
  const all = getAllThreadRows()
  const find = (pred) => all.find(pred)
  return [
    {
      id: 'pipe-half',
      rowIds: [
        find((r) => r.designation.includes('1/2-14 NPT'))?.id,
        find((r) => r.designation === 'G1/2')?.id,
        find((r) => r.designation === 'R1/2')?.id,
      ].filter(Boolean),
    },
    {
      id: 'metric-m10',
      rowIds: [
        find((r) => r.designation === 'M10')?.id,
        find((r) => r.designation === 'M10×1.25')?.id,
        find((r) => r.designation === 'M10×1')?.id,
      ].filter(Boolean),
    },
    {
      id: 'un-quarter',
      rowIds: [
        find((r) => r.designation.startsWith('1/4-20 UNC'))?.id,
        find((r) => r.designation.startsWith('1/4-28 UNF'))?.id,
      ].filter(Boolean),
    },
    {
      id: 'un-quarter-series',
      rowIds: [
        find((r) => r.designation.startsWith('1/4-20 UNC'))?.id,
        find((r) => r.designation.startsWith('1/4-28 UNF'))?.id,
        find((r) => r.designation.startsWith('1/4-32 UNEF'))?.id,
      ].filter(Boolean),
    },
    {
      id: 'pipe-npt-nptf',
      rowIds: [
        find((r) => r.designation === '1/2-14 NPT')?.id,
        find((r) => r.designation === '1/2-14 NPTF')?.id,
      ].filter(Boolean),
    },
    {
      id: 'tr-drive',
      rowIds: [
        find((r) => r.designation === 'Tr20×4')?.id,
        find((r) => r.designation === 'Tr24×5')?.id,
      ].filter(Boolean),
    },
    {
      id: 'power-tr-acme',
      rowIds: [
        find((r) => r.designation === 'Tr20×4')?.id,
        find((r) => r.designation === '1/2-10 ACME')?.id,
      ].filter(Boolean),
    },
    {
      id: 'whitworth-quarter',
      rowIds: [
        find((r) => r.designation === '1/4-20 BSW')?.id,
        find((r) => r.designation.startsWith('1/4-20 UNC'))?.id,
        find((r) => r.designation === 'M6')?.id,
      ].filter(Boolean),
    },
  ]
}

export function getSystemMeta(systemId) {
  return THREAD_SYSTEMS.find((s) => s.id === systemId) ?? null
}

export function tpiToPitch(tpi) {
  if (!tpi) return null
  return Math.round((25.4 / tpi) * 1000) / 1000
}

export function pitchToTpi(pitch) {
  if (!pitch) return null
  return Math.round((25.4 / pitch) * 100) / 100
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
