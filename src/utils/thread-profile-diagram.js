/**
 * 螺纹牙型示意图 — 内外螺纹啮合剖面 + 工程标注
 * @typedef {'triangular_60'|'triangular_55'|'triangular_60_taper'|'triangular_55_taper'|'trapezoidal_tr'|'trapezoidal_acme'|'square'|'buttress'|'round'|'ball_screw'} ThreadDiagramKind
 */

const SQRT3 = Math.sqrt(3)

/** @param {import('@/constants/thread-standards/taxonomy').ThreadSystemDef|null|undefined} def */
export function resolveDiagramKind(def) {
  if (!def) return 'triangular_60'
  const { profile, angle, taper, parentShape } = def
  const isTaper = taper === 'taper' || parentShape === 'conical'

  if (profile === 'trapezoidal') {
    return angle === 29 ? 'trapezoidal_acme' : 'trapezoidal_tr'
  }
  if (profile === 'square') return 'square'
  if (profile === 'buttress') return 'buttress'
  if (profile === 'round') return 'round'
  if (profile === 'ball_screw') return 'ball_screw'

  if (angle === 55) return isTaper ? 'triangular_55_taper' : 'triangular_55'
  if (isTaper) return 'triangular_60_taper'
  return 'triangular_60'
}

/** @param {ThreadDiagramKind} kind @param {'external'|'internal'} side */
export function buildProfilePath(kind, side) {
  const scene = buildDetailedDiagram(kind)
  return side === 'external' ? scene.legacyExternalPath : scene.legacyInternalPath
}

export function buildProfileExtras() {
  return []
}

export function showTaperOverlay(kind) {
  return kind === 'triangular_60_taper' || kind === 'triangular_55_taper'
}

export function taperOverlayPaths(kind) {
  const scene = buildDetailedDiagram(kind)
  return scene.taper ?? null
}

/**
 * @typedef {object} DiagramSample
 * @property {string} [designation]
 * @property {string} [pitch]
 * @property {string} [major]
 * @property {string} [pitchDia]
 * @property {string} [minor]
 * @property {string} [tapDrill]
 * @property {string} [toleranceExt]
 * @property {string} [toleranceInt]
 * @property {string} [taper]
 * @property {string} [sealing]
 * @property {string} [standard]
 */

/**
 * @param {ThreadDiagramKind} kind
 * @param {{ angle?: number, sample?: DiagramSample|null }} [options]
 */
export function buildDetailedDiagram(kind, options = {}) {
  const angle = options.angle ?? defaultAngle(kind)
  const builders = {
    triangular_60: () => buildTriangular60(false, angle),
    triangular_55: () => buildTriangular55(false, angle),
    triangular_60_taper: () => buildTriangular60(true, angle),
    triangular_55_taper: () => buildTriangular55(true, angle),
    trapezoidal_tr: () => buildTrapezoidal(angle, 'tr'),
    trapezoidal_acme: () => buildTrapezoidal(angle, 'acme'),
    square: () => buildSquare(),
    buttress: () => buildButtress(),
    round: () => buildRound(),
    ball_screw: () => buildBallScrew(),
  }
  const scene = (builders[kind] ?? builders.triangular_60)()
  scene.sampleParams = buildSampleParamRows(options.sample ?? null)
  return scene
}

function defaultAngle(kind) {
  if (kind === 'trapezoidal_acme') return 29
  if (kind === 'trapezoidal_tr') return 30
  if (kind.startsWith('triangular_55')) return 55
  if (kind === 'square') return 90
  if (kind === 'buttress') return 45
  return 60
}

/** @param {DiagramSample|null} sample */
function buildSampleParamRows(sample) {
  if (!sample) return []
  const rows = []
  const push = (key, label, value) => {
    if (value != null && value !== '' && value !== '—') rows.push({ key, label, value })
  }
  push('designation', 'designation', sample.designation)
  push('pitch', 'pitch', sample.pitch)
  push('major', 'major', sample.major)
  push('pitchDia', 'pitchDia', sample.pitchDia)
  push('minor', 'minor', sample.minor)
  push('tapDrill', 'tapDrill', sample.tapDrill)
  push('toleranceExt', 'toleranceExt', sample.toleranceExt)
  push('toleranceInt', 'toleranceInt', sample.toleranceInt)
  push('taper', 'taper', sample.taper)
  push('sealing', 'sealing', sample.sealing)
  push('standard', 'standard', sample.standard)
  return rows
}

function ptsToPath(points, close = false) {
  if (!points.length) return ''
  const [first, ...rest] = points
  let d = `M ${first[0]} ${first[1]}`
  for (const [x, y] of rest) d += ` L ${x} ${y}`
  if (close) d += ' Z'
  return d
}

function dimV(x, y1, y2, label, opts = {}) {
  const { ext = 0, side = 'left' } = opts
  const xa = side === 'left' ? x - ext : x + ext
  return {
    type: 'linear',
    x1: xa,
    y1,
    x2: xa,
    y2,
    label,
    labelX: side === 'left' ? xa - 4 : xa + 4,
    labelY: (y1 + y2) / 2 + 3,
    anchor: side === 'left' ? 'end' : 'start',
  }
}

function dimH(x1, x2, y, label, opts = {}) {
  const { ext = 8 } = opts
  const ya = y + ext
  return {
    type: 'linear',
    x1,
    y1: ya,
    x2,
    y2: ya,
    label,
    labelX: (x1 + x2) / 2,
    labelY: ya + 12,
    anchor: 'middle',
  }
}

function angleMarkAt(cx, cy, halfAngleDeg, label) {
  const r = 22
  const a = (halfAngleDeg * Math.PI) / 180
  const x1 = cx - r * Math.sin(a)
  const y1 = cy - r * Math.cos(a)
  const x2 = cx + r * Math.sin(a)
  const y2 = cy - r * Math.cos(a)
  return {
    cx,
    cy,
    r,
    x1,
    y1,
    x2,
    y2,
    label,
    labelX: cx,
    labelY: cy - r - 6,
  }
}

function diameterLeader(y, label) {
  return { type: 'diameter', y, label, x1: 358, x2: 462, labelX: 468, labelY: y + 3 }
}

function buildTriangular60(withTaper, angle) {
  const P = 52
  const H = (P * SQRT3) / 2
  const x0 = 118
  const teeth = 3
  const yPitch = 148
  const cf = P / 8

  const yMajor = yPitch - (3 * H) / 8
  const yMinor = yPitch + H / 4
  const yIntRoot = yPitch - H / 2 + H / 8
  const yIntCrest = yPitch + H / 4
  const ySharpCrest = yPitch - H / 2
  const ySharpRoot = yPitch + H / 2

  const extPts = []
  const intPts = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xr = xl + P
    extPts.push([xl, yMinor], [xl + P / 2 - cf / 2, yMajor], [xl + P / 2 + cf / 2, yMajor], [xr, yMinor])
    intPts.push([xl, yIntRoot], [xl + P / 2 - cf / 2, yIntCrest], [xl + P / 2 + cf / 2, yIntCrest], [xr, yIntRoot])
  }

  const xEnd = x0 + teeth * P
  const yBottom = yMinor + H / 3
  const yTop = yIntRoot - H / 6

  const extProfile = ptsToPath(extPts)
  const intProfile = ptsToPath(intPts)
  const extFill = `${extProfile} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`
  const intFill = `${intProfile} L ${xEnd} ${yTop} L ${x0} ${yTop} Z`

  const xc = x0 + P * 1.5
  const ghosts = [
    ptsToPath([[xc - P / 2, yMinor], [xc, ySharpCrest], [xc + P / 2, yMinor]]),
    ptsToPath([[xc - P / 2, yIntRoot], [xc, ySharpRoot], [xc + P / 2, yIntRoot]]),
  ]

  const dims = [
    dimV(72, ySharpCrest, ySharpRoot, 'H', { ext: 6 }),
    dimV(52, ySharpCrest, yMajor, 'H/8', { ext: 4 }),
    dimV(52, yPitch, ySharpCrest, 'H/2', { ext: 4 }),
    dimV(52, yMinor, ySharpRoot, 'H/4', { ext: 4 }),
    dimH(xc - P / 2, xc + P / 2, yMinor + H / 5, 'P'),
    diameterLeader(yMajor, 'd / D'),
    diameterLeader(yPitch, 'd₂ / D₂'),
    diameterLeader(yMinor, 'd₁ / D₁'),
  ]

  const scene = {
    viewBox: '0 0 560 300',
    regions: [
      { d: intFill, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: extFill, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: [
      { d: intProfile, stroke: '#2d6a62', width: 1.35 },
      { d: extProfile, stroke: '#374151', width: 1.35 },
    ],
    ghosts,
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims,
    angleMark: angleMarkAt(xc, yPitch, angle / 2, `${angle}°`),
    labels: [
      { text: 'internal', x: x0 + P * 0.4, y: yTop + 18 },
      { text: 'external', x: x0 + P * 0.4, y: yBottom - 8 },
    ],
    paramKeys: ['pitch', 'major', 'pitchDia', 'minor', 'tapDrill', 'toleranceExt', 'toleranceInt'],
    heightKeys: ['H', 'H/8', 'H/2', 'H/4'],
    diameterKeys: ['major', 'pitchDia', 'minor'],
    legacyExternalPath: extProfile,
    legacyInternalPath: intProfile,
    taper: null,
  }

  if (withTaper) {
    scene.taper = {
      x1: 88,
      y1: yBottom + 6,
      x2: xEnd + 36,
      y2: yTop - 4,
      labelX: xEnd + 8,
      labelY: yTop - 8,
      label: '1:16',
    }
    scene.paramKeys.push('taper', 'sealing')
  }

  return scene
}

function buildTriangular55(withTaper, angle) {
  const P = 52
  const H = P * 0.960491
  const x0 = 118
  const teeth = 3
  const yPitch = 148
  const cf = P / 6

  const yMajor = yPitch - (5 * H) / 12
  const yMinor = yPitch + H / 3
  const yIntRoot = yPitch - H / 2 + H / 6
  const yIntCrest = yPitch + H / 3
  const ySharpCrest = yPitch - H / 2
  const ySharpRoot = yPitch + H / 2

  const extPts = []
  const intPts = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xr = xl + P
    extPts.push([xl, yMinor], [xl + P / 2 - cf / 2, yMajor], [xl + P / 2 + cf / 2, yMajor], [xr, yMinor])
    intPts.push([xl, yIntRoot], [xl + P / 2 - cf / 2, yIntCrest], [xl + P / 2 + cf / 2, yIntCrest], [xr, yIntRoot])
  }

  const xEnd = x0 + teeth * P
  const yBottom = yMinor + H / 3
  const yTop = yIntRoot - H / 6
  const xc = x0 + P * 1.5

  const extProfile = ptsToPath(extPts)
  const intProfile = ptsToPath(intPts)

  const scene = {
    viewBox: '0 0 560 300',
    regions: [
      { d: `${intProfile} L ${xEnd} ${yTop} L ${x0} ${yTop} Z`, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: `${extProfile} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: [
      { d: intProfile, stroke: '#2d6a62', width: 1.35 },
      { d: extProfile, stroke: '#374151', width: 1.35 },
    ],
    ghosts: [
      ptsToPath([[xc - P / 2, yMinor], [xc, ySharpCrest], [xc + P / 2, yMinor]]),
      ptsToPath([[xc - P / 2, yIntRoot], [xc, ySharpRoot], [xc + P / 2, yIntRoot]]),
    ],
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims: [
      dimV(72, ySharpCrest, ySharpRoot, 'H', { ext: 6 }),
      dimV(52, ySharpCrest, yMajor, 'H/6', { ext: 4 }),
      dimV(52, yPitch, ySharpCrest, 'H/2', { ext: 4 }),
      dimV(52, yMinor, ySharpRoot, 'H/6', { ext: 4 }),
      dimH(xc - P / 2, xc + P / 2, yMinor + H / 5, 'P'),
      diameterLeader(yMajor, 'd / D'),
      diameterLeader(yPitch, 'd₂ / D₂'),
      diameterLeader(yMinor, 'd₁ / D₁'),
    ],
    angleMark: angleMarkAt(xc, yPitch, angle / 2, `${angle}°`),
    labels: [
      { text: 'internal', x: x0 + P * 0.4, y: yTop + 18 },
      { text: 'external', x: x0 + P * 0.4, y: yBottom - 8 },
    ],
    paramKeys: ['pitch', 'major', 'pitchDia', 'minor', 'tapDrill', 'toleranceExt', 'toleranceInt'],
    legacyExternalPath: extProfile,
    legacyInternalPath: intProfile,
    taper: withTaper
      ? { x1: 88, y1: yBottom + 6, x2: xEnd + 36, y2: yTop - 4, labelX: xEnd + 8, labelY: yTop - 8, label: '1:16' }
      : null,
  }
  if (withTaper) scene.paramKeys.push('taper', 'sealing')
  return scene
}

function buildTrapezoidal(angle, variant) {
  const P = 52
  const H = variant === 'acme' ? P * 0.5 : P * 0.5
  const x0 = 118
  const teeth = 3
  const yPitch = 148
  const flat = variant === 'acme' ? P * 0.37 : P * 0.366

  const yMajor = yPitch - H / 2
  const yMinor = yPitch + H / 2
  const yIntRoot = yPitch - H / 2 - H / 10
  const yIntCrest = yPitch + H / 2

  const extPts = []
  const intPts = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xr = xl + P
    extPts.push([xl, yMinor], [xl + (P - flat) / 2, yMajor], [xl + (P + flat) / 2, yMajor], [xr, yMinor])
    intPts.push([xl, yIntRoot], [xl + (P - flat) / 2, yIntCrest], [xl + (P + flat) / 2, yIntCrest], [xr, yIntRoot])
  }

  const xEnd = x0 + teeth * P
  const yBottom = yMinor + H / 2
  const yTop = yIntRoot - H / 4
  const xc = x0 + P * 1.5
  const extProfile = ptsToPath(extPts)
  const intProfile = ptsToPath(intPts)

  return {
    viewBox: '0 0 560 300',
    regions: [
      { d: `${intProfile} L ${xEnd} ${yTop} L ${x0} ${yTop} Z`, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: `${extProfile} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: [
      { d: intProfile, stroke: '#2d6a62', width: 1.35 },
      { d: extProfile, stroke: '#374151', width: 1.35 },
    ],
    ghosts: [],
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims: [
      dimV(72, yMajor, yMinor, 'H', { ext: 6 }),
      dimH(xc - P / 2, xc + P / 2, yMinor + H / 4, 'P'),
      diameterLeader(yMajor, 'd / D'),
      diameterLeader(yPitch, 'd₂ / D₂'),
      diameterLeader(yMinor, 'd₁ / D₁'),
    ],
    angleMark: angleMarkAt(xc, yPitch, angle / 2, `${angle}°`),
    labels: [
      { text: 'internal', x: x0 + P * 0.4, y: yTop + 18 },
      { text: 'external', x: x0 + P * 0.4, y: yBottom - 8 },
    ],
    paramKeys: ['pitch', 'major', 'pitchDia', 'minor', 'toleranceExt', 'toleranceInt'],
    legacyExternalPath: extProfile,
    legacyInternalPath: intProfile,
    taper: null,
  }
}

function buildSquare() {
  const P = 52
  const H = P * 0.5
  const x0 = 118
  const teeth = 3
  const yPitch = 148

  const extPts = []
  const intPts = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xr = xl + P
    extPts.push([xl, yPitch + H / 2], [xl, yPitch - H / 2], [xl + P / 2, yPitch - H / 2], [xl + P / 2, yPitch + H / 2], [xr, yPitch + H / 2])
    intPts.push([xl, yPitch - H / 2 - H / 8], [xl, yPitch + H / 2], [xl + P / 2, yPitch + H / 2], [xl + P / 2, yPitch - H / 2 - H / 8], [xr, yPitch - H / 2 - H / 8])
  }

  const xEnd = x0 + teeth * P
  const yBottom = yPitch + H + 10
  const yTop = yPitch - H - 18
  const xc = x0 + P * 1.5
  const extProfile = ptsToPath(extPts)
  const intProfile = ptsToPath(intPts)

  return {
    viewBox: '0 0 560 300',
    regions: [
      { d: `${intProfile} L ${xEnd} ${yTop} L ${x0} ${yTop} Z`, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: `${extProfile} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: [
      { d: intProfile, stroke: '#2d6a62', width: 1.35 },
      { d: extProfile, stroke: '#374151', width: 1.35 },
    ],
    ghosts: [],
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims: [
      dimV(72, yPitch - H / 2, yPitch + H / 2, 'H = P/2', { ext: 6 }),
      dimH(xc - P / 2, xc + P / 2, yPitch + H / 2 + 6, 'P'),
      diameterLeader(yPitch - H / 2, 'd / D'),
      diameterLeader(yPitch + H / 2, 'd₁ / D₁'),
    ],
    angleMark: null,
    labels: [
      { text: 'internal', x: x0 + P * 0.4, y: yTop + 18 },
      { text: 'external', x: x0 + P * 0.4, y: yBottom - 8 },
    ],
    paramKeys: ['pitch', 'major', 'minor'],
    legacyExternalPath: extProfile,
    legacyInternalPath: intProfile,
    taper: null,
  }
}

function buildButtress() {
  const P = 52
  const H = P * 0.52
  const x0 = 118
  const teeth = 3
  const yPitch = 148

  const extPts = []
  const intPts = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xr = xl + P
    extPts.push([xl, yPitch + H / 2], [xl + 6, yPitch - H / 2], [xl + P - 6, yPitch - H / 2 + 8], [xl + P - 2, yPitch - H / 2 + 8], [xr, yPitch + H / 2])
    intPts.push([xl, yPitch - H / 2 - 6], [xl + 6, yPitch + H / 2 - 8], [xl + P - 6, yPitch + H / 2], [xr, yPitch - H / 2 - 6])
  }

  const xEnd = x0 + teeth * P
  const yBottom = yPitch + H + 10
  const yTop = yPitch - H - 16
  const xc = x0 + P * 1.5
  const extProfile = ptsToPath(extPts)
  const intProfile = ptsToPath(intPts)

  return {
    viewBox: '0 0 560 300',
    regions: [
      { d: `${intProfile} L ${xEnd} ${yTop} L ${x0} ${yTop} Z`, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: `${extProfile} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: [
      { d: intProfile, stroke: '#2d6a62', width: 1.35 },
      { d: extProfile, stroke: '#374151', width: 1.35 },
    ],
    ghosts: [],
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims: [
      dimH(xc - P / 2, xc + P / 2, yPitch + H / 2 + 6, 'P'),
      diameterLeader(yPitch - H / 2, 'd / D'),
      diameterLeader(yPitch, 'd₂ / D₂'),
      diameterLeader(yPitch + H / 2, 'd₁ / D₁'),
    ],
    angleMark: { cx: xc, cy: yPitch, r: 20, x1: xc - 14, y1: yPitch - 10, x2: xc + 10, y2: yPitch - 16, label: '7° / 45°', labelX: xc, labelY: yPitch - 28 },
    labels: [
      { text: 'internal', x: x0 + P * 0.4, y: yTop + 18 },
      { text: 'external', x: x0 + P * 0.4, y: yBottom - 8 },
    ],
    paramKeys: ['pitch', 'major', 'pitchDia', 'minor', 'toleranceExt', 'toleranceInt'],
    legacyExternalPath: extProfile,
    legacyInternalPath: intProfile,
    taper: null,
  }
}

function buildRound() {
  const P = 52
  const H = P * 0.4
  const x0 = 118
  const teeth = 3
  const yPitch = 148
  const r = P / 4

  const extD = []
  const intD = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xm = xl + P / 2
    const xr = xl + P
    extD.push(`M ${xl} ${yPitch + H / 2} Q ${xm} ${yPitch - H / 2 - 4} ${xr} ${yPitch + H / 2}`)
    intD.push(`M ${xl} ${yPitch - H / 2 - 8} Q ${xm} ${yPitch + H / 2 + 4} ${xr} ${yPitch - H / 2 - 8}`)
  }

  const xEnd = x0 + teeth * P
  const yBottom = yPitch + H + 14
  const yTop = yPitch - H - 20
  const xc = x0 + P * 1.5

  return {
    viewBox: '0 0 560 300',
    regions: [
      { d: `${intD.join(' ')} L ${xEnd} ${yTop} L ${x0} ${yTop} Z`, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: `${extD.join(' ')} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: [
      ...intD.map((d) => ({ d, stroke: '#2d6a62', width: 1.35 })),
      ...extD.map((d) => ({ d, stroke: '#374151', width: 1.35 })),
    ],
    ghosts: [],
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims: [
      dimH(xc - P / 2, xc + P / 2, yPitch + H / 2 + 8, 'P'),
      { type: 'linear', x1: xc + r, y1: yPitch - H / 2, x2: xc + r + 16, y2: yPitch - H / 2, label: 'R', labelX: xc + r + 20, labelY: yPitch - H / 2 + 4, anchor: 'start' },
      diameterLeader(yPitch - H / 2, 'd / D'),
      diameterLeader(yPitch + H / 2, 'd₁ / D₁'),
    ],
    angleMark: null,
    labels: [
      { text: 'internal', x: x0 + P * 0.4, y: yTop + 18 },
      { text: 'external', x: x0 + P * 0.4, y: yBottom - 8 },
    ],
    paramKeys: ['pitch', 'major', 'minor'],
    legacyExternalPath: extD[0] ?? '',
    legacyInternalPath: intD[0] ?? '',
    taper: null,
  }
}

function buildBallScrew() {
  const P = 52
  const x0 = 118
  const teeth = 3
  const yPitch = 148
  const amp = 16

  const trackParts = []
  const balls = []
  for (let i = 0; i < teeth; i++) {
    const xl = x0 + i * P
    const xm = xl + P / 2
    const xr = xl + P
    trackParts.push(`M ${xl} ${yPitch + 6} Q ${xm} ${yPitch - amp} ${xr} ${yPitch + 6}`)
    balls.push({ cx: xm, cy: yPitch - amp + 8, r: 7 })
  }

  const xEnd = x0 + teeth * P
  const yBottom = yPitch + 28
  const yTop = yPitch - amp - 24
  const track = trackParts.join(' ')

  return {
    viewBox: '0 0 560 300',
    regions: [
      { d: `M ${x0} ${yTop} L ${xEnd} ${yTop} L ${xEnd} ${yPitch - amp - 4} Q ${x0 + P * 1.5} ${yPitch - amp - 14} ${x0} ${yPitch - amp - 4} Z`, fill: 'var(--thread-diagram-internal, #d8ece8)', stroke: '#5a8f88' },
      { d: `M ${x0} ${yPitch + 20} L ${xEnd} ${yPitch + 20} L ${xEnd} ${yBottom} L ${x0} ${yBottom} Z`, fill: 'var(--thread-diagram-external, #e4e8ec)', stroke: '#6b7280' },
    ],
    profiles: trackParts.map((d) => ({ d, stroke: '#374151', width: 1.35 })),
    ghosts: [],
    pitchAxis: { x1: x0 - 8, y1: yPitch, x2: xEnd + 8, y2: yPitch },
    dims: [
      dimH(x0 + P / 2, x0 + (3 * P) / 2, yBottom - 4, 'P'),
      diameterLeader(yPitch - amp, 'd / D'),
      diameterLeader(yPitch + 10, 'd₁ / D₁'),
    ],
    angleMark: null,
    circles: balls,
    labels: [
      { text: 'internal', x: x0 + P * 0.5, y: yTop + 16 },
      { text: 'external', x: x0 + P * 0.5, y: yBottom - 6 },
    ],
    paramKeys: ['pitch', 'major', 'minor'],
    legacyExternalPath: trackParts[0] ?? '',
    legacyInternalPath: '',
    taper: null,
  }
}
