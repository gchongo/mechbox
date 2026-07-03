/**
 * 设计链各步骤输入映射 + 实时 CalcResult 快照
 */

import { adaptShaftTorsion, adaptBearing, adaptKeyConnection, adaptBoltPreload, adaptBoltGroup, adaptFilletWeld } from '@/utils/calc-adapters'

/** 从共享输入构建某步骤的 analyze* 入参 */
export function buildStepInputs(chainType, stepKey, shared) {
  switch (chainType) {
    case 'powertrain':
      return buildPowertrainStepInputs(stepKey, shared)
    case 'bolt-joint':
      return buildBoltJointStepInputs(stepKey, shared)
    default:
      return { ...shared }
  }
}

function buildPowertrainStepInputs(stepKey, s) {
  switch (stepKey) {
    case 'shaft':
      return {
        calcMode: 'complete',
        diameter: s.shaftDiameter,
        torque: s.torque,
        yieldStrength: s.yieldStrength,
        length: 500,
      }
    case 'bearing':
      return {
        calcMode: 'simple',
        dynamicLoad: s.dynamicLoad ?? 30000,
        radialLoad: s.radialLoad,
        axialLoad: s.axialLoad,
        x: 1,
        y: 0,
        rpm: s.rpm,
        targetHours: s.targetHours,
        shaftDiameter: s.shaftDiameter,
        bearingType: 'ball',
      }
    case 'key':
      return {
        calcMode: 'complete',
        torque: s.torque,
        shaftDiameter: s.shaftDiameter,
        keyWidth: s.keyWidth ?? 8,
        keyHeight: 7,
        keyLength: s.keyLength ?? 28,
        hubLength: s.keyLength ?? 28,
        allowShear: 100,
        allowCrush: 150,
      }
    default:
      return { ...s }
  }
}

function buildBoltJointStepInputs(stepKey, s) {
  switch (stepKey) {
    case 'bolt-preload':
      return {
        calcMode: 'professional',
        mode: 'force2torque',
        diameter: s.diameter,
        pitch: s.pitch,
        grade: s.grade ?? '8.8',
        muG: 0.12,
        muK: 0.12,
        dKm: s.dKm ?? s.diameter * 1.45,
        gripLength: s.gripLength,
        holeDiameter: s.holeDiameter ?? s.diameter + 1,
        headContactDiameter: s.headContactDiameter ?? s.diameter + 5,
        outerDiameter: s.outerDiameter ?? s.diameter + 8,
        embedmentUm: 11,
        preload: s.preload,
        externalAxialLoad: s.externalAxialLoad,
      }
    case 'bolt-group':
      return {
        calcMode: 'complete',
        boltCount: s.boltCount,
        boltCircleRadius: s.boltCircleRadius,
        shearX: s.shearX,
        shearY: s.shearY,
        moment: s.moment,
        allowPerBolt: s.allowPerBolt ?? 8000,
        frictionCoeff: s.frictionCoeff ?? 0.2,
        clampForcePerBolt: s.clampForcePerBolt ?? s.preload,
        axialTension: s.axialTension ?? 0,
        pryingArm: s.pryingArm ?? 0,
        allowTensionPerBolt: s.allowTensionPerBolt ?? 12000,
      }
    case 'weld':
      return {
        calcMode: 'complete',
        legSize: s.legSize,
        weldLength: s.weldLength,
        force: s.weldForce ?? s.externalAxialLoad * 0.5,
        steelGrade: s.steelGrade ?? 'Q235',
        eccentricity: s.eccentricity ?? 20,
      }
    default:
      return { ...s }
  }
}

const ADAPTERS = {
  shaft: adaptShaftTorsion,
  bearing: adaptBearing,
  key: adaptKeyConnection,
  'bolt-preload': adaptBoltPreload,
  'bolt-group': adaptBoltGroup,
  weld: adaptFilletWeld,
}

/** 构建链上所有步骤的实时快照 */
export function buildChainSnapshots(chainType, sharedInputs) {
  const meta = CHAIN_STEP_KEYS[chainType]
  if (!meta) return {}
  const out = {}
  for (const stepKey of meta) {
    const toolId = STEP_TOOL_MAP[stepKey] ?? stepKey
    const adapter = ADAPTERS[toolId]
    if (!adapter) continue
    const inputs = buildStepInputs(chainType, stepKey, sharedInputs)
    out[stepKey] = adapter(inputs)
  }
  return out
}

export const CHAIN_STEP_KEYS = {
  powertrain: ['shaft', 'bearing', 'key'],
  'bolt-joint': ['bolt-preload', 'bolt-group', 'weld'],
}

const STEP_TOOL_MAP = {
  shaft: 'shaft',
  bearing: 'bearing',
  key: 'key',
  'bolt-preload': 'bolt-preload',
  'bolt-group': 'bolt-group',
  weld: 'weld',
}

/** 反算结果写回共享输入的字段映射 */
export const CHAIN_INVERSE_APPLY = {
  powertrain: {
    shaft: { 'min-diameter-standard': 'shaftDiameter', 'min-diameter-continuous': 'shaftDiameter' },
    bearing: { 'min-dynamic-load': 'dynamicLoad' },
    key: { 'min-key-length': 'keyLength' },
  },
  'bolt-joint': {
    'bolt-preload': { 'no-separation': 'preload' },
    'bolt-group': { 'min-bolt-count': 'boltCount' },
    weld: { 'min-leg-size': 'legSize', 'min-weld-length': 'weldLength' },
  },
}
