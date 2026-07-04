/** 1D 尺寸链：组成环方向与封闭环同向为增环，反向为减环 */
const OPPOSITE = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
}

export function inferRingType(ringDirection, closedDirection) {
  if (!ringDirection || !closedDirection) return null
  return ringDirection === closedDirection ? 'increasing' : 'decreasing'
}

export function getOppositeDirection(direction) {
  return OPPOSITE[direction] ?? 'left'
}

export function applyRingTypes(rings, closedDirection) {
  if (!closedDirection) {
    return rings.map((ring) => ({ ...ring, typeInvalid: true }))
  }
  return rings.map((ring) => {
    const inferred = ring.direction ? inferRingType(ring.direction, closedDirection) : null
    const explicit =
      ring.type === 'increasing' || ring.type === 'decreasing' ? ring.type : null
    return {
      ...ring,
      type: inferred ?? explicit,
      typeInvalid: !ring.direction || (inferred == null && explicit == null),
    }
  })
}

/** 解析组成环增/减类型；缺方向或无法推断时返回 validation 错误 */
export function resolveComponentRingTypes(componentRings, closedDirection) {
  if (!componentRings?.length) return { valid: true, rings: [] }
  const resolved = []
  for (const ring of componentRings) {
    const inferred =
      ring.direction && closedDirection ? inferRingType(ring.direction, closedDirection) : null

    if (closedDirection && !ring.direction) {
      return { valid: false, errorKey: 'ring_direction_missing', ringName: ring.name }
    }

    let type = ring.type
    if (type === 'increasing' || type === 'decreasing') {
      if (inferred && type !== inferred) {
        return { valid: false, errorKey: 'ring_type_direction_conflict', ringName: ring.name }
      }
    } else if (inferred) {
      type = inferred
    }

    if (type !== 'increasing' && type !== 'decreasing') {
      return {
        valid: false,
        errorKey: !ring.direction ? 'ring_direction_missing' : 'ring_type_missing',
        ringName: ring.name,
      }
    }
    resolved.push({ ...ring, type })
  }
  return { valid: true, rings: resolved }
}

/** 组成环方向/类型是否足以计算 */
export function validateRingDirections(closedDirection, rings = []) {
  if (!closedDirection) return { valid: false, errorKey: 'closed_direction_missing' }
  for (const ring of rings) {
    if (!ring.direction) return { valid: false, errorKey: 'ring_direction_missing', ringName: ring.name }
    const type = ring.type ?? inferRingType(ring.direction, closedDirection)
    if (!type) return { valid: false, errorKey: 'ring_type_undefined', ringName: ring.name }
  }
  return { valid: true }
}
