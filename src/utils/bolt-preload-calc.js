/**
 * 螺栓预紧力：简化 / VDI 2230 扭矩分解 / 专业（刚度 + 嵌入 + 热膨胀）
 */
import {
  calcTensileStressArea,
  calcPitchDiameter,
  calcThreadTensileStress,
  THREAD_GRADES,
  METRIC_THREAD_PITCH,
  suggestPitch,
} from '@/utils/thread-calc'

/** VDI 2230 典型嵌入量参考 (μm) */
export const EMBEDMENT_PRESETS = {
  steel_standard: { label: '钢件·常规 (≈11μm)', value: 11 },
  steel_fine: { label: '钢件·精加工 (≈7μm)', value: 7 },
  aluminum: { label: '铝件 (≈15μm)', value: 15 },
  custom: { label: '自定义', value: null },
}

export const DEFAULT_E_MODULUS = {
  steel: 206000,
  aluminum: 70000,
}

/** 头部摩擦圆直径 D_km 粗估 */
export function estimateHeadFrictionDiameter(diameter) {
  return 1.45 * diameter
}

/** 头部支承面外径 d_W 粗估 (六角头) */
export function estimateHeadContactDiameter(diameter) {
  return 1.5 * diameter
}

export function estimateHoleDiameter(diameter) {
  return diameter + 1
}

export function estimateGripLength(diameter) {
  return diameter * 2
}

/** 摩擦锥简化：有效替代外径 D_A (VDI 2230 R1) */
export function estimateReplacementOuterDiameter(headContactDiameter, gripLength) {
  return headContactDiameter + 1.4 * gripLength
}

/** 螺栓柔度 δ_S [mm/N] */
export function calcBoltCompliance(gripLength, stressArea, youngModulus = DEFAULT_E_MODULUS.steel) {
  if (!gripLength || !stressArea || !youngModulus) return 0
  return gripLength / (youngModulus * stressArea)
}

/** 被夹紧件柔度 δ_P [mm/N] */
export function calcPlateCompliance(
  gripLength,
  holeDiameter,
  outerDiameter,
  youngModulus = DEFAULT_E_MODULUS.steel,
) {
  const area = (Math.PI / 4) * (outerDiameter ** 2 - holeDiameter ** 2)
  if (!gripLength || area <= 0 || !youngModulus) return 0
  return gripLength / (youngModulus * area)
}

/** 嵌入导致的预紧力损失 F_Z [N] */
export function calcEmbedmentLossForce(embedmentMm, deltaS, deltaP) {
  const delta = deltaS + deltaP
  if (!delta || !embedmentMm) return 0
  return embedmentMm / delta
}

/**
 * 温差引起的预紧力变化 ΔF_VT [N]
 * 简化：螺栓与板同温升 ΔT，(α_S - α_P) · ΔT · L_K / (δ_S + δ_P)
 */
export function calcThermalPreloadChange({
  deltaT = 0,
  gripLength,
  deltaS,
  deltaP,
  alphaBolt = 12e-6,
  alphaPlate = 12e-6,
}) {
  const delta = deltaS + deltaP
  if (!delta || !deltaT || !gripLength) return 0
  return ((alphaBolt - alphaPlate) * deltaT * gripLength) / delta
}

export function calcTighteningTorqueSimple(preload, diameter, frictionCoeff = 0.2) {
  return (frictionCoeff * diameter * preload) / 1000
}

export function calcPreloadFromTorqueSimple(torque, diameter, frictionCoeff = 0.2) {
  if (!frictionCoeff || !diameter) return 0
  return (torque * 1000) / (frictionCoeff * diameter)
}

export function calcTorqueFactorVDI2230({ pitch, d2, dKm, muG, muK }) {
  return 0.16 * pitch + 0.58 * d2 * muG + 0.5 * dKm * muK
}

export function calcTighteningTorqueVDI2230(preload, params) {
  const pitch = params.pitch
  const d2 = params.d2 ?? calcPitchDiameter(params.diameter, pitch)
  const dKm = params.dKm ?? estimateHeadFrictionDiameter(params.diameter)
  const factor = calcTorqueFactorVDI2230({
    pitch,
    d2,
    dKm,
    muG: params.muG ?? 0.12,
    muK: params.muK ?? 0.12,
  })
  return (preload * factor) / 1000
}

export function calcPreloadFromTorqueVDI2230(torque, params) {
  const pitch = params.pitch
  const d2 = params.d2 ?? calcPitchDiameter(params.diameter, pitch)
  const dKm = params.dKm ?? estimateHeadFrictionDiameter(params.diameter)
  const factor = calcTorqueFactorVDI2230({
    pitch,
    d2,
    dKm,
    muG: params.muG ?? 0.12,
    muK: params.muK ?? 0.12,
  })
  if (!factor) return 0
  return (torque * 1000) / factor
}

export function calcTorqueBreakdownVDI2230(preload, params) {
  const pitch = params.pitch
  const d2 = params.d2 ?? calcPitchDiameter(params.diameter, pitch)
  const dKm = params.dKm ?? estimateHeadFrictionDiameter(params.diameter)
  const muG = params.muG ?? 0.12
  const muK = params.muK ?? 0.12
  const thread = (preload * (0.16 * pitch + 0.58 * d2 * muG)) / 1000
  const head = (preload * 0.5 * dKm * muK) / 1000
  return { thread, head, total: thread + head, d2, dKm }
}

export function buildVdiParams(input, d, P) {
  return {
    diameter: d,
    pitch: P,
    muG: input.muG ?? 0.12,
    muK: input.muK ?? 0.12,
    dKm: input.dKm ?? estimateHeadFrictionDiameter(d),
  }
}

export function buildProfessionalJoint(input, d, As) {
  const gripLength = input.gripLength ?? estimateGripLength(d)
  const holeDiameter = input.holeDiameter ?? estimateHoleDiameter(d)
  const headContact = input.headContactDiameter ?? estimateHeadContactDiameter(d)
  const outerDiameter =
    input.outerDiameter ?? estimateReplacementOuterDiameter(headContact, gripLength)
  const eBolt = input.eModulusBolt ?? DEFAULT_E_MODULUS.steel
  const ePlate = input.eModulusPlate ?? DEFAULT_E_MODULUS.steel
  const embedmentMm = (input.embedmentUm ?? EMBEDMENT_PRESETS.steel_standard.value) / 1000

  const deltaS = calcBoltCompliance(gripLength, As, eBolt)
  const deltaP = calcPlateCompliance(gripLength, holeDiameter, outerDiameter, ePlate)
  const kS = deltaS ? 1 / deltaS : 0
  const kP = deltaP ? 1 / deltaP : 0
  const loadFactor = kS + kP ? kP / (kS + kP) : 0

  const embedmentLoss = calcEmbedmentLossForce(embedmentMm, deltaS, deltaP)
  const thermalDelta = calcThermalPreloadChange({
    deltaT: input.deltaT ?? 0,
    gripLength,
    deltaS,
    deltaP,
    alphaBolt: input.alphaBolt ?? 12e-6,
    alphaPlate: input.alphaPlate ?? 12e-6,
  })

  return {
    gripLength,
    holeDiameter,
    headContact,
    outerDiameter,
    embedmentMm,
    embedmentUm: embedmentMm * 1000,
    deltaS,
    deltaP,
    kS,
    kP,
    loadFactor,
    embedmentLoss,
    thermalDelta,
  }
}

/** F_拧紧 = F_目标 + F_Z - ΔF_VT；F_残余 = F_拧紧 - F_Z + ΔF_VT */
export function calcTighteningPreloadFromTarget(targetResidual, joint) {
  return targetResidual + joint.embedmentLoss - joint.thermalDelta
}

export function calcResidualPreloadFromTightening(tighteningPreload, joint) {
  return tighteningPreload - joint.embedmentLoss + joint.thermalDelta
}

/** VDI 2230 轴向工作载荷下的夹紧力、螺栓力与分离校核 */
export function calcJointUnderAxialLoad(preloadResidual, loadFactor, externalAxialLoad = 0) {
  const F_A = Math.max(externalAxialLoad, 0)
  const phi = loadFactor ?? 0
  const clampingForceRemaining = preloadResidual - F_A * (1 - phi)
  const maxBoltForce = preloadResidual + phi * F_A
  return {
    externalAxialLoad: F_A,
    clampingForceRemaining,
    maxBoltForce,
    separationPass: clampingForceRemaining >= 0,
    requiredClampLoad: F_A * (1 - phi),
  }
}

export function analyzeBoltPreload(input) {
  const d = input.diameter
  const P = input.pitch ?? METRIC_THREAD_PITCH[Math.round(d)] ?? 1.5
  const grade = THREAD_GRADES[input.grade ?? '8.8'] ?? THREAD_GRADES['8.8']
  const As = calcTensileStressArea(d, P)
  const calcMode = input.calcMode ?? 'simple'
  const useVdiTorque = calcMode === 'vdi2230' || calcMode === 'professional'
  const isProfessional = calcMode === 'professional'

  const vdiParams = buildVdiParams(input, d, P)
  const joint = isProfessional ? buildProfessionalJoint(input, d, As) : null

  let preloadTightening
  let preloadResidual
  let torque

  if (input.mode === 'torque2force') {
    torque = input.torque ?? 0
    preloadTightening = useVdiTorque
      ? calcPreloadFromTorqueVDI2230(torque, vdiParams)
      : calcPreloadFromTorqueSimple(torque, d, input.frictionCoeff ?? 0.2)
    preloadResidual = isProfessional
      ? calcResidualPreloadFromTightening(preloadTightening, joint)
      : preloadTightening
  } else {
    if (isProfessional) {
      preloadResidual = input.preload ?? 0
      preloadTightening = calcTighteningPreloadFromTarget(preloadResidual, joint)
    } else {
      preloadTightening = input.preload ?? 0
      preloadResidual = preloadTightening
    }
    torque = useVdiTorque
      ? calcTighteningTorqueVDI2230(preloadTightening, vdiParams)
      : calcTighteningTorqueSimple(preloadTightening, d, input.frictionCoeff ?? 0.2)
  }

  const stress = calcThreadTensileStress(
    isProfessional ? preloadTightening : preloadTightening,
    As,
  )
  const stressResidual = isProfessional
    ? calcThreadTensileStress(preloadResidual, As)
    : stress
  const maxPreload = grade.allowStress * As
  const breakdown = useVdiTorque
    ? calcTorqueBreakdownVDI2230(preloadTightening, vdiParams)
    : null

  const simpleTorque = calcTighteningTorqueSimple(preloadTightening, d, input.frictionCoeff ?? 0.2)
  const vdiTorque = calcTighteningTorqueVDI2230(preloadTightening, vdiParams)

  let jointLoad = null
  if (isProfessional && joint) {
    jointLoad = calcJointUnderAxialLoad(
      preloadResidual,
      joint.loadFactor,
      input.externalAxialLoad ?? 0,
    )
  }

  let compareLabelKey = 'vdi'
  let compareTorque = vdiTorque
  if (calcMode === 'simple') {
    compareLabelKey = 'vdi'
    compareTorque = vdiTorque
  } else if (calcMode === 'vdi2230') {
    compareLabelKey = 'simple'
    compareTorque = simpleTorque
  } else {
    compareLabelKey = 'simple'
    compareTorque = simpleTorque
  }

  const stressUnderLoad = jointLoad
    ? calcThreadTensileStress(jointLoad.maxBoltForce, As)
    : null

  let pass = stress <= grade.allowStress
  let passResidual = stressResidual <= grade.allowStress
  if (jointLoad?.externalAxialLoad > 0) {
    pass = pass && jointLoad.separationPass && (stressUnderLoad ?? 0) <= grade.allowStress
    passResidual =
      passResidual &&
      jointLoad.separationPass &&
      (stressUnderLoad ?? 0) <= grade.allowStress
  }

  return {
    calcMode,
    stressArea: As,
    pitch: P,
    pitchDiameter: calcPitchDiameter(d, P),
    preload: isProfessional ? preloadResidual : preloadTightening,
    preloadTightening,
    preloadResidual,
    torque,
    stress,
    stressResidual,
    stressUnderLoad,
    allowStress: grade.allowStress,
    grade: grade.label,
    maxPreload,
    pass,
    passResidual,
    breakdown,
    joint,
    jointLoad,
    compareTorque,
    compareLabelKey,
  }
}

export { THREAD_GRADES, METRIC_THREAD_PITCH, suggestPitch }
