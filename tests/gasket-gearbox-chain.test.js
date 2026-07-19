import { describe, expect, it } from 'vitest'
import {
  analyzeGasketFlange,
  calcGasketArea,
  calcRequiredBoltLoads,
} from '@/utils/gasket-flange-calc'
import { buildChainSnapshots, buildStepInputs } from '@/utils/chain-snapshots'
import { CHAIN_TYPES } from '@/utils/design-context'
import { adaptGasketFlange, adaptGear } from '@/utils/calc-adapters'

describe('gasket-flange-calc', () => {
  it('computes annular gasket area', () => {
    const Ag = calcGasketArea(80, 110)
    expect(Ag).toBeCloseTo((Math.PI / 4) * (110 ** 2 - 80 ** 2), 6)
  })

  it('simple mode is estimateOnly', () => {
    const r = analyzeGasketFlange({
      calcMode: 'simple',
      boltCount: 8,
      preloadPerBolt: 30000,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1.6,
      gasketMaterial: 'compressed_fiber',
    })
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.seatingStress).toBeGreaterThan(0)
  })

  it('complete mode applies safety factor to seating and capacity', () => {
    const r = analyzeGasketFlange({
      calcMode: 'complete',
      boltCount: 8,
      preloadPerBolt: 40000,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1.0,
      gasketMaterial: 'compressed_fiber',
      minSafety: 1.2,
    })
    expect(r.seatingRequired).toBeCloseTo(11 * 1.2, 6)
    expect(r.capacityRequired).toBeCloseTo(r.requiredTotalLoad * 1.2, 6)
    // borderline seating without SF should fail with SF
    const borderline = analyzeGasketFlange({
      calcMode: 'complete',
      boltCount: 8,
      preloadPerBolt: r.gasketArea * 11.1 / 8,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1.0,
      gasketMaterial: 'compressed_fiber',
      minSafety: 1.2,
    })
    expect(borderline.seatingStress).toBeGreaterThan(11)
    expect(borderline.seatingPass).toBe(false)
    expect(borderline.pass).toBe(false)
  })

  it('complete mode passes when preload covers SF demand', () => {
    const Ag = calcGasketArea(80, 110)
    const need = Ag * 11 * 1.2
    const r = analyzeGasketFlange({
      calcMode: 'complete',
      boltCount: 8,
      preloadPerBolt: need / 8 + 100,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1.0,
      gasketMaterial: 'compressed_fiber',
      minSafety: 1.2,
    })
    expect(r.seatingPass).toBe(true)
    expect(r.operatingPass).toBe(true)
    expect(r.capacityPass).toBe(true)
    expect(r.pass).toBe(true)
  })

  it('required load uses max of seating and operating', () => {
    const Ag = calcGasketArea(80, 110)
    const Ai = (Math.PI / 4) * 80 ** 2
    const req = calcRequiredBoltLoads({
      gasketArea: Ag,
      pressureArea: Ai,
      seatingStressY: 11,
      factorM: 2,
      pressureMPa: 1.6,
    })
    expect(req.requiredTotalLoad).toBe(Math.max(req.seatingLoad, req.operatingLoad))
  })
})

describe('design chains step3', () => {
  it('registers flange-seal and gearbox chain types', () => {
    expect(CHAIN_TYPES['flange-seal'].steps.map((s) => s.key)).toEqual([
      'bolt-preload',
      'bolt-group',
      'gasket-flange',
    ])
    expect(CHAIN_TYPES.gearbox.steps.map((s) => s.key)).toEqual([
      'gear',
      'shaft',
      'bearing',
      'key',
    ])
  })

  it('builds flange-seal gasket step from shared preload', () => {
    const inputs = buildStepInputs('flange-seal', 'gasket-flange', {
      boltCount: 8,
      preload: 30000,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1.6,
    })
    expect(inputs.preloadPerBolt).toBe(30000)
    const snaps = buildChainSnapshots('flange-seal', {
      diameter: 12,
      pitch: 1.75,
      preload: 30000,
      externalAxialLoad: 8000,
      gripLength: 40,
      boltCount: 8,
      boltCircleRadius: 70,
      shearX: 2000,
      shearY: 1000,
      moment: 80000,
      allowPerBolt: 10000,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1.6,
    })
    expect(snaps['gasket-flange']?.toolId).toBe('gasket-flange')
    expect(snaps['bolt-preload']?.toolId).toBe('bolt-preload')
  })

  it('builds gearbox gear and bearing snapshots', () => {
    const snaps = buildChainSnapshots('gearbox', {
      torque: 200,
      rpm: 1500,
      module: 2,
      pinionTeeth: 20,
      gearTeeth: 40,
      faceWidth: 25,
      shaftDiameter: 30,
      yieldStrength: 355,
      targetHours: 10000,
      radialLoad: 0,
      axialLoad: 0,
      dynamicLoad: 35000,
      keyWidth: 8,
      keyLength: 28,
    })
    expect(snaps.gear?.toolId).toBe('gear')
    expect(snaps.bearing?.toolId).toBe('bearing')
    expect(snaps.bearing.inputs.radialLoad).toBeGreaterThan(0)
    expect(snaps.bearing.inputs.bore).toBe(30)
  })

  it('adapters export gasket and gear', () => {
    const g = adaptGasketFlange({
      calcMode: 'complete',
      boltCount: 8,
      preloadPerBolt: 40000,
      gasketInner: 80,
      gasketOuter: 110,
      pressure: 1,
      gasketMaterial: 'compressed_fiber',
    })
    expect(g.toolId).toBe('gasket-flange')
    const gear = adaptGear({
      calcMode: 'complete',
      module: 2,
      pinionTeeth: 20,
      gearTeeth: 40,
      faceWidth: 20,
      torque: 50,
      rpm: 1500,
      pressureAngle: 20,
      pinionMaterial: 'st-soft',
      gearMaterial: 'st-soft',
    })
    expect(gear.toolId).toBe('gear')
  })
})
