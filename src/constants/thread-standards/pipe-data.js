/**
 * 管螺纹参考尺寸
 * NPT: ASME B1.20.1 Table 2 (E0 大径, E1 手紧平面中径, K0 小径/底孔参考)
 * G:   ISO 228-1 平行管螺纹
 * R:   ISO 7-1 锥管螺纹 (55°, 1:16)
 */

import { NPT_DEFINITIONS, BSP_DEFINITIONS } from './pipe-definitions'
import { calcWhitworthMinor, round } from './thread-dim'

function nptDesignation(nom, tpi) {
  return `${nom}-${tpi} NPT`
}

function nptfDesignation(nom, tpi) {
  return `${nom}-${tpi} NPTF`
}

function gDesignation(nom) {
  return `G${nom}`
}

function rDesignation(nom) {
  return `R${nom}`
}

function buildNptRow([nom, tpi, major, pitchDia, minor, tapDrill]) {
  const pitch = 1 / tpi
  return {
    id: `pipe-npt-${nom.replace(/[^\w]/g, '')}-${tpi}`,
    system: 'npt',
    subSeries: 'npt',
    designation: nptDesignation(nom, tpi),
    priority: 1,
    standardRef: 'ASME B1.20.1',
    unit: 'in',
    nominal: major,
    major: round(major, 4),
    pitchDiameter: round(pitchDia, 4),
    minor: round(minor, 4),
    pitch,
    tpi,
    threadAngle: 60,
    tapDrill: round(tapDrill, 4),
    toleranceExternal: '—',
    toleranceInternal: '—',
    taper: '1:16',
    sealing: 'taper_seal',
    compatibilityKey: 'npt_bsp',
    usageKey: 'pipe',
  }
}

function buildGRow([nom, tpi, major, pitchDia, minor, tapDrill]) {
  const pitch = 1 / tpi
  const m = minor ?? calcWhitworthMinor(major, tpi)
  return {
    id: `pipe-g-${nom.replace(/[^\w]/g, '')}`,
    system: 'g',
    subSeries: 'g',
    designation: gDesignation(nom),
    priority: 1,
    standardRef: 'ISO 228-1',
    unit: 'in',
    nominal: major,
    major: round(major, 4),
    pitchDiameter: round(pitchDia, 4),
    minor: round(m, 4),
    pitch,
    tpi,
    threadAngle: 55,
    tapDrill: round(tapDrill, 4),
    toleranceExternal: '—',
    toleranceInternal: '—',
    taper: '—',
    sealing: 'parallel_seal',
    compatibilityKey: 'bsp_npt',
    usageKey: 'pipe',
  }
}

function buildRRow([nom, tpi, major, pitchDia, minor, tapDrill]) {
  const pitch = 1 / tpi
  const m = minor ?? calcWhitworthMinor(major, tpi)
  return {
    id: `pipe-r-${nom.replace(/[^\w]/g, '')}`,
    system: 'r',
    subSeries: 'r',
    designation: rDesignation(nom),
    priority: 1,
    standardRef: 'ISO 7-1',
    unit: 'in',
    nominal: major,
    major: round(major, 4),
    pitchDiameter: round(pitchDia, 4),
    minor: round(m, 4),
    pitch,
    tpi,
    threadAngle: 55,
    tapDrill: round(tapDrill, 4),
    toleranceExternal: '—',
    toleranceInternal: '—',
    taper: '1:16',
    sealing: 'taper_seal',
    compatibilityKey: 'bspt_npt',
    usageKey: 'pipe',
  }
}

export const NPT_ROWS = NPT_DEFINITIONS.map(buildNptRow)

function buildNptfRow(def) {
  const row = buildNptRow(def)
  const nom = def[0]
  const tpi = def[1]
  return {
    ...row,
    id: `pipe-nptf-${nom.replace(/[^\w]/g, '')}-${tpi}`,
    system: 'nptf',
    subSeries: 'nptf',
    designation: nptfDesignation(nom, tpi),
    standardRef: 'SAE J476 / ASME B1.20.3',
    sealing: 'dry_seal',
    compatibilityKey: 'npt_bsp',
    usageKey: 'pipe',
  }
}

export const NPTF_ROWS = NPT_DEFINITIONS.map(buildNptfRow)
export const G_ROWS = BSP_DEFINITIONS.map(buildGRow)
export const R_ROWS = BSP_DEFINITIONS.map(buildRRow)
