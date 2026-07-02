/** 轴承额定寿命 L10（百万转） */
export function calcL10MillionRevolutions(dynamicLoad, equivalentLoad, bearingType = 'ball') {
  if (!equivalentLoad || equivalentLoad <= 0) return Infinity
  const exp = bearingType === 'roller' ? 10 / 3 : 3
  return (dynamicLoad / equivalentLoad) ** exp
}

/** 额定寿命（小时） */
export function calcLifeHours(l10Million, rpm) {
  if (!rpm || rpm <= 0 || !Number.isFinite(l10Million)) return Infinity
  return (l10Million * 1_000_000) / (rpm * 60)
}

/** 简化径向当量动载荷 P = X·Fr + Y·Fa */
export function calcEquivalentLoad({ radialLoad, axialLoad = 0, x = 1, y = 0 }) {
  return x * radialLoad + y * axialLoad
}

/** 综合轴承寿命分析 */
export function analyzeBearingLife(input) {
  const p = calcEquivalentLoad(input)
  const l10 = calcL10MillionRevolutions(input.dynamicLoad, p, input.bearingType)
  const hours = calcLifeHours(l10, input.rpm)
  const targetHours = input.targetHours ?? 10000

  return {
    equivalentLoad: p,
    l10MillionRev: l10,
    lifeHours: hours,
    targetHours,
    pass: hours >= targetHours,
    bearingType: input.bearingType,
  }
}
