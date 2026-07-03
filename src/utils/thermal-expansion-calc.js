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

export function calcLinearExpansion(length, alpha, deltaT) {
  return alpha * length * deltaT
}

export function calcDiameterExpansion(diameter, alpha, deltaT) {
  return alpha * diameter * deltaT
}

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
  const calcMode = input.calcMode ?? 'simple'
  const alpha1 = input.alpha ?? THERMAL_MATERIALS.steel.alpha
  const alpha2 = input.alpha2 ?? alpha1
  const deltaT = input.deltaT ?? 0
  const Tref = input.referenceTemp ?? 20
  const Toper = input.operatingTemp ?? Tref + deltaT

  const linear1 = calcLinearExpansion(input.length ?? 100, alpha1, deltaT)
  const linear2 = input.length2 ? calcLinearExpansion(input.length2, alpha2, deltaT) : null

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

  const result = {
    calcMode,
    deltaT,
    referenceTemp: Tref,
    operatingTemp: Toper,
    alpha1,
    alpha2,
    linearExpansion: linear1,
    linearExpansion2: linear2,
    fit,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.assemblyDeltaT = input.assemblyDeltaT ?? 0
    result.serviceDeltaT = input.serviceDeltaT ?? deltaT
    if (input.shaftDiameter && input.holeDiameter && input.assemblyDeltaT != null) {
      const assemblyFit = calcFitChange({
        shaftDiameter: input.shaftDiameter,
        holeDiameter: input.holeDiameter,
        shaftAlpha: alpha1,
        holeAlpha: alpha2,
        deltaT: input.assemblyDeltaT,
        initialInterference: input.initialInterference ?? input.shaftDiameter - input.holeDiameter,
      })
      result.assemblyFit = assemblyFit
      if (calcMode === 'professional' && input.serviceDeltaT != null) {
        const serviceFit = calcFitChange({
          shaftDiameter: input.shaftDiameter + assemblyFit.shaftExpansion,
          holeDiameter: input.holeDiameter + assemblyFit.holeExpansion,
          shaftAlpha: alpha1,
          holeAlpha: alpha2,
          deltaT: input.serviceDeltaT - input.assemblyDeltaT,
          initialInterference: assemblyFit.finalInterference,
        })
        result.serviceFit = serviceFit
        result.fit = serviceFit
        result.pass = !serviceFit.becomesClearance
      }
    }
    if (fit) {
      result.pass = !fit.becomesClearance
    }
  }

  if (calcMode === 'professional' && fit) {
    result.interferenceMargin = fit.finalInterference
    result.clearanceRisk = fit.becomesClearance
    result.recommendedMaxDeltaT = input.maxDeltaT ?? Math.abs(deltaT) * 1.2
  }

  return result
}
