import { describe, it, expect } from 'vitest'
import {
  THREAD_PURPOSE_ORDER,
  PURPOSE_SYSTEM_IDS,
  THREAD_SYSTEM_REGISTRY,
  getSystemsForPurpose,
  resolveTaxonomyFromCatalog,
  countImplementedInPurpose,
  getReferenceCatalogAlternatives,
  catalogAlternativeToQuery,
} from '@/constants/thread-standards/taxonomy'

describe('thread taxonomy', () => {
  it('covers four purpose categories', () => {
    expect(THREAD_PURPOSE_ORDER).toEqual(['fastener', 'pipe', 'power', 'special'])
  })

  it('registers all listed systems', () => {
    for (const purpose of THREAD_PURPOSE_ORDER) {
      for (const id of PURPOSE_SYSTEM_IDS[purpose]) {
        expect(THREAD_SYSTEM_REGISTRY[id]).toBeDefined()
        expect(THREAD_SYSTEM_REGISTRY[id].purpose).toBe(purpose)
      }
    }
  })

  it('implements eleven catalog-backed systems', () => {
    const implemented = Object.values(THREAD_SYSTEM_REGISTRY).filter((s) => s.implemented)
    expect(implemented).toHaveLength(11)
    expect(implemented.map((s) => s.id).sort()).toEqual([
      'acme',
      'bspt_r',
      'bspp_g',
      'metric_coarse',
      'metric_fine',
      'npt',
      'nptf',
      'tr',
      'unc',
      'unef',
      'unf',
    ].sort())
  })

  it('resolves catalog rows to taxonomy ids', () => {
    expect(resolveTaxonomyFromCatalog('metric', 'coarse')).toBe('metric_coarse')
    expect(resolveTaxonomyFromCatalog('metric', 'fine')).toBe('metric_fine')
    expect(resolveTaxonomyFromCatalog('g')).toBe('bspp_g')
    expect(resolveTaxonomyFromCatalog('npt')).toBe('npt')
  })

  it('fastener category has more reference than implemented', () => {
    const list = getSystemsForPurpose('fastener')
    expect(list.length).toBeGreaterThanOrEqual(9)
    expect(countImplementedInPurpose('fastener')).toBe(5)
    expect(countImplementedInPurpose('power')).toBe(2)
  })

  it('pipe category lists NPT and BSP families', () => {
    const ids = getSystemsForPurpose('pipe').map((s) => s.id)
    expect(ids).toContain('npt')
    expect(ids).toContain('bspp_g')
    expect(ids).toContain('nptf')
  })

  it('reference-only systems suggest implemented catalogs', () => {
    expect(getReferenceCatalogAlternatives('uns')).toEqual(['unc', 'unf', 'unef'])
    expect(catalogAlternativeToQuery('metric')).toEqual({ system: 'metric', subSeries: 'coarse' })
    expect(catalogAlternativeToQuery('tr')).toEqual({ system: 'tr', subSeries: 'tr' })
  })
})
