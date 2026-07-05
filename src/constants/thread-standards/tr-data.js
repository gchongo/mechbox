/** ISO 290 / DIN 103 公制梯形 Tr — 基本尺寸由公式生成 */

import { TR_DEFINITIONS } from './tr-definitions'
import { calcTrapezoidalBasicDims, stripNum } from './thread-dim'

export { calcTrapezoidalBasicDims } from './thread-dim'

function designation(nominal, pitch) {
  return `Tr${stripNum(nominal)}×${stripNum(pitch)}`
}

export const TR_ROWS = TR_DEFINITIONS.map(([nominal, pitch]) => {
  const dims = calcTrapezoidalBasicDims(nominal, pitch)
  return {
    id: `tr-${nominal}-${pitch}`,
    system: 'tr',
    subSeries: 'tr',
    designation: designation(nominal, pitch),
    priority: 1,
    standardRef: 'ISO 290 / DIN 103',
    unit: 'mm',
    nominal,
    ...dims,
    toleranceExternal: '7e',
    toleranceInternal: '7H',
    sealing: '—',
    taper: '—',
    compatibility: '—',
    usageKey: 'power',
  }
})
