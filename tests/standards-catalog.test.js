import { describe, expect, it } from 'vitest'
import {
  STANDARDS_CATALOG_SECTIONS,
  listAllStandards,
  searchStandardsCatalog,
  countByPriority,
} from '@/constants/standards-catalog'

describe('standards-catalog', () => {
  it('loads sections and searchable items', () => {
    expect(STANDARDS_CATALOG_SECTIONS.length).toBeGreaterThan(10)
    const all = listAllStandards()
    expect(all.length).toBeGreaterThan(200)
    const stats = countByPriority()
    expect(stats.P0).toBeGreaterThan(20)
    expect(stats.total).toBe(all.length)
  })

  it('filters by query and priority', () => {
    const hits = searchStandardsCatalog({ query: '1101' })
    expect(hits.some((h) => /1101/.test(h.code))).toBe(true)

    const p0 = searchStandardsCatalog({ priority: 'P0', query: 'ISO' })
    expect(p0.every((h) => h.priority === 'P0')).toBe(true)
    expect(p0.length).toBeGreaterThan(5)
  })
})
