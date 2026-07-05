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

  it('zero engaged length does not auto-pass', () => {
    const r = analyzeThreadEngagement({
      diameter: 10,
      pitch: 1.5,
      engagedLength: 0,
      jointMaterial: 'steel',
    })
    expect(r.ok).toBe(true)
    expect(r.needsLength).toBe(true)
    expect(r.passMin).toBeNull()
    expect(r.passRecommend).toBeNull()
  })

  it('resolves metric row from catalog', () => {
    const row = getAllThreadRows().find((r) => r.designation === 'M8')
    const r = analyzeThreadEngagement({ row, engagedLength: 12, jointMaterial: 'steel' })
    expect(r.ok).toBe(true)
    expect(r.diameter).toBe(8)
  })

  it('resolves Tr and UNEF rows from catalog', () => {
    const tr = getAllThreadRows().find((r) => r.designation === 'Tr20×4')
    const trEng = analyzeThreadEngagement({ row: tr, engagedLength: 30, jointMaterial: 'steel' })
    expect(trEng.ok).toBe(true)
    expect(trEng.diameter).toBe(20)

    const unef = getAllThreadRows().find((r) => r.designation.startsWith('1/4-32 UNEF'))
    const unefEng = analyzeThreadEngagement({ row: unef, engagedLength: 10, jointMaterial: 'steel' })
    expect(unefEng.ok).toBe(true)
    expect(unefEng.pitch).toBeCloseTo(25.4 / 32, 3)
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

  it('NPTF pipe thread has no tap drill', () => {
    const row = getAllThreadRows().find((r) => r.system === 'nptf')
    const r = analyzeTapDrill(row, { material: 'steel' })
    expect(r.ok).toBe(false)
    expect(r.errorKey).toBe('tap_pipe_drill_na')
  })

  it('Tr row returns tap drill with trapezoidal tip', () => {
    const row = getAllThreadRows().find((r) => r.designation === 'Tr20×4')
    const r = analyzeTapDrill(row, { material: 'steel' })
    expect(r.ok).toBe(true)
    expect(r.tipKeys).toContain('processTrapezoidalTap')
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

  it('lists tr and nptf scenarios', () => {
    expect(listScenariosForSystem('tr').some((s) => s.id === 'tr_default')).toBe(true)
    expect(listScenariosForSystem('nptf').some((s) => s.id === 'pipe_dry')).toBe(true)
    expect(listScenariosForSystem('unef').some((s) => s.id === 'unef_commercial')).toBe(true)
  })
})

describe('misconfig library', () => {
  it('filters by pipe tag', () => {
    const list = filterMisconfigEntries('', 'pipe')
    expect(list.length).toBeGreaterThan(3)
    expect(list.every((e) => e.tags.includes('pipe'))).toBe(true)
    expect(list.some((e) => e.id === 'npt_vs_nptf')).toBe(true)
  })

  it('includes unef pitch misconfig with compare preset', () => {
    const list = filterMisconfigEntries('unef')
    expect(list.some((e) => e.id === 'unef_pitch_mix')).toBe(true)
  })
})

describe('findThreadRowById', () => {
  it('finds existing row', () => {
    const row = getAllThreadRows()[0]
    expect(findThreadRowById(row.id)?.id).toBe(row.id)
  })
})
