import { describe, it, expect } from 'vitest'
import { calcProcessCapability, cdfNormalAt } from '@/utils/process-capability'
import { buildSigmaSummary } from '@/utils/size-chain-math'
import { calculateRssLimits } from '@/utils/size-chain-math'
import {
  evaluateFitGeometry,
  evaluateFitThermal,
  analyzeFit,
} from '@/utils/iso-286-calc'
import { calcRodBucklingLoad, calcCylinderForce, calcCylinderArea } from '@/utils/hydraulic-calc'
import { calcKeyCrushStress } from '@/utils/key-calc'
import { calcToleranceLimits } from '@/utils/iso-286-calc'
import { analyzeFatigue } from '@/utils/fatigue-calc'
import { analyzeGearStrength } from '@/utils/gear-calc'
import { combineStackAdvice, evaluateStackFromRings, assessMcWorstGap } from '@/utils/stack-method-advice'
import { analyzeBeam } from '@/utils/beam-calc'
import { batchValidate } from '@/utils/batch-analysis'
import { runMonteCarloSimulation, createSeededRandom } from '@/utils/monte-carlo'
import { runToleranceAllocation } from '@/utils/tolerance-allocation'
import { calcSpringEffectiveAmplitude, analyzeSpring } from '@/utils/spring-calc'
import { calcJointUnderAxialLoad, analyzeBoltPreload } from '@/utils/bolt-preload-calc'
import { analyzeButtWeld } from '@/utils/weld-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
import { analyzeBearingLife } from '@/utils/bearing-calc'

describe('process-capability', () => {
  it('detects off-center process as low yield', () => {
    const cap = calcProcessCapability({ lsl: 5, usl: 7, mean: 10, sigma: 0.0144 })
    expect(cap.cpk).toBeLessThan(0)
    expect(cap.passRate).toBeLessThan(0.01)
    expect(cap.dppm).toBeGreaterThan(900_000)
  })

  it('matches cdf integration at spec limits', () => {
    const mean = 10
    const sigma = 0.02
    const expected = cdfNormalAt(10.1, mean, sigma) - cdfNormalAt(9.9, mean, sigma)
    const cap = calcProcessCapability({ lsl: 9.9, usl: 10.1, mean, sigma })
    expect(cap.passRate).toBeCloseTo(expected, 4)
  })
})

describe('buildSigmaSummary integration', () => {
  it('uses RSS nominal not design center', () => {
    const rss = calculateRssLimits([
      { size: 10, tolerance: 0.05, factor: 1, type: 'increasing' },
      { size: 10, tolerance: 0.05, factor: 1, type: 'increasing' },
      { size: 10, tolerance: 0.05, factor: 1, type: 'decreasing' },
    ])
    const summary = buildSigmaSummary({ min: 5, max: 7 }, rss)
    expect(parseFloat(summary.cpk)).toBeLessThan(0)
  })
})

describe('iso-286 fit pass', () => {
  it('M and N hole deviations differ at same grade', () => {
    const m = calcToleranceLimits(25, 'M6', 'hole')
    const n = calcToleranceLimits(25, 'N6', 'hole')
    expect(m.lowerDeviation).not.toBe(n.lowerDeviation)
  })

  it('complete mode validates geometry', () => {
    const r = analyzeFit(25, 'H7', 'g6', 'complete')
    expect(r.pass).toBe(true)
  })

  it('professional thermal clearance risk fails', () => {
    const cold = analyzeFit(25, 'H9', 'd9', 'simple')
    expect(cold.fitType).toBe('clearance')
    const hot = analyzeFit(25, 'H9', 'd9', { calcMode: 'professional', deltaT: -200 })
    if (hot.minClearanceHot < 0) {
      expect(hot.pass).toBe(false)
      expect(hot.thermalRiskKey).toBe('thermal_interference_risk')
    }
  })

  it('evaluateFitThermal flags lost interference', () => {
    const t = evaluateFitThermal('interference', 0.01, 0.02, 100)
    expect(t.pass).toBe(false)
    expect(t.thermalRiskKey).toBe('thermal_clearance_risk')
  })
})

describe('hydraulic cylinder force', () => {
  it('uses p×A (MPa·mm² = N) without spurious /1000', () => {
    const area = calcCylinderArea(100).bore
    const f = calcCylinderForce(16, area)
    expect(f).toBeCloseTo(16 * (Math.PI * 100 ** 2) / 4, 0)
    expect(f).toBeGreaterThan(100_000)
  })
})

describe('key crush stress', () => {
  it('uses key height in crush area, not width', () => {
    const force = 10000
    const hubLength = 40
    const withHeight = calcKeyCrushStress(force, 7, hubLength)
    const withWidth = calcKeyCrushStress(force, 8, hubLength)
    expect(withHeight).not.toBeCloseTo(withWidth)
    expect(withHeight).toBeCloseTo(force / (7 * hubLength / 2), 6)
  })
})

describe('hydraulic rod buckling', () => {
  it('returns force in newtons and uses yield for short columns', () => {
    const d = 20
    const L = 50
    const Fy = 235
    const p = calcRodBucklingLoad(d, L, Fy, 0.5)
    const A = (Math.PI * d ** 2) / 4
    expect(p).toBeLessThanOrEqual(A * Fy * 1.01)
    expect(p).toBeGreaterThan(1000)
  })

  it('euler governs long slender rod', () => {
    const d = 12
    const L = 800
    const p = calcRodBucklingLoad(d, L, 235, 1)
    const I = (Math.PI * d ** 4) / 64
    const pEuler = (Math.PI ** 2 * 210000 * I) / (L ** 2)
    expect(p).toBeCloseTo(pEuler, -1)
  })
})

describe('fatigue mean stress correction', () => {
  it('soderberg is more conservative than goodman', () => {
    const base = {
      calcMode: 'professional',
      material: 'steel_45',
      stressAmplitude: 200,
      meanStress: 150,
      targetLife: 1e6,
    }
    const goodman = analyzeFatigue({ ...base, meanStressMethod: 'goodman' })
    const soderberg = analyzeFatigue({ ...base, meanStressMethod: 'soderberg' })
    expect(soderberg.effectiveAmplitude).toBeGreaterThan(goodman.effectiveAmplitude)
  })
})

describe('gear simple mode material', () => {
  it('uses material allowables not hardcoded 300/900', () => {
    const r = analyzeGearStrength({
      module: 2,
      teeth: 30,
      faceWidth: 20,
      torque: 200,
      material: 'gg',
    })
    expect(r.allowBending).toBeLessThan(200)
    expect(r.materialLabel).toContain('铸铁')
  })
})

describe('stack method advice', () => {
  it('flags rss pass with worst fail as critical', () => {
    const advice = combineStackAdvice(false, true, 0.15, 0.08)
    expect(advice.level).toBe('critical')
    expect(advice.warningKey).toBe('rss_pass_worst_fail')
  })

  it('warns when worst tolerance is 2x rss', () => {
    const advice = combineStackAdvice(false, false, 0.2, 0.08)
    expect(advice.level).toBe('warn')
  })

  it('evaluateStackFromRings compares pass status', () => {
    const rings = [
      { size: 40, tolerance: 0.06, type: 'decreasing', factor: 1 },
      { size: 15, tolerance: 0.05, type: 'decreasing', factor: 1 },
      { size: 55.25, tolerance: 0.04, type: 'increasing', factor: 1 },
    ]
    const ev = evaluateStackFromRings({ min: 0.1, max: 0.35 }, rings)
    expect(ev.worst.totalTolerance).toBeGreaterThan(ev.rss.totalTolerance)
    expect(ev.advice).toBeDefined()
  })

  it('flags mc pass with worst fail', () => {
    const gap = assessMcWorstGap(false, 0.995)
    expect(gap.warningKey).toBe('mc_pass_worst_fail')
  })
})

describe('beam material binding', () => {
  it('simple mode requires material when allowable unset', () => {
    const r = analyzeBeam({
      calcMode: 'simple',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 2000,
    })
    expect(r.errorKey).toBe('material_required')
  })

  it('binds allowable from material library', () => {
    const r = analyzeBeam({
      calcMode: 'simple',
      materialId: 'q235',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 2000,
    })
    expect(r.allowableStress).toBe(157)
    expect(r.materialName).toContain('Q235')
  })
})

describe('batch analysis', () => {
  it('annotates rows with method advice', () => {
    const rows = batchValidate(
      [{ name: 'A', tolerances: '0.06,0.05,0.04' }],
      0,
      0.08,
    )
    expect(rows[0].adviceLevel).toBeDefined()
    expect(rows[0].methodRatio).toBeGreaterThan(1)
  })
})

describe('monte carlo reproducibility', () => {
  const rings = [
    { size: 10, tolerance: 0.05, type: 'increasing' },
    { size: 10, tolerance: 0.05, type: 'decreasing' },
  ]
  const closed = { min: 9.8, max: 10.2 }

  it('seeded runs are deterministic', () => {
    const a = runMonteCarloSimulation({
      closedRing: closed,
      componentRings: rings,
      iterations: 500,
      random: createSeededRandom(42),
    })
    const b = runMonteCarloSimulation({
      closedRing: closed,
      componentRings: rings,
      iterations: 500,
      random: createSeededRandom(42),
    })
    expect(a.passRate).toBe(b.passRate)
    expect(a.mean).toBe(b.mean)
  })
})

describe('tolerance allocation', () => {
  it('equal effect allocation satisfies RSS budget', () => {
    const rings = [
      { name: 'A', factor: 1, cost: 1 },
      { name: 'B', factor: 1, cost: 1 },
    ]
    const result = runToleranceAllocation('equal-effect', 0.1, rings)
    expect(result.verify.pass).toBe(true)
    expect(result.verify.stacked).toBeLessThanOrEqual(0.1 + 1e-9)
  })

  it('equal effect shrinks tolerance when factor > 1', () => {
    const rings = [
      { name: 'A', factor: 1, cost: 1 },
      { name: 'B', factor: 2, cost: 1 },
    ]
    const result = runToleranceAllocation('equal-effect', 0.1, rings)
    expect(result.verify.pass).toBe(true)
    const tolA = result.allocated.find((a) => a.name === 'A').tolerance
    const tolB = result.allocated.find((a) => a.name === 'B').tolerance
    expect(tolA).toBeCloseTo(tolB * 2, 6)
  })

  it('min-cost allocation satisfies RSS with non-unity factor', () => {
    const rings = [
      { name: 'A', factor: 1, cost: 1 },
      { name: 'B', factor: 2, cost: 4 },
    ]
    const result = runToleranceAllocation('min-cost', 0.12, rings)
    expect(result.verify.pass).toBe(true)
    expect(result.verify.stacked).toBeLessThanOrEqual(0.12 + 1e-9)
  })

  it('sensitivity allocation satisfies RSS budget', () => {
    const rings = [
      { name: 'A', factor: 1, cost: 1, sensitivity: 2 },
      { name: 'B', factor: 2, cost: 1, sensitivity: 1 },
    ]
    const result = runToleranceAllocation('sensitivity', 0.1, rings)
    expect(result.verify.pass).toBe(true)
  })
})

describe('shaft combined strength', () => {
  it('von Mises check uses user allowable in simple mode', () => {
    const r = analyzeShaftCombined({
      calcMode: 'simple',
      diameter: 30,
      torque: 200,
      bendingMoment: 150,
      allowableStress: 80,
    })
    expect(r.pass).toBe(r.equivalentStress <= 80)
  })

  it('complete mode derives allow from yield', () => {
    const r = analyzeShaftCombined({
      calcMode: 'complete',
      diameter: 40,
      torque: 300,
      bendingMoment: 200,
      yieldStrength: 235,
    })
    expect(r.allowableStress).toBeCloseTo(235 / Math.sqrt(3), 1)
  })
})

describe('spring mean stress fatigue', () => {
  it('Goodman raises effective amplitude when mean stress is present', () => {
    const eff = calcSpringEffectiveAmplitude(100, 200, 'goodman')
    expect(eff).toBeGreaterThan(100)
  })

  it('professional spring fatigue uses mean stress correction', () => {
    const lowMean = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 4,
      meanDiameter: 28,
      activeCoils: 8,
      loadMin: 100,
      loadMax: 500,
      targetCycles: 1e6,
    })
    const highMean = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 4,
      meanDiameter: 28,
      activeCoils: 8,
      loadMin: 400,
      loadMax: 800,
      targetCycles: 1e6,
    })
    expect(highMean.effectiveShearAmplitude).toBeGreaterThan(lowMean.effectiveShearAmplitude)
  })
})

describe('bolt joint under axial load', () => {
  it('detects separation when axial load exceeds residual clamp capacity', () => {
    const joint = calcJointUnderAxialLoad(10000, 0.2, 15000)
    expect(joint.maxBoltForce).toBeCloseTo(10000 + 0.2 * 15000, 0)
    expect(joint.separationPass).toBe(false)
  })

  it('professional preload fails when external load causes separation', () => {
    const base = {
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
      preload: 8000,
      externalAxialLoad: 0,
    }
    const r0 = analyzeBoltPreload(base)
    const phi = r0.joint.loadFactor
    const separatingLoad = r0.preloadResidual / Math.max(0.01, 1 - phi) + 500
    const r = analyzeBoltPreload({ ...base, externalAxialLoad: separatingLoad })
    expect(r.jointLoad.separationPass).toBe(false)
    expect(r.pass).toBe(false)
  })
})

describe('weld eurocode consistency', () => {
  it('butt weld EC allow uses betaW and gammaM2 like fillet path', () => {
    const r = analyzeButtWeld({
      thickness: 8,
      weldLength: 100,
      force: 1000,
      steelGrade: 'S235',
      calcMode: 'complete',
    })
    expect(r.eurocode.allow).toBeCloseTo(360 / (0.85 * 1.25), 1)
  })
})

describe('bearing life temperature factor', () => {
  it('applies a2 as exponent in professional mode (ball p=3)', () => {
    const base = {
      calcMode: 'professional',
      dynamicLoad: 30000,
      radialLoad: 5000,
      axialLoad: 0,
      x: 1,
      y: 0,
      rpm: 1500,
      targetHours: 10000,
      reliability: 90,
      lifeCondition: 'standard',
      operatingTemp: 150,
    }
    const r = analyzeBearingLife(base)
    const a2 = 0.9
    const expectedLnm = r.l10MillionRev * a2 ** 3
    expect(r.temperatureFactor).toBe(a2)
    expect(r.modifiedLifeMillionRev).toBeCloseTo(expectedLnm, 6)
  })
})

describe('bearing simple static check', () => {
  it('includes static safety when C0 provided', () => {
    const r = analyzeBearingLife({
      calcMode: 'simple',
      dynamicLoad: 20000,
      staticLoad: 15000,
      radialLoad: 5000,
      rpm: 1500,
      targetHours: 10000,
    })
    expect(r.staticSafetyFactor).toBeGreaterThan(0)
    expect(r.staticPass).toBeDefined()
  })
})
