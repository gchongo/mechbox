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
    const direction = ring.direction ?? closedDirection
    const inferred = inferRingType(direction, closedDirection)
    return {
      ...ring,
      direction,
      type: inferred ?? ring.type ?? null,
      typeInvalid: inferred == null && ring.type == null,
    }
  })
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
