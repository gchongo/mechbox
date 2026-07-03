/**
 * 机加工余量计算
 */

export const TOLERANCE_GRADES = {
  coarse: { id: 'coarse', label: '粗加工 (IT11–IT13)', factor: 1.4 },
  medium: { id: 'medium', label: '半精加工 (IT8–IT10)', factor: 1.0 },
  fine: { id: 'fine', label: '精加工 (IT6–IT7)', factor: 0.6 },
}

/** 单面余量参考 (mm) — 按直径段 */
const ROUGH_TURN = [
  { maxD: 30, rough: 1.5, semi: 0.5, finish: 0.15 },
  { maxD: 50, rough: 2.0, semi: 0.6, finish: 0.2 },
  { maxD: 120, rough: 2.5, semi: 0.8, finish: 0.25 },
  { maxD: 250, rough: 3.0, semi: 1.0, finish: 0.3 },
  { maxD: Infinity, rough: 4.0, semi: 1.2, finish: 0.4 },
]

function lookupRow(diameter) {
  return ROUGH_TURN.find((r) => diameter <= r.maxD) ?? ROUGH_TURN[ROUGH_TURN.length - 1]
}

/**
 * 工序序列余量叠加
 * operations: ['rough', 'semi', 'finish'] 或自定义
 */
export function calcMachiningAllowance(input) {
  const d = input.nominalDiameter ?? 50
  const L = input.length ?? 100
  const row = lookupRow(d)
  const grade = TOLERANCE_GRADES[input.toleranceGrade ?? 'medium'] ?? TOLERANCE_GRADES.medium

  const ops = input.operations ?? ['rough', 'semi', 'finish']
  const details = []
  let totalRadial = 0

  for (const op of ops) {
    let allowance = 0
    if (op === 'rough') allowance = row.rough
    else if (op === 'semi') allowance = row.semi
    else if (op === 'finish') allowance = row.finish
    else allowance = Number(op) || 0

    allowance *= grade.factor
    totalRadial += allowance
    details.push({ operation: op, radialAllowance: allowance })
  }

  const totalDiameter = totalRadial * 2
  const stockDiameter = d + totalDiameter
  const stockLength = L + (input.endFaceAllowance ?? 2) * 2

  return {
    nominalDiameter: d,
    length: L,
    toleranceGrade: grade.label,
    details,
    totalRadialAllowance: totalRadial,
    totalDiameterAllowance: totalDiameter,
    recommendedStockDiameter: stockDiameter,
    recommendedStockLength: stockLength,
    materialRemovalVolume:
      (Math.PI / 4) * (stockDiameter ** 2 - d ** 2) * stockLength,
  }
}

/** 磨削余量 */
export function calcGrindingAllowance(diameter) {
  const row = lookupRow(diameter)
  return { radial: row.finish, diameter: row.finish * 2 }
}
