import { describe, it, expect } from 'vitest'
import {
  calcBendAllowance,
  calcBendDeduction,
  analyzeSheetMetalUnfold,
} from '@/utils/sheet-metal-calc'
import { analyzeORingSeal, recommendGroove } from '@/utils/o-ring-calc'
import {
  calcFatigueStrength,
  calcLifeFromStress,
  calcMinerDamage,
  parseLoadSpectrum,
} from '@/utils/fatigue-calc'
import {
  geneticAlgorithmAllocation,
  multiObjectivePareto,
} from '@/utils/tolerance-optimization'

describe('sheet-metal-calc', () => {
  it('bend allowance increases with angle', () => {
    const ba90 = calcBendAllowance(90, 1.5, 1.5, 0.33)
    const ba45 = calcBendAllowance(45, 1.5, 1.5, 0.33)
    expect(ba90).toBeGreaterThan(ba45)
  })

  it('unfolds L-shape', () => {
    const r = analyzeSheetMetalUnfold({
      thickness: 1.5,
      bendRadius: 1.5,
      kFactor: 0.33,
      segments: [
        { type: 'straight', length: 50 },
        { type: 'bend', angle: 90 },
        { type: 'straight', length: 50 },
      ],
    })
    expect(r.flatLength).toBeGreaterThan(100)
    expect(r.bendCount).toBe(1)
  })

  const uChannel = [
    { type: 'straight', length: 50 },
    { type: 'bend', angle: 90 },
    { type: 'straight', length: 80 },
    { type: 'bend', angle: 90 },
    { type: 'straight', length: 50 },
  ]

  it('K-factor BA and flat length for U-channel 50-80-50', () => {
    const ba = calcBendAllowance(90, 1.5, 1.5, 0.33)
    expect(ba).toBeCloseTo(3.1337, 3)
    const r = analyzeSheetMetalUnfold({
      method: 'k_factor',
      thickness: 1.5,
      bendRadius: 1.5,
      kFactor: 0.33,
      segments: uChannel,
    })
    expect(r.flatLength).toBeCloseTo(186.267, 2)
    expect(r.dimensionBasis).toBe('tangent')
  })

  it('bend deduction uses segment outside sum, not a separate outerSum', () => {
    const bd = calcBendDeduction(90, 1.5, 1.5, 0.33)
    expect(bd).toBeCloseTo(2.8663, 3)
    const r = analyzeSheetMetalUnfold({
      method: 'bend_deduction',
      thickness: 1.5,
      bendRadius: 1.5,
      kFactor: 0.33,
      outerSum: 200, // must be ignored — same segments cannot mix 180 + 200
      segments: uChannel,
    })
    expect(r.straightSum).toBe(180)
    expect(r.flatLength).toBeCloseTo(174.267, 2)
    expect(r.dimensionBasis).toBe('outside')
  })

  it('professional keeps theoretical flat length separate from springback estimate', () => {
    const r = analyzeSheetMetalUnfold({
      method: 'k_factor',
      calcMode: 'professional',
      thickness: 1.5,
      bendRadius: 1.5,
      kFactor: 0.33,
      springbackFactor: 0.5,
      segments: uChannel,
    })
    expect(r.flatLength).toBeCloseTo(186.267, 2)
    expect(r.compensatedFlatLength).toBeCloseTo(186.78, 2)
    expect(r.compensatedFlatLength).toBeGreaterThan(r.flatLength)
  })
})

describe('o-ring-calc', () => {
  it('recommends groove from bore', () => {
    const r = recommendGroove(25, 3.53)
    expect(r.grooveDiameter).toBeLessThan(25)
    expect(r.grooveWidth).toBeCloseTo(4.3066, 2)
  })

  it('checks compression range', () => {
    const r = analyzeORingSeal({
      crossSection: 3.53,
      grooveDiameter: 18.5,
      grooveWidth: 4.8,
      compressionPercent: 20,
    })
    expect(r.compressionPercent).toBe(20)
    expect(typeof r.fillPercent).toBe('number')
  })

  it('uses stretch-adjusted area fill and empirical recommended width', () => {
    const r = analyzeORingSeal({
      crossSection: 3.53,
      grooveDiameter: 18.5,
      grooveWidth: 4.8,
      compressionPercent: 20,
      stretchPercent: 2,
    })
    expect(r.compression).toBeCloseTo(0.706, 3)
    expect(r.grooveDepth).toBeCloseTo(2.824, 3)
    // w ≈ d + Δd + d·ε ≈ 4.31 (not legacy 1.4·d = 4.94)
    expect(r.recommendedWidth).toBeCloseTo(4.3066, 2)
    // A'/(w·h) with A' = (π/4 d²)/1.02 ≈ 70.8% (not unstretched 72.2%)
    expect(r.fillPercent).toBeCloseTo(70.8, 1)
  })
})

describe('fatigue-calc', () => {
  it('S-N strength decreases with cycles', () => {
    const s1 = calcFatigueStrength('steel_45', 1e3)
    const s2 = calcFatigueStrength('steel_45', 1e6)
    expect(s1).toBeGreaterThan(s2)
  })

  it('life below endurance is infinite', () => {
    const N = calcLifeFromStress('steel_45', 200)
    expect(N).toBe(Infinity)
  })

  it('Miner damage accumulates', () => {
    const loads = parseLoadSpectrum('350,10000\n300,50000')
    const r = calcMinerDamage('steel_45', loads)
    expect(r.totalDamage).toBeGreaterThan(0)
    expect(r.details.length).toBe(2)
  })
})

describe('tolerance-optimization', () => {
  const rings = [
    { name: 'A', factor: 1, nominal: 40, cost: 1 },
    { name: 'B', factor: 1, nominal: 15, cost: 2 },
    { name: 'C', factor: 1, nominal: 55, cost: 1.5 },
  ]

  it('genetic algorithm meets RSS target', () => {
    const r = geneticAlgorithmAllocation(0.1, rings, { generations: 60, populationSize: 40 })
    expect(r.allocated.length).toBe(3)
    expect(r.verify.stacked).toBeLessThanOrEqual(0.1 + 1e-6)
  })

  it('pareto returns feasible solutions', () => {
    const r = multiObjectivePareto(0.1, rings, { samples: 100 })
    expect(r.pareto.length).toBeGreaterThan(0)
    for (const p of r.pareto) {
      expect(p.stacked).toBeLessThanOrEqual(0.105)
    }
  })
})
