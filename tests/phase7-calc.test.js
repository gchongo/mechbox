import { describe, it, expect } from 'vitest'
import { analyzeGdtStack, calcGdtContributions, calcDatumAccumulation, GDT_STACK_PRESETS } from '@/utils/gdt-stack-calc'
import { compareWeldStandards, analyzeButtWeld, analyzeFilletWeldGB } from '@/utils/weld-calc'
import {
  generateToleranceBandData,
  SUPPORTED_HOLE_LETTERS,
  SUPPORTED_SHAFT_LETTERS,
  analyzeFit,
} from '@/utils/iso-286-calc'

describe('gdt-stack-calc', () => {
  it('analyzes position stack', () => {
    const p = GDT_STACK_PRESETS.position
    const r = analyzeGdtStack({
      typeId: p.typeId,
      closedRing: p.closedRing,
      rings: p.rings,
      datums: p.datums,
      method: 'rss',
    })
    expect(r.error).toBeUndefined()
    expect(r.chainResult.totalTolerance).toBeGreaterThan(0)
    expect(r.contributions.length).toBeGreaterThan(0)
    expect(r.effectiveWithDatum).toBeGreaterThan(r.chainResult.totalTolerance)
  })

  it('computes contributions summing near 100%', () => {
    const rings = [
      { name: 'A', tolerance: 0.05, factor: 1 },
      { name: 'B', tolerance: 0.03, factor: 1 },
    ]
    const c = calcGdtContributions(rings, 'rss', 'flatness')
    const sum = c.reduce((s, x) => s + x.percent, 0)
    expect(sum).toBeCloseTo(100, 0)
  })

  it('accumulates datums', () => {
    const r = calcDatumAccumulation([
      { label: 'A', priority: 'primary', tolerance: 0.02 },
      { label: 'B', priority: 'secondary', tolerance: 0.03 },
    ])
    expect(r.total).toBeGreaterThan(0)
  })
})

describe('weld-calc standards', () => {
  const input = { legSize: 6, weldLength: 80, force: 12000, steelGrade: 'Q235' }

  it('GB fillet passes moderate load', () => {
    const r = analyzeFilletWeldGB(input)
    expect(r.shearStress).toBeGreaterThan(0)
    expect(r.pass).toBe(true)
  })

  it('compares three standards', () => {
    const c = compareWeldStandards(input)
    expect(c.standards).toHaveLength(3)
    expect(c.strictest.allowableShear).toBeGreaterThan(0)
  })

  it('butt weld analysis', () => {
    const r = analyzeButtWeld({ thickness: 8, weldLength: 100, force: 50000, steelGrade: 'Q235' })
    expect(r.normalStress).toBeGreaterThan(0)
    expect(r.gb.allow).toBeGreaterThan(0)
  })
})

describe('iso-286 enhanced', () => {
  it('lists more letters', () => {
    expect(SUPPORTED_HOLE_LETTERS).toContain('B')
    expect(SUPPORTED_SHAFT_LETTERS).toContain('c')
  })

  it('generates tolerance band data', () => {
    const b = generateToleranceBandData(25, 'H7', 'g6')
    expect(b.error).toBeUndefined()
    expect(b.hole.yMax).toBeGreaterThan(b.hole.yMin)
  })

  it('supports H9/d9 coarse fit', () => {
    const r = analyzeFit(30, 'H9', 'd9')
    expect(r.fitType).toBe('clearance')
  })
})
