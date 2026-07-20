import { describe, it, expect } from 'vitest'
import {
  THREAD_PURPOSE_ORDER,
  PURPOSE_SYSTEM_IDS,
  THREAD_SYSTEM_REGISTRY,
  THREAD_FAMILY_ORDER,
  getSystemsForPurpose,
  resolveTaxonomyFromCatalog,
  countImplementedInPurpose,
  getReferenceCatalogAlternatives,
  catalogAlternativeToQuery,
  listThreadSystemOverviewRows,
} from '@/constants/thread-standards/taxonomy'

describe('thread taxonomy', () => {
  it('covers seven purpose categories', () => {
    expect(THREAD_PURPOSE_ORDER).toEqual([
      'fastener',
      'pipe',
      'power',
      'special',
      'oil',
      'aerospace',
      'industry',
    ])
  })

  it('registers all listed systems with matching purpose and family', () => {
    for (const purpose of THREAD_PURPOSE_ORDER) {
      for (const id of PURPOSE_SYSTEM_IDS[purpose]) {
        expect(THREAD_SYSTEM_REGISTRY[id]).toBeDefined()
        expect(THREAD_SYSTEM_REGISTRY[id].purpose).toBe(purpose)
        expect(THREAD_SYSTEM_REGISTRY[id].family).toBeTruthy()
        expect(THREAD_FAMILY_ORDER).toContain(THREAD_SYSTEM_REGISTRY[id].family)
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
    expect(list.length).toBeGreaterThanOrEqual(15)
    expect(countImplementedInPurpose('fastener')).toBe(5)
    expect(countImplementedInPurpose('power')).toBe(2)
  })

  it('pipe category lists NPT, BSP and JIS families', () => {
    const ids = getSystemsForPurpose('pipe').map((s) => s.id)
    expect(ids).toContain('npt')
    expect(ids).toContain('bspp_g')
    expect(ids).toContain('nptf')
    expect(ids).toContain('pt_jis')
    expect(ids).toContain('pf_jis')
  })

  it('adds oil, aerospace and industry top-level categories', () => {
    expect(getSystemsForPurpose('oil').map((s) => s.id)).toContain('api_stc')
    expect(getSystemsForPurpose('aerospace').map((s) => s.id)).toContain('aero_mj')
    expect(getSystemsForPurpose('industry').map((s) => s.id)).toContain('rebar_straight')
  })

  it('reference-only systems suggest implemented catalogs', () => {
    expect(getReferenceCatalogAlternatives('uns')).toEqual(['unc', 'unf', 'unef'])
    expect(catalogAlternativeToQuery('metric')).toEqual({ system: 'metric', subSeries: 'coarse' })
    expect(catalogAlternativeToQuery('tr')).toEqual({ system: 'tr', subSeries: 'tr' })
  })

  it('overview rows cover all registered systems with comparison metadata', () => {
    const overview = listThreadSystemOverviewRows()
    const registered = Object.keys(THREAD_SYSTEM_REGISTRY)
    expect(overview).toHaveLength(registered.length)
    expect(overview.map((r) => r.id).sort()).toEqual(registered.sort())

    expect(THREAD_SYSTEM_REGISTRY.metric_coarse.gbStandard).toBe('GB/T 196-2003')
    expect(THREAD_SYSTEM_REGISTRY.metric_coarse.standards).toEqual([
      'ISO 68-1',
      'ISO 724',
      'ISO 965',
    ])
    expect(THREAD_SYSTEM_REGISTRY.metric_coarse.family).toBe('metric_fastener')
    expect(THREAD_SYSTEM_REGISTRY.npt.taperRatio).toBe('1:16')
    expect(THREAD_SYSTEM_REGISTRY.buttress.angleLabel).toBe('3°/30°')
    expect(THREAD_SYSTEM_REGISTRY.buttress.unit).toBe('mm')
    expect(THREAD_SYSTEM_REGISTRY.knuckle.unit).toBe('mm')
    expect(THREAD_SYSTEM_REGISTRY.bspt_rp.standards).toContain('ISO 7-1')
    expect(THREAD_SYSTEM_REGISTRY.arc_round.standards).toContain('DIN 20400')
  })
})
