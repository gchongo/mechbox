import { describe, it, expect } from 'vitest'
import {
  calcSpringFatigueCheck,
  analyzeSpring,
  isSpringFatigueLifeAtTarget,
} from '@/utils/spring-calc'
import { adaptSpring } from '@/utils/calc-adapters'
import { calcContactPressure, analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import {
  inferRingType,
  validateRingDirections,
  resolveComponentRingTypes,
  applyRingTypes,
} from '@/utils/ring-direction'
import {
  calculateChainResult,
  evaluateTolerancePass,
  shouldUseToleranceBudget,
} from '@/utils/gdt-chain'
import { calcSignedNominalSum, ringSign, buildFormulaLines } from '@/utils/size-chain-math'
import { buildEnhancedReport } from '@/utils/enhanced-report'

describe('P0 spring fatigue GB/T 23935 formula (30)', () => {
  it('matches table 9 at N=10⁷ (τu0=0.32·Rm)', () => {
    const r = calcSpringFatigueCheck({
      tauMin: 362.6,
      tauMax: 728.6,
      tensileStrength: 1810,
      targetCycles: 1e7,
      minSafety: 1.1,
    })
    expect(r.tauU0).toBeCloseTo(0.32 * 1810, 0)
    expect(r.safetyFactor).toBeCloseTo(1.17, 2)
    expect(r.fatiguePass).toBe(true)
  })

  it('appendix C.2.12 worked example uses N=10⁸ tier (τu0=0.30·Rm, S≈1.12)', () => {
    const r = calcSpringFatigueCheck({
      tauMin: 362.6,
      tauMax: 728.6,
      tensileStrength: 1810,
      targetCycles: 1e8,
      minSafety: 1.1,
    })
    expect(r.tauU0).toBeCloseTo(0.3 * 1810, 0)
    expect(r.safetyFactor).toBeCloseTo(1.12, 2)
    expect(r.fatiguePass).toBe(true)
  })

  it('fails when stress range exceeds pulsating limit', () => {
    const r = calcSpringFatigueCheck({
      tauMin: 0,
      tauMax: 2000,
      tensileStrength: 1810,
      targetCycles: 1e6,
      minSafety: 1.1,
    })
    expect(r.fatiguePass).toBe(false)
  })

  it('overall pass follows fatiguePass (S@target), life tier is informational', () => {
    const base = {
      calcMode: 'professional',
      wireDiameter: 4,
      meanDiameter: 28,
      activeCoils: 8,
      freeLength: 35,
      loadMin: 50,
      loadMax: 250,
      material: '50CrVA',
    }
    const r = analyzeSpring({ ...base, targetCycles: 1e4 })
    expect(r.fatiguePass).toBe(true)
    if (r.fatigueLifePass === false) {
      expect(r.pass).toBe(r.fatiguePass)
    }
  })

  it('adaptSpring cites GB/T 23935; life metric has no pass/fail status', () => {
    const snap = adaptSpring({
      calcMode: 'professional',
      wireDiameter: 4,
      meanDiameter: 28,
      activeCoils: 8,
      freeLength: 35,
      loadMin: 50,
      loadMax: 250,
      targetCycles: 1e6,
    })
    expect(snap.standards.some((s) => s.includes('23935'))).toBe(true)
    expect(snap.standards.some((s) => s.toLowerCase().includes('goodman'))).toBe(false)
    const lifeMetric = snap.keyMetrics.find((m) => m.key === 'fatigueLife')
    const sMetric = snap.keyMetrics.find((m) => m.key === 'fatigueSafety')
    expect(lifeMetric?.status == null).toBe(true)
    expect(sMetric?.status).toBe(snap.outputs.fatiguePass ? 'pass' : 'fail')
    expect(snap.assumptions.some((a) => a.includes('安全系数 S'))).toBe(true)
  })
})

describe('P0 interference fit Lame compliance', () => {
  const base = {
    interference: 0.025,
    holeDiameter: 49.975,
    hubOuterDiameter: 90,
    shaftDiameter: 50,
  }

  it('hub compliance includes Poisson + term (lower pressure than old formula)', () => {
    const c = calcContactPressure(base)
    expect(c.errorKey).toBeUndefined()
    expect(c.pressure).toBeGreaterThan(0)
    expect(c.lambdaH).toBeGreaterThan(c.lambdaS)
    const ri = base.holeDiameter / 2
    const ro = base.hubOuterDiameter / 2
    const expectedLambdaH =
      (1 / 210000) * ((ro * ro + ri * ri) / (ro * ro - ri * ri) + 0.3)
    expect(c.lambdaH).toBeCloseTo(expectedLambdaH, 8)
  })

  it('hollow shaft has higher compliance than solid (lower pressure)', () => {
    const solid = calcContactPressure({ ...base, shaftInnerDiameter: 0 })
    const hollow = calcContactPressure({ ...base, shaftInnerDiameter: 30 })
    expect(hollow.lambdaS).toBeGreaterThan(solid.lambdaS)
    expect(hollow.pressure).toBeLessThan(solid.pressure)
  })

  it('simple mode still checks hoop stress (no auto-pass)', () => {
    const ok = analyzeInterferenceFit({
      shaftDiameter: 50,
      holeDiameter: 49.975,
      hubOuterDiameter: 90,
      fitLength: 40,
      calcMode: 'simple',
      shaftAllowHoop: 500,
      hubAllowHoop: 500,
    })
    expect(ok.estimateOnly).toBe(true)
    expect(ok.hoopPass).toBe(ok.hoopShaft <= 500 && ok.hoopHub <= 500)

    const fail = analyzeInterferenceFit({
      shaftDiameter: 50,
      holeDiameter: 49.5,
      hubOuterDiameter: 55,
      fitLength: 40,
      calcMode: 'simple',
      shaftAllowHoop: 50,
      hubAllowHoop: 50,
    })
    expect(fail.hoopPass).toBe(false)
    expect(fail.pass).toBe(false)
  })
})

describe('P0 ring direction inference', () => {
  it('returns null when direction missing instead of default decreasing', () => {
    expect(inferRingType(null, 'right')).toBeNull()
    expect(inferRingType('right', null)).toBeNull()
    expect(inferRingType('right', 'right')).toBe('increasing')
    expect(inferRingType('left', 'right')).toBe('decreasing')
  })

  it('validateRingDirections flags missing ring direction', () => {
    const v = validateRingDirections('right', [{ name: 'A1', direction: null }])
    expect(v.valid).toBe(false)
    expect(v.errorKey).toBe('ring_direction_missing')
  })

  it('applyRingTypes does not default missing direction to closed direction', () => {
    const rings = applyRingTypes([{ name: 'A1', direction: null }], 'right')
    expect(rings[0].typeInvalid).toBe(true)
    expect(rings[0].type).toBeNull()
  })

  it('resolveComponentRingTypes rejects missing direction when closedDirection given', () => {
    const r = resolveComponentRingTypes([{ name: 'A1', type: 'increasing', direction: null }], 'right')
    expect(r.valid).toBe(false)
    expect(r.errorKey).toBe('ring_direction_missing')
  })

  it('resolveComponentRingTypes rejects type/direction conflict', () => {
    const r = resolveComponentRingTypes(
      [{ name: 'A1', type: 'increasing', direction: 'left' }],
      'right',
    )
    expect(r.valid).toBe(false)
    expect(r.errorKey).toBe('ring_type_direction_conflict')
  })

  it('calculateChainResult blocks when ring type cannot be resolved', () => {
    const result = calculateChainResult(
      { min: 0, max: 1 },
      [{ name: 'A1', size: 10, tolerance: 0.1, direction: null, type: null }],
      'rss',
      { closedDirection: 'right' },
    )
    expect(result.pass).toBe(false)
    expect(result.validationError).toBe('ring_direction_missing')
    expect(result.totalTolerance).toBeNull()
  })
})

describe('P0 GD&T pass semantics and position chain', () => {
  it('shouldUseToleranceBudget for [0, T_spec] closed ring', () => {
    expect(shouldUseToleranceBudget({ min: 0, max: 0.1 }, 0)).toBe(true)
    expect(shouldUseToleranceBudget({ min: -5, max: 25 }, 20)).toBe(false)
  })

  it('evaluateTolerancePass budget: T within spec passes', () => {
    const r = evaluateTolerancePass(0.05, { min: 0, max: 0.1 }, { passMode: 'budget' })
    expect(r.pass).toBe(true)
    expect(r.passMode).toBe('budget')
    expect(r.upper).toBe(0.05)
    expect(r.lower).toBe(0)
  })

  it('evaluateTolerancePass budget: T exceeds spec fails', () => {
    const r = evaluateTolerancePass(0.15, { min: 0, max: 0.1 }, { passMode: 'budget' })
    expect(r.pass).toBe(false)
  })

  it('uses signed nominal sum for radial chain with linear sizes', () => {
    const rings = [
      { size: 30, tolerance: 0.04, factor: 1, type: 'increasing', direction: 'right' },
      { size: 10, tolerance: 0.02, factor: 1, type: 'decreasing', direction: 'left' },
    ]
    const result = calculateChainResult({ min: -5, max: 25 }, rings, 'rss', {
      typeId: 'coaxiality',
      closedDirection: 'right',
    })
    expect(result.nominal).toBeCloseTo(20, 6)
    expect(result.passMode).toBe('band')
  })

  it('position chain uses budget pass and passes when T_pos <= spec', () => {
    const rings = [
      { size: 50, tolerance: 0.02, factor: 1, type: 'increasing', direction: 'right' },
      { size: 30, tolerance: 0.02, factor: 1, type: 'decreasing', direction: 'up' },
    ]
    const result = calculateChainResult({ min: 0, max: 0.1 }, rings, 'rss', {
      typeId: 'position',
      closedDirection: 'right',
    })
    expect(result.nominal).toBe(0)
    expect(result.passMode).toBe('budget')
    expect(result.totalTolerance).toBeGreaterThan(0)
    expect(result.totalTolerance).toBeLessThan(0.1)
    expect(result.pass).toBe(true)
  })

  it('ringSign returns null for invalid type (no silent decreasing)', () => {
    expect(ringSign({ type: 'increasing' })).toBe(1)
    expect(ringSign({ type: 'decreasing' })).toBe(-1)
    expect(ringSign({ type: null })).toBeNull()
    expect(calcSignedNominalSum([{ size: 10, type: null }])).toBe(0)
  })

  it('buildFormulaLines rejects invalid rings like calculateChainResult', () => {
    const lines = buildFormulaLines(
      { min: 0, max: 1, name: 'L0' },
      [{ name: 'A1', size: 10, tolerance: 0.1, type: 'increasing', direction: 'left' }],
      'rss',
      'mm',
      { closedDirection: 'right' },
    )
    expect(lines[0]).toMatch(/ring_type_direction_conflict/)
  })
})

describe('P0 enhanced report wording', () => {
  it('does not claim baseline design approval on pass', () => {
    const report = buildEnhancedReport({
      snapshot: {
        toolLabel: '测试',
        timestamp: Date.now(),
        calcMode: 'complete',
        pass: true,
        keyMetrics: [],
        standards: [],
        assumptions: [],
        warnings: [],
        suggestions: [],
      },
    })
    const suggestion = report.sections.find((s) => s.heading === '建议')
    expect(suggestion?.text).toMatch(/辅助判断/)
    expect(suggestion?.text).not.toMatch(/基线方案/)

    const verdict = report.sections.find((s) => s.heading === '判定汇总')
    expect(verdict?.rows[0].value).toMatch(/非正式放行/)
    expect(verdict?.rows[0].value).not.toMatch(/^通过 ✓$/)
  })
})
