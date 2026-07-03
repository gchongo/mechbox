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

/** 轴承安装方式（配对 / 串联） */
export const MOUNTING_ARRANGEMENTS = {
  single: {
    id: 'single',
    label: '单列',
    cFactor: 1,
    c0Factor: 1,
    yFactor: 1,
    stiffnessFactor: 1,
  },
  'duplex-db': {
    id: 'duplex-db',
    label: '背靠背 DB',
    cFactor: 1,
    c0Factor: 1,
    yFactor: 0.72,
    stiffnessFactor: 2,
    note: '角接触配对：Y 折减约 28%',
  },
  'duplex-df': {
    id: 'duplex-df',
    label: '面对面 DF',
    cFactor: 1,
    c0Factor: 1,
    yFactor: 0.72,
    stiffnessFactor: 2,
    note: '角接触配对：Y 折减约 28%',
  },
  'duplex-dt': {
    id: 'duplex-dt',
    label: '串联 DT',
    cFactor: 2,
    c0Factor: 2,
    yFactor: 1,
    stiffnessFactor: 1,
    note: '同向串联：C / C₀ 按 2 颗计',
  },
}

export function getMountingFactors(arrangement = 'single') {
  return MOUNTING_ARRANGEMENTS[arrangement] ?? MOUNTING_ARRANGEMENTS.single
}

/**
 * 安装方式 + 轴向预紧对当量载荷的影响
 * Fa' = |Fa| + F₀；配对时 Y 折减
 */
export function applyMountingAndPreload({
  radialLoad,
  axialLoad = 0,
  axialPreload = 0,
  x = 1,
  y = 0,
  arrangement = 'single',
}) {
  const mounting = getMountingFactors(arrangement)
  const Fr = Math.abs(radialLoad)
  const Fa = Math.abs(axialLoad) + Math.max(0, axialPreload)
  const yAdj = y * mounting.yFactor
  const equivalentLoad = x * Fr + yAdj * Fa
  return {
    effectiveAxialLoad: Fa,
    axialPreloadApplied: Math.max(0, axialPreload),
    x,
    y: yAdj,
    equivalentLoad,
    mounting,
  }
}

/** 径向刚度粗估 k_r ≈ 0.15·√(C/1000)·f_s (N/μm) */
export function estimateRadialStiffness(dynamicLoad, arrangement = 'single') {
  const m = getMountingFactors(arrangement)
  if (!dynamicLoad || dynamicLoad <= 0) return null
  return 0.15 * Math.sqrt(dynamicLoad / 1000) * m.stiffnessFactor
}

/** 自动查表 X/Y 并计算寿命 */
export function analyzeBearingLife(input) {
  const calcMode = input.calcMode ?? 'complete'
  const arrangement = input.mountingArrangement ?? 'single'
  const axialPreload = input.axialPreload ?? 0
  const mounting = getMountingFactors(arrangement)
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

  const dynamicLoad = input.dynamicLoad * mounting.cFactor
  const staticLoad = input.staticLoad != null ? input.staticLoad * mounting.c0Factor : null

  if (calcMode === 'simple') {
    x = input.x ?? 1
    y = input.y ?? 0
    const mounted = applyMountingAndPreload({
      radialLoad: input.radialLoad,
      axialLoad: input.axialLoad,
      axialPreload,
      x,
      y,
      arrangement,
    })
    const p =
      input.simpleEquivalentLoad != null
        ? input.simpleEquivalentLoad
        : mounted.equivalentLoad
    const l10 = calcL10MillionRevolutions(dynamicLoad, p, bearingType)
    const hours = calcLifeHours(l10, input.rpm)
    const targetHours = input.targetHours ?? 10000
    const staticSafety = staticLoad
      ? calcStaticSafetyFactor(staticLoad, p)
      : null
    const minStaticSafety = input.minStaticSafety ?? 1.5
    const lifePass = hours >= targetHours
    const staticPass = staticSafety == null ? true : staticSafety >= minStaticSafety
    return {
      calcMode,
      equivalentLoad: p,
      x: mounted.x,
      y: mounted.y,
      effectiveAxialLoad: mounted.effectiveAxialLoad,
      axialPreloadApplied: mounted.axialPreloadApplied,
      mountingArrangement: arrangement,
      mountingLabel: mounting.label,
      effectiveDynamicLoad: dynamicLoad,
      effectiveStaticLoad: staticLoad,
      l10MillionRev: l10,
      modifiedLifeMillionRev: l10,
      reliabilityFactor: 1,
      lifeConditionFactor: 1,
      temperatureFactor: 1,
      lifeHours: hours,
      targetHours,
      staticSafetyFactor: staticSafety,
      staticPass,
      lifePass,
      pass: lifePass && staticPass,
      bearingType,
    }
  }

  const mounted = applyMountingAndPreload({
    radialLoad: input.radialLoad,
    axialLoad: input.axialLoad,
    axialPreload,
    x: x ?? 1,
    y: y ?? 0,
    arrangement,
  })
  const p = mounted.equivalentLoad

  const l10 = calcL10MillionRevolutions(dynamicLoad, p, bearingType)

  const a1 = input.reliability
    ? getReliabilityFactor(input.reliability)
    : (input.reliabilityFactor ?? 1)
  const aIso = input.lifeConditionFactor ?? getLifeConditionFactor(input.lifeCondition ?? 'standard')
  let a2 = 1
  if (calcMode === 'professional') {
    a2 = input.temperatureFactor ?? getTemperatureFactor(input.operatingTemp ?? 120)
  }
  const lifeExp = bearingType === 'roller' ? 10 / 3 : 3
  const lnm = calcModifiedLife(l10, a1 * aIso * a2 ** lifeExp)
  const hours = calcLifeHours(lnm, input.rpm)
  const targetHours = input.targetHours ?? 10000
  const staticSafety = staticLoad
    ? calcStaticSafetyFactor(staticLoad, p)
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

  const radialStiffness = calcMode === 'professional'
    ? estimateRadialStiffness(dynamicLoad, arrangement)
    : null

  return {
    calcMode,
    equivalentLoad: p,
    x: mounted.x,
    y: mounted.y,
    effectiveAxialLoad: mounted.effectiveAxialLoad,
    axialPreloadApplied: mounted.axialPreloadApplied,
    mountingArrangement: arrangement,
    mountingLabel: mounting.label,
    mountingNote: mounting.note ?? null,
    effectiveDynamicLoad: dynamicLoad,
    effectiveStaticLoad: staticLoad,
    radialStiffness,
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
