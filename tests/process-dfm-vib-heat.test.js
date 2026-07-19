import { describe, it, expect } from 'vitest'
import { analyzeCutting } from '@/utils/cutting-calc'
import { analyzeRoughnessFit, lookupByRa, lookupByFit } from '@/utils/roughness-fit-ref'
import { analyzeInjectionDfm } from '@/utils/injection-dfm'
import {
  analyzeVibrationIsolation,
  transmissibility,
  naturalFreqHz,
} from '@/utils/vibration-isolation-calc'
import { analyzeHeatTransfer, conductionPower, convectionPower } from '@/utils/heat-transfer-calc'

describe('cutting-calc', () => {
  it('computes force, power and rpm', () => {
    const r = analyzeCutting({
      calcMode: 'complete',
      materialId: 'steel_soft',
      cuttingSpeed: 100,
      feed: 0.2,
      depthOfCut: 2,
      diameter: 50,
      efficiency: 0.8,
      allowPower: 10,
    })
    expect(r.cuttingForce).toBeCloseTo(1800 * 2 * 0.2, 5)
    expect(r.cuttingPower).toBeCloseTo((720 * 100) / (60 * 1000), 8)
    expect(r.motorPower).toBeCloseTo(r.cuttingPower / 0.8, 8)
    expect(r.rpm).toBeCloseTo((1000 * 100) / (Math.PI * 50), 5)
    expect(r.powerPass).toBe(true)
    expect(r.pass).toBe(true)
  })

  it('simple mode is estimateOnly and not pass', () => {
    const r = analyzeCutting({ calcMode: 'simple', allowPower: 100 })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('fails when motor power exceeds allow', () => {
    const r = analyzeCutting({
      calcMode: 'complete',
      materialId: 'stainless',
      cuttingSpeed: 80,
      feed: 0.3,
      depthOfCut: 3,
      diameter: 40,
      efficiency: 0.7,
      allowPower: 0.5,
    })
    expect(r.powerPass).toBe(false)
    expect(r.pass).toBe(false)
  })

  it('professional Taylor life gate with calibrated C default', () => {
    const ok = analyzeCutting({
      calcMode: 'professional',
      cuttingSpeed: 100,
      feed: 0.2,
      depthOfCut: 1,
      diameter: 40,
      efficiency: 0.8,
      allowPower: 10,
      minToolLife: 15,
    })
    expect(ok.toolLifeMin).toBeCloseTo(15, 5)
    expect(ok.lifePass).toBe(true)
    expect(ok.pass).toBe(true)

    const short = analyzeCutting({
      calcMode: 'professional',
      cuttingSpeed: 200,
      feed: 0.2,
      depthOfCut: 1,
      diameter: 40,
      efficiency: 0.8,
      allowPower: 50,
      minToolLife: 15,
    })
    expect(short.lifePass).toBe(false)
    expect(short.pass).toBe(false)
  })
})

describe('roughness-fit-ref', () => {
  it('maps Ra to IT band', () => {
    expect(lookupByRa(0.8).itMin).toBe(7)
    expect(lookupByFit('H7/g6')?.raShaft).toBe(0.8)
    const a = analyzeRoughnessFit({ ra: 1.6, fit: 'H7/k6' })
    expect(a.byRa.process).toBeTruthy()
    expect(a.estimateOnly).toBe(true)
    expect(a.pass).toBe(false)
  })
})

describe('injection-dfm', () => {
  it('passes checklist when geometry ok', () => {
    const ok = analyzeInjectionDfm({
      calcMode: 'complete',
      materialId: 'abs',
      wallThickness: 2.5,
      wallVariationPct: 10,
      draftAngle: 1,
      filletRadius: 1.5,
      hasRibs: true,
      ribThickness: 1.2,
    })
    expect(ok.pass).toBe(true)
    expect(ok.failCount).toBe(0)
  })

  it('simple estimateOnly even if checks pass', () => {
    const r = analyzeInjectionDfm({
      calcMode: 'simple',
      materialId: 'abs',
      wallThickness: 2.5,
      wallVariationPct: 10,
      draftAngle: 1,
      filletRadius: 1.5,
      hasRibs: false,
    })
    expect(r.failCount).toBe(0)
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('fails thin wall / small draft / fillet', () => {
    const bad = analyzeInjectionDfm({
      calcMode: 'complete',
      materialId: 'abs',
      wallThickness: 0.5,
      draftAngle: 0.1,
      filletRadius: 0.1,
    })
    expect(bad.pass).toBe(false)
    expect(bad.failCount).toBeGreaterThan(0)
  })
})

describe('vibration-isolation', () => {
  it('TR is 1 at r=0 and at r=√2 for any ζ', () => {
    expect(transmissibility(0, 0.05)).toBeCloseTo(1, 5)
    expect(transmissibility(Math.SQRT2, 0.001)).toBeCloseTo(1, 5)
    expect(transmissibility(Math.SQRT2, 0.2)).toBeCloseTo(1, 5)
  })

  it('peaks near resonance and isolates at high r', () => {
    const near = transmissibility(1, 0.05)
    const iso = transmissibility(3, 0.05)
    expect(near).toBeGreaterThan(5)
    expect(iso).toBeLessThan(1)
  })

  it('complete requires r>√2 and TR limit', () => {
    const fn = naturalFreqHz(20000, 50)
    const passCase = analyzeVibrationIsolation({
      calcMode: 'complete',
      mass: 50,
      stiffness: 20000,
      dampingRatio: 0.05,
      excitationFreq: fn * 3,
      maxTransmissibility: 0.25,
    })
    expect(passCase.aboveIsolationRegion).toBe(true)
    expect(passCase.pass).toBe(true)

    const atSqrt2 = analyzeVibrationIsolation({
      calcMode: 'complete',
      mass: 50,
      stiffness: 20000,
      dampingRatio: 0.05,
      excitationFreq: fn * Math.SQRT2,
      maxTransmissibility: 1.1,
    })
    // r=√2 为隔振区边界（TR≈1），不计入 r>√2
    expect(atSqrt2.frequencyRatio).toBeCloseTo(Math.SQRT2, 10)
    expect(atSqrt2.aboveIsolationRegion).toBe(false)
    expect(atSqrt2.pass).toBe(false)

    const below = analyzeVibrationIsolation({
      calcMode: 'complete',
      mass: 50,
      stiffness: 20000,
      dampingRatio: 0.05,
      excitationFreq: fn * 1.4,
      maxTransmissibility: 1.1,
    })
    expect(below.aboveIsolationRegion).toBe(false)
    expect(below.pass).toBe(false)

    const nearRes = analyzeVibrationIsolation({
      calcMode: 'complete',
      mass: 50,
      stiffness: 20000,
      dampingRatio: 0.05,
      excitationFreq: fn * 1.1,
      maxTransmissibility: 0.25,
    })
    expect(nearRes.pass).toBe(false)
  })

  it('professional also checks isolation dB', () => {
    const fn = naturalFreqHz(20000, 50)
    const r = analyzeVibrationIsolation({
      calcMode: 'professional',
      mass: 50,
      stiffness: 20000,
      dampingRatio: 0.05,
      excitationFreq: fn * 4,
      maxTransmissibility: 0.3,
      isolationTargetDb: 10,
    })
    expect(r.dbPass).toBe(true)
    expect(r.recommendedStiffness).toBeGreaterThan(0)
    expect(r.pass).toBe(true)
  })
})

describe('heat-transfer', () => {
  it('conduction Q = kAΔT/L', () => {
    const Q = conductionPower({ k: 50, area: 0.01, deltaT: 40, thickness: 0.005 })
    expect(Q).toBeCloseTo((50 * 0.01 * 40) / 0.005, 6)
    const r = analyzeHeatTransfer({
      calcMode: 'complete',
      mode: 'conduction',
      conductivity: 50,
      area: 0.01,
      thickness: 0.005,
      deltaT: 40,
      allowPower: 100,
    })
    expect(r.power).toBeCloseTo(Q, 6)
    expect(r.pass).toBe(true)
  })

  it('convection and series resistance', () => {
    const Qc = convectionPower({ h: 15, area: 0.01, deltaT: 40 })
    expect(Qc).toBeCloseTo(15 * 0.01 * 40, 8)

    const series = analyzeHeatTransfer({
      calcMode: 'complete',
      mode: 'series',
      conductivity: 50,
      thickness: 0.005,
      area: 0.01,
      hConv: 15,
      deltaT: 40,
      allowPower: 5,
    })
    const Rc = 0.005 / (50 * 0.01)
    const Rh = 1 / (15 * 0.01)
    expect(series.thermalResistance).toBeCloseTo(Rc + Rh, 8)
    expect(series.power).toBeCloseTo(40 / (Rc + Rh), 6)
    expect(series.pass).toBe(series.power >= 5)
  })

  it('professional fails when equivalent rise exceeds limit', () => {
    const r = analyzeHeatTransfer({
      calcMode: 'professional',
      mode: 'series',
      conductivity: 50,
      thickness: 0.005,
      area: 0.01,
      hConv: 15,
      deltaT: 40,
      allowPower: 100,
      maxSurfaceRise: 60,
    })
    expect(r.equivDeltaT).toBeGreaterThan(60)
    expect(r.tempPass).toBe(false)
    expect(r.pass).toBe(false)
  })

  it('simple is estimateOnly', () => {
    const r = analyzeHeatTransfer({ calcMode: 'simple', mode: 'conduction' })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })
})
