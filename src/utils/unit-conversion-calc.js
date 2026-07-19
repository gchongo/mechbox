/**
 * 工程单位换算 — 批量转换与单值换算
 */

export const UNIT_CATEGORIES = {
  stress: {
    label: '应力 / 压力',
    base: 'MPa',
    units: {
      MPa: 1,
      GPa: 1000,
      kPa: 0.001,
      Pa: 1e-6,
      psi: 0.00689476,
      ksi: 6.89476,
      bar: 0.1,
      'N/mm²': 1,
    },
  },
  force: {
    label: '力',
    base: 'N',
    units: {
      N: 1,
      kN: 1000,
      MN: 1e6,
      lbf: 4.44822,
      kgf: 9.80665,
      dyn: 1e-5,
    },
  },
  torque: {
    label: '扭矩',
    base: 'N·m',
    units: {
      'N·m': 1,
      'N·mm': 0.001,
      'kN·m': 1000,
      'lbf·ft': 1.35582,
      'lbf·in': 0.112985,
      'kgf·m': 9.80665,
      'kgf·cm': 0.0980665,
    },
  },
  length: {
    label: '长度',
    base: 'mm',
    units: {
      mm: 1,
      cm: 10,
      m: 1000,
      μm: 0.001,
      in: 25.4,
      ft: 304.8,
      mil: 0.0254,
    },
  },
  area: {
    label: '面积',
    base: 'mm²',
    units: {
      'mm²': 1,
      'cm²': 100,
      'm²': 1e6,
      公顷: 1e10, // 1 ha = 10⁴ m²
      'km²': 1e12,
      // 市制：1 亩 = 2000/3 m²（法定）
      亩: (2000 / 3) * 1e6,
      分: (200 / 3) * 1e6, // 1 分 = 0.1 亩
      顷: (2000 / 3) * 1e8, // 1 顷 = 100 亩
      'in²': 645.16,
      'ft²': 92903.04,
      'yd²': 836127.36,
      acre: 4.0468564224e9, // 4046.8564224 m²
      'mi²': 2.589988110336e12,
    },
  },
  volume: {
    label: '体积',
    base: 'cm³',
    units: {
      'mm³': 0.001,
      'cm³': 1,
      'm³': 1e6,
      'L': 1000,
      'in³': 16.3871,
      'ft³': 28316.8,
    },
  },
  mass: {
    label: '质量',
    base: 'kg',
    units: {
      g: 0.001,
      kg: 1,
      t: 1000,
      lb: 0.453592,
      oz: 0.0283495,
    },
  },
  temperature: {
    label: '温度',
    base: '°C',
    special: true,
  },
  power: {
    label: '功率',
    base: 'kW',
    units: {
      W: 0.001,
      kW: 1,
      MW: 1000,
      hp: 0.7457,
      'ft·lbf/s': 0.00135582,
    },
  },
  density: {
    label: '密度',
    base: 'g/cm³',
    units: {
      'g/cm³': 1,
      'kg/m³': 0.001,
      'lb/in³': 27.6799,
      'lb/ft³': 0.0160185,
    },
  },
  velocity: {
    label: '速度',
    base: 'm/s',
    units: {
      'm/s': 1,
      'mm/s': 0.001,
      'km/h': 1 / 3.6,
      'ft/s': 0.3048,
      'mph': 0.44704,
    },
  },
  energy: {
    label: '能量',
    base: 'J',
    units: {
      J: 1,
      kJ: 1000,
      'N·m': 1,
      'ft·lbf': 1.35582,
      cal: 4.184,
      kcal: 4184,
    },
  },
}

/** 线性单位换算（除温度外） */
export function convertUnit(value, fromUnit, toUnit, categoryId) {
  const cat = UNIT_CATEGORIES[categoryId]
  if (!cat) return { errorKey: 'unit_unknown_category' }
  if (cat.special) return convertTemperature(value, fromUnit, toUnit)

  const fromFactor = cat.units[fromUnit]
  const toFactor = cat.units[toUnit]
  if (fromFactor == null || toFactor == null) {
    return { errorKey: 'unit_unknown_unit' }
  }

  const baseValue = value * fromFactor
  const result = baseValue / toFactor
  return { value: result, baseValue, category: categoryId }
}

export function convertTemperature(value, fromUnit, toUnit) {
  let celsius
  if (fromUnit === '°C') celsius = value
  else if (fromUnit === '°F') celsius = ((value - 32) * 5) / 9
  else if (fromUnit === 'K') celsius = value - 273.15
  else return { errorKey: 'unit_unknown_temp' }

  let result
  if (toUnit === '°C') result = celsius
  else if (toUnit === '°F') result = (celsius * 9) / 5 + 32
  else if (toUnit === 'K') result = celsius + 273.15
  else return { errorKey: 'unit_unknown_temp' }

  return { value: result, category: 'temperature' }
}

/** 批量换算：同一数值转换到该类别所有单位 */
export function convertToAll(value, fromUnit, categoryId) {
  const cat = UNIT_CATEGORIES[categoryId]
  if (!cat) return { errorKey: 'unit_unknown_category' }

  if (cat.special) {
    const rows = ['°C', '°F', 'K'].map((u) => {
      const r = convertTemperature(value, fromUnit, u)
      return { unit: u, value: round(r.value, 6) }
    })
    return { category: categoryId, label: cat.label, fromUnit, input: value, rows }
  }

  const rows = Object.keys(cat.units).map((u) => {
    const r = convertUnit(value, fromUnit, u, categoryId)
    return { unit: u, value: round(r.value, 8) }
  })
  return { category: categoryId, label: cat.label, fromUnit, input: value, rows }
}

/** 常用快捷换算对 */
export const QUICK_PAIRS = [
  { category: 'stress', from: 'MPa', to: 'psi', label: 'MPa → psi' },
  { category: 'stress', from: 'psi', to: 'MPa', label: 'psi → MPa' },
  { category: 'force', from: 'N', to: 'lbf', label: 'N → lbf' },
  { category: 'torque', from: 'N·m', to: 'lbf·ft', label: 'N·m → lbf·ft' },
  { category: 'length', from: 'mm', to: 'in', label: 'mm → in' },
  { category: 'length', from: 'in', to: 'mm', label: 'in → mm' },
  { category: 'power', from: 'kW', to: 'hp', label: 'kW → hp' },
  { category: 'temperature', from: '°C', to: '°F', label: '°C → °F' },
]

export function quickConvert(pairId, value) {
  const pair = QUICK_PAIRS[pairId]
  if (!pair) return { errorKey: 'unit_invalid_quick' }
  const cat = UNIT_CATEGORIES[pair.category]
  if (cat.special) {
    return { ...convertTemperature(value, pair.from, pair.to), from: pair.from, to: pair.to }
  }
  return { ...convertUnit(value, pair.from, pair.to, pair.category), from: pair.from, to: pair.to }
}

function round(v, d) {
  if (!Number.isFinite(v)) return v
  const f = 10 ** d
  return Math.round(v * f) / f
}

export function getUnitsForCategory(categoryId) {
  const cat = UNIT_CATEGORIES[categoryId]
  if (!cat) return []
  if (cat.special) return ['°C', '°F', 'K']
  return Object.keys(cat.units)
}
