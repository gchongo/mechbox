import { describe, it, expect } from 'vitest'
import {
  calcPreloadFromTorqueSimple,
  calcTighteningTorqueSimple,
  calcPreloadFromTorqueVDI2230,
  calcTighteningTorqueVDI2230,
  calcTorqueBreakdownVDI2230,
  analyzeBoltPreload,
} from '@/utils/bolt-preload-calc'

describe('bolt-preload-calc', () => {
  it('simple torque round-trip', () => {
    const F = calcPreloadFromTorqueSimple(50, 10, 0.2)
    expect(F).toBeCloseTo(25000, 0)
    expect(calcTighteningTorqueSimple(F, 10, 0.2)).toBeCloseTo(50, 2)
  })

  it('VDI2230 gives different torque than simple at same preload', () => {
    const params = { diameter: 10, pitch: 1.5, muG: 0.12, muK: 0.12, dKm: 14.5 }
    const tSimple = calcTighteningTorqueSimple(25000, 10, 0.2)
    const tVdi = calcTighteningTorqueVDI2230(25000, params)
    expect(tVdi).toBeGreaterThan(0)
    expect(Math.abs(tVdi - tSimple)).toBeGreaterThan(1)
  })

  it('VDI2230 breakdown sums to total', () => {
    const params = { diameter: 12, pitch: 1.75, muG: 0.12, muK: 0.12, dKm: 17.4 }
    const F = 30000
    const b = calcTorqueBreakdownVDI2230(F, params)
    expect(b.thread + b.head).toBeCloseTo(b.total, 4)
    expect(b.total).toBeCloseTo(calcTighteningTorqueVDI2230(F, params), 4)
  })

  it('analyzeBoltPreload vdi mode', () => {
    const r = analyzeBoltPreload({
      calcMode: 'vdi2230',
      mode: 'torque2force',
      diameter: 10,
      pitch: 1.5,
      grade: '8.8',
      muG: 0.12,
      muK: 0.12,
      dKm: 14.5,
      torque: 50,
    })
    expect(r.preload).toBeGreaterThan(0)
    expect(r.breakdown).not.toBeNull()
    expect(r.calcMode).toBe('vdi2230')
  })

  it('VDI2230 preload from torque round-trip', () => {
    const params = { diameter: 10, pitch: 1.5, muG: 0.12, muK: 0.12, dKm: 14.5 }
    const F = calcPreloadFromTorqueVDI2230(50, params)
    expect(calcTighteningTorqueVDI2230(F, params)).toBeCloseTo(50, 2)
  })

  it('professional: target residual requires higher tightening force', () => {
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
      outerDiameter: 43,
      embedmentUm: 11,
      deltaT: 0,
      preload: 20000,
    })
    expect(r.preloadTightening).toBeGreaterThan(r.preloadResidual)
    expect(r.joint.embedmentLoss).toBeGreaterThan(0)
    expect(r.preloadResidual).toBeCloseTo(20000, -1)
  })

  it('professional torque2force gives lower residual than tightening', () => {
    const r = analyzeBoltPreload({
      calcMode: 'professional',
      mode: 'torque2force',
      diameter: 10,
      pitch: 1.5,
      grade: '8.8',
      muG: 0.12,
      muK: 0.12,
      dKm: 14.5,
      gripLength: 20,
      embedmentUm: 11,
      torque: 50,
    })
    expect(r.preloadResidual).toBeLessThan(r.preloadTightening)
  })

  it('joint load increases max bolt force with load factor', () => {
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
      embedmentUm: 11,
      preload: 25000,
      externalAxialLoad: 5000,
    })
    expect(r.jointLoad.maxBoltForce).toBeGreaterThan(r.preloadResidual)
    expect(r.jointLoad.separationPass).toBe(true)
  })

  it('professional load factor follows bolt stiffness share', () => {
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
      outerDiameter: 43,
      preload: 25000,
      externalAxialLoad: 5000,
    })
    const expectedPhi = r.joint.kS / (r.joint.kS + r.joint.kP)
    expect(r.joint.loadFactor).toBeCloseTo(expectedPhi, 8)
    expect(r.jointLoad.maxBoltForce).toBeCloseTo(r.preloadResidual + expectedPhi * 5000, 6)
  })
})
