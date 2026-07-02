/** 常用工程材料力学性能库 (GB/T 参考值) */

export const MATERIALS = [
  {
    id: 'q235',
    name: 'Q235 碳素结构钢',
    category: '碳素钢',
    sigmaB: 375,
    sigmaS: 235,
    sigmaAllow: 157,
    tauAllow: 94,
    E: 206000,
    G: 79000,
    density: 7.85,
    note: '通用结构件',
  },
  {
    id: 'q345',
    name: 'Q345 低合金钢',
    category: '低合金钢',
    sigmaB: 470,
    sigmaS: 345,
    sigmaAllow: 230,
    tauAllow: 138,
    E: 206000,
    G: 79000,
    density: 7.85,
    note: '焊接结构、桥梁',
  },
  {
    id: '45',
    name: '45 优质碳素钢',
    category: '碳素钢',
    sigmaB: 600,
    sigmaS: 355,
    sigmaAllow: 237,
    tauAllow: 142,
    E: 206000,
    G: 79000,
    density: 7.85,
    note: '调质后用于轴、齿轮',
  },
  {
    id: '40cr',
    name: '40Cr 合金结构钢',
    category: '合金钢',
    sigmaB: 980,
    sigmaS: 785,
    sigmaAllow: 523,
    tauAllow: 314,
    E: 206000,
    G: 79000,
    density: 7.87,
    note: '调质/表面淬火',
  },
  {
    id: '20crmnti',
    name: '20CrMnTi 渗碳钢',
    category: '合金钢',
    sigmaB: 1080,
    sigmaS: 835,
    sigmaAllow: 557,
    tauAllow: 334,
    E: 206000,
    G: 79000,
    density: 7.85,
    note: '渗碳淬火齿轮',
  },
  {
    id: '304',
    name: '304 不锈钢',
    category: '不锈钢',
    sigmaB: 520,
    sigmaS: 205,
    sigmaAllow: 137,
    tauAllow: 82,
    E: 193000,
    G: 72000,
    density: 7.93,
    note: '耐腐蚀结构',
  },
  {
    id: '6061-t6',
    name: '6061-T6 铝合金',
    category: '铝合金',
    sigmaB: 310,
    sigmaS: 276,
    sigmaAllow: 184,
    tauAllow: 110,
    E: 68900,
    G: 26000,
    density: 2.70,
    note: '轻量化结构件',
  },
  {
    id: '7075-t6',
    name: '7075-T6 铝合金',
    category: '铝合金',
    sigmaB: 572,
    sigmaS: 503,
    sigmaAllow: 335,
    tauAllow: 201,
    E: 71700,
    G: 26000,
    density: 2.81,
    note: '高强度航空铝',
  },
  {
    id: 'ht200',
    name: 'HT200 灰铸铁',
    category: '铸铁',
    sigmaB: 200,
    sigmaS: 0,
    sigmaAllow: 80,
    tauAllow: 48,
    E: 100000,
    G: 40000,
    density: 7.25,
    note: '箱体、底座',
  },
  {
    id: 'qt500-7',
    name: 'QT500-7 球墨铸铁',
    category: '铸铁',
    sigmaB: 500,
    sigmaS: 320,
    sigmaAllow: 213,
    tauAllow: 128,
    E: 170000,
    G: 65000,
    density: 7.10,
    note: '齿轮、曲轴',
  },
  {
    id: 'h62',
    name: 'H62 黄铜',
    category: '铜合金',
    sigmaB: 315,
    sigmaS: 0,
    sigmaAllow: 105,
    tauAllow: 63,
    E: 105000,
    G: 40000,
    density: 8.43,
    note: '耐磨零件',
  },
  {
    id: 'tc4',
    name: 'TC4 钛合金',
    category: '钛合金',
    sigmaB: 895,
    sigmaS: 828,
    sigmaAllow: 552,
    tauAllow: 331,
    E: 110000,
    G: 44000,
    density: 4.43,
    note: '航空高强度',
  },
]

export function findMaterial(id) {
  return MATERIALS.find((m) => m.id === id) ?? null
}

export function searchMaterials(query) {
  const q = (query ?? '').trim().toLowerCase()
  if (!q) return MATERIALS
  return MATERIALS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.id.includes(q),
  )
}

export function getCategories() {
  return [...new Set(MATERIALS.map((m) => m.category))]
}

/** 温度折减许用应力 (简化线性, 参考温度 20°C) */
export function getAllowableAtTemp(material, tempC = 20, refTemp = 20) {
  if (!material) return null
  const factor = tempC <= refTemp ? 1 : Math.max(0.4, 1 - (tempC - refTemp) * 0.003)
  return {
    sigmaAllow: Math.round(material.sigmaAllow * factor),
    tauAllow: Math.round(material.tauAllow * factor),
    factor,
    tempC,
  }
}
