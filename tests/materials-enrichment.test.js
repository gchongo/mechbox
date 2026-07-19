import { describe, it, expect } from 'vitest'
import {
  searchMaterials,
  findMaterial,
  applyMaterialState,
  getMaterialAlpha,
  getMaterialConductivity,
  CATEGORY_THERMAL_DEFAULTS,
} from '@/constants/materials'

describe('materials enrichment', () => {
  it('every material has alpha and kThermal', () => {
    const list = searchMaterials('')
    expect(list.length).toBeGreaterThan(40)
    for (const m of list) {
      expect(m.alpha).toBeGreaterThan(0)
      expect(m.kThermal).toBeGreaterThan(0)
    }
  })

  it('searches by standard number', () => {
    const hits = searchMaterials('GB/T 699')
    expect(hits.some((m) => m.id === '45')).toBe(true)
  })

  it('searches by heat treatment label', () => {
    const hits = searchMaterials('调质')
    expect(hits.some((m) => m.id === '45' || m.id === '40cr')).toBe(true)
  })

  it('applies heat-treatment state strengths', () => {
    const base = findMaterial('45')
    expect(base.activeState).toBe('qt')
    const annealed = applyMaterialState(base, 'annealed')
    expect(annealed.sigmaB).toBe(540)
    expect(annealed.sigmaS).toBe(280)
    expect(annealed.alpha).toBe(base.alpha)
  })

  it('expands carburizing and Q345 states', () => {
    const gear = findMaterial('20crmnti')
    expect(gear.activeState).toBe('carburized')
    expect(gear.states.some((s) => s.id === 'normalized')).toBe(true)
    const q345 = findMaterial('q345')
    expect(q345.activeState).toBe('as_rolled')
    const norm = applyMaterialState(q345, 'normalized')
    expect(norm.sigmaS).toBe(355)
  })

  it('alpha helpers match category defaults for carbon steel', () => {
    expect(getMaterialAlpha('q235')).toBeCloseTo(CATEGORY_THERMAL_DEFAULTS['碳素钢'].alpha, 12)
    expect(getMaterialConductivity('q235')).toBe(CATEGORY_THERMAL_DEFAULTS['碳素钢'].kThermal)
  })

  it('aluminum has higher alpha than steel', () => {
    expect(getMaterialAlpha('6061-t6')).toBeGreaterThan(getMaterialAlpha('q235'))
  })
})
