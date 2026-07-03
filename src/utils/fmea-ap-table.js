/**
 * AIAG & VDA FMEA Handbook (2019) — Action Priority lookup
 * Rows: severity band × detection band; columns: occurrence band
 */

const AP_TABLE = [
  // S = 1
  [
    ['L', 'L', 'L', 'L', 'L'],
    ['L', 'L', 'L', 'L', 'M'],
    ['L', 'L', 'L', 'L', 'M'],
    ['L', 'L', 'L', 'L', 'M'],
  ],
  // S = 2–3
  [
    ['L', 'L', 'L', 'L', 'L'],
    ['L', 'L', 'L', 'L', 'M'],
    ['L', 'L', 'L', 'L', 'M'],
    ['L', 'L', 'L', 'L', 'M'],
  ],
  // S = 4–6
  [
    ['L', 'L', 'L', 'M', 'M'],
    ['L', 'L', 'M', 'M', 'H'],
    ['L', 'L', 'H', 'H', 'H'],
    ['L', 'M', 'H', 'H', 'H'],
  ],
  // S = 7–8
  [
    ['L', 'L', 'M', 'M', 'M'],
    ['L', 'L', 'H', 'H', 'H'],
    ['L', 'M', 'H', 'H', 'H'],
    ['L', 'M', 'H', 'H', 'H'],
  ],
  // S = 9–10
  [
    ['L', 'L', 'H', 'H', 'H'],
    ['L', 'L', 'H', 'H', 'H'],
    ['M', 'M', 'H', 'H', 'H'],
    ['M', 'M', 'H', 'H', 'H'],
  ],
]

function severityBand(S) {
  if (S <= 1) return 0
  if (S <= 3) return 1
  if (S <= 6) return 2
  if (S <= 8) return 3
  return 4
}

function occurrenceBand(O) {
  if (O <= 1) return 0
  if (O <= 3) return 1
  if (O <= 5) return 2
  if (O <= 7) return 3
  return 4
}

function detectionBand(D) {
  if (D <= 1) return 0
  if (D <= 4) return 1
  if (D <= 6) return 2
  return 3
}

/** @returns {'H'|'M'|'L'} */
export function lookupActionPriority(S, O, D) {
  const s = Math.min(Math.max(Math.round(S ?? 1), 1), 10)
  const o = Math.min(Math.max(Math.round(O ?? 1), 1), 10)
  const d = Math.min(Math.max(Math.round(D ?? 1), 1), 10)
  return AP_TABLE[severityBand(s)][detectionBand(d)][occurrenceBand(o)]
}

export const AP_RANK = { H: 3, M: 2, L: 1 }
