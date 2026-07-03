/**
 * 热处理硬度预测 — 碳当量、Jominy 端淬曲线、回火硬度（工程估算）
 */

/** IIW 碳当量 CE (%) */
export function calcCarbonEquivalent(composition) {
  const C = composition.C ?? 0
  const Mn = composition.Mn ?? 0
  const Cr = composition.Cr ?? 0
  const Mo = composition.Mo ?? 0
  const V = composition.V ?? 0
  const Ni = composition.Ni ?? 0
  const Cu = composition.Cu ?? 0
  const ce = C + Mn / 6 + (Cr + Mo + V) / 5 + (Ni + Cu) / 15
  return {
    ce: round(ce, 3),
    weldability:
      ce < 0.35 ? '良好' : ce < 0.45 ? '一般（需预热）' : ce < 0.6 ? '较差' : '差（高预热/后热）',
  }
}

/** 奥氏体晶粒度 ASTM 1–8，默认 7 */
export function estimateIdealCriticalDiameter(ce, grainSize = 7) {
  const grainFactor = 1 + (grainSize - 7) * 0.08
  const di = 25 * (1 - Math.exp(-ce * 1.8)) * grainFactor
  return round(Math.max(5, di), 1)
}

/** Jominy 端淬 HRC 估算（距淬火端距离 mm） */
export function estimateJominyHardness(ce, distanceMm, grainSize = 7) {
  const surfaceHRC = 20 + 58 * (1 - Math.exp(-ce * 0.85))
  const grainAdj = (grainSize - 7) * 1.5
  const dropRate = 0.35 + ce * 0.15
  const hrc = surfaceHRC - dropRate * distanceMm + grainAdj
  return round(clamp(hrc, 18, 65), 1)
}

/** 生成 Jominy 曲线点 */
export function generateJominyCurve(ce, grainSize = 7, maxDistance = 50, step = 2) {
  const points = []
  for (let d = 0; d <= maxDistance; d += step) {
    points.push({ distance: d, hrc: estimateJominyHardness(ce, d, grainSize) })
  }
  return points
}

/** 截面淬透性校核 */
export function assessHardenability(ce, partDiameterMm, grainSize = 7) {
  const di = estimateIdealCriticalDiameter(ce, grainSize)
  const ratio = partDiameterMm / di
  let verdict
  let coreHRC
  if (ratio <= 0.5) {
    verdict = '全截面可淬硬'
    coreHRC = estimateJominyHardness(ce, partDiameterMm * 0.25, grainSize)
  } else if (ratio <= 1) {
    verdict = '心部可能未完全淬硬'
    coreHRC = estimateJominyHardness(ce, partDiameterMm * 0.5, grainSize)
  } else {
    verdict = '仅表层可淬硬，心部偏软'
    coreHRC = estimateJominyHardness(ce, partDiameterMm * 0.8, grainSize)
  }
  return {
    idealCriticalDiameter: di,
    partDiameter: partDiameterMm,
    ratio: round(ratio, 2),
    verdict,
    estimatedCoreHRC: coreHRC,
    surfaceHRC: estimateJominyHardness(ce, 0, grainSize),
  }
}

/** Hollomon-Jaffe 参数与回火硬度 */
export function calcTemperedHardness(asQuenchedHRC, temperTempC, timeHours) {
  if (asQuenchedHRC <= 0) return { error: '淬火硬度无效' }
  const tSec = Math.max(timeHours, 0.01) * 3600
  const T = temperTempC + 273
  const pj = T * (20 + Math.log10(tSec))

  const tempFactor = (temperTempC / 600) ** 1.4
  const timeFactor = Math.log10(timeHours + 0.1) + 1
  const loss = asQuenchedHRC * tempFactor * timeFactor * 0.35
  const temperedHRC = clamp(asQuenchedHRC - loss, 18, asQuenchedHRC)

  let temperState
  if (temperedHRC >= 50) temperState = '高硬度（未充分回火）'
  else if (temperedHRC >= 40) temperState = '中硬度（调质范围）'
  else if (temperedHRC >= 30) temperState = '中等硬度'
  else temperState = '低硬度（软态）'

  return {
    asQuenchedHRC,
    temperedHRC: round(temperedHRC, 1),
    hollomonJaffe: round(pj, 0),
    temperTempC,
    timeHours,
    temperState,
    hardnessDrop: round(asQuenchedHRC - temperedHRC, 1),
  }
}

export const STEEL_PRESETS = {
  '1045': { label: '1045 碳钢', C: 0.45, Mn: 0.75, Cr: 0, Mo: 0, V: 0, Ni: 0, Cu: 0 },
  '4140': { label: '4140 合金钢', C: 0.4, Mn: 0.85, Cr: 0.95, Mo: 0.2, V: 0, Ni: 0, Cu: 0 },
  '4340': { label: '4340 合金钢', C: 0.4, Mn: 0.75, Cr: 0.8, Mo: 0.25, V: 0, Ni: 1.8, Cu: 0 },
  '8620': { label: '8620 渗碳钢', C: 0.2, Mn: 0.85, Cr: 0.5, Mo: 0.2, V: 0, Ni: 0.55, Cu: 0 },
}

export function analyzeHeatTreatment(input) {
  const comp = input.composition ?? STEEL_PRESETS['4140']
  const grainSize = input.grainSize ?? 7
  const partDiameter = input.partDiameter ?? 50
  const temperTemp = input.temperTemp ?? 550
  const temperTime = input.temperTime ?? 2

  const { ce, weldability } = calcCarbonEquivalent(comp)
  const hardenability = assessHardenability(ce, partDiameter, grainSize)
  const jominyCurve = generateJominyCurve(ce, grainSize)
  const temper = calcTemperedHardness(hardenability.surfaceHRC, temperTemp, temperTime)

  return {
    composition: comp,
    carbonEquivalent: ce,
    weldability,
    hardenability,
    jominyCurve,
    temper,
  }
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}
