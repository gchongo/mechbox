/** ASME B1.5 通用 Acme — 基本尺寸由公式生成 */

import { ACME_DEFINITIONS } from './acme-definitions'
import { calcAcmeBasicDims } from './thread-dim'

export { calcAcmeBasicDims } from './thread-dim'

function formatLabel(label, tpi) {
  if (label.startsWith('#')) return `${label}-${tpi} ACME`
  return `${label}-${tpi} ACME`
}

export const ACME_ROWS = ACME_DEFINITIONS.map(([label, major, tpi]) => {
  const dims = calcAcmeBasicDims(major, tpi)
  return {
    id: `acme-${label.replace(/[^\w]/g, '')}-${tpi}`,
    system: 'acme',
    subSeries: 'acme',
    designation: formatLabel(label, tpi),
    priority: 1,
    standardRef: 'ASME B1.5',
    unit: 'in',
    nominal: major,
    ...dims,
    toleranceExternal: '2G',
    toleranceInternal: '2G',
    sealing: '—',
    taper: '—',
    compatibility: '—',
    usageKey: 'power',
  }
})
