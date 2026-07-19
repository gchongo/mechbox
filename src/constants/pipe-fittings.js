/**
 * 管路局部损失参考库（教材/手册量级，非正式标准全文）
 * K：速度头系数；LeD：等效长度 / 内径
 */
export const PIPE_FITTINGS = {
  elbow_90_std: { id: 'elbow_90_std', K: 0.9, LeD: 30, label: '90° 标准弯头' },
  elbow_90_lr: { id: 'elbow_90_lr', K: 0.45, LeD: 16, label: '90° 长半径弯头' },
  elbow_45: { id: 'elbow_45', K: 0.4, LeD: 16, label: '45° 弯头' },
  tee_through: { id: 'tee_through', K: 0.6, LeD: 20, label: '三通直通' },
  tee_branch: { id: 'tee_branch', K: 1.8, LeD: 60, label: '三通分支' },
  gate_open: { id: 'gate_open', K: 0.15, LeD: 8, label: '闸阀全开' },
  globe_open: { id: 'globe_open', K: 10, LeD: 340, label: '截止阀全开' },
  check_swing: { id: 'check_swing', K: 2.5, LeD: 100, label: '旋启式止回阀' },
  entrance_sharp: { id: 'entrance_sharp', K: 0.5, LeD: 25, label: '锐边入口' },
  exit: { id: 'exit', K: 1.0, LeD: 50, label: '出口' },
  reducer: { id: 'reducer', K: 0.5, LeD: 20, label: '变径（近似）' },
}

/**
 * @param {{ type: string, qty?: number }[]} fittings
 * @param {'K'|'LeD'} method
 * @param {number} diameterMm
 * @returns {{ totalK: number, equivalentLengthM: number, items: object[] }}
 */
export function sumFittingLosses(fittings = [], method = 'K', diameterMm = 50) {
  const D = Math.max(1e-6, Number(diameterMm) || 50) / 1000
  let totalK = 0
  let equivalentLengthM = 0
  const items = []

  for (const row of fittings) {
    const def = PIPE_FITTINGS[row.type]
    if (!def) continue
    const qty = Math.max(0, Number(row.qty) || 0)
    if (qty <= 0) continue
    const kPart = def.K * qty
    const lePart = def.LeD * D * qty
    totalK += kPart
    equivalentLengthM += lePart
    items.push({
      type: row.type,
      qty,
      K: def.K,
      LeD: def.LeD,
      contributionK: kPart,
      contributionLeM: lePart,
      label: def.label,
    })
  }

  return {
    method,
    totalK,
    equivalentLengthM,
    items,
    /** 用于压降：K 法用 totalK；Le/D 法把等效长度并入管长 */
    effectiveK: method === 'LeD' ? 0 : totalK,
    extraLengthM: method === 'LeD' ? equivalentLengthM : 0,
  }
}
