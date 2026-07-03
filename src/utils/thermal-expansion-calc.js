/**
 * 热膨胀补偿计算
 */

export const THERMAL_MATERIALS = {
  steel: { label: '碳钢 / 合金钢', alpha: 11.5e-6 },
  stainless: { label: '不锈钢', alpha: 17.3e-6 },
  cast_iron: { label: '铸铁', alpha: 10.5e-6 },
  aluminum: { label: '铝合金', alpha: 23.6e-6 },
  copper: { label: '铜合金', alpha: 17.0e-6 },
  brass: { label: '黄铜', alpha: 18.7e-6 },
  titanium: { label: '钛合金', alpha: 8.6e-6 },
}

/** 线膨胀 ΔL = α · L · ΔT (mm) */
export function calcLinearExpansion(length, alpha, deltaT) {
  return alpha * length * deltaT
}

/** 直径热膨胀 Δd = α · d · ΔT */
export function calcDiameterExpansion(diameter, alpha, deltaT) {
  return alpha * diameter * deltaT
}

/**
 * 配合间隙/过盈随温度变化
 * 正值 = 过盈增加，负值 = 间隙增加
 */
export function calcFitChange({
  shaftDiameter,
  holeDiameter,
  shaftAlpha,
  holeAlpha,
  deltaT,
  initialInterference,
}) {
  const dShaft = calcDiameterExpansion(shaftDiameter, shaftAlpha, deltaT)
  const dHole = calcDiameterExpansion(holeDiameter, holeAlpha, deltaT)
  const interferenceChange = dShaft - dHole
  const initial = initialInterference ?? shaftDiameter - holeDiameter
  const finalInterference = initial + interferenceChange

  return {
    shaftExpansion: dShaft,
    holeExpansion: dHole,
    interferenceChange,
    initialInterference: initial,
    finalInterference,
    becomesClearance: finalInterference < 0,
    finalClearance: finalInterference < 0 ? -finalInterference : 0,
  }
}

export function analyzeThermalExpansion(input) {
  const alpha1 = input.alpha ?? THERMAL_MATERIALS.steel.alpha
  const alpha2 = input.alpha2 ?? alpha1
  const deltaT = input.deltaT ?? 0

  const linear1 = calcLinearExpansion(input.length ?? 100, alpha1, deltaT)
  const linear2 = input.length2
    ? calcLinearExpansion(input.length2, alpha2, deltaT)
    : null

  let fit = null
  if (input.shaftDiameter && input.holeDiameter) {
    fit = calcFitChange({
      shaftDiameter: input.shaftDiameter,
      holeDiameter: input.holeDiameter,
      shaftAlpha: alpha1,
      holeAlpha: alpha2,
      deltaT,
      initialInterference: input.initialInterference,
    })
  }

  return {
    deltaT,
    alpha1,
    alpha2,
    linearExpansion: linear1,
    linearExpansion2: linear2,
    fit,
  }
}
