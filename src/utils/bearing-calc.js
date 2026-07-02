import {
  lookupBearingXY,
  resolveSeriesFromModel,
  BEARING_SERIES,
} from '@/constants/bearing-xy-tables'

/** 轴承额定寿命 L10（百万转） ISO 281 */
export function calcL10MillionRevolutions(dynamicLoad, equivalentLoad, bearingType = 'ball') {
  if (!equivalentLoad || equivalentLoad <= 0) return Infinity
  const exp = bearingType === 'roller' ? 10 / 3 : 3
  return (dynamicLoad / equivalentLoad) ** exp
}

/** 修正额定寿命 Lnm = a1 · L10 (百万转) */
export function calcModifiedLife(l10, reliabilityFactor = 1) {
  return l10 * reliabilityFactor
}

/** 额定寿命（小时） */
export function calcLifeHours(l10Million, rpm) {
  if (!rpm || rpm <= 0 || !Number.isFinite(l10Million)) return Infinity
  return (l10Million * 1_000_000) / (rpm * 60)
}

/** 当量动载荷 P = X·Fr + Y·Fa */
export function calcEquivalentLoad({ radialLoad, axialLoad = 0, x = 1, y = 0 }) {
  return x * radialLoad + y * axialLoad
}

/** 可靠性系数 a1 (ISO 281) */
export const RELIABILITY_FACTORS = {
  90: 1.0,
  95: 0.64,
  96: 0.55,
  97: 0.47,
  98: 0.37,
  99: 0.25,
}

export function getReliabilityFactor(percent = 90) {
  return RELIABILITY_FACTORS[percent] ?? 1.0
}

/** ISO 281 寿命修正 aISO（污染/润滑工况） */
export const LIFE_CONDITION_FACTORS = {
  clean: 1.5,
  standard: 1.0,
  contaminated: 0.5,
  heavy: 0.3,
}

export function getLifeConditionFactor(key = 'standard') {
  return LIFE_CONDITION_FACTORS[key] ?? 1.0
}

/** 静载荷安全系数 S₀ = C₀ / P₀ */
export function calcStaticSafetyFactor(staticLoad, equivalentLoad) {
  if (!equivalentLoad || equivalentLoad <= 0) return Infinity
  return staticLoad / equivalentLoad
}

/** 自动查表 X/Y 并计算寿命 */
export function analyzeBearingLife(input) {
  let x = input.x
  let y = input.y
  let xyInfo = null
  let bearingType = input.bearingType ?? 'ball'

  if (input.autoLookup !== false && (input.seriesId || input.bearingModel)) {
    const seriesId = input.seriesId ?? resolveSeriesFromModel(input.bearingModel)
    xyInfo = lookupBearingXY({
      seriesId,
      radialLoad: input.radialLoad,
      axialLoad: input.axialLoad,
    })
    x = xyInfo.x
    y = xyInfo.y
    bearingType = xyInfo.bearingType
  }

  const p = calcEquivalentLoad({
    radialLoad: input.radialLoad,
    axialLoad: input.axialLoad,
    x: x ?? 1,
    y: y ?? 0,
  })

  const l10 = calcL10MillionRevolutions(input.dynamicLoad, p, bearingType)
  const a1 = input.reliability
    ? getReliabilityFactor(input.reliability)
    : (input.reliabilityFactor ?? 1)
  const aIso = input.lifeConditionFactor ?? getLifeConditionFactor(input.lifeCondition ?? 'standard')
  const lnm = calcModifiedLife(l10, a1 * aIso)
  const hours = calcLifeHours(lnm, input.rpm)
  const targetHours = input.targetHours ?? 10000
  const staticSafety = input.staticLoad
    ? calcStaticSafetyFactor(input.staticLoad, p)
    : null
  const minStaticSafety = input.minStaticSafety ?? 1.5

  return {
    equivalentLoad: p,
    x: x ?? 1,
    y: y ?? 0,
    xyInfo,
    l10MillionRev: l10,
    modifiedLifeMillionRev: lnm,
    reliabilityFactor: a1,
    lifeConditionFactor: aIso,
    staticSafetyFactor: staticSafety,
    staticPass: staticSafety == null ? true : staticSafety >= minStaticSafety,
    lifeHours: hours,
    targetHours,
    pass: hours >= targetHours && (staticSafety == null || staticSafety >= minStaticSafety),
    bearingType,
    seriesId: input.seriesId ?? xyInfo?.series,
  }
}

export { lookupBearingXY, resolveSeriesFromModel, BEARING_SERIES, listBearingSeries } from '@/constants/bearing-xy-tables'
