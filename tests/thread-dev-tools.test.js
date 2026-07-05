import { describe, it, expect } from 'vitest'
import { analyzeThreadEngagement, findThreadRowById } from '@/utils/thread-engagement-calc'
import { analyzeTapDrill } from '@/utils/thread-tap-drill-calc'
import { getToleranceScenario, listScenariosForSystem } from '@/utils/thread-tolerance-guide'
import { filterMisconfigEntries } from '@/constants/thread-standards/misconfig-lib'
import { getAllThreadRows } from '@/constants/thread-standards'

describe('thread engagement calc', () => {
  it('M10 engaged 15mm in steel passes minimum', () => {
    const r = analyzeThreadEngagement({
      diameter: 10,
      pitch: 1.5,
      engagedLength: 15,
      jointMaterial: 'steel',
    })
    expect(r.ok).toBe(true)
    expect(r.passMin).toBe(true)
    expect(r.minEngagement).toBeGreaterThanOrEqual(8)
  })

  it('plastic needs longer engagement than steel', () => {
    const steel = analyzeThreadEngagement({
      diameter: 8,
      pitch: 1.25,
      engagedLength: 10,
      jointMaterial: 'steel',
    })
    const plastic = analyzeThreadEngagement({
      diameter: 8,
      pitch: 1.25,
      engagedLength: 10,
      jointMaterial: 'plastic',
    })
    expect(plastic.recommendedEngagement).toBeGreaterThan(steel.recommendedEngagement)
    expect(plastic.passMin).toBe(false)
  })

  it('resolves metric row from catalog', () => {
    const row = getAllThreadRows().find((r) => r.designation === 'M8')
    const r = analyzeThreadEngagement({ row, engagedLength: 12, jointMaterial: 'steel' })
    expect(r.ok).toBe(true)
    expect(r.diameter).toBe(8)
  })
})

describe('thread tap drill calc', () => {
  it('aluminum increases drill vs steel', () => {
    const row = getAllThreadRows().find((r) => r.designation === 'M10')
    const steel = analyzeTapDrill(row, { material: 'steel' })
    const al = analyzeTapDrill(row, { material: 'aluminum' })
    expect(steel.ok).toBe(true)
    expect(al.recommendedDrill).toBeGreaterThan(steel.recommendedDrill)
  })

  it('pipe thread has no tap drill', () => {
    const row = getAllThreadRows().find((r) => r.system === 'npt')
    const r = analyzeTapDrill(row, { material: 'steel' })
    expect(r.ok).toBe(false)
    expect(r.errorKey).toBe('tap_pipe_drill_na')
  })
})

describe('tolerance guide', () => {
  it('lists metric scenarios', () => {
    const list = listScenariosForSystem('metric')
    expect(list.some((s) => s.id === 'general')).toBe(true)
    expect(list.some((s) => s.id === 'coated')).toBe(true)
  })

  it('returns unified commercial for unc', () => {
    const sc = getToleranceScenario('unified_commercial', 'unc')
    expect(sc?.external).toBe('2A')
  })
})

describe('misconfig library', () => {
  it('filters by pipe tag', () => {
    const list = filterMisconfigEntries('', 'pipe')
    expect(list.length).toBeGreaterThan(3)
    expect(list.every((e) => e.tags.includes('pipe'))).toBe(true)
  })
})

describe('findThreadRowById', () => {
  it('finds existing row', () => {
    const row = getAllThreadRows()[0]
    expect(findThreadRowById(row.id)?.id).toBe(row.id)
  })
})
