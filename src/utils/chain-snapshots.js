/**
 * 设计链各步骤输入映射 + 实时 CalcResult 快照
 */

import { adaptShaftTorsion, adaptBearing, adaptKeyConnection, adaptBoltPreload, adaptBoltGroup, adaptFilletWeld, adaptGasketFlange, adaptGear } from '@/utils/calc-adapters'
import { updateSharedInputs } from '@/utils/design-context'

/** 从共享输入构建某步骤的 analyze* 入参 */
export function buildStepInputs(chainType, stepKey, shared) {
  switch (chainType) {
    case 'powertrain':
      return buildPowertrainStepInputs(stepKey, shared)
    case 'bolt-joint':
      return buildBoltJointStepInputs(stepKey, shared)
    case 'flange-seal':
      return buildFlangeSealStepInputs(stepKey, shared)
    case 'gearbox':
      return buildGearboxStepInputs(stepKey, shared)
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
        // 始终跟踪步骤 1 预紧力，保证链内夹紧力联动
        clampForcePerBolt: s.preload,
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

function buildFlangeSealStepInputs(stepKey, s) {
  switch (stepKey) {
    case 'bolt-preload':
      return buildBoltJointStepInputs('bolt-preload', s)
    case 'bolt-group':
      return buildBoltJointStepInputs('bolt-group', s)
    case 'gasket-flange':
      return {
        calcMode: 'complete',
        boltCount: s.boltCount,
        preloadPerBolt: s.preload,
        gasketInner: s.gasketInner ?? 80,
        gasketOuter: s.gasketOuter ?? 110,
        pressure: s.pressure ?? 1.6,
        gasketMaterial: s.gasketMaterial ?? 'compressed_fiber',
        factorM: s.factorM,
        seatingStressY: s.seatingStressY,
        minSafety: s.minSafety ?? 1.2,
      }
    default:
      return { ...s }
  }
}

function buildGearboxStepInputs(stepKey, s) {
  switch (stepKey) {
    case 'gear':
      return {
        calcMode: 'complete',
        module: s.module ?? 2,
        pinionTeeth: s.pinionTeeth ?? 20,
        gearTeeth: s.gearTeeth ?? 40,
        faceWidth: s.faceWidth ?? 20,
        torque: s.torque,
        rpm: s.rpm,
        pressureAngle: s.pressureAngle ?? 20,
        helixAngle: s.helixAngle ?? 0,
        pinionMaterial: s.pinionMaterial ?? 'st-soft',
        gearMaterial: s.gearMaterial ?? 'st-soft',
        applicationFactor: s.applicationFactor ?? 1.25,
        iso1328Grade: s.iso1328Grade ?? 7,
        accuracyGrade: s.accuracyGrade ?? 7,
        minSafetyContact: s.minSafetyContact ?? 1.0,
        minSafetyBending: s.minSafetyBending ?? 1.4,
      }
    case 'shaft':
      return buildPowertrainStepInputs('shaft', s)
    case 'bearing': {
      const m = s.module ?? 2
      const z1 = s.pinionTeeth ?? 20
      const Ft = (2000 * (s.torque ?? 0)) / Math.max(m * z1, 1e-6)
      const alpha = ((s.pressureAngle ?? 20) * Math.PI) / 180
      const FrEst = Ft * Math.tan(alpha)
      return {
        ...buildPowertrainStepInputs('bearing', {
          ...s,
          radialLoad: s.radialLoad > 0 ? s.radialLoad : FrEst,
          axialLoad: s.axialLoad ?? 0,
        }),
        bore: s.shaftDiameter,
      }
    }
    case 'key':
      return buildPowertrainStepInputs('key', s)
    default:
      return { ...s }
  }
}

const ADAPTERS = {
  shaft: adaptShaftTorsion,
  bearing: adaptBearing,
  key: adaptKeyConnection,
  gear: adaptGear,
  'bolt-preload': adaptBoltPreload,
  'bolt-group': adaptBoltGroup,
  weld: adaptFilletWeld,
  'gasket-flange': adaptGasketFlange,
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
  'flange-seal': ['bolt-preload', 'bolt-group', 'gasket-flange'],
  gearbox: ['gear', 'shaft', 'bearing', 'key'],
}

const STEP_TOOL_MAP = {
  shaft: 'shaft',
  bearing: 'bearing',
  key: 'key',
  gear: 'gear',
  'bolt-preload': 'bolt-preload',
  'bolt-group': 'bolt-group',
  weld: 'weld',
  'gasket-flange': 'gasket-flange',
}

/**
 * 反算结果写回共享输入的字段映射
 * - string: 直接写 solution
 * - { field, from }: 从 result 路径取值（如 solutionRow.C）
 */
export const CHAIN_INVERSE_APPLY = {
  powertrain: {
    shaft: { 'min-diameter-standard': 'shaftDiameter', 'min-diameter-continuous': 'shaftDiameter' },
    bearing: {
      'min-dynamic-load': 'dynamicLoad',
      'pick-standard-model': { field: 'dynamicLoad', from: 'solutionRow.C' },
    },
    key: { 'min-key-length': 'keyLength' },
  },
  'bolt-joint': {
    'bolt-preload': { 'no-separation': 'preload' },
    'bolt-group': { 'min-bolt-count': 'boltCount' },
    weld: { 'min-leg-size': 'legSize', 'min-weld-length': 'weldLength' },
  },
  'flange-seal': {
    'bolt-preload': { 'no-separation': 'preload' },
    'bolt-group': { 'min-bolt-count': 'boltCount' },
    'gasket-flange': {},
  },
  gearbox: {
    gear: {},
    shaft: { 'min-diameter-standard': 'shaftDiameter', 'min-diameter-continuous': 'shaftDiameter' },
    bearing: {
      'min-dynamic-load': 'dynamicLoad',
      'pick-standard-model': { field: 'dynamicLoad', from: 'solutionRow.C' },
    },
    key: { 'min-key-length': 'keyLength' },
  },
}

/** 解析 CHAIN_INVERSE_APPLY 条目，得到 { field, value } 或 null */
export function resolveInverseApply(spec, result) {
  if (!spec || result == null) return null
  if (typeof spec === 'string') {
    if (result.solution == null || !Number.isFinite(Number(result.solution))) return null
    return { field: spec, value: Number(result.solution) }
  }
  if (spec.field && spec.from) {
    const value = getPath(result, spec.from)
    if (value == null || !Number.isFinite(Number(value))) return null
    return { field: spec.field, value: Number(value) }
  }
  return null
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/** 工具页 form 字段 → 设计链共享输入字段 */
export const CHAIN_TOOL_TO_SHARED = {
  powertrain: {
    shaft: [
      ['shaftDiameter', 'diameter'],
      ['torque', 'torque'],
      ['yieldStrength', 'yieldStrength'],
    ],
    bearing: [
      ['dynamicLoad', 'dynamicLoad'],
      ['radialLoad', 'radialLoad'],
      ['axialLoad', 'axialLoad'],
      ['rpm', 'rpm'],
      ['targetHours', 'targetHours'],
    ],
    key: [
      ['torque', 'torque'],
      ['shaftDiameter', 'shaftDiameter'],
      ['keyWidth', 'keyWidth'],
      ['keyLength', 'keyLength'],
    ],
  },
  'bolt-joint': {
    'bolt-preload': [
      ['diameter', 'diameter'],
      ['pitch', 'pitch'],
      ['preload', 'preload'],
      ['externalAxialLoad', 'externalAxialLoad'],
      ['gripLength', 'gripLength'],
    ],
    'bolt-group': [
      ['boltCount', 'boltCount'],
      ['boltCircleRadius', 'boltCircleRadius'],
      ['shearX', 'shearX'],
      ['shearY', 'shearY'],
      ['moment', 'moment'],
      ['allowPerBolt', 'allowPerBolt'],
      ['preload', 'clampForcePerBolt'],
    ],
    weld: [
      ['legSize', 'legSize'],
      ['weldLength', 'weldLength'],
      ['weldForce', 'force'],
    ],
  },
  'flange-seal': {
    'bolt-preload': [
      ['diameter', 'diameter'],
      ['pitch', 'pitch'],
      ['preload', 'preload'],
      ['externalAxialLoad', 'externalAxialLoad'],
      ['gripLength', 'gripLength'],
    ],
    'bolt-group': [
      ['boltCount', 'boltCount'],
      ['boltCircleRadius', 'boltCircleRadius'],
      ['shearX', 'shearX'],
      ['shearY', 'shearY'],
      ['moment', 'moment'],
      ['allowPerBolt', 'allowPerBolt'],
      ['preload', 'clampForcePerBolt'],
    ],
    'gasket-flange': [
      ['boltCount', 'boltCount'],
      ['preload', 'preloadPerBolt'],
      ['gasketInner', 'gasketInner'],
      ['gasketOuter', 'gasketOuter'],
      ['pressure', 'pressure'],
    ],
  },
  gearbox: {
    gear: [
      ['module', 'module'],
      ['pinionTeeth', 'pinionTeeth'],
      ['gearTeeth', 'gearTeeth'],
      ['faceWidth', 'faceWidth'],
      ['torque', 'torque'],
      ['rpm', 'rpm'],
    ],
    shaft: [
      ['shaftDiameter', 'diameter'],
      ['torque', 'torque'],
      ['yieldStrength', 'yieldStrength'],
    ],
    bearing: [
      ['dynamicLoad', 'dynamicLoad'],
      ['radialLoad', 'radialLoad'],
      ['axialLoad', 'axialLoad'],
      ['rpm', 'rpm'],
      ['targetHours', 'targetHours'],
      ['shaftDiameter', 'bore'],
    ],
    key: [
      ['torque', 'torque'],
      ['shaftDiameter', 'shaftDiameter'],
      ['keyWidth', 'keyWidth'],
      ['keyLength', 'keyLength'],
    ],
  },
}

/** 从工具页 form 提取可写回设计链的共享输入 patch */
export function extractSharedFromStepForm(chainType, stepKey, form) {
  const pairs = CHAIN_TOOL_TO_SHARED[chainType]?.[stepKey]
  if (!pairs || !form) return {}
  const patch = {}
  for (const [sharedKey, formKey] of pairs) {
    const v = form[formKey]
    if (v == null) continue
    if (typeof v === 'number' && Number.isFinite(v)) patch[sharedKey] = v
  }
  return patch
}

/** 将工具页 form 写回设计链共享输入 */
export function syncStepFormToChain(chainId, chainType, stepKey, form) {
  if (!chainId) return null
  const patch = extractSharedFromStepForm(chainType, stepKey, form)
  if (!Object.keys(patch).length) return null
  return updateSharedInputs(chainId, patch)
}
