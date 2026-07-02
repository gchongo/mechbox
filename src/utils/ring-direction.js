/** 1D 尺寸链：组成环方向与封闭环同向为增环，反向为减环 */
const OPPOSITE = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
}

export function inferRingType(ringDirection, closedDirection) {
  if (!ringDirection || !closedDirection) return 'decreasing'
  return ringDirection === closedDirection ? 'increasing' : 'decreasing'
}

export function getOppositeDirection(direction) {
  return OPPOSITE[direction] ?? 'left'
}

export function applyRingTypes(rings, closedDirection) {
  return rings.map((ring) => ({
    ...ring,
    type: inferRingType(ring.direction ?? closedDirection, closedDirection),
  }))
}
