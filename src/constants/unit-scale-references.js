/**
 * 单位换算「约等于」工程量级参照
 * value 为参照物在 baseUnit 下的典型值；ratio = inputBase / value
 */
import { convertUnit, convertTemperature, UNIT_CATEGORIES } from '@/utils/unit-conversion-calc'

/** @typedef {{ id: string, category: string, baseUnit: string, value: number, icon: string, labelKey: string, minRatio?: number, maxRatio?: number, priority?: number }} ScaleReference */

/** @type {ScaleReference[]} */
export const UNIT_SCALE_REFERENCES = [
  // 应力 / 压力 (base MPa)
  { id: 'atm', category: 'stress', baseUnit: 'MPa', value: 0.101325, icon: '🌍', labelKey: 'atmPressure', minRatio: 2, maxRatio: 1e6, priority: 1 },
  { id: 'tire', category: 'stress', baseUnit: 'MPa', value: 0.22, icon: '🛞', labelKey: 'tirePressure', minRatio: 0.5, maxRatio: 500, priority: 2 },
  { id: 'hydraulic', category: 'stress', baseUnit: 'MPa', value: 21, icon: '⚙️', labelKey: 'hydraulicPressure', minRatio: 0.05, maxRatio: 50, priority: 3 },
  { id: 'q235', category: 'stress', baseUnit: 'MPa', value: 235, icon: '🧱', labelKey: 'q235Yield', minRatio: 0.02, maxRatio: 5, priority: 4 },
  { id: 'q345', category: 'stress', baseUnit: 'MPa', value: 345, icon: '🏗️', labelKey: 'q345Yield', minRatio: 0.02, maxRatio: 5, priority: 5 },

  // 长度 (base mm)
  { id: 'hair', category: 'length', baseUnit: 'mm', value: 0.07, icon: '📏', labelKey: 'hairDiameter', minRatio: 0.1, maxRatio: 500, priority: 1 },
  { id: 'paper', category: 'length', baseUnit: 'mm', value: 0.1, icon: '📄', labelKey: 'paperThickness', minRatio: 0.1, maxRatio: 500, priority: 2 },
  { id: 'm6_pitch', category: 'length', baseUnit: 'mm', value: 1, icon: '🔩', labelKey: 'm6Pitch', minRatio: 0.05, maxRatio: 200, priority: 3 },
  { id: 'shaft25', category: 'length', baseUnit: 'mm', value: 25, icon: '⚙️', labelKey: 'shaft25', minRatio: 0.02, maxRatio: 20, priority: 4 },
  { id: 'hand', category: 'length', baseUnit: 'mm', value: 101.6, icon: '✋', labelKey: 'handWidth', minRatio: 0.02, maxRatio: 50, priority: 5 },

  // 力 (base N)
  { id: 'apple', category: 'force', baseUnit: 'N', value: 1, icon: '🍎', labelKey: 'appleWeight', minRatio: 0.1, maxRatio: 5000, priority: 1 },
  { id: 'kgf1', category: 'force', baseUnit: 'N', value: 9.80665, icon: '⚖️', labelKey: 'oneKgf', minRatio: 0.05, maxRatio: 500, priority: 2 },
  { id: 'person', category: 'force', baseUnit: 'N', value: 700, icon: '🧑', labelKey: 'personWeight', minRatio: 0.02, maxRatio: 50, priority: 3 },
  { id: 'car', category: 'force', baseUnit: 'N', value: 15000, icon: '🚗', labelKey: 'carWeight', minRatio: 0.001, maxRatio: 20, priority: 4 },

  // 扭矩 (base N·m)
  { id: 'hand_torque', category: 'torque', baseUnit: 'N·m', value: 5, icon: '🔧', labelKey: 'handTorque', minRatio: 0.05, maxRatio: 200, priority: 1 },
  { id: 'm8_torque', category: 'torque', baseUnit: 'N·m', value: 20, icon: '🔩', labelKey: 'm8Torque', minRatio: 0.05, maxRatio: 50, priority: 2 },
  { id: 'm12_torque', category: 'torque', baseUnit: 'N·m', value: 100, icon: '⚙️', labelKey: 'm12Torque', minRatio: 0.02, maxRatio: 30, priority: 3 },

  // 质量 (base kg)
  { id: 'part1kg', category: 'mass', baseUnit: 'kg', value: 1, icon: '📦', labelKey: 'oneKg', minRatio: 0.01, maxRatio: 5000, priority: 1 },
  { id: 'person_mass', category: 'mass', baseUnit: 'kg', value: 70, icon: '🧑', labelKey: 'personMass', minRatio: 0.02, maxRatio: 100, priority: 2 },
  { id: 'car_mass', category: 'mass', baseUnit: 'kg', value: 1500, icon: '🚗', labelKey: 'carMass', minRatio: 0.001, maxRatio: 50, priority: 3 },
  { id: 'elephant', category: 'mass', baseUnit: 'kg', value: 5000, icon: '🐘', labelKey: 'elephant', minRatio: 0.001, maxRatio: 20, priority: 4 },

  // 功率 (base kW)
  { id: 'household', category: 'power', baseUnit: 'kW', value: 1, icon: '💡', labelKey: 'householdMotor', minRatio: 0.05, maxRatio: 500, priority: 1 },
  { id: 'motor15', category: 'power', baseUnit: 'kW', value: 1.5, icon: '⚙️', labelKey: 'motor15kw', minRatio: 0.05, maxRatio: 200, priority: 2 },
  { id: 'motor75', category: 'power', baseUnit: 'kW', value: 75, icon: '🏭', labelKey: 'motor75kw', minRatio: 0.01, maxRatio: 30, priority: 3 },

  // 速度 (base m/s)
  { id: 'walk', category: 'velocity', baseUnit: 'm/s', value: 1.4, icon: '🚶', labelKey: 'walkSpeed', minRatio: 0.05, maxRatio: 100, priority: 1 },
  { id: 'highway', category: 'velocity', baseUnit: 'm/s', value: 27.8, icon: '🚗', labelKey: 'highwaySpeed', minRatio: 0.02, maxRatio: 20, priority: 2 },

  // 温度 — 用绝对差值语义，ratio 改为 |input - ref|
  { id: 'room', category: 'temperature', baseUnit: '°C', value: 20, icon: '🏠', labelKey: 'roomTemp', isDelta: true, minRatio: 0, maxRatio: 200, priority: 1 },
  { id: 'body', category: 'temperature', baseUnit: '°C', value: 37, icon: '🌡️', labelKey: 'bodyTemp', isDelta: true, minRatio: 0, maxRatio: 100, priority: 2 },
  { id: 'boiling', category: 'temperature', baseUnit: '°C', value: 100, icon: '♨️', labelKey: 'boilingWater', isDelta: true, minRatio: 0, maxRatio: 150, priority: 3 },
  { id: 'temper', category: 'temperature', baseUnit: '°C', value: 200, icon: '🔥', labelKey: 'temperTemp', isDelta: true, minRatio: 0, maxRatio: 300, priority: 4 },

  // 体积 (base cm³)
  { id: 'teaspoon', category: 'volume', baseUnit: 'cm³', value: 5, icon: '🥄', labelKey: 'teaspoon', minRatio: 0.05, maxRatio: 5000, priority: 1 },
  { id: 'coffee', category: 'volume', baseUnit: 'cm³', value: 240, icon: '☕', labelKey: 'coffeeCup', minRatio: 0.02, maxRatio: 500, priority: 2 },
]

/** 各类别置顶常用单位（chips） */
export const PRIMARY_UNITS = {
  stress: ['MPa', 'GPa', 'psi', 'ksi'],
  force: ['N', 'kN', 'lbf', 'kgf'],
  torque: ['N·m', 'N·mm', 'lbf·ft', 'lbf·in'],
  length: ['mm', 'm', 'in', 'ft'],
  area: ['mm²', 'cm²', 'm²', '亩', '公顷', 'in²'],
  volume: ['cm³', 'L', 'm³', 'in³'],
  mass: ['g', 'kg', 't', 'lb'],
  temperature: ['°C', '°F', 'K'],
  power: ['W', 'kW', 'hp', 'MW'],
  density: ['g/cm³', 'kg/m³', 'lb/in³'],
  velocity: ['m/s', 'km/h', 'ft/s', 'mph'],
  energy: ['J', 'kJ', 'N·m', 'kcal'],
}

/**
 * @param {number} inputValue 用户输入
 * @param {string} fromUnit
 * @param {string} categoryId
 * @param {(key: string) => string} labelFn  i18n: units.refs.xxx
 */
export function getScaleReferences(inputValue, fromUnit, categoryId, labelFn) {
  const catRefs = UNIT_SCALE_REFERENCES.filter((r) => r.category === categoryId)
  if (!catRefs.length || !Number.isFinite(inputValue)) return []

  let inputBase = inputValue
  if (categoryId !== 'temperature') {
    const cat = UNIT_CATEGORIES[categoryId]
    if (!cat?.units) return []
    const baseUnit = cat.base
    const r = convertUnit(inputValue, fromUnit, baseUnit, categoryId)
    if (r.errorKey) return []
    inputBase = r.value
  } else {
    const r = convertTemperature(inputValue, fromUnit, '°C')
    if (r.errorKey) return []
    inputBase = r.value
  }

  const items = []
  for (const ref of catRefs) {
    let ratio
    let displayMode = 'times'

    if (ref.isDelta && categoryId === 'temperature') {
      const delta = Math.abs(inputBase - ref.value)
      if (delta < 0.5) continue
      ratio = delta
      displayMode = 'delta'
      const maxD = ref.maxRatio ?? 200
      if (delta > maxD) continue
    } else {
      if (ref.value <= 0) continue
      ratio = inputBase / ref.value
      const minR = ref.minRatio ?? 0.05
      const maxR = ref.maxRatio ?? 50
      if (ratio < minR || ratio > maxR) continue
    }

    items.push({
      id: ref.id,
      icon: ref.icon,
      label: labelFn(ref.labelKey),
      ratio,
      displayMode,
      refValue: ref.value,
      priority: ref.priority ?? 99,
    })
  }

  items.sort((a, b) => a.priority - b.priority)
  return items.slice(0, 4)
}
