/**
 * 热膨胀补偿计算
 * 简单/完整模式：α 为参考温度常数（线性 ΔL = α L ΔT）
 * 专业模式：可选 α(T) = α_ref·(1 + k·(T − T_ref)) 均值积分
 */
import { auditCriticalInputs, applyReleaseGate } from '@/utils/critical-input-guard'

export const THERMAL_ALPHA_DEFINITION =
  'Simple/complete: constant α at reference temperature; professional: optional linear α(T) mean-value correction'

export const THERMAL_MATERIALS = {
  steel: { label: '碳钢 / 合金钢', alpha: 11.5e-6, alphaTempCoeff: 2.4e-5, referenceTemp: 20 },
  stainless: { label: '不锈钢', alpha: 17.3e-6, alphaTempCoeff: 2.2e-5, referenceTemp: 20 },
  cast_iron: { label: '铸铁', alpha: 10.5e-6, alphaTempCoeff: 2.0e-5, referenceTemp: 20 },
  aluminum: { label: '铝合金', alpha: 23.6e-6, alphaTempCoeff: 3.0e-5, referenceTemp: 20 },
  copper: { label: '铜合金', alpha: 17.0e-6, alphaTempCoeff: 2.5e-5, referenceTemp: 20 },
  brass: { label: '黄铜', alpha: 18.7e-6, alphaTempCoeff: 2.6e-5, referenceTemp: 20 },
  titanium: { label: '钛合金', alpha: 8.6e-6, alphaTempCoeff: 1.8e-5, referenceTemp: 20 },
}

/** α(T) = α_ref · (1 + k · (T − T_ref))；k 为相对温度系数 (/°C) */
export function alphaAtTemperature(alphaRef, tempC, refTemp = 20, alphaTempCoeff = 0) {
  if (!alphaTempCoeff || tempC == null) return alphaRef
  return alphaRef * (1 + alphaTempCoeff * (tempC - refTemp))
}

export function resolveThermalAlphaOptions(input = {}, materialKey = 'steel') {
  const mat = THERMAL_MATERIALS[materialKey] ?? THERMAL_MATERIALS.steel
  const referenceTemp = input.referenceTemp ?? mat.referenceTemp ?? 20
  const alphaTempCoeff = input.alphaTempCoeff ?? mat.alphaTempCoeff ?? 0
  const useAlphaTemperature =
    input.useAlphaTemperature ?? (input.calcMode === 'professional')
  return { referenceTemp, alphaTempCoeff, useAlphaTemperature }
}

export function calcLinearExpansion(length, alpha, deltaT, options = {}) {
  const { referenceTemp = 20, alphaTempCoeff = 0, useAlphaTemperature = false } = options
  if (!length || !deltaT) return 0
  if (!useAlphaTemperature || !alphaTempCoeff) {
    return alpha * length * deltaT
  }
  const alphaMean = alpha * (1 + alphaTempCoeff * deltaT / 2)
  return alphaMean * length * deltaT
}

export function calcDiameterExpansion(diameter, alpha, deltaT, options = {}) {
  return calcLinearExpansion(diameter, alpha, deltaT, options)
}

export function calcFitChange({
  shaftDiameter,
  holeDiameter,
  shaftAlpha,
  holeAlpha,
  deltaT,
  initialInterference,
  expansionOptions = {},
  shaftExpansionOptions = {},
  holeExpansionOptions = {},
}) {
  const dShaft = calcDiameterExpansion(shaftDiameter, shaftAlpha, deltaT, {
    ...expansionOptions,
    ...shaftExpansionOptions,
  })
  const dHole = calcDiameterExpansion(holeDiameter, holeAlpha, deltaT, {
    ...expansionOptions,
    ...holeExpansionOptions,
  })
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
    alphaTemperatureUsed: Boolean(expansionOptions.useAlphaTemperature),
  }
}

export function analyzeThermalExpansion(input) {
  const calcMode = input.calcMode ?? 'simple'
  const alpha1 = input.alpha ?? THERMAL_MATERIALS.steel.alpha
  const alpha2 = input.alpha2 ?? alpha1
  const deltaT = input.deltaT ?? 0
  const Tref = input.referenceTemp ?? 20
  const Toper = input.operatingTemp ?? Tref + deltaT
  const expansionOpts = {
    referenceTemp: Tref,
    alphaTempCoeff: input.alphaTempCoeff ?? THERMAL_MATERIALS.steel.alphaTempCoeff,
    useAlphaTemperature: input.useAlphaTemperature ?? calcMode === 'professional',
  }
  const shaftOpts = {
    ...expansionOpts,
    alphaTempCoeff: input.shaftAlphaTempCoeff ?? input.alphaTempCoeff ?? expansionOpts.alphaTempCoeff,
  }
  const holeOpts = {
    ...expansionOpts,
    alphaTempCoeff: input.holeAlphaTempCoeff ?? input.alpha2TempCoeff ?? expansionOpts.alphaTempCoeff,
  }

  const linear1 = calcLinearExpansion(input.length ?? 100, alpha1, deltaT, expansionOpts)
  const linear2 = input.length2 ? calcLinearExpansion(input.length2, alpha2, deltaT, holeOpts) : null
  const linear1Constant = calcLinearExpansion(input.length ?? 100, alpha1, deltaT, {
    useAlphaTemperature: false,
  })

  let fit = null
  if (input.shaftDiameter && input.holeDiameter) {
    fit = calcFitChange({
      shaftDiameter: input.shaftDiameter,
      holeDiameter: input.holeDiameter,
      shaftAlpha: alpha1,
      holeAlpha: alpha2,
      deltaT,
      initialInterference: input.initialInterference,
      expansionOptions: expansionOpts,
      shaftExpansionOptions: shaftOpts,
      holeExpansionOptions: holeOpts,
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
    linearExpansionConstantAlpha: linear1Constant,
    linearExpansion2: linear2,
    fit,
    alphaTemperatureUsed: expansionOpts.useAlphaTemperature,
    alphaDefinition: THERMAL_ALPHA_DEFINITION,
    alphaAtOperating: alphaAtTemperature(alpha1, Toper, Tref, expansionOpts.alphaTempCoeff),
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
        expansionOptions: expansionOpts,
        shaftExpansionOptions: shaftOpts,
        holeExpansionOptions: holeOpts,
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
          expansionOptions: expansionOpts,
          shaftExpansionOptions: shaftOpts,
          holeExpansionOptions: holeOpts,
        })
        result.serviceFit = serviceFit
        result.fit = serviceFit
      }
    }
    result.pass = !(result.fit?.becomesClearance ?? false)
  }

  if (calcMode === 'professional' && result.fit) {
    result.interferenceMargin = result.fit.finalInterference
    result.clearanceRisk = result.fit.becomesClearance
    result.recommendedMaxDeltaT = input.maxDeltaT ?? Math.abs(deltaT) * 1.2
  }

  if (calcMode === 'simple') {
    result.estimateOnly = true
    result.pass = false
  } else if (
    input.enforceCriticalConfirm &&
    (calcMode === 'complete' || calcMode === 'professional')
  ) {
    applyReleaseGate(result, auditCriticalInputs('thermal-expansion', calcMode, input))
  }

  return result
}
