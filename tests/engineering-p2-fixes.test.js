import { describe, it, expect } from 'vitest'
import {
  calcProcessCapability,
  SIGMA_LEVEL_DEFINITION,
  TOLERANCE_OVER_6SIGMA_DEFINITION,
} from '@/utils/process-capability'
import { calcToleranceLimits, validateIso286Nominal, ISO286_NOMINAL_MAX } from '@/utils/iso-286-calc'
import {
  calculateSizeChain,
  calculateWorstCaseLimits,
  buildSigmaSummary,
} from '@/utils/size-chain-math'
import {
  validateRingToleranceBounds,
  validateComponentRingTolerances,
} from '@/utils/ring-tolerance'
import { deserializeMonteCarloPayload } from '@/constants/editor-bridge'
import { runMonteCarloSimulation, createSeededRandom } from '@/utils/monte-carlo'
import {
  calcRodBucklingLoad,
  resolveEffectiveLengthFactor,
  END_FIXITY_PRESETS,
  analyzeHydraulicCylinder,
} from '@/utils/hydraulic-calc'
import {
  analyzeThermalExpansion,
  calcLinearExpansion,
  alphaAtTemperature,
  THERMAL_ALPHA_DEFINITION,
} from '@/utils/thermal-expansion-calc'
import { analyzeBearingLife } from '@/utils/bearing-calc'
import {
  auditCriticalInputs,
  applyReleaseGate,
} from '@/utils/critical-input-guard'
import { analyzeFatigue } from '@/utils/fatigue-calc'
import { analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import { analyzeSpring } from '@/utils/spring-calc'
import { analyzeThreadStrength } from '@/utils/thread-calc'

const baseRings = [
  { name: 'A', size: 50, tolerance: 0.1, type: 'increasing', direction: 'right' },
  { name: 'B', size: 30, tolerance: 0.08, type: 'decreasing', direction: 'left' },
]

describe('P2-01/02 process capability σ definitions', () => {
  it('sigmaLevel = 3·Cpk for centered capable process', () => {
    const cap = calcProcessCapability({ lsl: 9.9, usl: 10.1, mean: 10, sigma: 0.05 })
    expect(cap.cpk).toBeCloseTo(0.667, 2)
    expect(cap.sigmaLevel).toBeCloseTo(3 * cap.cpk, 4)
    expect(cap.sigmaLevelFormula).toBe('3·Cpk')
    expect(cap.sigmaLevelDefinition).toBe(SIGMA_LEVEL_DEFINITION)
  })

  it('C = T/(6σ) equals Cp when mean is centered', () => {
    const cap = calcProcessCapability({ lsl: 9.9, usl: 10.1, mean: 10, sigma: 0.01 })
    expect(cap.c).toBeCloseTo(0.2 / 0.06, 4)
    expect(cap.toleranceOver6Sigma).toBeCloseTo(cap.c, 4)
    expect(TOLERANCE_OVER_6SIGMA_DEFINITION).toMatch(/centered/)
  })

  it('off-center mean: C ≠ 3·Cpk/σ level relationship still holds via min(cpu,cpl)', () => {
    const cap = calcProcessCapability({ lsl: 9.9, usl: 10.1, mean: 10.05, sigma: 0.01 })
    expect(cap.sigmaLevel).toBeCloseTo(3 * cap.cpk, 4)
    expect(cap.c).not.toBeCloseTo(cap.cpk, 2)
  })

  it('buildSigmaSummary exposes 3·Cpk formula metadata', () => {
    const rss = calculateWorstCaseLimits(baseRings)
    const summary = buildSigmaSummary({ min: 19.5, max: 20.5 }, rss)
    expect(summary.sigmaLevelFormula).toBe('3·Cpk')
    expect(parseFloat(summary.sigmaLevel)).toBeGreaterThanOrEqual(0)
  })
})

describe('P2-03 ISO 286 nominal range guard', () => {
  it('validateIso286Nominal rejects d > 500 mm', () => {
    const check = validateIso286Nominal(501)
    expect(check.valid).toBe(false)
    expect(check.errorKey).toBe('nominal_out_of_table_range')
    expect(check.maxNominal).toBe(ISO286_NOMINAL_MAX)
  })

  it('calcToleranceLimits returns range error without limits', () => {
    const r = calcToleranceLimits(600, 'H7', 'hole')
    expect(r.errorKey).toBe('nominal_out_of_table_range')
    expect(r.lowerLimit).toBeUndefined()
  })

  it('within-range nominal still computes', () => {
    const r = calcToleranceLimits(25, 'H7', 'hole')
    expect(r.errorKey).toBeUndefined()
    expect(r.maxSize).toBeGreaterThan(r.minSize)
  })
})

describe('P2-06 ES/EI validation blocks chain', () => {
  it('validateRingToleranceBounds rejects ES < EI', () => {
    const check = validateRingToleranceBounds({ name: 'X', es: -0.02, ei: 0.05, size: 10 })
    expect(check.valid).toBe(false)
    expect(check.errorKey).toBe('es_lt_ei')
  })

  it('calculateSizeChain blocks when asymmetric band is invalid', () => {
    const badRings = [
      { name: 'A', size: 50, es: 0.02, ei: 0.05, type: 'increasing', direction: 'right' },
    ]
    const r = calculateSizeChain({ min: 0, max: 100 }, badRings, 'worst')
    expect(r.pass).toBe(false)
    expect(r.validationError).toBe('es_lt_ei')
    expect(r.validationRing).toBe('A')
  })

  it('asymmetric valid ES/EI affects worst-case limits', () => {
    const asymmetric = [
      { name: 'A', size: 10, es: 0.08, ei: -0.02, type: 'increasing', direction: 'right' },
    ]
    const symmetric = [{ name: 'A', size: 10, tolerance: 0.1, type: 'increasing', direction: 'right' }]
    const a = calculateWorstCaseLimits(asymmetric)
    const s = calculateWorstCaseLimits(symmetric)
    expect(a.upper).toBeCloseTo(10.08, 4)
    expect(a.lower).toBeCloseTo(9.98, 4)
    expect(s.upper).toBeCloseTo(10.05, 4)
    expect(a.upper).not.toBeCloseTo(s.upper, 4)
  })

  it('Monte Carlo rejects invalid tolerance bands', () => {
    const r = runMonteCarloSimulation({
      closedRing: { min: 0, max: 100 },
      componentRings: [{ name: 'A', size: 10, es: -0.01, ei: 0.02, type: 'increasing', direction: 'right' }],
      iterations: 100,
      random: createSeededRandom(1),
    })
    expect(r.errorKey).toBe('es_lt_ei')
    expect(r.passRate).toBe(0)
  })
})

describe('P2 editor → MC asymmetric tolerance round-trip', () => {
  it('deserializeMonteCarloPayload preserves explicit es/ei', () => {
    const payload = {
      closedMin: 0.1,
      closedMax: 0.3,
      componentRings: [
        {
          name: 'Gap',
          size: 0.2,
          es: 0.08,
          ei: -0.02,
          tolerance: 0.1,
          type: 'increasing',
        },
      ],
    }
    const fields = deserializeMonteCarloPayload(payload)
    expect(fields.componentRings[0].es).toBe(0.08)
    expect(fields.componentRings[0].ei).toBe(-0.02)
    expect(fields.esList).toBe('0.08')
    expect(fields.eiList).toBe('-0.02')
    const check = validateComponentRingTolerances(fields.componentRings)
    expect(check.valid).toBe(true)
  })

  it('symmetric rings default es/ei from tolerance when omitted', () => {
    const fields = deserializeMonteCarloPayload({
      componentRings: [{ name: 'A', size: 10, tolerance: 0.12, type: 'increasing' }],
    })
    expect(fields.componentRings[0].es).toBeCloseTo(0.06)
    expect(fields.componentRings[0].ei).toBeCloseTo(-0.06)
  })

  it('deserialize preserves unknown type token instead of forcing dec', () => {
    const fields = deserializeMonteCarloPayload({
      componentRings: [{ name: 'A', size: 10, tolerance: 0.12, type: null }],
    })
    expect(fields.typeList).toBe('unknown')
  })

  it('Monte Carlo rejects rings with missing type/direction', () => {
    const r = runMonteCarloSimulation({
      closedRing: { min: 0, max: 100 },
      componentRings: [{ name: 'A', size: 10, tolerance: 0.1, type: null, direction: null }],
      iterations: 100,
      random: createSeededRandom(1),
    })
    expect(r.errorKey).toBe('ring_direction_missing')
    expect(r.passRate).toBe(0)
  })
})

describe('P2-04 hydraulic rod buckling end fixity K', () => {
  it('resolveEffectiveLengthFactor maps presets to standard K', () => {
    expect(resolveEffectiveLengthFactor('fixed_fixed').K).toBe(0.5)
    expect(resolveEffectiveLengthFactor('pinned_pinned').K).toBe(1)
    expect(resolveEffectiveLengthFactor('fixed_free').K).toBe(2)
    expect(resolveEffectiveLengthFactor(0.5).K).toBe(0.5)
  })

  it('higher K lowers critical load for same geometry', () => {
    const short = calcRodBucklingLoad(20, 400, 235, 'fixed_fixed')
    const long = calcRodBucklingLoad(20, 400, 235, 'pinned_pinned')
    expect(long.criticalLoad).toBeLessThan(short.criticalLoad)
    expect(long.effectiveLength).toBe(2 * short.effectiveLength)
  })

  it('buckling checks compressive load only; skipped when no compression', () => {
    const r = analyzeHydraulicCylinder({
      calcMode: 'complete',
      boreDiameter: 50,
      rodDiameter: 20,
      pressure: 16,
      strokeLength: 300,
      externalLoad: 5000,
      compressOnRetract: false,
    })
    expect(r.buckling.checkSkipped).toBe(true)
    expect(r.bucklingPass).toBe(true)
  })

  it('defaults to pinned_pinned K=1 when preset omitted', () => {
    const r = analyzeHydraulicCylinder({
      calcMode: 'complete',
      boreDiameter: 50,
      rodDiameter: 20,
      pressure: 16,
      strokeLength: 300,
      externalLoad: 100,
    })
    expect(r.buckling.effectiveLengthFactor).toBe(END_FIXITY_PRESETS.pinned_pinned.K)
  })
})

describe('P2-05 thermal expansion α(T)', () => {
  it('simple mode uses constant α', () => {
    const r = analyzeThermalExpansion({ calcMode: 'simple', length: 100, deltaT: 100, alpha: 11.5e-6 })
    expect(r.linearExpansion).toBeCloseTo(0.115, 3)
    expect(r.alphaTemperatureUsed).toBe(false)
  })

  it('professional mode applies α(T) mean correction for large ΔT', () => {
    const constant = calcLinearExpansion(100, 11.5e-6, 300, { useAlphaTemperature: false })
    const withAlphaT = calcLinearExpansion(100, 11.5e-6, 300, {
      useAlphaTemperature: true,
      alphaTempCoeff: 2.4e-5,
      referenceTemp: 20,
    })
    expect(withAlphaT).toBeGreaterThan(constant)
    const r = analyzeThermalExpansion({
      calcMode: 'professional',
      length: 100,
      deltaT: 300,
      alpha: 11.5e-6,
    })
    expect(r.alphaTemperatureUsed).toBe(true)
    expect(r.alphaDefinition).toBe(THERMAL_ALPHA_DEFINITION)
    expect(r.linearExpansion).toBeCloseTo(withAlphaT, 6)
  })

  it('alphaAtTemperature increases with temperature for steel', () => {
    const a20 = alphaAtTemperature(11.5e-6, 20, 20, 2.4e-5)
    const a400 = alphaAtTemperature(11.5e-6, 400, 20, 2.4e-5)
    expect(a400).toBeGreaterThan(a20)
  })
})

describe('P2-06 critical input confirmation gate', () => {
  it('blocks release when complete mode lacks confirmedFields', () => {
    const audit = auditCriticalInputs('cylinder', 'complete', {})
    expect(audit.releaseAllowed).toBe(false)
    expect(audit.unconfirmed).toContain('endFixity')
    const r = applyReleaseGate({ pass: true, loadPass: true }, audit)
    expect(r.pass).toBe(false)
    expect(r.releaseBlocked).toBe(true)
  })

  it('allows release when all critical fields confirmed', () => {
    const audit = auditCriticalInputs('cylinder', 'complete', {
      confirmedFields: {
        endFixity: true,
        strokeLength: true,
        yieldStrength: true,
        compressOnRetract: true,
      },
    })
    expect(audit.releaseAllowed).toBe(true)
    const r = applyReleaseGate({ pass: true }, audit)
    expect(r.pass).toBe(true)
    expect(r.releaseBlocked).toBeUndefined()
  })

  it('fatigue simple mode always estimateOnly with pass false', () => {
    const r = analyzeFatigue({
      calcMode: 'simple',
      material: 'steel_45',
      stressAmplitude: 200,
    })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('thread complete blocks pass without confirmation even if stresses OK', () => {
    const r = analyzeThreadStrength({
      calcMode: 'complete',
      enforceCriticalConfirm: true,
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      axialForce: 10000,
      engagedLength: 18,
    })
    expect(r.tensilePass).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.releaseBlocked).toBe(true)
  })

  it('thermal professional blocks without assembly/service confirmation', () => {
    const r = analyzeThermalExpansion({
      calcMode: 'professional',
      enforceCriticalConfirm: true,
      alpha: 11.5e-6,
      alpha2: 11.5e-6,
      shaftDiameter: 50,
      holeDiameter: 49.95,
      assemblyDeltaT: 80,
      serviceDeltaT: 120,
    })
    expect(r.releaseBlocked).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('bearing complete blocks release until life inputs and lookup source are confirmed', () => {
    const r = analyzeBearingLife({
      calcMode: 'complete',
      enforceCriticalConfirm: true,
      autoLookup: false,
      bearingType: 'ball',
      dynamicLoad: 35000,
      staticLoad: 18000,
      radialLoad: 5000,
      axialLoad: 1000,
      rpm: 1500,
      targetHours: 10000,
      x: 1,
      y: 0.56,
    })
    expect(r.releaseBlocked).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('interference complete blocks release until geometry and hoop allowables confirmed', () => {
    const r = analyzeInterferenceFit({
      calcMode: 'complete',
      enforceCriticalConfirm: true,
      shaftDiameter: 50,
      holeDiameter: 49.975,
      hubOuterDiameter: 90,
      fitLength: 40,
      shaftAllowHoop: 350,
      hubAllowHoop: 350,
    })
    expect(r.releaseBlocked).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('spring simple stays estimate-only and not pass', () => {
    const r = analyzeSpring({
      calcMode: 'simple',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      load: 100,
      allowableShear: 700,
    })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })
})
