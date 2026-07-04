/**
 * 疲劳寿命 — S-N 曲线与 Miner 累积损伤
 * Basquin: S = Sf' · (2N)^b  或  S = C · N^b
 */

export const SN_MATERIALS = {
  steel_45: {
    label: '45 钢（调质）',
    uts: 600,
    yieldMin: 355,
    enduranceLimit: 280,
    sf: 900,
    b: -0.085,
    cycleLimit: 1e6,
  },
  steel_40cr: {
    label: '40Cr（调质）',
    uts: 785,
    yieldMin: 540,
    enduranceLimit: 350,
    sf: 1100,
    b: -0.09,
    cycleLimit: 1e6,
  },
  spring_steel: {
    label: '弹簧钢',
    uts: 1600,
    yieldMin: 1400,
    enduranceLimit: 450,
    sf: 2000,
    b: -0.1,
    cycleLimit: 1e6,
  },
  aluminum_6061: {
    label: '6061-T6 铝合金',
    uts: 310,
    yieldMin: 276,
    enduranceLimit: 97,
    sf: 450,
    b: -0.102,
    cycleLimit: 5e8,
  },
  cast_iron: {
    label: '灰铸铁',
    uts: 250,
    yieldMin: 200,
    enduranceLimit: 100,
    sf: 400,
    b: -0.08,
    cycleLimit: 1e6,
  },
}

const SN_N_MIN = 1e2

/** 材料 S-N 曲线示意与应力幅输入的合理范围（端点落在曲线上） */
export function getStressAmplitudeBounds(materialKey) {
  const m = SN_MATERIALS[materialKey] ?? SN_MATERIALS.steel_45
  const saMax = calcFatigueStrength(materialKey, SN_N_MIN)
  const saMin = m.enduranceLimit
  const suggest = Math.round((saMin + saMax) / 2)
  return {
    saMin,
    saMax,
    peakStress: saMax,
    suggest,
    cycleLimit: m.cycleLimit ?? 1e6,
  }
}

/** 材料库 id → S-N 曲线键 */
export const MATERIAL_ID_TO_SN = {
  q235: 'steel_45',
  q195: 'steel_45',
  q345: 'steel_45',
  q460: 'steel_40cr',
  '16mn': 'steel_45',
  '20': 'steel_45',
  '35': 'steel_45',
  '45': 'steel_45',
  '40cr': 'steel_40cr',
  '20crmnti': 'steel_40cr',
  '20cr': 'steel_40cr',
  '35crmo': 'steel_40cr',
  '42crmo': 'steel_40cr',
  '38crmoal': 'steel_40cr',
  '65mn': 'steel_40cr',
  gcr15: 'steel_40cr',
  '12cr1mov': 'steel_45',
  '304': 'steel_45',
  '316': 'steel_45',
  '316l': 'steel_45',
  '2cr13': 'steel_40cr',
  '6061-t6': 'aluminum_6061',
  '7075-t6': 'aluminum_6061',
  '2024-t4': 'aluminum_6061',
  '2a12-t4': 'aluminum_6061',
  '5052-h32': 'aluminum_6061',
  adc12: 'aluminum_6061',
  ht200: 'cast_iron',
  ht250: 'cast_iron',
  ht300: 'cast_iron',
  'qt400-18': 'cast_iron',
  'qt500-7': 'cast_iron',
  'qt600-3': 'cast_iron',
  cast_iron: 'cast_iron',
  cr12: 'steel_40cr',
  cr12mov: 'steel_40cr',
  cr12mo1v1: 'steel_40cr',
  '4cr5mosiv1': 'steel_40cr',
  '3cr2w8v': 'steel_40cr',
  '3cr2mo': 'steel_40cr',
  '3cr2nimo': 'steel_40cr',
  '4cr13': 'steel_40cr',
  gh4169: 'steel_40cr',
  gh3030: 'steel_45',
  gh3044: 'steel_40cr',
  gh3128: 'steel_40cr',
  gh2132: 'steel_40cr',
  gh3536: 'steel_45',
}

export function resolveSnMaterialKey(input = {}) {
  if (input.snMaterial && SN_MATERIALS[input.snMaterial]) return input.snMaterial
  if (input.materialId && MATERIAL_ID_TO_SN[input.materialId]) {
    return MATERIAL_ID_TO_SN[input.materialId]
  }
  const sy = input.yieldStrength
  if (sy != null && sy >= 500) return 'steel_40cr'
  return 'steel_45'
}

/** 正应力 / 切应力强度换算（von Mises） */
export function getStressModeLimits(snKey, stressMode = 'normal') {
  const m = SN_MATERIALS[snKey] ?? SN_MATERIALS.steel_45
  const k = stressMode === 'shear' ? 1 / Math.sqrt(3) : 1
  return {
    uts: m.uts * k,
    yieldMin: m.yieldMin * k,
    enduranceLimit: m.enduranceLimit * k,
    label: m.label,
  }
}

/** Goodman / Soderberg 等效应力幅 */
export function calcMeanStressEffectiveAmplitude(
  amplitude,
  mean,
  snKey,
  method = 'goodman',
  stressMode = 'normal',
) {
  const Sa = amplitude ?? 0
  if (Sa <= 0) return 0
  const sm = mean ?? 0
  if (sm <= 0) return Sa
  const limits = getStressModeLimits(snKey, stressMode)
  const denom = method === 'soderberg' ? limits.yieldMin : limits.uts
  if (sm >= denom) return Infinity
  return Sa / (1 - sm / denom)
}

/**
 * 构件疲劳评估 — 统一 S-N + Goodman/Soderberg
 * @returns {{ snMaterial, effectiveAmplitude, adjustedEndurance, fatigueLife, fatiguePass }}
 */
export function assessComponentFatigue(input = {}) {
  const snKey = resolveSnMaterialKey(input)
  const limits = getStressModeLimits(snKey, input.stressMode ?? 'normal')
  const amp = input.stressAmplitude ?? 0
  const mean = input.meanStress ?? 0
  const method = input.meanStressMethod ?? 'goodman'
  const ka = input.surfaceFactor ?? 1
  const kb = input.sizeFactor ?? 1
  const target = input.targetCycles ?? input.targetLife ?? 1e6

  const effectiveAmplitude = calcMeanStressEffectiveAmplitude(amp, mean, snKey, method, input.stressMode)
  const adjustedEndurance = limits.enduranceLimit * ka * kb
  const basquinStress =
    input.stressMode === 'shear' ? effectiveAmplitude * Math.sqrt(3) : effectiveAmplitude
  let fatigueLife = null
  if (effectiveAmplitude > 0 && Number.isFinite(effectiveAmplitude)) {
    fatigueLife =
      effectiveAmplitude <= adjustedEndurance
        ? Infinity
        : calcLifeFromStress(snKey, basquinStress)
  }
  const fatiguePass =
    amp <= 0 ||
    (Number.isFinite(effectiveAmplitude) &&
      (effectiveAmplitude <= adjustedEndurance || (fatigueLife != null && fatigueLife >= target)))

  return {
    snMaterial: snKey,
    snMaterialLabel: limits.label,
    stressAmplitude: amp,
    meanStress: mean,
    effectiveAmplitude,
    adjustedEndurance,
    fatigueLife,
    fatiguePass,
    targetCycles: target,
  }
}

/** 疲劳强度 at N cycles (MPa) — 双对数 Basquin */
export function calcFatigueStrength(material, cycles) {
  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  const N = Math.max(cycles, 1)
  const Nref = m.cycleLimit ?? 1e6

  if (N >= Nref) {
    return m.enduranceLimit
  }

  // log-log: log(S) = log(Sf) + b·log(N)
  const S = m.sf * N ** m.b
  return Math.max(S, m.enduranceLimit)
}

/** 给定应力幅，求寿命 (cycles) */
export function calcLifeFromStress(material, stressAmplitude) {
  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  const Sa = stressAmplitude
  if (Sa <= m.enduranceLimit) return Infinity

  // Sa = sf * N^b  =>  N = (Sa/sf)^(1/b)
  const N = (Sa / m.sf) ** (1 / m.b)
  return Math.max(N, 1)
}

/** 生成 S-N 曲线点 */
export function generateSNCurve(material, points = 40) {
  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  const Nmin = 1e2
  const Nmax = 1e8
  const curve = []
  for (let i = 0; i <= points; i++) {
    const logN = Math.log10(Nmin) + (i / points) * (Math.log10(Nmax) - Math.log10(Nmin))
    const N = 10 ** logN
    curve.push({ N, S: calcFatigueStrength(material, N) })
  }
  return { material: m.label, curve, enduranceLimit: m.enduranceLimit }
}

/**
 * Miner 累积损伤
 * loads: [{ stress, cycles }]  stress 为应力幅 (MPa)
 */
export function calcMinerDamage(material, loads) {
  if (!loads?.length) return { errorKey: 'need_load_level' }

  let damage = 0
  const details = []

  for (const load of loads) {
    const Sa = load.stress ?? load.stressAmplitude
    const n = load.cycles ?? 0
    if (Sa <= 0 || n <= 0) continue

    const Nf = calcLifeFromStress(material, Sa)
    const ni = Nf === Infinity ? 0 : n / Nf
    damage += ni
    details.push({
      stress: Sa,
      cycles: n,
      lifeAtStress: Nf === Infinity ? '∞' : Math.round(Nf),
      damage: ni,
      damagePct: ni * 100,
    })
  }

  const remaining = Math.max(0, 1 - damage)
  let statusKey = 'safe'
  if (damage >= 1) statusKey = 'fail'
  else if (damage >= 0.8) statusKey = 'warn'

  return {
    totalDamage: damage,
    damagePercent: damage * 100,
    remainingLifeFraction: remaining,
    statusKey,
    pass: damage < 1,
    details,
  }
}

export function analyzeFatigue(input) {
  const calcMode = input.calcMode ?? 'complete'
  const material = input.material ?? 'steel_45'
  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  let stressAmplitude = input.stressAmplitude ?? 0

  if (calcMode === 'professional' && input.meanStress != null) {
    const method = input.meanStressMethod ?? 'goodman'
    const uts = m.uts
    const yieldStrength = input.yieldStrength ?? m.yieldMin ?? uts * 0.6
    const meanDenom = method === 'soderberg' ? yieldStrength : uts
    if (meanDenom > 0 && input.meanStress < meanDenom) {
      stressAmplitude = stressAmplitude / (1 - input.meanStress / meanDenom)
    } else {
      stressAmplitude = Infinity
    }
    stressAmplitude = Math.max(stressAmplitude, 0)
  }

  let life = null
  if (stressAmplitude > 0) {
    const Se = m.enduranceLimit * (calcMode === 'professional' ? (input.surfaceFactor ?? 1) * (input.sizeFactor ?? 1) : 1)
    if (stressAmplitude <= Se) {
      life = Infinity
    } else {
      life = calcLifeFromStress(material, stressAmplitude)
    }
  }

  let miner = null
  if (calcMode !== 'simple' && input.loads?.length) {
    miner = calcMinerDamage(material, input.loads)
  }

  const snCurve = generateSNCurve(material)

  const result = {
    calcMode,
    material,
    materialLabel: m.label,
    stressAmplitude: input.stressAmplitude,
    effectiveAmplitude: stressAmplitude,
    life,
    lifeFormatted: life === Infinity ? '无限寿命' : life != null ? Math.round(life) : null,
    miner,
    snCurve,
    enduranceLimit: m.enduranceLimit,
    pass: miner ? miner.pass : life === Infinity || (life != null && life >= (input.targetLife ?? 1e6)),
  }

  if (calcMode === 'professional') {
    result.meanStress = input.meanStress
    result.surfaceFactor = input.surfaceFactor ?? 1
    result.sizeFactor = input.sizeFactor ?? 1
    result.adjustedEndurance = m.enduranceLimit * result.surfaceFactor * result.sizeFactor
    if (input.meanStress != null && input.stressAmplitude > 0) {
      result.goodmanPass = stressAmplitude <= result.adjustedEndurance
      result.pass = result.pass && result.goodmanPass
    }
  }

  return result
}

/** 解析载荷谱文本：应力,循环次数 每行 */
export function parseLoadSpectrum(text) {
  return String(text)
    .trim()
    .split(/\n/)
    .map((line) => line.split(/[,，\s]+/).filter(Boolean))
    .filter((p) => p.length >= 2)
    .map(([s, n]) => ({ stress: Number(s), cycles: Number(n) }))
    .filter((p) => !Number.isNaN(p.stress) && !Number.isNaN(p.cycles))
}
