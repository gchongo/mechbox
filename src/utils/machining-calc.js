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

function resolveOperations(calcMode, inputOps) {
  if (calcMode === 'simple') return ['rough', 'finish']
  if (inputOps?.length) return inputOps
  return ['rough', 'semi', 'finish']
}

/**
 * 工序序列余量叠加
 * operations: ['rough', 'semi', 'finish'] 或自定义（完整/专业模式）
 */
export function calcMachiningAllowance(input) {
  const calcMode = input.calcMode ?? 'complete'
  const d = input.nominalDiameter ?? 50
  const L = input.length ?? 100
  const row = lookupRow(d)
  const grade = TOLERANCE_GRADES[input.toleranceGrade ?? 'medium'] ?? TOLERANCE_GRADES.medium

  const ops = resolveOperations(calcMode, input.operations)
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
  const endFace = input.endFaceAllowance ?? (calcMode === 'simple' ? 1 : 2)
  const stockDiameter = d + totalDiameter
  const stockLength = L + endFace * 2

  const result = {
    calcMode,
    nominalDiameter: d,
    length: L,
    toleranceGrade: grade.label,
    operations: ops,
    details,
    totalRadialAllowance: totalRadial,
    totalDiameterAllowance: totalDiameter,
    endFaceAllowance: endFace,
    recommendedStockDiameter: stockDiameter,
    recommendedStockLength: stockLength,
    materialRemovalVolume: (Math.PI / 4) * (stockDiameter ** 2 - d ** 2) * stockLength,
  }

  if (calcMode === 'complete' || calcMode === 'professional') {
    const grinding = calcGrindingAllowance(d)
    result.grindingAllowance = grinding.radial
    result.grindingDiameterAllowance = grinding.diameter
    result.minStockDiameter = d + row.finish * 2 * grade.factor
    result.stockMargin = stockDiameter - result.minStockDiameter
  }

  if (calcMode === 'professional') {
    const removalRate = input.removalRate ?? 50 // mm³/min
    result.removalRate = removalRate
    result.estimatedMachiningMinutes = result.materialRemovalVolume / removalRate
    result.totalWithGrinding = stockDiameter + (result.grindingDiameterAllowance ?? 0)
  }

  return result
}

/** 磨削余量 */
export function calcGrindingAllowance(diameter) {
  const row = lookupRow(diameter)
  return { radial: row.finish, diameter: row.finish * 2 }
}

export const MACHINING_MODE_OPS = {
  simple: ['rough', 'finish'],
  complete: ['rough', 'semi', 'finish'],
  professional: ['rough', 'semi', 'finish'],
}
