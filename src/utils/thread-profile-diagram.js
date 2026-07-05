/**
 * 螺纹牙型示意图 — 按 taxonomy 元数据解析牙型种类并生成 SVG path
 * @typedef {'triangular_60'|'triangular_55'|'triangular_60_taper'|'triangular_55_taper'|'trapezoidal_tr'|'trapezoidal_acme'|'square'|'buttress'|'round'|'ball_screw'} ThreadDiagramKind
 */

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
export function buildProfilePaths(kind, side) {
  const ox = side === 'external' ? 40 : 200
  const builders = {
    triangular_60: () => triangular60(ox),
    triangular_55: () => triangular55(ox),
    triangular_60_taper: () => triangular60(ox),
    triangular_55_taper: () => triangular55(ox),
    trapezoidal_tr: () => trapezoidalTr(ox),
    trapezoidal_acme: () => trapezoidalAcme(ox),
    square: () => squareProfile(ox),
    buttress: () => buttressProfile(ox),
    round: () => roundProfile(ox),
    ball_screw: () => ballScrewProfile(ox),
  }
  return (builders[kind] ?? builders.triangular_60)()
}

function triangular60(ox) {
  return `M ${ox} 140 L ${ox + 20} 90 L ${ox + 40} 140 L ${ox + 60} 90 L ${ox + 80} 140 L ${ox + 100} 90 L ${ox + 120} 140`
}

/** Whitworth 55° — 顶/底略平，示意圆角牙型 */
function triangular55(ox) {
  return `M ${ox} 140 L ${ox + 8} 118 L ${ox + 18} 100 L ${ox + 28} 118 L ${ox + 38} 140 L ${ox + 48} 118 L ${ox + 58} 100 L ${ox + 68} 118 L ${ox + 78} 140 L ${ox + 88} 118 L ${ox + 98} 100 L ${ox + 108} 118 L ${ox + 118} 140`
}

/** ISO Tr 30° 梯形 — 顶/底平 */
function trapezoidalTr(ox) {
  return `M ${ox} 140 L ${ox + 12} 105 L ${ox + 28} 105 L ${ox + 40} 140 L ${ox + 52} 105 L ${ox + 68} 105 L ${ox + 80} 140 L ${ox + 92} 105 L ${ox + 108} 105 L ${ox + 120} 140`
}

/** Acme 29° — 略窄顶面 */
function trapezoidalAcme(ox) {
  return `M ${ox} 140 L ${ox + 10} 108 L ${ox + 30} 108 L ${ox + 40} 140 L ${ox + 50} 108 L ${ox + 70} 108 L ${ox + 80} 140 L ${ox + 90} 108 L ${ox + 110} 108 L ${ox + 120} 140`
}

function squareProfile(ox) {
  return `M ${ox} 140 L ${ox} 95 L ${ox + 40} 95 L ${ox + 40} 140 L ${ox + 40} 95 L ${ox + 80} 95 L ${ox + 80} 140 L ${ox + 80} 95 L ${ox + 120} 95 L ${ox + 120} 140`
}

/** 锯齿形 — 承载面陡、背面缓 */
function buttressProfile(ox) {
  return `M ${ox} 140 L ${ox + 8} 100 L ${ox + 38} 100 L ${ox + 40} 140 L ${ox + 48} 115 L ${ox + 78} 115 L ${ox + 80} 140 L ${ox + 88} 100 L ${ox + 118} 100 L ${ox + 120} 140`
}

/** 圆/圆弧螺纹 — 半圆弧牙顶 */
function roundProfile(ox) {
  return `M ${ox} 140 Q ${ox + 20} 90 ${ox + 40} 140 Q ${ox + 60} 90 ${ox + 80} 140 Q ${ox + 100} 90 ${ox + 120} 140`
}

/** 滚珠丝杠 — 简化滚道 + 滚珠 */
function ballScrewProfile(ox) {
  const track = `M ${ox} 130 Q ${ox + 20} 100 ${ox + 40} 130 Q ${ox + 60} 160 ${ox + 80} 130 Q ${ox + 100} 100 ${ox + 120} 130`
  return { d: track, extras: [{ cx: ox + 40, cy: 118, r: 6 }, { cx: ox + 80, cy: 142, r: 6 }] }
}

/** @returns {string|{d:string,extras?:Array<{cx:number,cy:number,r:number}>}} */
function buildRaw(kind, side) {
  const ox = side === 'external' ? 40 : 200
  if (kind === 'ball_screw') return ballScrewProfile(ox)
  const map = {
    triangular_60: triangular60,
    triangular_55: triangular55,
    triangular_60_taper: triangular60,
    triangular_55_taper: triangular55,
    trapezoidal_tr: trapezoidalTr,
    trapezoidal_acme: trapezoidalAcme,
    square: squareProfile,
    buttress: buttressProfile,
    round: roundProfile,
  }
  return (map[kind] ?? triangular60)(ox)
}

export function buildProfilePath(kind, side) {
  const raw = buildRaw(kind, side)
  return typeof raw === 'string' ? raw : raw.d
}

export function buildProfileExtras(kind, side) {
  const raw = buildRaw(kind, side)
  return typeof raw === 'string' ? [] : raw.extras ?? []
}

export function showTaperOverlay(kind) {
  return kind === 'triangular_60_taper' || kind === 'triangular_55_taper'
}

export function taperOverlayPaths(kind) {
  if (kind === 'triangular_60_taper' || kind === 'triangular_55_taper') {
    return {
      x1: 30,
      y1: 165,
      x2: 390,
      y2: kind === 'triangular_55_taper' ? 130 : 125,
      labelX: 360,
      labelY: kind === 'triangular_55_taper' ? 123 : 118,
      label: '1:16',
    }
  }
  return null
}
