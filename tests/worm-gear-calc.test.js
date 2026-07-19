import { describe, it, expect } from 'vitest'
import {
  analyzeWormGear,
  calcWormEfficiency,
  leadAngleFromQ,
  frictionAngleDeg,
  equivalentFriction,
  calcSlidingSpeed,
  calcWormBendingStress,
  calcWormContactStress,
  calcHeatCapacityKw,
  WORM_ZE_STEEL_BRONZE,
  WORM_YF_DEFAULT,
} from '@/utils/worm-gear-calc'

describe('worm-gear-calc', () => {
  it('lead angle from diameter factor', () => {
    expect(leadAngleFromQ(1, 10)).toBeCloseTo((Math.atan(0.1) * 180) / Math.PI, 4)
    expect(leadAngleFromQ(2, 10)).toBeGreaterThan(leadAngleFromQ(1, 10))
  })

  it('efficiency equals tanγ/tan(γ+ρ) and improves with γ', () => {
    const mu = 0.08
    const g = 12
    const rho = frictionAngleDeg(mu)
    const e = calcWormEfficiency(g, mu)
    const ref =
      Math.tan((g * Math.PI) / 180) / Math.tan(((g + rho) * Math.PI) / 180)
    expect(e).toBeCloseTo(ref, 10)
    expect(calcWormEfficiency(15, mu)).toBeGreaterThan(calcWormEfficiency(5, mu))
    expect(calcWormEfficiency(15, 0.15)).toBeLessThan(calcWormEfficiency(15, mu))
  })

  it('self-locking when gamma <= friction angle', () => {
    const mu = 0.1
    const rho = frictionAngleDeg(mu)
    const r = analyzeWormGear({
      calcMode: 'simple',
      module: 2,
      wormStarts: 1,
      wheelTeeth: 40,
      diameterFactor: 16,
      frictionCoeff: mu,
      rpmWorm: 1000,
      torqueWorm: 10,
    })
    expect(r.leadAngle).toBeLessThanOrEqual(rho + 1e-9)
    expect(r.selfLocking).toBe(true)
  })

  it('Fa1 equals Ft2 and matches η force relation', () => {
    const r = analyzeWormGear({
      calcMode: 'simple',
      module: 2,
      wormStarts: 2,
      wheelTeeth: 40,
      diameterFactor: 10,
      rpmWorm: 1500,
      torqueWorm: 20,
      frictionCoeff: 0.08,
    })
    expect(r.axialForceWorm).toBeCloseTo(r.tangentialForceWheel, 6)
    const tg = Math.tan((r.leadAngle * Math.PI) / 180)
    expect(r.tangentialForceWheel).toBeCloseTo(
      (r.tangentialForceWorm * r.efficiency) / tg,
      4,
    )
  })

  it('simple mode is estimateOnly and never passes', () => {
    const r = analyzeWormGear({
      calcMode: 'simple',
      module: 3,
      wormStarts: 2,
      wheelTeeth: 40,
      diameterFactor: 10,
      rpmWorm: 1000,
      torqueWorm: 8,
      frictionCoeff: 0.06,
    })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.bendingStress).toBeUndefined()
    expect(r.ratio).toBe(20)
    expect(r.wormDiameter).toBe(30)
    expect(r.wheelDiameter).toBe(120)
    expect(r.centerDistance).toBe(75)
  })

  it('complete mode pass is bending ∧ contact', () => {
    const ok = analyzeWormGear({
      calcMode: 'complete',
      module: 3,
      wormStarts: 2,
      wheelTeeth: 40,
      diameterFactor: 10,
      frictionCoeff: 0.06,
      rpmWorm: 1000,
      torqueWorm: 8,
      faceWidth: 28,
      allowBending: 120,
      allowContact: 450,
    })
    expect(ok.estimateOnly).toBe(false)
    expect(ok.bendingPass).toBe(true)
    expect(ok.contactPass).toBe(true)
    expect(ok.pass).toBe(true)
    expect(ok.bendingStress).toBeCloseTo(
      calcWormBendingStress(ok.tangentialForceWheel, 28, 3, WORM_YF_DEFAULT),
      6,
    )
    expect(ok.contactStress).toBeCloseTo(
      calcWormContactStress(ok.tangentialForceWheel, 120, 28, WORM_ZE_STEEL_BRONZE),
      6,
    )

    const fail = analyzeWormGear({
      calcMode: 'complete',
      module: 2,
      wormStarts: 1,
      wheelTeeth: 40,
      diameterFactor: 10,
      rpmWorm: 1500,
      torqueWorm: 80,
      faceWidth: 8,
      allowBending: 20,
      allowContact: 50,
    })
    expect(fail.pass).toBe(false)
  })

  it('professional raises load by KA and uses equivalent mu', () => {
    const base = analyzeWormGear({
      calcMode: 'complete',
      module: 3,
      wormStarts: 2,
      wheelTeeth: 40,
      diameterFactor: 10,
      frictionCoeff: 0.06,
      pressureAngle: 20,
      torqueWorm: 8,
      rpmWorm: 1000,
      faceWidth: 28,
      allowBending: 120,
      allowContact: 450,
    })
    const pro = analyzeWormGear({
      calcMode: 'professional',
      module: 3,
      wormStarts: 2,
      wheelTeeth: 40,
      diameterFactor: 10,
      frictionCoeff: 0.06,
      pressureAngle: 20,
      torqueWorm: 8,
      rpmWorm: 1000,
      faceWidth: 28,
      allowBending: 120,
      allowContact: 450,
      serviceFactor: 1.25,
      maxSlidingSpeed: 10,
    })
    expect(pro.torqueWormDesign).toBeCloseTo(10, 5)
    expect(pro.frictionCoeffUsed).toBeCloseTo(equivalentFriction(0.06, 20), 10)
    expect(pro.efficiency).toBeLessThan(base.efficiency)
    expect(pro.slidingSpeed).toBeCloseTo(calcSlidingSpeed(pro.wormDiameter, 1000, pro.leadAngle), 6)
    expect(pro.heatCapacity).toBeCloseTo(
      calcHeatCapacityKw(pro.centerDistance, pro.wormDiameter, pro.wheelDiameter, 3.5),
      6,
    )
    expect(pro.pass).toBe(true)
    expect(pro.slidingPass).toBe(true)
    expect(pro.thermalPass).toBe(true)
  })

  it('professional fails when sliding speed exceeds limit', () => {
    const r = analyzeWormGear({
      calcMode: 'professional',
      module: 3,
      wormStarts: 2,
      wheelTeeth: 40,
      diameterFactor: 10,
      frictionCoeff: 0.06,
      torqueWorm: 8,
      rpmWorm: 1000,
      faceWidth: 28,
      allowBending: 120,
      allowContact: 450,
      serviceFactor: 1.25,
      maxSlidingSpeed: 0.5,
    })
    expect(r.slidingPass).toBe(false)
    expect(r.pass).toBe(false)
  })
})
