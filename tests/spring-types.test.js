import { describe, it, expect } from 'vitest'
import {
  analyzeTensionSpring,
  analyzeTorsionSpring,
  analyzeSpringByType,
  calcTorsionStressFactor,
  calcTorsionAngularRate,
  calcTorsionBendingStress,
  calcBendingFatigueCheck,
} from '@/utils/spring-types-calc'
import { analyzeSpring } from '@/utils/spring-calc'

describe('tension spring', () => {
  it('initial tension plus rate gives working load', () => {
    const r = analyzeTensionSpring({
      calcMode: 'complete',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 12,
      load: 80,
      initialShearStress: 120,
      allowableShear: 600,
      tensileStrength: 1600,
    })
    expect(r.springType).toBe('tension')
    expect(r.initialTension).toBeGreaterThan(0)
    expect(r.shearStress).toBeGreaterThan(0)
    expect(r.hookShearStress).toBeGreaterThan(r.shearStress)
  })

  it('professional fatigue uses GB formula (30)', () => {
    const r = analyzeTensionSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 12,
      load: 80,
      loadMin: 40,
      loadMax: 80,
      initialShearStress: 100,
      allowableShear: 600,
      tensileStrength: 1800,
      targetCycles: 1e6,
      fatigueSafety: 1.1,
    })
    expect(r.fatigueSafetyFactor).toBeGreaterThan(0)
    expect(r.fatiguePass).toBeDefined()
  })
})

describe('torsion spring', () => {
  it('Ki formula and bending stress consistency', () => {
    const C = 8
    const Ki = calcTorsionStressFactor(C)
    expect(Ki).toBeCloseTo((4 * 8 - 1) / (4 * 8 - 4), 8)
    const k = calcTorsionAngularRate({
      elasticModulus: 206000,
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 10,
    })
    expect(k).toBeCloseTo((206000 * 16) / (64 * 16 * 10), 5)
    const sigma = calcTorsionBendingStress(500, 2, Ki)
    expect(sigma).toBeCloseTo((32 * 500 * Ki) / (Math.PI * 8), 5)
  })

  it('analyzeTorsionSpring returns angle and fatigue', () => {
    const r = analyzeTorsionSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 10,
      moment: 600,
      momentMin: 100,
      momentMax: 600,
      tensileStrength: 1600,
      allowableBending: 900,
    })
    expect(r.springType).toBe('torsion')
    expect(r.angleDeg).toBeGreaterThan(0)
    expect(r.bendingStress).toBeGreaterThan(0)
    expect(r.fatigueSafetyFactor).toBeGreaterThan(0)
  })

  it('Goodman bending SF decreases when amplitude rises', () => {
    const low = calcBendingFatigueCheck({
      sigmaMin: 100,
      sigmaMax: 200,
      tensileStrength: 1600,
    })
    const high = calcBendingFatigueCheck({
      sigmaMin: 100,
      sigmaMax: 800,
      tensileStrength: 1600,
    })
    expect(high.safetyFactor).toBeLessThan(low.safetyFactor)
  })
})

describe('analyzeSpringByType', () => {
  it('defaults to compression path', () => {
    const a = analyzeSpringByType({
      calcMode: 'simple',
      wireDiameter: 1.5,
      meanDiameter: 10.5,
      activeCoils: 10,
      load: 55,
      allowableShear: 540,
    })
    const b = analyzeSpring({
      calcMode: 'simple',
      wireDiameter: 1.5,
      meanDiameter: 10.5,
      activeCoils: 10,
      load: 55,
      allowableShear: 540,
    })
    expect(a.springType).toBe('compression')
    expect(a.springRate).toBeCloseTo(b.springRate, 6)
  })
})
