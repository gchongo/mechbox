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
import { analyzeGearStrength, analyzeGear } from '@/utils/gear-calc'
import { combineStackAdvice, evaluateStackFromRings, assessMcWorstGap } from '@/utils/stack-method-advice'
import { analyzeBeam } from '@/utils/beam-calc'
import { batchValidate } from '@/utils/batch-analysis'
import { runMonteCarloSimulation, createSeededRandom } from '@/utils/monte-carlo'
import { runToleranceAllocation, compareAllocationMethods } from '@/utils/tolerance-allocation'
import { calcSpringEffectiveAmplitude, analyzeSpring } from '@/utils/spring-calc'
import { calcJointUnderAxialLoad, analyzeBoltPreload } from '@/utils/bolt-preload-calc'
import { analyzeButtWeld } from '@/utils/weld-calc'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
import { assessComponentFatigue } from '@/utils/fatigue-calc'
import { analyzeBoltGroup, calcSlipResistance } from '@/utils/bolt-group-calc'
import { analyzeBearingLife } from '@/utils/bearing-calc'
import { adaptBeam } from '@/utils/calc-adapters'

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
    const r = calcRodBucklingLoad(d, L, Fy, 'fixed_fixed')
    const A = (Math.PI * d ** 2) / 4
    expect(r.criticalLoad).toBeLessThanOrEqual(A * Fy * 1.01)
    expect(r.criticalLoad).toBeGreaterThan(1000)
    expect(r.effectiveLengthFactor).toBe(0.5)
  })

  it('euler governs long slender rod', () => {
    const d = 12
    const L = 800
    const r = calcRodBucklingLoad(d, L, 235, 1)
    const I = (Math.PI * d ** 4) / 64
    const pEuler = (Math.PI ** 2 * 210000 * I) / (L ** 2)
    expect(r.criticalLoad).toBeCloseTo(pEuler, -1)
    expect(r.effectiveLengthFactor).toBe(1)
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

  it('keeps slenderness warning visible in simple mode', () => {
    const input = {
      calcMode: 'simple',
      materialId: 'q235',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 20,
      spanLength: 900,
      load: 50,
    }
    const raw = analyzeBeam(input)
    expect(raw.pass).toBe(true)
    expect(raw.spanRatio).toBeCloseTo(45, 6)
    expect(raw.slendernessWarning).toBe(true)

    const snapshot = adaptBeam(input)
    expect(snapshot.pass).toBe(true)
    expect(snapshot.estimateOnly).toBe(true)
    expect(snapshot.warnings.some((w) => w.key === 'slenderness')).toBe(true)
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

  it('compareAllocationMethods ranks all analytical methods', () => {
    const rings = [
      { name: 'A', factor: 1, cost: 1, nominal: 20 },
      { name: 'B', factor: 1, cost: 2, nominal: 30 },
      { name: 'C', factor: 1.5, cost: 1, nominal: 10 },
    ]
    const rows = compareAllocationMethods(0.1, rings)
    expect(rows.length).toBeGreaterThanOrEqual(4)
    expect(rows.find((r) => r.methodId === 'equal-effect')?.pass).toBe(true)
    expect(rows.find((r) => r.methodId === 'min-cost')?.pass).toBe(true)
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].costIndex).toBeGreaterThanOrEqual(rows[i - 1].costIndex)
    }
  })
})

describe('shaft combined strength', () => {
  it('keeps torsion stress check separate from twist-angle failure', () => {
    const r = analyzeShaftTorsion({
      calcMode: 'complete',
      diameter: 30,
      torque: 200,
      length: 4000,
      yieldStrength: 235,
      maxTwistAngle: 0.5,
    })
    expect(r.torsionPass).toBe(true)
    expect(r.anglePass).toBe(false)
    expect(r.pass).toBe(false)
  })

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

  it('complete mode derives allow from yield (von Mises σ_eq ≤ Sy)', () => {
    const r = analyzeShaftCombined({
      calcMode: 'complete',
      diameter: 40,
      torque: 300,
      bendingMoment: 200,
      yieldStrength: 235,
    })
    expect(r.allowableStress).toBeCloseTo(235, 1)
  })

  it('keeps equivalent stress check separate from fatigue failure', () => {
    const r = analyzeShaftCombined({
      calcMode: 'professional',
      materialId: '45',
      diameter: 40,
      torque: 20,
      bendingMoment: 20,
      yieldStrength: 355,
      stressConcentrationBending: 1,
      stressConcentrationTorsion: 1,
      bendingAmplitude: 2000,
      targetCycles: 1e6,
    })
    expect(r.combinedPass).toBe(true)
    expect(r.fatiguePass).toBe(false)
    expect(r.pass).toBe(false)
  })
})

describe('spring mean stress fatigue', () => {
  it('Goodman raises effective amplitude when mean stress is present', () => {
    const eff = calcSpringEffectiveAmplitude(100, 200, 'goodman')
    expect(eff).toBeGreaterThan(100)
  })

  it('professional spring fatigue uses GB/T (30) mean stress term', () => {
    const base = {
      calcMode: 'professional',
      wireDiameter: 4,
      meanDiameter: 28,
      activeCoils: 8,
      targetCycles: 1e6,
    }
    const lowMean = analyzeSpring({ ...base, loadMin: 100, loadMax: 500 })
    const highMean = analyzeSpring({ ...base, loadMin: 300, loadMax: 700 })
    expect(highMean.shearAmplitude).toBeCloseTo(lowMean.shearAmplitude, 1)
    expect(highMean.shearMean).toBeGreaterThan(lowMean.shearMean)
    expect(highMean.fatigueSafetyFactor).toBeGreaterThan(0)
    expect(highMean.fatigueTauU0).toBe(lowMean.fatigueTauU0)
    expect(highMean.fatigueSafetyFactor).toBeLessThan(lowMean.fatigueSafetyFactor)
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

describe('component fatigue S-N integration', () => {
  it('uses S-N endurance instead of yield fraction for shaft torsion', () => {
    const fatigue = assessComponentFatigue({
      materialId: '45',
      stressMode: 'shear',
      stressAmplitude: 200,
      targetCycles: 1e6,
    })
    expect(fatigue.adjustedEndurance).toBeLessThan(200)
    expect(fatigue.adjustedEndurance).toBeGreaterThan(100)
    expect(fatigue.fatiguePass).toBe(false)
  })

  it('mean stress raises effective amplitude via Goodman', () => {
    const low = assessComponentFatigue({
      snMaterial: 'steel_45',
      stressAmplitude: 120,
      meanStress: 0,
    })
    const high = assessComponentFatigue({
      snMaterial: 'steel_45',
      stressAmplitude: 120,
      meanStress: 150,
    })
    expect(high.effectiveAmplitude).toBeGreaterThan(low.effectiveAmplitude)
  })
})

describe('gear analyzeGear modes', () => {
  const base = {
    module: 2,
    pinionTeeth: 24,
    gearTeeth: 72,
    faceWidth: 20,
    torque: 200,
    rpm: 1500,
    pinionMaterial: 'st-soft',
    gearMaterial: 'st-soft',
  }

  it('complete mode runs ISO6336 instead of placeholder', () => {
    const r = analyzeGear({ ...base, calcMode: 'complete' })
    expect(r.needsISO).toBeUndefined()
    expect(r.contactStress).toBeGreaterThan(0)
    expect(r.bendingStress).toBeGreaterThan(0)
    expect(r.pass).toBeDefined()
  })

  it('professional mode includes AGMA comparison', () => {
    const r = analyzeGear({ ...base, calcMode: 'professional' })
    expect(r.agma).toBeDefined()
    expect(r.compare).toBeDefined()
    expect(r.compare.bothPass).toBeDefined()
  })
})

describe('bolt group friction and prying', () => {
  it('slip resistance scales with clamp force and friction', () => {
    const slip = calcSlipResistance(0.2, 10000, 4)
    expect(slip.slipCapacity).toBe(8000)
  })

  it('complete mode fails slip when shear exceeds friction capacity', () => {
    const r = analyzeBoltGroup({
      calcMode: 'complete',
      boltCount: 4,
      boltCircleRadius: 50,
      shearX: 20000,
      shearY: 0,
      moment: 0,
      frictionCoeff: 0.2,
      clampForcePerBolt: 5000,
      allowPerBolt: 50000,
    })
    expect(r.friction.slipPass).toBe(false)
    expect(r.pass).toBe(false)
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
