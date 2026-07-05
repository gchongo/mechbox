/**
 * 疲劳寿命 — S-N 曲线与 Miner 累积损伤
 * Basquin: S = Sf' · (2N)^b  或  S = C · N^b
 */
import { auditCriticalInputs, applyReleaseGate } from '@/utils/critical-input-guard'

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
        : calcLifeFromStress(snKey, basquinStress, { enduranceLimit: adjustedEndurance })
  }
  const fatiguePass =
    amp <= 0
      ? false
      : Number.isFinite(effectiveAmplitude) &&
        (effectiveAmplitude <= adjustedEndurance || (fatigueLife != null && fatigueLife >= target))

  return {
    snMaterial: snKey,
    snMaterialLabel: limits.label,
    stressAmplitude: amp,
    meanStress: mean,
    effectiveAmplitude,
    adjustedEndurance,
    fatigueLife,
    fatiguePass,
    zeroAmplitude: amp <= 0,
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

/** 给定应力幅，求寿命 (cycles)
 * @param {Object} [options]
 * @param {number} [options.enduranceLimit] 持久极限 (MPa)，默认材料 σ₋₁；专业模式传 Se′=ka·kb·σ₋₁
 */
export function calcLifeFromStress(material, stressAmplitude, options = {}) {
  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  const Sa = stressAmplitude
  const enduranceLimit = options.enduranceLimit ?? m.enduranceLimit
  if (Sa <= enduranceLimit) return Infinity

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
 * @param {Object} [options]
 * @param {number} [options.enduranceFactor=1]  ka·kb，修正持久极限 Se′=σ₋₁·factor
 * @param {number|null} [options.meanStress] 全局平均应力 Sm；各级 Sa 做 Goodman/Soderberg（恒定 Sm 假设）
 * @param {'goodman'|'soderberg'} [options.meanStressMethod='goodman']
 */
export function calcMinerDamage(material, loads, options = {}) {
  if (!loads?.length) return { errorKey: 'need_load_level' }

  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  const enduranceFactor = options.enduranceFactor ?? 1
  const adjustedEndurance = m.enduranceLimit * enduranceFactor
  const meanStress = options.meanStress
  const meanStressMethod = options.meanStressMethod ?? 'goodman'

  let damage = 0
  const details = []
  let hasInfiniteDamage = false

  for (const load of loads) {
    const rawSa = load.stress ?? load.stressAmplitude
    const n = load.cycles ?? 0
    if (rawSa <= 0 || n <= 0) continue

    let saEff = rawSa
    if (meanStress != null && meanStress > 0) {
      saEff = calcMeanStressEffectiveAmplitude(rawSa, meanStress, material, meanStressMethod)
    }

    if (!Number.isFinite(saEff)) {
      hasInfiniteDamage = true
      details.push({
        stress: rawSa,
        effectiveStress: null,
        cycles: n,
        lifeAtStress: 0,
        damage: Infinity,
        damagePct: Infinity,
        contributionPct: 0,
      })
      continue
    }
    if (saEff <= 0) continue

    const Nf =
      saEff <= adjustedEndurance
        ? Infinity
        : calcLifeFromStress(material, saEff, { enduranceLimit: adjustedEndurance })
    const ni = Nf === Infinity ? 0 : n / Nf
    if (!Number.isFinite(ni)) hasInfiniteDamage = true
    damage += Number.isFinite(ni) ? ni : 0
    details.push({
      stress: rawSa,
      effectiveStress: Math.round(saEff * 10) / 10,
      cycles: n,
      lifeAtStress: Nf === Infinity ? '∞' : Math.round(Nf),
      damage: ni,
      damagePct: Number.isFinite(ni) ? ni * 100 : Infinity,
      contributionPct: 0,
    })
  }

  if (!details.length) return { errorKey: 'need_load_level' }

  if (hasInfiniteDamage) damage = Infinity

  if (Number.isFinite(damage) && damage > 0) {
    for (const row of details) {
      row.contributionPct = Number.isFinite(row.damage) ? (row.damage / damage) * 100 : 0
    }
  } else if (!Number.isFinite(damage)) {
    for (const row of details) {
      row.contributionPct = row.damage === Infinity ? 100 : 0
    }
  }

  const remaining = Number.isFinite(damage) ? Math.max(0, 1 - damage) : 0
  let statusKey = 'safe'
  if (!Number.isFinite(damage) || damage >= 1) statusKey = 'fail'
  else if (damage >= 0.8) statusKey = 'warn'

  return {
    totalDamage: damage,
    damagePercent: Number.isFinite(damage) ? damage * 100 : Infinity,
    remainingLifeFraction: remaining,
    statusKey,
    pass: Number.isFinite(damage) && damage < 1,
    adjustedEndurance,
    meanStressApplied: meanStress != null && meanStress > 0,
    details,
  }
}

export function analyzeFatigue(input) {
  const calcMode = input.calcMode ?? 'complete'
  const material = input.material ?? 'steel_45'
  const m = SN_MATERIALS[material] ?? SN_MATERIALS.steel_45
  const rawAmplitude = Math.max(0, input.stressAmplitude ?? 0)
  let stressAmplitude = rawAmplitude

  if (calcMode === 'professional' && input.meanStress != null) {
    stressAmplitude = calcMeanStressEffectiveAmplitude(
      rawAmplitude,
      input.meanStress,
      material,
      input.meanStressMethod ?? 'goodman',
    )
  }

  let life = null
  if (Number.isFinite(stressAmplitude) && stressAmplitude > 0) {
    const Se =
      m.enduranceLimit *
      (calcMode === 'professional' ? (input.surfaceFactor ?? 1) * (input.sizeFactor ?? 1) : 1)
    if (stressAmplitude <= Se) {
      life = Infinity
    } else {
      life = calcLifeFromStress(material, stressAmplitude, { enduranceLimit: Se })
    }
  }

  const targetLife = Math.max(1, Number(input.targetLife) || 1e6)

  let miner = null
  if (calcMode !== 'simple' && input.loads?.length) {
    const minerOptions =
      calcMode === 'professional'
        ? {
            enduranceFactor: (input.surfaceFactor ?? 1) * (input.sizeFactor ?? 1),
            meanStress: input.meanStress,
            meanStressMethod: input.meanStressMethod ?? 'goodman',
          }
        : {}
    miner = calcMinerDamage(material, input.loads, minerOptions)
  }

  const snCurve = generateSNCurve(material)

  let singleLevelPass = false
  if (calcMode !== 'simple' && Number.isFinite(stressAmplitude) && stressAmplitude > 0 && life != null) {
    singleLevelPass = life === Infinity || life >= targetLife
  }

  const result = {
    calcMode,
    material,
    materialLabel: m.label,
    stressAmplitude: rawAmplitude,
    effectiveAmplitude: stressAmplitude,
    life,
    lifeFormatted: life === Infinity ? '无限寿命' : life != null ? Math.round(life) : null,
    targetLife,
    miner,
    snCurve,
    enduranceLimit: m.enduranceLimit,
    singleLevelPass,
    pass: miner ? miner.pass : singleLevelPass,
  }

  if (calcMode === 'professional') {
    result.meanStress = input.meanStress
    result.meanStressMethod = input.meanStressMethod ?? 'goodman'
    result.surfaceFactor = input.surfaceFactor ?? 1
    result.sizeFactor = input.sizeFactor ?? 1
    result.adjustedEndurance = m.enduranceLimit * result.surfaceFactor * result.sizeFactor
    if (input.meanStress != null && rawAmplitude > 0 && Number.isFinite(stressAmplitude)) {
      result.goodmanPass = stressAmplitude <= result.adjustedEndurance
      result.singleLevelPass = singleLevelPass && result.goodmanPass
      // 有 Miner 谱时平均应力已在各级 Nf 中体现，综合 pass 不再重复 goodmanPass
      if (!miner) {
        result.pass = result.pass && result.goodmanPass
      }
    }
  }

  if (calcMode === 'simple') {
    result.estimateOnly = true
    result.pass = false
  } else if (input.enforceCriticalConfirm) {
    applyReleaseGate(result, auditCriticalInputs('fatigue', calcMode, input))
  }

  return result
}

/** PDF / 报告用纯文本摘要 */
export function buildFatigueReportText(result, locale = 'zh') {
  if (!result) return ''
  const zh = locale !== 'en'
  const lines = []
  if (result.releaseBlocked) {
    lines.push(zh ? '【未放行】关键输入未全部确认，下列数值仅供参考' : '[NOT RELEASED] Critical inputs unconfirmed — values for review only')
  }
  lines.push(`${zh ? '材料' : 'Material'}: ${result.materialLabel ?? result.material}`)
  lines.push(`${zh ? '模式' : 'Mode'}: ${result.calcMode}`)
  lines.push(`${zh ? '应力幅 Sa' : 'Sa'}: ${result.stressAmplitude} MPa`)
  if (result.calcMode === 'professional' && result.meanStress != null) {
    lines.push(
      `${zh ? '平均应力 Sm' : 'Sm'}: ${result.meanStress} MPa (${result.meanStressMethod ?? 'goodman'})`,
    )
    lines.push(
      `${zh ? '等效应力幅' : 'Effective Sa'}: ${result.effectiveAmplitude?.toFixed?.(1) ?? result.effectiveAmplitude} MPa`,
    )
    lines.push(`${zh ? '修正疲劳极限 Se′' : "Se'"}: ${result.adjustedEndurance} MPa`)
  }
  lines.push(`${zh ? '目标寿命' : 'Target life'}: ${result.targetLife ?? 1e6}`)
  if (result.life != null) {
    lines.push(
      `${zh ? '单级估算寿命 N' : 'Single-level N'}: ${result.lifeFormatted ?? result.life}${
        result.singleLevelPass != null
          ? ` (${result.singleLevelPass ? (zh ? '满足目标' : 'meets target') : zh ? '未达目标' : 'below target'})`
          : ''
      }`,
    )
  }
  if (result.miner && !result.miner.errorKey) {
    lines.push(`${zh ? 'Miner 累积损伤 D' : 'Miner D'}: ${result.miner.totalDamage?.toFixed(4)}`)
    lines.push(
      `${zh ? 'Miner 判定' : 'Miner verdict'}: ${result.miner.pass ? (zh ? 'D<1 通过' : 'D<1 pass') : zh ? 'D≥1 不通过' : 'D≥1 fail'}`,
    )
    for (const row of result.miner.details ?? []) {
      const saNote =
        row.effectiveStress != null && row.effectiveStress !== row.stress
          ? ` (Sa_eff=${row.effectiveStress} MPa)`
          : ''
      const dmg = Number.isFinite(row.damage) ? row.damage.toFixed(4) : '∞'
      const share = Number.isFinite(row.contributionPct) ? row.contributionPct.toFixed(1) : '—'
      lines.push(
        `  Sa=${row.stress}${saNote} MPa, n=${row.cycles}, Nf=${row.lifeAtStress}, n/Nf=${dmg}, 占D=${share}%`,
      )
    }
  }
  lines.push(
    `${zh ? '综合 pass' : 'Overall pass'}: ${result.pass ? (zh ? '是' : 'yes') : zh ? '否' : 'no'}${
      result.releaseBlocked ? (zh ? '（未放行）' : ' (blocked)') : ''
    }`,
  )
  return lines.join('\n')
}

/** 解析载荷谱文本：应力,循环次数 每行 */
export function parseLoadSpectrum(text) {
  return String(text)
    .trim()
    .split(/\n/)
    .map((line) => line.split(/[,，\s]+/).filter(Boolean))
    .filter((p) => p.length >= 2)
    .map(([s, n]) => ({ stress: Number(s), cycles: Number(n) }))
    .filter((p) => !Number.isNaN(p.stress) && !Number.isNaN(p.cycles) && p.stress > 0 && p.cycles > 0)
}
