import { describe, it, expect } from 'vitest'
import { calcSpringFatigueCheck, analyzeSpring } from '@/utils/spring-calc'
import { calcContactPressure, analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import { inferRingType, validateRingDirections } from '@/utils/ring-direction'
import { calculateChainResult } from '@/utils/gdt-chain'
import { buildEnhancedReport } from '@/utils/enhanced-report'

describe('P0 spring fatigue GB/T 23935 formula (30)', () => {
  it('matches standard worked example S ≈ 1.12', () => {
    const r = calcSpringFatigueCheck({
      tauMin: 362.6,
      tauMax: 728.6,
      tensileStrength: 1810,
      targetCycles: 1e7,
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
})

describe('P0 GD&T radial nominal with decreasing ring', () => {
  it('uses signed nominal sum like 1D chain', () => {
    const rings = [
      { size: 30, tolerance: 0.04, factor: 1, type: 'increasing', direction: 'right' },
      { size: 10, tolerance: 0.02, factor: 1, type: 'decreasing', direction: 'left' },
    ]
    const result = calculateChainResult({ min: -5, max: 25 }, rings, 'rss', {
      typeId: 'coaxiality',
    })
    expect(result.nominal).toBeCloseTo(20, 6)
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
  })
})
