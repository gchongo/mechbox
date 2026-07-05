/**
 * 安全关键输入确认 — complete/professional 模式须用户显式确认关键参数后方可放行 pass
 * confirmedFields 由 UI 在用户编辑对应字段时置 true
 */

export const CRITICAL_INPUT_SPECS = {
  bearing: {
    complete: ['dynamicLoad', 'staticLoad', 'radialLoad', 'axialLoad', 'rpm', 'targetHours'],
    professional: [
      'dynamicLoad',
      'staticLoad',
      'radialLoad',
      'axialLoad',
      'rpm',
      'targetHours',
      'operatingTemp',
      'limitingSpeed',
    ],
  },
  cylinder: {
    complete: ['endFixity', 'strokeLength', 'yieldStrength', 'compressOnRetract'],
    professional: ['endFixity', 'strokeLength', 'yieldStrength', 'compressOnRetract', 'loadMass'],
  },
  'interference-fit': {
    complete: ['shaftDiameter', 'holeDiameter', 'hubOuterDiameter', 'fitLength', 'shaftAllowHoop', 'hubAllowHoop'],
    professional: [
      'shaftDiameter',
      'holeDiameter',
      'hubOuterDiameter',
      'fitLength',
      'shaftAllowHoop',
      'hubAllowHoop',
      'deltaT',
      'shaftAlpha',
      'holeAlpha',
    ],
  },
  spring: {
    complete: ['material', 'wireDiameter', 'outerDiameter', 'activeCoils', 'freeLength', 'installHeight', 'workingHeight', 'endType'],
    professional: [
      'material',
      'wireDiameter',
      'outerDiameter',
      'activeCoils',
      'freeLength',
      'installHeight',
      'workingHeight',
      'endType',
      'targetCycles',
      'tensileStrength',
    ],
  },
  'thermal-expansion': {
    complete: ['shaftDiameter', 'holeDiameter', 'deltaT'],
    professional: ['shaftDiameter', 'holeDiameter', 'assemblyDeltaT', 'serviceDeltaT'],
  },
  fatigue: {
    complete: ['material', 'stressAmplitude', 'targetLife'],
    professional: [
      'material',
      'stressAmplitude',
      'targetLife',
      'meanStress',
      'meanStressMethod',
      'surfaceFactor',
      'sizeFactor',
    ],
  },
  thread: {
    simple: ['diameter', 'grade', 'axialForce'],
    complete: ['diameter', 'grade', 'axialForce', 'engagedLength'],
    professional: ['diameter', 'grade', 'axialForce', 'engagedLength', 'muG', 'muK'],
  },
}

export const CRITICAL_INPUT_LABELS = {
  dynamicLoad: '额定动载荷 C',
  staticLoad: '额定静载荷 C₀',
  radialLoad: '径向载荷 Fr',
  axialLoad: '轴向载荷 Fa',
  rpm: '转速 n',
  targetHours: '目标寿命',
  seriesId: '轴承系列',
  bearingModel: '轴承型号',
  bearingType: '轴承类型',
  x: '系数 X',
  y: '系数 Y',
  operatingTemp: '工作温度',
  limitingSpeed: '极限转速',
  endFixity: '杆端约束 K',
  strokeLength: '行程',
  yieldStrength: '屈服强度',
  compressOnRetract: '压缩载荷工况',
  loadMass: '负载质量',
  shaftDiameter: '轴径',
  holeDiameter: '孔径',
  hubOuterDiameter: '轮毂外径',
  fitLength: '配合长度',
  shaftAllowHoop: '轴许用切向应力',
  hubAllowHoop: '孔许用切向应力',
  shaftAlpha: '轴线膨胀系数',
  holeAlpha: '孔线膨胀系数',
  deltaT: '温差 ΔT',
  assemblyDeltaT: '装配温差',
  serviceDeltaT: '服役温差',
  material: '材料',
  stressAmplitude: '应力幅',
  meanStress: '平均应力',
  surfaceFactor: '表面系数',
  sizeFactor: '尺寸系数 kb',
  targetLife: '目标循环次数 N_target',
  meanStressMethod: '平均应力修正方法',
  wireDiameter: '线径',
  outerDiameter: '外径 D₂',
  activeCoils: '有效圈数',
  freeLength: '自由高度 H₀',
  installHeight: '安装高度 H₁',
  workingHeight: '工作高度 H₂',
  endType: '端部形式',
  targetCycles: '目标循环次数',
  tensileStrength: '抗拉强度 Rm',
  diameter: '公称直径',
  grade: '性能等级',
  axialForce: '轴向力',
  engagedLength: '旋合长度',
  muG: '螺纹摩擦 μ_G',
  muK: '支承面摩擦 μ_K',
}

/** @returns {{ releaseAllowed: boolean, unconfirmed: string[], estimateOnly: boolean, allCriticalKeys: string[] }} */
export function auditCriticalInputs(moduleId, calcMode, input = {}) {
  const modeSpec = CRITICAL_INPUT_SPECS[moduleId] ?? {}
  const allCriticalKeys = modeSpec[calcMode] ?? modeSpec.complete ?? []
  const confirmed = input.confirmedFields ?? {}
  const unconfirmed = allCriticalKeys.filter((key) => !confirmed[key])
  const strict = calcMode !== 'simple' && allCriticalKeys.length > 0
  const releaseAllowed = !strict || unconfirmed.length === 0

  return {
    moduleId,
    calcMode,
    releaseAllowed,
    unconfirmed,
    estimateOnly: !releaseAllowed,
    allCriticalKeys,
  }
}

export function auditCriticalInputsWithKeys(moduleId, calcMode, input = {}, extraKeys = []) {
  const base = auditCriticalInputs(moduleId, calcMode, input)
  const allCriticalKeys = Array.from(new Set([...(base.allCriticalKeys ?? []), ...extraKeys]))
  const confirmed = input.confirmedFields ?? {}
  const unconfirmed = allCriticalKeys.filter((key) => !confirmed[key])
  const strict = calcMode !== 'simple' && allCriticalKeys.length > 0
  return {
    ...base,
    releaseAllowed: !strict || unconfirmed.length === 0,
    estimateOnly: strict && unconfirmed.length > 0,
    allCriticalKeys,
    unconfirmed,
  }
}

/** 合并放行门禁到计算结果；未确认时强制 pass=false */
export function applyReleaseGate(result, audit) {
  if (!audit) return result
  result.criticalInputAudit = audit
  result.unconfirmedCriticalInputs = audit.unconfirmed

  if (!audit.releaseAllowed) {
    result.pass = false
    result.estimateOnly = true
    result.releaseBlocked = true
    result.releaseBlockedReasonKey = 'critical_inputs_unconfirmed'
    return result
  }

  if (audit.calcMode === 'simple') {
    result.estimateOnly = result.estimateOnly !== false ? true : false
    if (result.estimateOnly) result.pass = false
  }

  return result
}

export function formatUnconfirmedLabels(keys, locale = 'zh') {
  return keys.map((k) => {
    if (locale === 'en') {
      const en = {
        endFixity: 'rod end restraint K',
        strokeLength: 'stroke length',
        yieldStrength: 'yield strength',
        compressOnRetract: 'compression load case',
        loadMass: 'load mass',
        shaftDiameter: 'shaft diameter',
        holeDiameter: 'bore diameter',
        deltaT: 'ΔT',
        assemblyDeltaT: 'assembly ΔT',
        serviceDeltaT: 'service ΔT',
        material: 'material',
        stressAmplitude: 'stress amplitude',
        meanStress: 'mean stress',
        surfaceFactor: 'surface factor',
        sizeFactor: 'size factor kb',
        targetLife: 'target cycles N_target',
        meanStressMethod: 'mean-stress method',
        diameter: 'nominal diameter',
        grade: 'property class',
        axialForce: 'axial force',
        engagedLength: 'engagement length',
        muG: 'thread friction μ_G',
        muK: 'bearing friction μ_K',
        dynamicLoad: 'basic dynamic load C',
        staticLoad: 'basic static load C₀',
        radialLoad: 'radial load Fr',
        axialLoad: 'axial load Fa',
        rpm: 'speed n',
        targetHours: 'target life',
        seriesId: 'bearing series',
        bearingModel: 'bearing designation',
        bearingType: 'bearing type',
        x: 'factor X',
        y: 'factor Y',
        operatingTemp: 'operating temperature',
        limitingSpeed: 'limiting speed',
        hubOuterDiameter: 'hub OD',
        fitLength: 'fit length',
        shaftAllowHoop: 'shaft allowable hoop stress',
        hubAllowHoop: 'bore allowable hoop stress',
        shaftAlpha: 'shaft alpha',
        holeAlpha: 'bore alpha',
        wireDiameter: 'wire diameter',
        outerDiameter: 'outer diameter D₂',
        activeCoils: 'active coils',
        freeLength: 'free height H₀',
        installHeight: 'installed height H₁',
        workingHeight: 'working height H₂',
        endType: 'end type',
        targetCycles: 'target cycles',
        tensileStrength: 'tensile strength Rm',
      }
      return en[k] ?? k
    }
    return CRITICAL_INPUT_LABELS[k] ?? k
  })
}
