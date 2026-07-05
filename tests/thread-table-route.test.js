import { describe, it, expect } from 'vitest'
import {
  normalizeNavKey,
  navKeyFromQuery,
  compareIdsFromQuery,
  buildThreadTableQuery,
  DEFAULT_NAV_KEY,
} from '@/utils/thread-table-route'

describe('thread-table-route', () => {
  it('normalizes invalid nav to default', () => {
    expect(normalizeNavKey('')).toBe(DEFAULT_NAV_KEY)
    expect(normalizeNavKey('bad')).toBe(DEFAULT_NAV_KEY)
    expect(normalizeNavKey('catalog|pipe|metric_coarse')).toBe(DEFAULT_NAV_KEY)
  })

  it('accepts valid catalog and design keys', () => {
    expect(normalizeNavKey('catalog|pipe|npt')).toBe('catalog|pipe|npt')
    expect(normalizeNavKey('design|engagement')).toBe('design|engagement')
    expect(normalizeNavKey('tools|compare')).toBe('tools|compare')
    expect(normalizeNavKey('tools|glossary')).toBe('tools|glossary')
  })

  it('parses query params', () => {
    expect(navKeyFromQuery({ nav: 'catalog|power|tr' })).toBe('catalog|power|tr')
    expect(compareIdsFromQuery({ cmp: 'a,b,c' })).toEqual(['a', 'b', 'c'])
    expect(compareIdsFromQuery({ cmp: 'a,b,c,d' })).toEqual(['a', 'b', 'c'])
  })

  it('builds query object', () => {
    expect(
      buildThreadTableQuery({
        navKey: 'tools|parse',
        compareIds: ['x', 'y'],
        highlightRowId: 'metric-M10',
      }),
    ).toEqual({ nav: 'tools|parse', cmp: 'x,y', hl: 'metric-M10' })
  })
})
