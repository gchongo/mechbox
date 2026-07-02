/** ISO 6336 常用材料许用应力参考 (N/mm²) — 简化查表 */
export const GEAR_MATERIALS = {
  'st-soft': {
    id: 'st-soft',
    label: '调质钢 (软齿面)',
    sigmaHlim: 750,
    sigmaFlim: 320,
    sigmaHlimN: 750,
    sigmaFlimN: 320,
    heatTreatment: '调质',
  },
  'st-hard': {
    id: 'st-hard',
    label: '调质钢 (硬齿面)',
    sigmaHlim: 1200,
    sigmaFlim: 450,
    sigmaHlimN: 1200,
    sigmaFlimN: 450,
    heatTreatment: '调质+表面淬火',
  },
  'case-carburized': {
    id: 'case-carburized',
    label: '渗碳淬火钢',
    sigmaHlim: 1500,
    sigmaFlim: 550,
    sigmaHlimN: 1500,
    sigmaFlimN: 550,
    heatTreatment: '渗碳淬火',
  },
  'nitrided': {
    id: 'nitrided',
    label: '氮化钢',
    sigmaHlim: 1300,
    sigmaFlim: 420,
    sigmaHlimN: 1300,
    sigmaFlimN: 420,
    heatTreatment: '氮化',
  },
  'gg': {
    id: 'gg',
    label: '灰铸铁 (GG)',
    sigmaHlim: 500,
    sigmaFlim: 140,
    sigmaHlimN: 500,
    sigmaFlimN: 140,
    heatTreatment: '铸态',
  },
  'ggg': {
    id: 'ggg',
    label: '球墨铸铁 (GGG)',
    sigmaHlim: 780,
    sigmaFlim: 280,
    sigmaHlimN: 780,
    sigmaFlimN: 280,
    heatTreatment: '正火/调质',
  },
}

/** ISO 6336-3 齿形系数 YF（外齿轮，α=20°，h*fp=1，ρ*fp=0.38）插值表 */
export const YF_TABLE = [
  [17, 2.97], [18, 2.91], [19, 2.85], [20, 2.8], [22, 2.72], [24, 2.65],
  [25, 2.62], [26, 2.6], [28, 2.55], [30, 2.52], [35, 2.45], [40, 2.4],
  [45, 2.35], [50, 2.32], [60, 2.28], [80, 2.22], [100, 2.18], [150, 2.12],
  [200, 2.08],
]

export function lookupYF(z) {
  const teeth = Math.max(17, z)
  if (teeth <= YF_TABLE[0][0]) return YF_TABLE[0][1]
  for (let i = 0; i < YF_TABLE.length - 1; i++) {
    const [z0, y0] = YF_TABLE[i]
    const [z1, y1] = YF_TABLE[i + 1]
    if (teeth >= z0 && teeth <= z1) {
      const t = (teeth - z0) / (z1 - z0)
      return y0 + t * (y1 - y0)
    }
  }
  return YF_TABLE[YF_TABLE.length - 1][1]
}

/** 应力修正系数 YS (ISO 6336-3 简化) */
export function calcYS(z) {
  if (z < 40) return 2.0
  return 1.6 + 0.4 * Math.pow(40 / z, 3)
}
