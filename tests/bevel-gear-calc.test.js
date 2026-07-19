import { describe, it, expect } from 'vitest'
import {
  analyzeBevelGear,
  pitchAngles90,
  coneDistance,
  meanPitchDiameter,
  virtualTeeth,
  calcBevelForces,
  calcBevelBendingStress,
  calcBevelContactStress,
} from '@/utils/bevel-gear-calc'

describe('bevel-gear-calc', () => {
  it('pitch angles sum to 90° and follow tan δ1 = z1/z2', () => {
    const { delta1, delta2 } = pitchAngles90(20, 40)
    expect(delta1 + delta2).toBeCloseTo(90, 10)
    expect(Math.tan((delta1 * Math.PI) / 180)).toBeCloseTo(20 / 40, 10)
  })

  it('cone distance and mean diameter', () => {
    const R = coneDistance(3, 20, 40)
    expect(R).toBeCloseTo(1.5 * Math.sqrt(20 ** 2 + 40 ** 2), 8)
    const dm = meanPitchDiameter(60, 0.3 * R, R)
    expect(dm).toBeCloseTo(60 * (1 - 0.5 * 0.3), 8)
  })

  it('virtual teeth z/cosδ', () => {
    const { delta1 } = pitchAngles90(20, 40)
    expect(virtualTeeth(20, delta1)).toBeCloseTo(20 / Math.cos((delta1 * Math.PI) / 180), 8)
  })

  it('force decomposition Fr/Fa', () => {
    const f = calcBevelForces(50, 55, 20, 26.565)
    expect(f.tangentialForce).toBeCloseTo((2000 * 50) / 55, 6)
    expect(f.radialForce).toBeCloseTo(
      f.tangentialForce * Math.tan((20 * Math.PI) / 180) * Math.cos((26.565 * Math.PI) / 180),
      4,
    )
    expect(f.axialForce).toBeCloseTo(
      f.tangentialForce * Math.tan((20 * Math.PI) / 180) * Math.sin((26.565 * Math.PI) / 180),
      4,
    )
  })

  it('simple is estimateOnly', () => {
    const r = analyzeBevelGear({
      calcMode: 'simple',
      module: 3,
      pinionTeeth: 20,
      gearTeeth: 40,
      torquePinion: 40,
      rpmPinion: 1000,
    })
    expect(r.ratio).toBe(2)
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.tangentialForce).toBeGreaterThan(0)
  })

  it('complete checks bending and contact', () => {
    const ok = analyzeBevelGear({
      calcMode: 'complete',
      module: 4,
      pinionTeeth: 20,
      gearTeeth: 40,
      torquePinion: 30,
      rpmPinion: 800,
      allowBending: 200,
      allowContact: 800,
    })
    expect(ok.bendingStress).toBeCloseTo(
      calcBevelBendingStress(ok.tangentialForce, ok.faceWidth, 4),
      6,
    )
    expect(ok.contactStress).toBeCloseTo(
      calcBevelContactStress(ok.tangentialForce, ok.meanDiameter1, ok.faceWidth),
      6,
    )
    expect(ok.pass).toBe(ok.bendingPass && ok.contactPass)

    const fail = analyzeBevelGear({
      calcMode: 'complete',
      module: 3,
      pinionTeeth: 18,
      gearTeeth: 36,
      torquePinion: 200,
      allowBending: 20,
      allowContact: 50,
    })
    expect(fail.pass).toBe(false)
  })

  it('professional applies KA and speed gate', () => {
    const base = analyzeBevelGear({
      calcMode: 'complete',
      module: 4,
      pinionTeeth: 20,
      gearTeeth: 40,
      torquePinion: 40,
      rpmPinion: 1500,
      allowBending: 250,
      allowContact: 900,
    })
    const pro = analyzeBevelGear({
      calcMode: 'professional',
      module: 4,
      pinionTeeth: 20,
      gearTeeth: 40,
      torquePinion: 40,
      rpmPinion: 1500,
      serviceFactor: 1.5,
      allowBending: 250,
      allowContact: 900,
      maxPitchSpeed: 0.5,
    })
    expect(pro.torquePinionDesign).toBeCloseTo(40 * 1.5, 8)
    expect(pro.tangentialForce).toBeGreaterThan(base.tangentialForce)
    expect(pro.speedPass).toBe(false)
    expect(pro.pass).toBe(false)
  })

  it('Fa1 equals Fr2 for 90° pair', () => {
    const r = analyzeBevelGear({
      calcMode: 'simple',
      module: 3,
      pinionTeeth: 20,
      gearTeeth: 40,
      torquePinion: 25,
    })
    expect(r.axialForcePinion).toBeCloseTo(r.radialForceGear, 8)
    expect(r.radialForcePinion).toBeCloseTo(r.axialForceGear, 8)
  })
})
