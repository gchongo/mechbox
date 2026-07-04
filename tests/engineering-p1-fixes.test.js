import { describe, it, expect } from 'vitest'
import {
  analyzeSpring,
  resolveSpringAllowableShear,
  resolveSpringLoadCategory,
  resolveSpringStressRatio,
  lookupFig1RmFactor,
} from '@/utils/spring-calc'
import { analyzeBearingLife } from '@/utils/bearing-calc'
import { assessComponentFatigue } from '@/utils/fatigue-calc'
import { analyzeGearStrength } from '@/utils/gear-calc'
import { calculateChainResult, calculateGdtChain } from '@/utils/gdt-chain'
import {
  calculateWorstCaseLimits,
  calculateRssLimits,
  getModifiedRssBreakdown,
} from '@/utils/size-chain-math'
import {
  runMonteCarloSimulation,
  createSeededRandom,
  calcControlLimits,
  sampleToleranceError,
} from '@/utils/monte-carlo'
import { analyzeBoltPreload } from '@/utils/bolt-preload-calc'

describe('P1-07 spring load class and [τ] per GB/T 23935', () => {
  it('infers static when no load variation and N < 1e4', () => {
    expect(
      resolveSpringLoadCategory({
        targetCycles: 5000,
        loadVariation: false,
      }),
    ).toBe('static')
  })

  it('infers dynamic_figure when loads vary but N unspecified', () => {
    expect(
      resolveSpringLoadCategory({
        loadVariation: true,
      }),
    ).toBe('dynamic_figure')
  })

  it('fig1 at N=1e7, γ=0.667 matches handbook [τ]≈529 for Rm=1700', () => {
    const factor = lookupFig1RmFactor('oil_quenched', 0.667, 1e7)
    expect(factor).toBeCloseTo(0.311, 3)
    const allow = resolveSpringAllowableShear({
      material: '50CrVA',
      rm: 1700,
      loadCategory: 'dynamic_figure',
      gamma: 0.667,
      targetCycles: 1e7,
    })
    expect(allow.value).toBeCloseTo(529, 0)
    expect(allow.source).toBe('fig1_unlimited')
  })

  it('appendix C.2 static factor 0.50·Rm for oil quenched', () => {
    const allow = resolveSpringAllowableShear({
      material: '50CrVA',
      rm: 1840,
      loadCategory: 'static',
    })
    expect(allow.value).toBeCloseTo(920, 0)
    expect(allow.source).toBe('table3_static')
  })

  it('handbook reference case uses dynamic [τ] and fails static shear at τ₂≈759', () => {
    const r = analyzeSpring({
      calcMode: 'complete',
      material: '50CrVA',
      wireDiameter: 1.1,
      outerDiameter: 6.5,
      activeCoils: 5,
      totalCoils: 7,
      freeLength: 15,
      installHeight: 13,
      workingHeight: 12,
      endType: 'fixed',
    })
    expect(r.stressRatioGamma).toBeCloseTo(37.19 / 55.79, 2)
    expect(r.allowableShear).toBeCloseTo(529, 0)
    expect(r.tauWorking).toBeCloseTo(759.2, 1)
    expect(r.shearPass).toBe(false)
  })

  it('static load class gives higher [τ] than dynamic for same Rm', () => {
    const staticAllow = resolveSpringAllowableShear({
      material: '50CrVA',
      rm: 1700,
      loadCategory: 'static',
    })
    const dynamicAllow = resolveSpringAllowableShear({
      material: '50CrVA',
      rm: 1700,
      loadCategory: 'dynamic_figure',
      gamma: 0.667,
    })
    expect(staticAllow.value).toBeGreaterThan(dynamicAllow.value)
  })
})

describe('P1-01 bearing simple mode blocks Y=0 with axial load', () => {
  const base = {
    calcMode: 'simple',
    dynamicLoad: 35000,
    radialLoad: 5000,
    axialLoad: 1000,
    rpm: 1500,
    bearingType: 'ball',
    autoLookup: false,
  }

  it('blocks life when Fa>0 and Y not provided', () => {
    const r = analyzeBearingLife({ ...base, x: 1 })
    expect(r.errorKey).toBe('bearing_simple_xy_required')
    expect(r.pass).toBe(false)
    expect(r.estimateOnly).toBe(true)
  })

  it('allows calculation when Y explicitly provided', () => {
    const r = analyzeBearingLife({ ...base, x: 1, y: 0.56 })
    expect(r.errorKey).toBeUndefined()
    expect(r.l10MillionRev).toBeGreaterThan(0)
    expect(r.equivalentLoad).toBeGreaterThan(base.radialLoad)
  })

  it('allows direct equivalent load override', () => {
    const r = analyzeBearingLife({ ...base, simpleEquivalentLoad: 6000 })
    expect(r.errorKey).toBeUndefined()
    expect(r.equivalentLoad).toBe(6000)
  })
})

describe('P1-02 fatigue zero amplitude must not pass', () => {
  it('fails when stress amplitude is zero', () => {
    const r = assessComponentFatigue({
      snMaterial: 'steel_45',
      stressAmplitude: 0,
      meanStress: 0,
      targetCycles: 1e6,
    })
    expect(r.fatiguePass).toBe(false)
    expect(r.zeroAmplitude).toBe(true)
    expect(r.fatigueLife).toBeNull()
  })
})

describe('P1-06 gear simple mode never formal pass', () => {
  it('reports strengthPass but pass=false', () => {
    const r = analyzeGearStrength({
      module: 2,
      teeth: 30,
      faceWidth: 20,
      torque: 50,
      material: 'st-soft',
    })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    if (r.strengthPass) {
      expect(r.bendingPass).toBe(true)
      expect(r.contactPass).toBe(true)
    }
  })
})

describe('P1-09 GD&T position formula note matches implementation', () => {
  it('documents T_pos = 2√((Tx/2)²+(Ty/2)²) with full-axis tolerances', () => {
    const rings = [
      { size: 0, tolerance: 0.2, type: 'increasing', direction: 'right', factor: 1 },
      { size: 0, tolerance: 0.1, type: 'decreasing', direction: 'up', factor: 1 },
    ]
    const r = calculateGdtChain({ min: 0, max: 0.5 }, rings, 'rss', {
      typeId: 'position',
      closedDirection: 'right',
    })
    expect(r.formulaNote).toContain('T_x/2')
    expect(r.totalTolerance).toBeCloseTo(2 * Math.sqrt(0.1 ** 2 + 0.05 ** 2), 4)
  })

  it('position chain entry still passes budget when T_pos <= spec', () => {
    const rings = [
      { size: 50, tolerance: 0.02, type: 'increasing', direction: 'right', factor: 1 },
      { size: 30, tolerance: 0.02, type: 'decreasing', direction: 'up', factor: 1 },
    ]
    const r = calculateChainResult({ min: 0, max: 0.1 }, rings, 'rss', {
      typeId: 'position',
      closedDirection: 'right',
    })
    expect(r.passMode).toBe('budget')
    expect(r.pass).toBe(true)
  })
})

describe('P1-04 asymmetric tolerances in size chain', () => {
  it('worst-case upper shifts for +0.1/0 tolerance vs symmetric', () => {
    const asymmetric = calculateWorstCaseLimits([
      { size: 10, es: 0.1, ei: 0, type: 'increasing', factor: 1 },
    ])
    const symmetric = calculateWorstCaseLimits([
      { size: 10, tolerance: 0.1, type: 'increasing', factor: 1 },
    ])
    expect(asymmetric.upper).toBeCloseTo(10.1, 6)
    expect(symmetric.upper).toBeCloseTo(10.05, 6)
    expect(asymmetric.nominal).toBeGreaterThan(symmetric.nominal)
  })

  it('RSS nominal includes (ES+EI)/2 mean shift', () => {
    const limits = calculateRssLimits([
      { size: 10, es: 0.1, ei: 0, type: 'increasing', factor: 1 },
      { size: 0, tolerance: 0.05, type: 'decreasing', factor: 1 },
    ])
    expect(limits.nominal).toBeCloseTo(10.05, 6)
    expect(limits.totalTolerance).toBeCloseTo(
      Math.sqrt(0.1 ** 2 + 0.05 ** 2),
      4,
    )
  })
})

describe('P1-03 Monte Carlo truncated normal and sample std', () => {
  it('truncated normal samples stay within [EI, ES]', () => {
    const rnd = createSeededRandom(99)
    for (let i = 0; i < 500; i += 1) {
      const err = sampleToleranceError(0.1, 'normal', 0, rnd, {
        es: 0.1,
        ei: 0,
        truncatedNormal: true,
      })
      expect(err).toBeGreaterThanOrEqual(0 - 1e-12)
      expect(err).toBeLessThanOrEqual(0.1 + 1e-12)
    }
  })

  it('sample std uses n-1 divisor', () => {
    const values = [10, 10.01, 9.99, 10.02, 9.98]
    const limits = calcControlLimits(values, true)
    const pop = calcControlLimits(values, false)
    expect(limits.sigma).toBeGreaterThan(pop.sigma)
    expect(limits.sigma).toBeCloseTo(0.015811, 3)
  })

  it('seeded runs remain reproducible with truncation', () => {
    const rings = [
      { size: 10, tolerance: 0.05, type: 'increasing' },
      { size: 10, tolerance: 0.05, type: 'decreasing' },
    ]
    const base = {
      closedRing: { min: 9.8, max: 10.2 },
      componentRings: rings,
      iterations: 500,
      truncatedNormal: true,
    }
    const a = runMonteCarloSimulation({ ...base, random: createSeededRandom(42) })
    const b = runMonteCarloSimulation({ ...base, random: createSeededRandom(42) })
    expect(a.passRate).toBe(b.passRate)
    expect(a.mean).toBe(b.mean)
  })
})

describe('P1-05 modified RSS empirical disclaimer', () => {
  it('flags uniform distribution as empirical', () => {
    const breakdown = getModifiedRssBreakdown([{ tolerance: 0.1 }], 'uniform')
    expect(breakdown.empirical).toBe(true)
    expect(breakdown.total).toBeCloseTo(Math.sqrt(0.01) * 1.15, 6)
    expect(breakdown.disclaimer).toMatch(/经验/)
  })

  it('normal distribution is non-empirical baseline', () => {
    const breakdown = getModifiedRssBreakdown([{ tolerance: 0.1 }], 'normal')
    expect(breakdown.empirical).toBe(false)
    expect(breakdown.distFactor).toBe(1)
  })
})

describe('P1-08 bolt simple torque estimateOnly', () => {
  it('simple mode never formal pass even when stress ok', () => {
    const r = analyzeBoltPreload({
      calcMode: 'simple',
      diameter: 12,
      preload: 30000,
      grade: '8.8',
    })
    expect(r.estimateOnly).toBe(true)
    expect(r.stressPass).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('keeps residual stress check separate from joint separation failure', () => {
    const r = analyzeBoltPreload({
      calcMode: 'professional',
      mode: 'force2torque',
      diameter: 10,
      pitch: 1.5,
      grade: '8.8',
      muG: 0.12,
      muK: 0.12,
      dKm: 14.5,
      gripLength: 20,
      holeDiameter: 11,
      headContactDiameter: 15,
      outerDiameter: 18,
      embedmentUm: 11,
      preload: 3000,
      externalAxialLoad: 50000,
    })
    expect(r.jointLoad?.separationPass).toBe(false)
    expect(r.stressResidualPass).toBe(true)
    expect(r.passResidual).toBe(false)
    expect(r.stressUnderLoadPass).toBe(r.stressUnderLoad <= r.allowStress)
  })
})
