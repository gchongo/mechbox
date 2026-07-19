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
  const rawEngagement = options.engagementLength
    ?? (row.nominal != null ? row.nominal * 1.5 : null)
  const engagementLength = rawEngagement != null
    ? roundDrill(rawEngagement, row.unit)
    : null

  const tipKeys = [
    'processTapDrill',
    ...(row.system === 'metric' ? ['processMetricTap'] : []),
    ...(row.system === 'unc' || row.system === 'unf' || row.system === 'unef' ? ['processUnifiedTap'] : []),
    ...(row.system === 'tr' ? ['processTrapezoidalTap'] : []),
    ...(row.system === 'acme' ? ['processAcmeTap'] : []),
    ...mat.tipKeys,
    ...hole.tipKeys,
  ]

  const torque = analyzeTapTorque(row, {
    material,
    holeType,
    engagementLength: engagementLength ?? undefined,
    lubrication: options.lubrication,
  })

  return {
    ok: true,
    row,
    material,
    holeType,
    unit: row.unit,
    baseDrill,
    recommendedDrill,
    drillDelta: roundDrill(recommendedDrill - baseDrill, row.unit),
    engagementLength,
    chamferAngle: '90–120°',
    tipKeys: [...new Set(tipKeys)],
    isPipe: ['npt', 'nptf', 'g', 'r'].includes(row.system),
    ...torque,
  }
}

/** 材料剪切强度粗量级 (MPa)，攻丝扭矩估算用 */
export const TAP_TORQUE_MATERIALS = {
  steel: { shearMPa: 350 },
  cast_iron: { shearMPa: 280 },
  aluminum: { shearMPa: 180 },
  stainless: { shearMPa: 450 },
  plastic: { shearMPa: 40 },
}

export const TAP_LUBRICATION = {
  cutting_oil: { factor: 1.0, tipKey: 'tapLube_oil' },
  paste: { factor: 0.85, tipKey: 'tapLube_paste' },
  dry: { factor: 1.35, tipKey: 'tapLube_dry' },
}

/**
 * 切削丝锥攻丝扭矩经验估算（N·m）
 * T ≈ C · τ · d · P · L_e · f_hole · f_lube / 1000
 */
export function analyzeTapTorque(row, options = {}) {
  if (!row) return { torqueOk: false, torqueErrorKey: 'tap_need_row' }
  if (['npt', 'nptf', 'g', 'r'].includes(row.system)) {
    return { torqueOk: false, torqueErrorKey: 'tap_pipe_torque_na' }
  }
  const d = row.nominal
  const P = row.pitch
  if (d == null || P == null || !(d > 0) || !(P > 0)) {
    return { torqueOk: false, torqueErrorKey: 'tap_no_pitch' }
  }

  const material = options.material ?? 'steel'
  const holeType = options.holeType ?? 'through'
  const lubrication = options.lubrication ?? 'cutting_oil'
  const mat = TAP_TORQUE_MATERIALS[material] ?? TAP_TORQUE_MATERIALS.steel
  const lube = TAP_LUBRICATION[lubrication] ?? TAP_LUBRICATION.cutting_oil
  const Le =
    options.engagementLength != null && Number.isFinite(options.engagementLength)
      ? options.engagementLength
      : d * 1.5
  const holeFactor = holeType === 'blind' ? 1.25 : 1.0
  const C = 0.08
  const tapTorqueNm = (C * mat.shearMPa * d * P * Le * holeFactor * lube.factor) / 1000

  return {
    torqueOk: true,
    tapTorqueNm,
    tapTorqueMinNm: tapTorqueNm * 0.7,
    tapTorqueMaxNm: tapTorqueNm * 1.4,
    tapTorqueEstimateOnly: true,
    lubrication,
    torqueTipKeys: ['tapTorqueHint', lube.tipKey],
  }
}

function roundDrill(value, unit) {
  const precision = unit === 'mm' ? 2 : 4
  return Math.round(value * 10 ** precision) / 10 ** precision
}
