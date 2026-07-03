/**
 * 疲劳寿命 — S-N 曲线与 Miner 累积损伤
 * Basquin: S = Sf' · (2N)^b  或  S = C · N^b
 */

export const SN_MATERIALS = {
  steel_45: {
    label: '45 钢（调质）',
    uts: 600,
    enduranceLimit: 280,
    sf: 900,
    b: -0.085,
    cycleLimit: 1e6,
  },
  steel_40cr: {
    label: '40Cr（调质）',
    uts: 785,
    enduranceLimit: 350,
    sf: 1100,
    b: -0.09,
    cycleLimit: 1e6,
  },
  spring_steel: {
    label: '弹簧钢',
    uts: 1600,
    enduranceLimit: 450,
    sf: 2000,
    b: -0.1,
    cycleLimit: 1e6,
  },
  aluminum_6061: {
    label: '6061-T6 铝合金',
    uts: 310,
    enduranceLimit: 97,
    sf: 450,
    b: -0.102,
    cycleLimit: 5e8,
  },
  cast_iron: {
    label: '灰铸铁',
    uts: 250,
    enduranceLimit: 100,
    sf: 400,
    b: -0.08,
    cycleLimit: 1e6,
  },
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
  if (!loads?.length) return { error: '至少一个载荷级' }

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
  let status = '安全'
  if (damage >= 1) status = '疲劳失效（D≥1）'
  else if (damage >= 0.8) status = '接近极限（D≥0.8）'

  return {
    totalDamage: damage,
    damagePercent: damage * 100,
    remainingLifeFraction: remaining,
    status,
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
    const Se = m.enduranceLimit * (input.surfaceFactor ?? 1) * (input.sizeFactor ?? 1)
    if (method === 'soderberg') {
      stressAmplitude = stressAmplitude / (1 - (input.meanStress / (uts || 1)))
    } else {
      stressAmplitude = stressAmplitude / (1 - (input.meanStress / (uts || 1)))
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
      result.goodmanPass = input.stressAmplitude / result.adjustedEndurance + input.meanStress / m.uts <= 1
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
