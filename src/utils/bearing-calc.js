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

/** 温度系数 a₂ (ISO 281 简化) */
export const TEMPERATURE_FACTORS = {
  120: 1.0,
  150: 0.9,
  175: 0.8,
  200: 0.75,
  250: 0.5,
}

export function getTemperatureFactor(tempC = 120) {
  const keys = Object.keys(TEMPERATURE_FACTORS)
    .map(Number)
    .sort((a, b) => a - b)
  let factor = 1.0
  for (const t of keys) {
    if (tempC >= t) factor = TEMPERATURE_FACTORS[t]
  }
  return factor
}

/** 静载荷安全系数 S₀ = C₀ / P₀ */
export function calcStaticSafetyFactor(staticLoad, equivalentLoad) {
  if (!equivalentLoad || equivalentLoad <= 0) return Infinity
  return staticLoad / equivalentLoad
}

/** 自动查表 X/Y 并计算寿命 */
export function analyzeBearingLife(input) {
  const calcMode = input.calcMode ?? 'complete'
  let x = input.x
  let y = input.y
  let xyInfo = null
  let bearingType = input.bearingType ?? 'ball'

  const useAutoLookup = calcMode !== 'simple' && input.autoLookup !== false && (input.seriesId || input.bearingModel)

  if (useAutoLookup) {
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

  if (calcMode === 'simple') {
    x = input.x ?? 1
    y = input.y ?? 0
    if (input.simpleEquivalentLoad != null) {
      const p = input.simpleEquivalentLoad
      const l10 = calcL10MillionRevolutions(input.dynamicLoad, p, bearingType)
      const hours = calcLifeHours(l10, input.rpm)
      return {
        calcMode,
        equivalentLoad: p,
        x,
        y,
        l10MillionRev: l10,
        modifiedLifeMillionRev: l10,
        reliabilityFactor: 1,
        lifeConditionFactor: 1,
        temperatureFactor: 1,
        lifeHours: hours,
        targetHours: input.targetHours ?? 10000,
        pass: hours >= (input.targetHours ?? 10000),
        bearingType,
      }
    }
  }

  const p = calcEquivalentLoad({
    radialLoad: input.radialLoad,
    axialLoad: input.axialLoad,
    x: x ?? 1,
    y: y ?? 0,
  })

  const l10 = calcL10MillionRevolutions(input.dynamicLoad, p, bearingType)

  if (calcMode === 'simple') {
    const hours = calcLifeHours(l10, input.rpm)
    return {
      calcMode,
      equivalentLoad: p,
      x: x ?? 1,
      y: y ?? 0,
      xyInfo,
      l10MillionRev: l10,
      modifiedLifeMillionRev: l10,
      reliabilityFactor: 1,
      lifeConditionFactor: 1,
      temperatureFactor: 1,
      lifeHours: hours,
      targetHours: input.targetHours ?? 10000,
      pass: hours >= (input.targetHours ?? 10000),
      bearingType,
      seriesId: input.seriesId ?? xyInfo?.series,
    }
  }

  const a1 = input.reliability
    ? getReliabilityFactor(input.reliability)
    : (input.reliabilityFactor ?? 1)
  const aIso = input.lifeConditionFactor ?? getLifeConditionFactor(input.lifeCondition ?? 'standard')
  let a2 = 1
  if (calcMode === 'professional') {
    a2 = input.temperatureFactor ?? getTemperatureFactor(input.operatingTemp ?? 120)
  }
  const lnm = calcModifiedLife(l10, a1 * aIso * a2)
  const hours = calcLifeHours(lnm, input.rpm)
  const targetHours = input.targetHours ?? 10000
  const staticSafety = input.staticLoad
    ? calcStaticSafetyFactor(input.staticLoad, p)
    : null
  const minStaticSafety = input.minStaticSafety ?? 1.5

  let speedPass = true
  let speedWarningKey = null
  let speedWarningParams = null
  if (calcMode === 'professional' && input.limitingSpeed) {
    speedPass = input.rpm <= input.limitingSpeed
    if (!speedPass) {
      speedWarningKey = 'speed_exceeded'
      speedWarningParams = { rpm: input.rpm, limit: input.limitingSpeed }
    }
  }

  return {
    calcMode,
    equivalentLoad: p,
    x: x ?? 1,
    y: y ?? 0,
    xyInfo,
    l10MillionRev: l10,
    modifiedLifeMillionRev: lnm,
    reliabilityFactor: a1,
    lifeConditionFactor: aIso,
    temperatureFactor: a2,
    staticSafetyFactor: staticSafety,
    staticPass: staticSafety == null ? true : staticSafety >= minStaticSafety,
    lifeHours: hours,
    targetHours,
    speedPass,
    speedWarningKey,
    speedWarningParams,
    pass:
      hours >= targetHours &&
      (staticSafety == null || staticSafety >= minStaticSafety) &&
      speedPass,
    bearingType,
    seriesId: input.seriesId ?? xyInfo?.series,
  }
}

export { lookupBearingXY, resolveSeriesFromModel, BEARING_SERIES, listBearingSeries } from '@/constants/bearing-xy-tables'
