const MM_PER_INCH = 25.4

export function convertLength(value, fromUnit, toUnit) {
  if (value == null || fromUnit === toUnit) return value
  if (fromUnit === 'mm' && toUnit === 'inch') return value / MM_PER_INCH
  if (fromUnit === 'inch' && toUnit === 'mm') return value * MM_PER_INCH
  return value
}

export function convertRingList(rings, fromUnit, toUnit) {
  return rings.map((ring) => ({
    ...ring,
    size: convertLength(ring.size, fromUnit, toUnit),
    tolerance: convertLength(ring.tolerance, fromUnit, toUnit),
  }))
}

export function unitLabel(unit) {
  return unit === 'inch' ? 'inch' : 'mm'
}
