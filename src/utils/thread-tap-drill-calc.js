/** @typedef {'steel'|'aluminum'|'stainless'|'cast_iron'|'plastic'} TapMaterialId */
/** @typedef {'through'|'blind'} HoleTypeId */

export const TAP_MATERIALS = {
  steel: { drillFactor: 1.0, tipKeys: ['tapTip_steel'] },
  cast_iron: { drillFactor: 1.0, tipKeys: ['tapTip_cast'] },
  aluminum: { drillFactor: 1.02, tipKeys: ['tapTip_aluminum'] },
  stainless: { drillFactor: 0.99, tipKeys: ['tapTip_stainless'] },
  plastic: { drillFactor: 1.04, tipKeys: ['tapTip_plastic'] },
}

export const HOLE_TYPES = {
  through: { tipKeys: ['tapHole_through'] },
  blind: { tipKeys: ['tapHole_blind'] },
}

/**
 * @param {import('@/constants/thread-standards').ThreadRow|null} row
 * @param {{
 *   material?: TapMaterialId,
 *   holeType?: HoleTypeId,
 *   engagementLength?: number,
 * }} options
 */
export function analyzeTapDrill(row, options = {}) {
  if (!row) return { ok: false, errorKey: 'tap_need_row' }
  if (['npt', 'nptf', 'g', 'r'].includes(row.system)) {
    return { ok: false, errorKey: 'tap_pipe_drill_na', row }
  }
  if (row.tapDrill == null) {
    return {
      ok: false,
      errorKey: 'tap_no_drill',
      row,
    }
  }

  const material = options.material ?? 'steel'
  const holeType = options.holeType ?? 'through'
  const mat = TAP_MATERIALS[material] ?? TAP_MATERIALS.steel
  const hole = HOLE_TYPES[holeType] ?? HOLE_TYPES.through

  const baseDrill = row.tapDrill
  const recommendedDrill = roundDrill(baseDrill * mat.drillFactor, row.unit)
  const engagementLength = options.engagementLength
    ?? (row.nominal ? row.nominal * (row.unit === 'mm' ? 1.5 : 1.5) : null)

  const tipKeys = [
    'processTapDrill',
    ...(row.system === 'metric' ? ['processMetricTap'] : []),
    ...(row.system === 'unc' || row.system === 'unf' || row.system === 'unef' ? ['processUnifiedTap'] : []),
    ...(row.system === 'tr' ? ['processTrapezoidalTap'] : []),
    ...(row.system === 'acme' ? ['processAcmeTap'] : []),
    ...mat.tipKeys,
    ...hole.tipKeys,
  ]

  return {
    ok: true,
    row,
    material,
    holeType,
    unit: row.unit,
    baseDrill,
    recommendedDrill,
    drillDelta: recommendedDrill - baseDrill,
    engagementLength,
    chamferAngle: '90–120°',
    tipKeys: [...new Set(tipKeys)],
    isPipe: ['npt', 'nptf', 'g', 'r'].includes(row.system),
  }
}

function roundDrill(value, unit) {
  const precision = unit === 'mm' ? 2 : 4
  return Math.round(value * 10 ** precision) / 10 ** precision
}
