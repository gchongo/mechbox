import { describe, it, expect } from 'vitest'
import {
  analyzeThreadStrength,
  calcExternalThreadShearArea,
  calcInternalThreadShearArea,
  calcMinEngagementLength,
} from '@/utils/thread-calc'
import {
  analyzeBoltGroup,
  generateCircleBoltPositions,
} from '@/utils/bolt-group-calc'
import { analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import {
  analyzeSpring,
  calcBucklingCheck,
  calcLoadsFromHeights,
  calcSpringNaturalFrequency,
  calcSpringResonanceCheck,
  calcSpringCharacteristicCheck,
  calcSpringFatigueCheck,
  calcHotCoiledCompressionTestShearStress,
  calcSpringTestShearStress,
  calcSpringTestLoad,
  getPulsatingFatigueLimit,
  lookupBucklingCoefficient,
  resolveSpringTestLoad,
  hasSpringLoadFallback,
  resolveSpringFatigueLoadRange,
  resolveSpringSolidLoadFromGeometry,
  lookupSpringRmByWireDiameter,
  validateSpringHeights,
} from '@/utils/spring-calc'
import { adaptSpring } from '@/utils/calc-adapters'
import { analyzeBearingLife } from '@/utils/bearing-calc'
import { analyzeFilletWeld } from '@/utils/weld-calc'
import { analyzeBeam } from '@/utils/beam-calc'
import { analyzeKeyConnection } from '@/utils/key-calc'
import { analyzeORingSeal } from '@/utils/o-ring-calc'
import { analyzeClutch } from '@/utils/clutch-calc'
import { analyzeBeltDrive } from '@/utils/belt-calc'
import { analyzeChainDrive } from '@/utils/chain-calc'
import { analyzeHydraulicCylinder, analyzePneumaticCylinder } from '@/utils/hydraulic-calc'
import {
  analyzeFatigue,
  getStressAmplitudeBounds,
  calcFatigueStrength,
  calcLifeFromStress,
  SN_MATERIALS,
} from '@/utils/fatigue-calc'
import { calcPlateBucklingStress } from '@/utils/plate-buckling-calc'
import { analyzeGearStrength } from '@/utils/gear-calc'
import { analyzeThermalExpansion } from '@/utils/thermal-expansion-calc'
import { analyzeSheetMetalUnfold } from '@/utils/sheet-metal-calc'
import { analyzeHeatTreatment } from '@/utils/heat-treatment-calc'
import { calcMachiningAllowance } from '@/utils/machining-calc'
import { calcDraftAngle } from '@/utils/casting-calc'
import { analyzePipeFlow } from '@/utils/pipe-flow-calc'
import { analyzeModal } from '@/utils/modal-calc'
import { analyzeButtWeld } from '@/utils/weld-calc'
import { analyzeGdtStack } from '@/utils/gdt-stack-calc'
import { analyzeFit } from '@/utils/iso-286-calc'
import { scoreMaterials } from '@/utils/material-selection-calc'

describe('thread-calc modes', () => {
  it('simple mode keeps basic pass/fail', () => {
    const r = analyzeThreadStrength({
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      axialForce: 10000,
      engagedLength: 18,
      calcMode: 'simple',
    })
    expect(r.calcMode).toBe('simple')
    expect(r.stressArea).toBeGreaterThan(0)
    expect(r.torqueMethod).toBe('简化 μdF')
  })

  it('complete mode splits inner/outer shear and checks engagement', () => {
    const r = analyzeThreadStrength({
      diameter: 12,
      pitch: 1.75,
      axialForce: 10000,
      engagedLength: 18,
      calcMode: 'complete',
    })
    expect(r.shearExternal).toBeDefined()
    expect(r.shearInternal).toBeDefined()
    expect(r.minEngagementLength).toBe(calcMinEngagementLength(12, 'steel'))
    expect(r.engagementPass).toBe(true)
  })

  it('professional mode uses VDI torque', () => {
    const r = analyzeThreadStrength({
      diameter: 12,
      pitch: 1.75,
      axialForce: 20000,
      engagedLength: 18,
      calcMode: 'professional',
      muG: 0.12,
      muK: 0.12,
      dKm: 17.4,
    })
    expect(r.torqueMethod).toBe('VDI 2230')
    expect(r.vdiTorqueFactor).toBeGreaterThan(0)
    expect(r.tighteningTorque).toBeGreaterThan(0)
  })

  it('external shear area increases with engagement length', () => {
    const a1 = calcExternalThreadShearArea(12, 1.75, 10)
    const a2 = calcExternalThreadShearArea(12, 1.75, 20)
    expect(a2).toBeGreaterThan(a1)
  })

  it('internal shear area increases with engagement length', () => {
    const a1 = calcInternalThreadShearArea(12, 1.75, 10)
    const a2 = calcInternalThreadShearArea(12, 1.75, 20)
    expect(a2).toBeGreaterThan(a1)
  })
})

describe('bolt-group-calc modes', () => {
  it('simple mode returns scalar max force', () => {
    const r = analyzeBoltGroup({
      calcMode: 'simple',
      boltCount: 8,
      boltCircleRadius: 60,
      shearX: 5000,
      moment: 120000,
    })
    expect(r.calcMode).toBe('simple')
    expect(r.maxBoltForce).toBeGreaterThan(0)
    expect(r.bolts).toBeUndefined()
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('complete mode returns per-bolt table', () => {
    const r = analyzeBoltGroup({
      calcMode: 'complete',
      boltCount: 4,
      boltCircleRadius: 50,
      shearX: 4000,
      moment: 80000,
      allowPerBolt: 10000,
    })
    expect(r.bolts).toHaveLength(4)
    expect(r.criticalBoltIndex).toBeGreaterThan(0)
    expect(r.polarInertia).toBeGreaterThan(0)
  })

  it('default demo: torsion is M·R/Ip and max shear is vector max', () => {
    const base = {
      boltCount: 8,
      boltCircleRadius: 60,
      shearX: 5000,
      shearY: 2000,
      moment: 120000,
      allowPerBolt: 8000,
      frictionCoeff: 0.2,
      clampForcePerBolt: 25000,
      pryingArm: 40,
      allowTensionPerBolt: 8000,
    }
    const complete = analyzeBoltGroup({ ...base, calcMode: 'complete' })
    expect(complete.torsionPerBolt).toBeCloseTo(250, 5)
    expect(complete.maxShearForce).toBeCloseTo(910, 0)
    expect(complete.maxBoltForce).toBeCloseTo(910, 0)
    expect(complete.hasTension).toBe(false)
    expect(complete.friction).toBeNull()
    expect(complete.prying.pryingTension).toBe(0)

    const pro = analyzeBoltGroup({ ...base, calcMode: 'professional' })
    expect(pro.torsionPerBolt).toBeCloseTo(250, 5)
    expect(pro.maxShearForce).toBeCloseTo(910, 0)
    expect(pro.prying.pryingTension).toBeCloseTo(375, 5)
    expect(pro.maxBoltForce).toBeCloseTo(Math.hypot(910, 375), 0)
    expect(pro.friction.slipCapacity).toBe(40000)
  })

  it('circle positions are symmetric', () => {
    const pos = generateCircleBoltPositions(4, 50)
    expect(pos).toHaveLength(4)
    const sumX = pos.reduce((s, p) => s + p.x, 0)
    expect(Math.abs(sumX)).toBeLessThan(1e-6)
  })
})

describe('interference-fit-calc modes', () => {
  const base = {
    shaftDiameter: 50,
    holeDiameter: 49.975,
    hubOuterDiameter: 90,
    fitLength: 40,
    friction: 0.12,
  }

  it('simple mode unchanged for positive interference', () => {
    const r = analyzeInterferenceFit({ ...base, calcMode: 'simple' })
    expect(r.errorKey).toBeUndefined()
    expect(r.pressure).toBeGreaterThan(0)
    expect(r.hollowShaft).toBeFalsy()
  })

  it('complete mode supports hollow shaft', () => {
    const solid = analyzeInterferenceFit({ ...base, calcMode: 'complete', shaftInnerDiameter: 0 })
    const hollow = analyzeInterferenceFit({ ...base, calcMode: 'complete', shaftInnerDiameter: 20 })
    expect(hollow.hollowShaft).toBe(true)
    expect(hollow.pressure).not.toEqual(solid.pressure)
  })

  it('professional mode applies thermal delta', () => {
    const nominal = base.shaftDiameter - base.holeDiameter
    const hot = analyzeInterferenceFit({
      ...base,
      calcMode: 'professional',
      deltaT: 80,
      shaftAlpha: 23e-6,
      holeAlpha: 11.5e-6,
    })
    expect(hot.thermal).toBeTruthy()
    expect(hot.interference).toBeGreaterThan(nominal)
  })
})

describe('shaft-calc modes', () => {
  it('simple torsion matches solid shaft', () => {
    const r = analyzeShaftTorsion({ diameter: 30, torque: 200, calcMode: 'simple', materialId: 'q235' })
    expect(r.calcMode).toBe('simple')
    expect(r.shearStress).toBeGreaterThan(0)
    expect(r.hollowShaft).toBeFalsy()
  })

  it('complete mode supports hollow shaft', () => {
    const solid = analyzeShaftTorsion({ diameter: 40, torque: 300, calcMode: 'complete', innerDiameter: 0, yieldStrength: 235 })
    const hollow = analyzeShaftTorsion({ diameter: 40, torque: 300, calcMode: 'complete', innerDiameter: 20, yieldStrength: 235 })
    expect(hollow.hollowShaft).toBe(true)
    expect(hollow.shearStress).toBeGreaterThan(solid.shearStress)
  })

  it('professional applies stress concentration', () => {
    const r = analyzeShaftTorsion({
      diameter: 30,
      torque: 200,
      calcMode: 'professional',
      stressConcentrationTorsion: 2,
      yieldStrength: 235,
    })
    expect(r.peakShearStress).toBeCloseTo(r.shearStress * 2, 1)
  })
})

describe('spring-calc modes', () => {
  const base = { wireDiameter: 2, meanDiameter: 16, activeCoils: 8, load: 150 }

  it('simple mode computes rate and stress', () => {
    const r = analyzeSpring({ ...base, calcMode: 'simple', load: 100, allowableShear: 700 })
    expect(r.springRate).toBeGreaterThan(0)
    expect(r.shearStress).toBeGreaterThan(0)
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('simple mode ignores residual height fields and uses load', () => {
    const r = analyzeSpring({
      calcMode: 'simple',
      wireDiameter: 1.5,
      meanDiameter: 10.5,
      activeCoils: 10,
      load: 55,
      allowableShear: 700,
      freeLength: 45,
      installHeight: 38,
      workingHeight: 32,
    })
    expect(r.usesHeightLoads).toBe(false)
    expect(r.force ?? r.shearStress).toBeTruthy()
    expect(r.shearStress).toBeCloseTo((8 * 55 * 10.5 * r.wahlFactor) / (Math.PI * 1.5 ** 3), 0)
  })

  it('default-like demo passes static checks in complete mode', () => {
    const r = analyzeSpring({
      calcMode: 'complete',
      material: '65Mn',
      wireDiameter: 1.5,
      outerDiameter: 12,
      activeCoils: 10,
      totalCoils: 12,
      freeLength: 45,
      installHeight: 38,
      workingHeight: 32,
      endType: 'fixed',
    })
    expect(r.shearPass).toBe(true)
    expect(r.solidPass).toBe(true)
    expect(r.pass).toBe(true)
  })

  it('complete mode checks buckling and index', () => {
    const r = analyzeSpring({ ...base, calcMode: 'complete', freeLength: 35, endType: 'fixed' })
    expect(r.buckling).toBeDefined()
    expect(r.indexPass).toBe(true)
  })

  it('professional mode estimates fatigue life', () => {
    const r = analyzeSpring({
      ...base,
      calcMode: 'professional',
      loadMin: 50,
      loadMax: 250,
      freeLength: 35,
      material: '60Si2CrVA',
    })
    expect(r.shearAmplitude).toBeGreaterThan(0)
    expect(r.fatigueSafetyFactor).toBeGreaterThan(0)
  })

  it('shear pass is independent of solid height check', () => {
    const r = analyzeSpring({
      calcMode: 'complete',
      wireDiameter: 5.06,
      meanDiameter: 29,
      activeCoils: 14,
      load: 129,
      allowableShear: 700,
      freeLength: 40,
      endType: 'free',
    })
    expect(r.shearStress).toBeCloseTo(93.1, 0)
    expect(r.shearPass).toBe(true)
    expect(r.solidPass).toBe(false)
    expect(r.geometryPass).toBe(false)
    expect(r.pass).toBe(false)
    expect(r.solidHeight).toBeCloseTo(5.06 * 16.5, 2)
  })

  it('end type changes solid height coil count', () => {
    const fixed = analyzeSpring({
      ...base,
      calcMode: 'complete',
      freeLength: 80,
      endType: 'fixed',
    })
    const free = analyzeSpring({
      ...base,
      calcMode: 'complete',
      freeLength: 80,
      endType: 'free',
    })
    expect(fixed.solidHeight).toBe(base.wireDiameter * (base.activeCoils + 2))
    expect(free.solidHeight).toBe(base.wireDiameter * (base.activeCoils + 1 + 1.5))
  })

  it('valid geometry passes solid check when deflection is within margin', () => {
    const r = analyzeSpring({
      ...base,
      calcMode: 'complete',
      freeLength: 60,
      load: 80,
      allowableShear: 700,
      endType: 'fixed',
    })
    expect(r.geometryPass).toBe(true)
    expect(r.solidPass).toBe(true)
    expect(r.shearPass).toBe(true)
    expect(r.buckling?.bucklingPass).toBe(true)
    expect(r.pass).toBe(true)
  })

  it('matches mechanical design handbook reference case', () => {
    const r = analyzeSpring({
      calcMode: 'complete',
      material: '50CrVA',
      wireDiameter: 1.1,
      outerDiameter: 6.5,
      activeCoils: 5,
      totalCoils: 7,
      freeLength: 15,
      installHeight: 13,
      workingHeight: 12,
      endType: 'fixed',
    })
    expect(r.meanDiameter).toBeCloseTo(5.4, 2)
    expect(r.springIndex).toBeCloseTo(4.91, 2)
    expect(r.wahlFactor).toBeCloseTo(1.3171, 3)
    expect(r.springRate).toBeCloseTo(18.596, 3)
    expect(r.solidHeight).toBeCloseTo(7.7, 2)
    expect(r.installLoad).toBeCloseTo(37.19, 2)
    expect(r.workingLoad).toBeCloseTo(55.79, 2)
    expect(r.solidLoad).toBeCloseTo(135.75, 2)
    expect(r.tauInstall).toBeCloseTo(506.1, 1)
    expect(r.tauWorking).toBeCloseTo(759.2, 1)
    expect(r.unwindLength).toBeCloseTo(118.8, 1)
    /** 几何间隙 H₂−Lₛ=4.3；预留 1d 后余量 = 4.3−1.1 = 3.2 */
    expect(r.solidClearance).toBeCloseTo(4.3, 2)
    expect(r.solidReserve).toBeCloseTo(1.1, 2)
    expect(r.remainingDeflectionMargin).toBeCloseTo(3.2, 2)
    expect(r.solidPass).toBe(true)
    expect(r.allowableShear).toBeCloseTo(529, 0)
    expect(r.shearPass).toBe(false)
    expect(r.pass).toBe(false)
  })

  it('professional fatigue uses GB/T 23935 formula with H1/H2 loads', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      material: '50CrVA',
      wireDiameter: 1.1,
      outerDiameter: 6.5,
      activeCoils: 5,
      totalCoils: 7,
      freeLength: 15,
      installHeight: 13,
      workingHeight: 12,
      endType: 'fixed',
      loadMin: 50,
      loadMax: 170,
      targetCycles: 1e6,
    })
    expect(r.fatigueFromHeights).toBe(true)
    expect(r.fatigueIssue).toBeNull()
    expect(r.loadMin).toBeCloseTo(37.19, 1)
    expect(r.loadMax).toBeCloseTo(55.79, 1)
    expect(r.shearAmplitude).toBeLessThan(200)
    expect(r.fatigueSafetyFactor).toBeCloseTo(1.33, 1)
    expect(r.fatiguePass).toBe(true)
  })

  it('fatigue blocks partial height when no load range is provided', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      freeLength: 35,
      workingHeight: 30,
      targetCycles: 1e6,
    })
    expect(r.fatigueIssue).toBe('fatigue_partial_heights')
    expect(r.fatigueFromHeights).toBe(false)
    expect(r.fatiguePass).toBe(false)
    expect(r.loadMin).toBeNull()
    expect(r.loadMax).toBeNull()
  })

  it('fatigue uses loadMin/loadMax when only one height is given but load range is complete', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      freeLength: 35,
      workingHeight: 30,
      loadMin: 50,
      loadMax: 250,
      targetCycles: 1e6,
    })
    expect(r.fatigueIssue).toBeNull()
    expect(r.fatigueLoadsFallback).toBe(true)
    expect(r.fatigueFromHeights).toBe(false)
    expect(r.loadMin).toBe(50)
    expect(r.loadMax).toBe(250)
    expect(r.fatigueSafetyFactor).toBeGreaterThan(0)
  })

  it('fatigue falls back to loadMin/loadMax when height order is invalid', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      freeLength: 35,
      installHeight: 33,
      workingHeight: 34,
      loadMin: 50,
      loadMax: 250,
      targetCycles: 1e6,
      endType: 'fixed',
      allowableShear: 700,
    })
    expect(r.heightLoadsFallback).toBe(true)
    expect(r.fatigueLoadsFallback).toBe(true)
    expect(r.fatigueIssue).toBeNull()
    expect(r.loadMin).toBe(50)
    expect(r.loadMax).toBe(250)
    expect(r.fatigueSafetyFactor).toBeGreaterThan(0)
    expect(r.shearStress).toBeGreaterThan(0)
  })

  it('resolveSpringFatigueLoadRange prefers height pair over loadMin/loadMax', () => {
    const range = resolveSpringFatigueLoadRange(
      { installHeight: 13, workingHeight: 12, loadMin: 1, loadMax: 9999 },
      {
        heightsValid: true,
        heightLoads: { install: 37.19, working: 55.79 },
        designForce: 55.79,
      },
    )
    expect(range.fromHeights).toBe(true)
    expect(range.loadsFallback).toBe(false)
    expect(range.fMin).toBeCloseTo(37.19, 2)
    expect(range.fMax).toBeCloseTo(55.79, 2)
    expect(range.issue).toBeNull()
  })

  it('resolveSpringFatigueLoadRange falls back to load range when heights invalid', () => {
    const range = resolveSpringFatigueLoadRange(
      { installHeight: 13, workingHeight: 14, loadMin: 50, loadMax: 250 },
      {
        heightsValid: false,
        heightLoads: { install: 10, working: 5 },
        designForce: 250,
      },
    )
    expect(range.loadsFallback).toBe(true)
    expect(range.fMin).toBe(50)
    expect(range.fMax).toBe(250)
    expect(range.issue).toBeNull()
  })

  it('table9 tauU0 uses 0.32·Rm at 1e7 and 0.30·Rm at 1e8', () => {
    expect(getPulsatingFatigueLimit(1e7, 1810)).toBeCloseTo(579.2, 1)
    expect(getPulsatingFatigueLimit(1e8, 1810)).toBeCloseTo(543, 1)
    expect(getPulsatingFatigueLimit(1e6, 1810)).toBeCloseTo(633.5, 1)
  })

  it('GB/T 23935 appendix C.2.12 fatigue example', () => {
    const check = calcSpringFatigueCheck({
      tauMin: 362.6,
      tauMax: 728.6,
      tensileStrength: 1810,
      targetCycles: 1e7,
      minSafety: 1.1,
    })
    expect(check.tauU0).toBeCloseTo(579.2, 1)
    expect(check.safetyFactor).toBeCloseTo(1.17, 2)
    expect(check.fatiguePass).toBe(true)
  })

  it('calcLoadsFromHeights does not clamp negative compression', () => {
    const loads = calcLoadsFromHeights({
      springRate: 10,
      freeLength: 15,
      workingHeight: 20,
    })
    expect(loads.working).toBe(-50)
  })

  it('invalid H2 > H1 blocks height-based loads and fails pass', () => {
    const v = validateSpringHeights({
      freeLength: 15,
      installHeight: 13,
      workingHeight: 14,
      solidHeight: 7.7,
    })
    expect(v.valid).toBe(false)
    expect(v.issues).toContain('h2_gt_h1')
    const r = analyzeSpring({
      calcMode: 'complete',
      wireDiameter: 1.1,
      outerDiameter: 6.5,
      activeCoils: 5,
      totalCoils: 7,
      freeLength: 15,
      installHeight: 13,
      workingHeight: 14,
      endType: 'fixed',
    })
    expect(r.heightLoadBlocked).toBe(true)
    expect(r.usesHeightLoads).toBe(false)
    expect(r.pass).toBe(false)
  })

  it('invalid height order falls back to loadMax for stress and buckling in professional mode', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      freeLength: 35,
      installHeight: 33,
      workingHeight: 34,
      loadMax: 250,
      loadMin: 50,
      targetCycles: 1e6,
      endType: 'fixed',
      allowableShear: 700,
    })
    expect(r.heightLoadsFallback).toBe(true)
    expect(r.heightLoadBlocked).toBeFalsy()
    expect(r.usesHeightLoads).toBe(false)
    expect(r.workingLoad).toBe(250)
    expect(r.shearStress).toBeGreaterThan(0)
    expect(r.buckling?.maxWorkingLoad).toBe(250)
    expect(r.solidPass).toBe(r.deflection <= r.maxDeflection)
    expect(hasSpringLoadFallback({ loadMax: 250 }, 'professional')).toBe(true)
    const snap = adaptSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      freeLength: 35,
      installHeight: 33,
      workingHeight: 34,
      loadMax: 250,
      loadMin: 50,
      targetCycles: 1e6,
      endType: 'fixed',
      allowableShear: 700,
    })
    expect(snap.assumptions.some((a) => a.includes('F_max/load'))).toBe(true)
  })

  it('C > 16 is recommendation warning only, not hard fail', () => {
    const r = analyzeSpring({
      calcMode: 'complete',
      wireDiameter: 1,
      meanDiameter: 20,
      activeCoils: 8,
      load: 50,
      allowableShear: 900,
      freeLength: 30,
      endType: 'fixed',
    })
    expect(r.springIndex).toBe(20)
    expect(r.indexPass).toBe(true)
    expect(r.indexRecommend).toBe(false)
  })

  it('lookupBucklingCoefficient interpolates GB/T 23935 figure 3', () => {
    expect(lookupBucklingCoefficient(5.3, 'fixed').coefficient).toBeCloseTo(2.78, 2)
    const mid = lookupBucklingCoefficient(5.65, 'fixed').coefficient
    expect(mid).toBeGreaterThan(2.13)
    expect(mid).toBeLessThan(2.78)
    expect(lookupBucklingCoefficient(15, 'fixed').inTableRange).toBe(false)
  })

  it('calcBucklingCheck uses Fc=CB·P\'·H₀ when b exceeds limit', () => {
    const k = 4.88
    const H0 = 90
    const D = 16
    const b = H0 / D
    const cb = lookupBucklingCoefficient(b, 'fixed').coefficient
    const r = calcBucklingCheck(H0, D, 'fixed', { springRate: k, maxWorkingLoad: 80 })
    expect(r.checkMode).toBe('critical_load')
    expect(r.criticalLoad).toBeCloseTo(cb * k * H0, 0)
    expect(r.bucklingPass).toBe(r.criticalLoad > 80)
  })

  it('calcBucklingCheck fails when b exceeds CB table range', () => {
    const r = calcBucklingCheck(200, 16, 'fixed', { springRate: 5, maxWorkingLoad: 100 })
    expect(r.cbOutOfRange).toBe(true)
    expect(r.bucklingPass).toBe(false)
    expect(r.criticalLoad).toBeNull()
  })

  it('calcSpringTestLoad matches GB/T 23935 formula (14) without K', () => {
    const fs = calcSpringTestLoad({
      wireDiameter: 1.1,
      meanDiameter: 5.4,
      testShearStress: 0.55 * 1810,
    })
    expect(fs).toBeCloseTo(96.36, 1)
  })

  it('appendix C.2.7 nominal Fs = 886.3 N before solid cap', () => {
    const rm = 1810
    const fs = calcSpringTestLoad({
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      testShearStress: 0.55 * rm,
    })
    expect(fs).toBeCloseTo(886.3, 0)
  })

  it('appendix F.4 lookup gives VDCrV-A Rm lower limit by wire diameter', () => {
    expect(lookupSpringRmByWireDiameter(1.1, 'VDCrV-A').rm).toBe(1700)
    expect(lookupSpringRmByWireDiameter(4.1, 'VDCrV-A').rm).toBe(1520)
    expect(lookupSpringRmByWireDiameter(4.1, 'VDCrSi').rm).toBe(1810)
  })

  it('analyzeSpring uses appendix F Rm for test shear unless manually overridden', () => {
    const auto = analyzeSpring({
      calcMode: 'complete',
      material: '50CrVA',
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      endType: 'fixed',
      allowableShear: 900,
    })
    expect(auto.rmFromAppendixF).toBe(true)
    expect(auto.rmGrade).toBe('VDCrV-A')
    expect(auto.tensileStrength).toBe(1520)
    expect(auto.testShearStressNominal).toBeCloseTo(0.55 * 1520, 0)

    const manual = analyzeSpring({
      calcMode: 'complete',
      material: '50CrVA',
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      endType: 'fixed',
      allowableShear: 900,
      tensileStrength: 1810,
      tensileStrengthManual: true,
    })
    expect(manual.tensileStrength).toBe(1810)
    expect(manual.testShearStressNominal).toBeCloseTo(0.55 * 1810, 0)
  })

  it('resolveSpringTestLoad caps at solid load Fb per appendix C.2.7', () => {
    const resolved = resolveSpringTestLoad({
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      testShearStress: 0.55 * 1810,
      springRate: 24.67,
      solidLoad: 722.8,
      solidDeflection: 29.3,
    })
    expect(resolved.cappedAtSolid).toBe(true)
    expect(resolved.testLoad).toBeCloseTo(722.8, 0)
    expect(resolved.testDeflection).toBeCloseTo(29.3, 1)
    expect(resolved.effectiveTestShearStress).toBeCloseTo(811.9, 0)
  })

  it('resolveSpringSolidLoadFromGeometry is independent of height order validation', () => {
    const geom = resolveSpringSolidLoadFromGeometry({
      springRate: 24.67,
      freeLength: 53.9,
      solidHeight: 24.6,
    })
    expect(geom.solidDeflection).toBeCloseTo(29.3, 1)
    expect(geom.solidLoad).toBeCloseTo(722.8, 0)
  })

  it('appendix C.2.7 Fs caps at Fb even when H₁/H₂ order is invalid', () => {
    const input = {
      calcMode: 'complete',
      material: '50CrVA',
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      installHeight: 43,
      workingHeight: 45,
      endType: 'fixed',
      allowableShear: 900,
    }
    const r = analyzeSpring(input)
    const nominalFsHandbook = calcSpringTestLoad({
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      testShearStress: 0.55 * 1810,
    })
    const nominalFsTable = calcSpringTestLoad({
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      testShearStress: 0.55 * r.tensileStrength,
    })
    const geom = resolveSpringSolidLoadFromGeometry({
      springRate: r.springRate,
      freeLength: r.freeLength,
      solidHeight: r.solidHeight,
    })
    expect(r.heightLoadBlocked).toBe(true)
    expect(nominalFsHandbook).toBeCloseTo(886.3, 0)
    expect(r.tensileStrength).toBe(1520)
    expect(r.testLoadCappedAtSolid).toBe(true)
    expect(r.testLoad).toBeCloseTo(geom.solidLoad, 0)
    expect(r.testLoad).toBeLessThan(nominalFsTable)
    expect(r.testLoad).toBeLessThan(nominalFsHandbook)
    expect(r.testDeflection).toBeCloseTo(geom.solidDeflection, 1)
    const snap = adaptSpring(input)
    expect(snap.assumptions.some((a) => a.includes('Fs 已按附录限制为压并负荷 Fb'))).toBe(true)
  })

  it('characteristic check enforces 0.2fs–0.8fs and F₂≤Fs', () => {
    expect(calcSpringCharacteristicCheck({ deflection: 3, testDeflection: 5.18 }).pass).toBe(true)
    expect(calcSpringCharacteristicCheck({ deflection: 0.5, testDeflection: 5.18 }).pass).toBe(false)
    expect(calcSpringCharacteristicCheck({ deflection: 4.5, testDeflection: 5.18 }).pass).toBe(false)
    expect(
      calcSpringCharacteristicCheck({
        deflection: 3,
        testDeflection: 5.18,
        workingLoad: 900,
        testLoad: 800,
      }).pass,
    ).toBe(false)
  })

  it('handbook reference case passes characteristic f/fs with appendix F Rm', () => {
    const r = analyzeSpring({
      calcMode: 'complete',
      material: '50CrVA',
      wireDiameter: 1.1,
      outerDiameter: 6.5,
      activeCoils: 5,
      totalCoils: 7,
      freeLength: 15,
      installHeight: 13,
      workingHeight: 12,
      endType: 'fixed',
    })
    expect(r.tensileStrength).toBe(1700)
    expect(r.rmFromAppendixF).toBe(true)
    expect(r.characteristic?.ratio).toBeCloseTo(0.62, 2)
    expect(r.characteristicPass).toBe(true)
  })

  it('professional without heights uses loadMax for F₂ buckling and characteristic', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      loadMin: 50,
      loadMax: 250,
      freeLength: 35,
      endType: 'fixed',
      allowableShear: 700,
      targetCycles: 1e6,
    })
    expect(r.maxWorkingLoad).toBe(250)
    expect(r.workingLoad).toBe(250)
    expect(r.buckling?.maxWorkingLoad).toBe(250)
    expect(r.loadMax).toBe(250)
  })

  it('adaptSpring criticalLoad metric includes pass status', () => {
    const snap = adaptSpring({
      calcMode: 'complete',
      wireDiameter: 2,
      meanDiameter: 16,
      activeCoils: 8,
      freeLength: 90,
      load: 5000,
      endType: 'fixed',
      allowableShear: 900,
    })
    const fc = snap.keyMetrics.find((m) => m.key === 'criticalLoad')
    expect(fc?.status).toBe('fail')
    expect(fc?.utilization).toBeGreaterThan(1)
  })

  it('rotating support uses b≤2.6 stability limit without fake CB extrapolation', () => {
    const ok = calcBucklingCheck(25, 10, 'rotating', { springRate: 10, maxWorkingLoad: 10 })
    const fail = calcBucklingCheck(30, 10, 'rotating', { springRate: 10, maxWorkingLoad: 10 })
    expect(ok.criticalSlenderness).toBe(2.6)
    expect(ok.bucklingPass).toBe(true)
    expect(fail.checkMode).toBe('critical_load')
    expect(fail.cbOutOfRange).toBe(true)
    expect(fail.bucklingPass).toBe(false)
  })

  it('test shear stress follows cold table factors, d<1 correction, and hot-coiled lower bound', () => {
    expect(calcSpringTestShearStress(1810, 0.55, 1.1, { process: 'cold' })).toBeCloseTo(995.5, 1)
    expect(calcSpringTestShearStress(1810, 0.55, 0.8, { process: 'cold' })).toBeCloseTo(895.95, 1)
    expect(calcSpringTestShearStress(1810, 0.45, 1.1, { process: 'cold' })).toBeCloseTo(814.5, 1)
    expect(calcSpringTestShearStress(1810, 0.55, 4.1, { process: 'hot' })).toBe(710)
  })

  it('hot-coiled table 5 interpolates compression test shear by 42-52 HRC hardness', () => {
    expect(calcHotCoiledCompressionTestShearStress(42)).toBe(710)
    expect(calcHotCoiledCompressionTestShearStress(47)).toBe(800)
    expect(calcHotCoiledCompressionTestShearStress(52)).toBe(890)
    expect(calcHotCoiledCompressionTestShearStress(41)).toBeNull()
    expect(calcSpringTestShearStress(1810, 0.55, 4.1, {
      process: 'hot',
      hotCoilHardnessHrc: 47,
    })).toBe(800)
    expect(calcSpringTestShearStress(1810, 0.55, 4.1, {
      process: 'hot',
      hotCoilHardnessHrc: 55,
    })).toBe(0)
  })

  it('hot-coiled analyzeSpring uses hardness-derived test shear and rejects out-of-range hardness', () => {
    const valid = analyzeSpring({
      calcMode: 'complete',
      springProcess: 'hot',
      hotCoilHardnessHrc: 52,
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      installHeight: 43,
      workingHeight: 32,
      endType: 'fixed',
      allowableShear: 900,
    })
    expect(valid.testShearStressNominal).toBe(890)

    const invalid = analyzeSpring({
      calcMode: 'complete',
      springProcess: 'hot',
      hotCoilHardnessHrc: 55,
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      installHeight: 43,
      workingHeight: 32,
      endType: 'fixed',
      allowableShear: 900,
    })
    expect(invalid.inputValidation.valid).toBe(false)
    expect(invalid.inputValidation.issues).toContain('hot_hardness_out_of_range')
    expect(invalid.pass).toBe(false)
  })

  it('natural frequency matches GB/T 23935 appendix C.2.12 formula (12)', () => {
    const fe = calcSpringNaturalFrequency({
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      shearModulus: 78500,
      density: 7.85e-6,
    })
    expect(fe).toBeCloseTo(394.8, 0)
  })

  it('resonance check requires fe/fr > 10 when excitation frequency is provided', () => {
    expect(calcSpringResonanceCheck({ naturalFrequency: 394.8, excitationFrequency: 25 }).pass).toBe(true)
    const fail = calcSpringResonanceCheck({ naturalFrequency: 394.8, excitationFrequency: 50 })
    expect(fail.checked).toBe(true)
    expect(fail.pass).toBe(false)
  })

  it('professional mode fails pass when resonance ratio is unsafe', () => {
    const r = analyzeSpring({
      calcMode: 'professional',
      material: '50CrVA',
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      installHeight: 43,
      workingHeight: 32,
      endType: 'fixed',
      allowableShear: 900,
      targetCycles: 1e4,
      excitationFrequency: 50,
    })
    expect(r.naturalFrequency).toBeGreaterThan(0)
    expect(r.resonance?.checked).toBe(true)
    expect(r.resonancePass).toBe(false)
    expect(r.pass).toBe(false)
  })

  it('adaptSpring exports resonance ratio status', () => {
    const snap = adaptSpring({
      calcMode: 'professional',
      wireDiameter: 4.1,
      meanDiameter: 30.4,
      activeCoils: 4,
      totalCoils: 6,
      freeLength: 53.9,
      installHeight: 43,
      workingHeight: 32,
      endType: 'fixed',
      excitationFrequency: 50,
    })
    const resonance = snap.keyMetrics.find((m) => m.key === 'resonanceRatio')
    expect(resonance?.status).toBe('fail')
    expect(snap.standards.some((s) => s.includes('6.5.3'))).toBe(true)
  })
})

describe('bearing-calc modes', () => {
  const base = {
    dynamicLoad: 35000,
    radialLoad: 5000,
    axialLoad: 1000,
    rpm: 1500,
    x: 1,
    y: 0,
    bearingType: 'ball',
  }

  it('simple mode returns L10 only', () => {
    const r = analyzeBearingLife({ ...base, calcMode: 'simple', autoLookup: false })
    expect(r.calcMode).toBe('simple')
    expect(r.reliabilityFactor).toBe(1)
    expect(r.lifeConditionFactor).toBe(1)
    expect(r.l10MillionRev).toBeGreaterThan(0)
  })

  it('complete mode applies reliability and aISO', () => {
    const r = analyzeBearingLife({
      ...base,
      calcMode: 'complete',
      autoLookup: false,
      reliability: 99,
      lifeCondition: 'clean',
      staticLoad: 18000,
    })
    expect(r.reliabilityFactor).toBeLessThan(1)
    expect(r.lifeConditionFactor).toBeGreaterThan(1)
    expect(r.staticSafetyFactor).toBeGreaterThan(0)
  })

  it('professional mode applies temperature factor', () => {
    const cold = analyzeBearingLife({ ...base, calcMode: 'professional', autoLookup: false, operatingTemp: 120 })
    const hot = analyzeBearingLife({ ...base, calcMode: 'professional', autoLookup: false, operatingTemp: 200 })
    expect(hot.temperatureFactor).toBeLessThan(cold.temperatureFactor)
    expect(hot.lifeHours).toBeLessThan(cold.lifeHours)
  })

  it('duplex DT doubles effective C and C0', () => {
    const single = analyzeBearingLife({ ...base, calcMode: 'complete', autoLookup: false })
    const tandem = analyzeBearingLife({
      ...base,
      calcMode: 'complete',
      autoLookup: false,
      mountingArrangement: 'duplex-dt',
    })
    expect(tandem.effectiveDynamicLoad).toBe(base.dynamicLoad * 2)
    expect(tandem.lifeHours).toBeGreaterThan(single.lifeHours)
  })

  it('duplex DB reduces Y factor', () => {
    const single = analyzeBearingLife({
      ...base,
      calcMode: 'complete',
      autoLookup: false,
      y: 1.5,
      axialLoad: 2000,
    })
    const db = analyzeBearingLife({
      ...base,
      calcMode: 'complete',
      autoLookup: false,
      y: 1.5,
      axialLoad: 2000,
      mountingArrangement: 'duplex-db',
    })
    expect(db.y).toBeCloseTo(1.5 * 0.72, 4)
    expect(db.equivalentLoad).toBeLessThan(single.equivalentLoad)
  })

  it('axial preload increases equivalent load', () => {
    const noPreload = analyzeBearingLife({ ...base, calcMode: 'complete', autoLookup: false, y: 1 })
    const preloaded = analyzeBearingLife({
      ...base,
      calcMode: 'complete',
      autoLookup: false,
      y: 1,
      axialPreload: 500,
    })
    expect(preloaded.effectiveAxialLoad).toBe(base.axialLoad + 500)
    expect(preloaded.equivalentLoad).toBeGreaterThan(noPreload.equivalentLoad)
  })

  it('professional mode estimates radial stiffness for duplex', () => {
    const r = analyzeBearingLife({
      ...base,
      calcMode: 'professional',
      autoLookup: false,
      mountingArrangement: 'duplex-db',
    })
    expect(r.radialStiffness).toBeGreaterThan(0)
    const single = analyzeBearingLife({
      ...base,
      calcMode: 'professional',
      autoLookup: false,
      mountingArrangement: 'single',
    })
    expect(r.radialStiffness).toBeGreaterThan(single.radialStiffness)
  })
})

describe('weld-calc modes', () => {
  const input = { legSize: 6, weldLength: 80, force: 12000, steelGrade: 'Q235' }

  it('simple mode uses GB only', () => {
    const r = analyzeFilletWeld({ ...input, calcMode: 'simple' })
    expect(r.calcMode).toBe('simple')
    expect(r.standards).toHaveLength(1)
    expect(r.standard).toContain('GB')
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.shearPass).toBe(true)
  })

  it('complete mode compares three standards', () => {
    const r = analyzeFilletWeld({ ...input, calcMode: 'complete' })
    expect(r.standards).toHaveLength(3)
    expect(r.allPass).toBeDefined()
  })

  it('professional mode adds combined and HAZ', () => {
    const r = analyzeFilletWeld({
      ...input,
      calcMode: 'professional',
      eccentricity: 25,
      stressRange: 30,
    })
    expect(r.combined).toBeDefined()
    expect(r.haz).toBeDefined()
    expect(r.combined.equivalentStress).toBeGreaterThan(r.shearStress)
  })

  it('combined bending uses W = a·L²/6 for a single straight fillet', () => {
    const r = analyzeFilletWeld({
      ...input,
      calcMode: 'professional',
      eccentricity: 20,
    })
    const throat = 6 * 0.7
    const area = throat * 80
    const W = (throat * 80 ** 2) / 6
    const expectedSigmaB = (12000 * 20) / W
    expect(r.combined.bendingStress).toBeCloseTo(53.57, 1)
    expect(r.combined.bendingStress).toBeCloseTo(expectedSigmaB, 4)
    expect(r.combined.equivalentStress).toBeCloseTo(81.83, 1)
    expect(r.combined.shearStress).toBeCloseTo(12000 / area, 4)
    expect(r.combinedPass).toBe(true)
  })
})

describe('beam-calc modes', () => {
  it('simple mode passes moderate load', () => {
    const r = analyzeBeam({
      materialId: 'q235',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 1000,
      calcMode: 'simple',
    })
    expect(r.calcMode).toBe('simple')
    expect(r.pass).toBe(true)
  })

  it('complete mode adds utilization', () => {
    const r = analyzeBeam({
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 2000,
      calcMode: 'complete',
    })
    expect(r.stressUtilization).toBeGreaterThan(0)
    expect(r.minSectionModulusStress).toBeGreaterThan(0)
  })

  it('professional applies dynamic factor', () => {
    const base = analyzeBeam({
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 1000,
      calcMode: 'professional',
      dynamicFactor: 1,
    })
    const dyn = analyzeBeam({
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 30,
      spanLength: 500,
      load: 1000,
      calcMode: 'professional',
      dynamicFactor: 1.5,
    })
    expect(dyn.stress).toBeGreaterThan(base.stress)
  })

  it('professional fatigue amplitude applies Kd to both load extremes', () => {
    const r = analyzeBeam({
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 32,
      spanLength: 500,
      load: 2000,
      elasticModulus: 206000,
      allowableStress: 157,
      allowableDeflection: 0.5,
      calcMode: 'professional',
      dynamicFactor: 1.2,
      stressConcentration: 1.5,
      loadMin: 500,
      loadMax: 2000,
    })
    // σ_a = Kd·Kt·(Fmax-Fmin)·L / (8W) ≈ 52.5 MPa (not 55.4 from Kd on Fmax only)
    expect(r.stressAmplitude).toBeCloseTo(52.46, 1)
    expect(r.moment).toBeCloseTo(300000, 0)
    expect(r.stress).toBeCloseTo(139.9, 1)
    expect(r.deflection).toBeCloseTo(0.5894, 3)
  })
})

describe('key-calc modes', () => {
  it('simple mode shear and crush', () => {
    const r = analyzeKeyConnection({
      torque: 200,
      shaftDiameter: 30,
      keyWidth: 8,
      keyLength: 28,
      calcMode: 'simple',
    })
    expect(r.tangentialForce).toBeGreaterThan(0)
    expect(r.shearStress).toBeGreaterThan(0)
    expect(r.shearPass).toBe(true)
    expect(r.crushPass).toBe(true)
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('complete mode suggests standard key', () => {
    const r = analyzeKeyConnection({ torque: 200, shaftDiameter: 30, calcMode: 'complete' })
    expect(r.standardKey).toBeDefined()
    expect(r.recommendedLength).toBeGreaterThan(0)
  })

  it('professional mode handles twin keys', () => {
    const one = analyzeKeyConnection({ torque: 400, shaftDiameter: 30, keyWidth: 8, keyLength: 32, calcMode: 'simple' })
    const two = analyzeKeyConnection({ torque: 400, shaftDiameter: 30, keyWidth: 8, keyLength: 32, keyCount: 2, calcMode: 'professional' })
    expect(two.shearStress).toBeLessThan(one.shearStress)
  })
})

describe('o-ring-calc modes', () => {
  const base = {
    crossSection: 3.53,
    grooveDiameter: 18.5,
    grooveWidth: 4.8,
    compressionPercent: 20,
  }

  it('simple mode checks fill and compression', () => {
    const r = analyzeORingSeal({ ...base, calcMode: 'simple' })
    expect(r.fillPercent).toBeGreaterThan(0)
  })

  it('derives free catalog ID from installed groove diameter and stretch', () => {
    const r = analyzeORingSeal({ ...base, calcMode: 'simple', stretchPercent: 2 })
    expect(r.installedID).toBeCloseTo(18.5, 6)
    expect(r.freeID).toBeCloseTo(18.5 / 1.02, 6)
    expect(r.freeID).toBeLessThan(r.installedID)
  })

  it('rejects out-of-range stretch percent', () => {
    expect(analyzeORingSeal({ ...base, stretchPercent: 12 }).errorKey).toBe('invalid_stretch')
  })

  it('complete mode checks extrusion', () => {
    const r = analyzeORingSeal({ ...base, calcMode: 'complete', pressure: 5, extrusionGap: 0.1 })
    expect(r.extrusionPass).toBeDefined()
    expect(r.material).toBeTruthy()
  })

  it('professional mode limits pressure', () => {
    const r = analyzeORingSeal({ ...base, calcMode: 'professional', pressure: 20, extrusionGap: 0.15 })
    expect(r.maxAllowPressure).toBeGreaterThan(0)
  })
})

describe('clutch-calc modes', () => {
  it('simple torque from force', () => {
    const r = analyzeClutch({ calcMode: 'simple', frictionCoeff: 0.15, force: 5000, radius: 80, surfaces: 2 })
    expect(r.torque).toBeCloseTo(120, 5)
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.torquePass).toBe(false)
    expect(r.allowableRequired).toBe(true)
  })

  it('complete uses uniform-wear effective radius', () => {
    const r = analyzeClutch({
      calcMode: 'complete',
      frictionCoeff: 0.15,
      force: 5000,
      innerDiameter: 100,
      outerDiameter: 160,
      surfaces: 2,
      allowableTorque: 200,
    })
    expect(r.effectiveRadius).toBeCloseTo(66.15, 1)
    expect(r.torque).toBeCloseTo(99.23, 1)
    expect(r.contactPressure).toBeGreaterThan(0)
    expect(r.torquePass).toBe(true)
  })

  it('complete without allowable torque cannot formally pass', () => {
    const r = analyzeClutch({
      calcMode: 'complete',
      frictionCoeff: 0.15,
      force: 5000,
      innerDiameter: 100,
      outerDiameter: 160,
      surfaces: 2,
    })
    expect(r.allowableRequired).toBe(true)
    expect(r.torquePass).toBe(false)
    expect(r.pass).toBe(false)
    expect(r.estimateOnly).toBe(true)
  })

  it('professional derates at speed', () => {
    const r = analyzeClutch({
      calcMode: 'professional',
      frictionCoeff: 0.15,
      force: 5000,
      innerDiameter: 100,
      outerDiameter: 160,
      surfaces: 2,
      rpm: 3000,
      requiredTorque: 50,
    })
    expect(r.torqueAtSpeed).toBeLessThanOrEqual(r.torque)
  })

  it('professional with requiredTorque fails hard when derated is short', () => {
    const r = analyzeClutch({
      calcMode: 'professional',
      frictionCoeff: 0.15,
      force: 5000,
      innerDiameter: 100,
      outerDiameter: 160,
      surfaces: 2,
      rpm: 1500,
      requiredTorque: 100,
      thermalFade: 0.9,
      safetyFactor: 1.2,
    })
    expect(r.deratedTorque).toBeLessThan(100)
    expect(r.designPass).toBe(false)
    expect(r.pass).toBe(false)
    expect(r.estimateOnly).toBe(false)
  })

  it('aligned simple radius matches complete torque', () => {
    const complete = analyzeClutch({
      calcMode: 'complete',
      frictionCoeff: 0.15,
      force: 5000,
      innerDiameter: 100,
      outerDiameter: 160,
      surfaces: 2,
      allowableTorque: 200,
    })
    const simple = analyzeClutch({
      calcMode: 'simple',
      frictionCoeff: 0.15,
      force: 5000,
      radius: complete.effectiveRadius,
      surfaces: 2,
    })
    expect(simple.torque).toBeCloseTo(complete.torque, 5)
  })
})

describe('belt-calc modes', () => {
  const base = { driverDiameter: 120, drivenDiameter: 300, centerDistance: 500, rpm: 1450, power: 5.5 }

  it('simple mode computes length and tension', () => {
    const r = analyzeBeltDrive({ ...base, calcMode: 'simple', wrapAngle: 180 })
    expect(r.ratio).toBeCloseTo(2.5, 5)
    expect(r.beltLength).toBeCloseTo(1675.9, 0)
    expect(r.beltSpeed).toBeCloseTo(9.11, 1)
    expect(r.efficiency).toBe(0.95)
    expect(r.friction).toBe(0.3)
    expect(r.F1).toBeCloseTo(1041, 0)
    expect(r.F2).toBeCloseTo(406, 0)
  })

  it('complete mode auto wrap angle', () => {
    const r = analyzeBeltDrive({ ...base, calcMode: 'complete', powerPerBelt: 2.5 })
    expect(r.wrapAngle).toBeCloseTo(159.3, 0)
    expect(r.F1).toBeCloseTo(1123, 0)
    expect(r.beltCount).toBe(3)
  })

  it('professional applies service factor', () => {
    const baseP = analyzeBeltDrive({ ...base, calcMode: 'simple', wrapAngle: 180 })
    const pro = analyzeBeltDrive({
      ...base,
      calcMode: 'professional',
      serviceFactor: 1.2,
      powerPerBelt: 2.5,
    })
    expect(pro.F1).toBeGreaterThan(baseP.F1)
    expect(pro.F1).toBeCloseTo(1348, 0)
    expect(pro.beltCount).toBe(3)
    expect(pro.estimatedLifeHours).toBeCloseTo(882, 0)
  })
})

describe('chain-calc modes', () => {
  const base = { pitch: 15.875, driverTeeth: 19, drivenTeeth: 57, centerDistance: 500, rpm: 720, power: 7.5 }

  it('simple mode basic output', () => {
    const r = analyzeChainDrive({ ...base, calcMode: 'simple' })
    expect(r.ratio).toBeCloseTo(3, 5)
    expect(r.chainSpeed).toBeCloseTo(3.62, 1)
    expect(r.linksExact).toBeCloseTo(102.13, 1)
    expect(r.links).toBe(104)
    expect(r.oddRoundedUp).toBe(true)
    expect(r.chainLength).toBeCloseTo(104 * 15.875, 5)
    expect(r.chainTension).toBeCloseTo(2114, 0)
    expect(r.serviceFactor).toBe(1)
  })

  it('complete mode checks speed and tension without service factor', () => {
    const r = analyzeChainDrive({
      ...base,
      calcMode: 'complete',
      allowTension: 50000,
      maxChainSpeed: 20,
      serviceFactor: 1.3,
    })
    expect(r.serviceFactor).toBe(1)
    expect(r.chainTension).toBeCloseTo(2114, 0)
    expect(r.speedPass).toBe(true)
    expect(r.tensionPass).toBe(true)
  })

  it('professional mode applies Ka and caps life', () => {
    const r = analyzeChainDrive({
      ...base,
      calcMode: 'professional',
      serviceFactor: 1.3,
      strands: 1,
      allowTension: 20000,
    })
    expect(r.chainTension).toBeCloseTo(2749, 0)
    expect(r.estimatedLifeHours).toBeLessThanOrEqual(30000)
    expect(r.lifeCapped).toBe(true)
  })

  it('multi-strand tensionPass uses per-strand capacity', () => {
    const single = analyzeChainDrive({
      ...base,
      calcMode: 'complete',
      allowTension: 1500,
      strands: 1,
    })
    const triple = analyzeChainDrive({
      ...base,
      calcMode: 'complete',
      allowTension: 1500,
      strands: 3,
    })
    expect(single.tensionPass).toBe(false)
    expect(triple.tensionPerStrand).toBeCloseTo(triple.chainTension / 3, 6)
    expect(triple.tensionPass).toBe(true)
    expect(triple.pass).toBe(true)
  })
})

describe('hydraulic-calc modes', () => {
  const base = { boreDiameter: 50, rodDiameter: 20, pressure: 16, flowRate: 20 }

  it('simple mode force and velocity', () => {
    const r = analyzeHydraulicCylinder({ ...base, calcMode: 'simple' })
    expect(r.extendForce).toBeGreaterThan(r.retractForce)
    expect(r.extendVelocity).toBeGreaterThan(0)
  })

  it('complete mode checks load and buckling', () => {
    const r = analyzeHydraulicCylinder({
      ...base,
      calcMode: 'complete',
      externalLoad: 20,
      strokeLength: 300,
    })
    expect(r.loadPass).toBe(true)
    expect(r.bucklingLoad).toBeGreaterThan(0)
    expect(r.cycleTimeExtend).toBeGreaterThan(0)
  })

  it('demo defaults: force velocity johnson buckling', () => {
    const r = analyzeHydraulicCylinder({
      ...base,
      calcMode: 'complete',
      externalLoad: 8000,
      strokeLength: 300,
      yieldStrength: 235,
      endFixity: 'pinned_pinned',
      compressOnRetract: true,
    })
    expect(r.extendForce).toBeCloseTo(Math.PI * 25 ** 2 * 16, 4)
    expect(r.retractForce).toBeCloseTo(Math.PI * (25 ** 2 - 10 ** 2) * 16, 4)
    expect(r.extendVelocity).toBeCloseTo(169.77, 1)
    expect(r.buckling?.governingMode).toBe('johnson')
    expect(r.bucklingLoad).toBeCloseTo(66293.7, 0)
    expect(r.buckling?.safetyFactor).toBeCloseTo(66293.7 / 8000, 1)
    expect(r.cycleTimeExtend).toBeCloseTo(300 / r.extendVelocity, 6)
  })

  it('professional mode dynamic load', () => {
    const r = analyzeHydraulicCylinder({
      ...base,
      calcMode: 'professional',
      strokeLength: 300,
      loadMass: 200,
      acceleration: 1,
    })
    expect(r.dynamicLoad).toBeGreaterThan(0)
    expect(r.cycleTimeExtend).toBeGreaterThan(0)
  })

  it('pneumatic efficiency updates load pass with derated force', () => {
    const hydraulic = analyzeHydraulicCylinder({
      ...base,
      calcMode: 'complete',
      pressure: 1.0,
      externalLoad: 1500,
      strokeLength: 300,
    })
    const pneumatic = analyzePneumaticCylinder({
      ...base,
      calcMode: 'complete',
      pressure: 1.0,
      externalLoad: 1500,
      strokeLength: 300,
      efficiency: 0.5,
    })
    expect(hydraulic.loadPass).toBe(true)
    expect(pneumatic.extendForce).toBeLessThan(hydraulic.extendForce)
    expect(pneumatic.loadPass).toBe(false)
    expect(pneumatic.pass).toBe(false)
  })

  it('rejects pneumatic efficiency greater than one because it would amplify force', () => {
    const r = analyzePneumaticCylinder({ ...base, calcMode: 'complete', efficiency: 1.05 })
    expect(r.errorKey).toBe('invalid_efficiency')
  })

  it('rejects rod diameter greater than or equal to bore diameter', () => {
    const r = analyzeHydraulicCylinder({
      calcMode: 'simple',
      boreDiameter: 50,
      rodDiameter: 50,
      pressure: 16,
      flowRate: 20,
    })
    expect(r.errorKey).toBe('invalid_rod_diameter')
  })

  it('rejects missing or negative pressure instead of returning NaN force', () => {
    expect(analyzeHydraulicCylinder({
      calcMode: 'simple',
      boreDiameter: 50,
      rodDiameter: 20,
    }).errorKey).toBe('invalid_pressure')
    expect(analyzeHydraulicCylinder({
      calcMode: 'simple',
      boreDiameter: 50,
      rodDiameter: 20,
      pressure: -1,
    }).errorKey).toBe('invalid_pressure')
  })

  it('rejects non-finite cylinder inputs before formulas run', () => {
    expect(analyzeHydraulicCylinder({
      calcMode: 'simple',
      boreDiameter: 50,
      rodDiameter: 20,
      pressure: Number.NaN,
    }).errorKey).toBe('invalid_pressure')
    expect(analyzePneumaticCylinder({
      ...base,
      calcMode: 'complete',
      efficiency: Number.POSITIVE_INFINITY,
    }).errorKey).toBe('invalid_efficiency')
  })
})

describe('fatigue-calc modes', () => {
  it('simple mode life only', () => {
    const r = analyzeFatigue({ calcMode: 'simple', material: 'steel_45', stressAmplitude: 350 })
    expect(r.life).toBeGreaterThan(0)
    expect(r.miner).toBeNull()
  })

  it('complete mode with miner', () => {
    const r = analyzeFatigue({
      calcMode: 'complete',
      material: 'steel_45',
      stressAmplitude: 350,
      loads: [{ stress: 300, cycles: 10000 }],
    })
    expect(r.miner).toBeTruthy()
  })

  it('professional goodman check', () => {
    const r = analyzeFatigue({
      calcMode: 'professional',
      material: 'steel_45',
      stressAmplitude: 200,
      meanStress: 150,
      surfaceFactor: 0.9,
      sizeFactor: 0.85,
    })
    expect(r.adjustedEndurance).toBeDefined()
    expect(r.goodmanPass).toBeDefined()
  })

  it('stress amplitude bounds scale with material', () => {
    const cast = getStressAmplitudeBounds('cast_iron')
    const steel = getStressAmplitudeBounds('steel_45')
    expect(cast.saMax).toBeLessThan(steel.saMax)
    expect(cast.suggest).toBeLessThanOrEqual(cast.saMax)
    expect(cast.suggest).toBeGreaterThanOrEqual(cast.saMin)
  })

  it('stress amplitude bounds endpoints lie on S-N curve for all materials', () => {
    for (const key of Object.keys(SN_MATERIALS)) {
      const m = SN_MATERIALS[key]
      const bounds = getStressAmplitudeBounds(key)
      expect(bounds.saMin).toBe(m.enduranceLimit)
      expect(bounds.saMax).toBeCloseTo(calcFatigueStrength(key, 1e2), 5)
      expect(calcLifeFromStress(key, bounds.saMax)).toBeCloseTo(1e2, -1)
      expect(calcLifeFromStress(key, bounds.saMin)).toBe(Infinity)
      const mid = (bounds.saMin + bounds.saMax) / 2
      const nMid = calcLifeFromStress(key, mid)
      expect(nMid).toBeGreaterThan(1e2)
      expect(nMid).toBeLessThan(m.cycleLimit ?? 1e6)
      expect(calcFatigueStrength(key, nMid)).toBeCloseTo(mid, 4)
    }
  })
})

describe('plate-buckling modes', () => {
  const base = { thickness: 2, width: 200, length: 400, appliedStress: 50 }

  it('simple mode critical stress', () => {
    const r = calcPlateBucklingStress({ ...base, calcMode: 'simple' })
    expect(r.criticalStress).toBeGreaterThan(0)
    expect(r.bucklingCoeff).toBe(4)
  })

  it('does not inflate buckling coefficient with aspect ratio', () => {
    const square = calcPlateBucklingStress({
      ...base,
      length: 200,
      calcMode: 'simple',
    })
    const long = calcPlateBucklingStress({
      ...base,
      length: 600,
      calcMode: 'simple',
    })
    expect(square.bucklingCoeff).toBe(4)
    expect(long.bucklingCoeff).toBe(4)
    expect(long.criticalStress).toBeCloseTo(square.criticalStress, 6)
  })

  it('complete mode lowers k with imperfection', () => {
    const ideal = calcPlateBucklingStress({ ...base, calcMode: 'simple' })
    const real = calcPlateBucklingStress({ ...base, calcMode: 'complete', imperfectionFactor: 0.7 })
    expect(real.criticalStress).toBeLessThan(ideal.criticalStress)
  })

  it('professional adds post buckling capacity as φ·σ_cr', () => {
    const r = calcPlateBucklingStress({
      ...base,
      calcMode: 'professional',
      appliedShear: 5,
      imperfectionFactor: 0.8,
      postBucklingFactor: 1.5,
    })
    expect(r.postBucklingCapacity).toBeCloseTo(r.criticalStress * 1.5, 6)
    expect(r.postBucklingReserve).toBeCloseTo(r.postBucklingCapacity, 6)
  })

  it('default demo fails because SF < minSafety 2', () => {
    const simple = calcPlateBucklingStress({ ...base, calcMode: 'simple' })
    expect(simple.criticalStress).toBeCloseTo(75.9, 0)
    expect(simple.safetyFactor).toBeCloseTo(1.52, 1)
    expect(simple.minSafety).toBe(2)
    expect(simple.pass).toBe(false)

    const pro = calcPlateBucklingStress({
      ...base,
      calcMode: 'professional',
      imperfectionFactor: 0.8,
    })
    expect(pro.criticalStress).toBeCloseTo(60.7, 0)
    expect(pro.safetyFactor).toBeCloseTo(1.21, 1)
    expect(pro.postBucklingCapacity).toBeCloseTo(91.1, 0)
    expect(pro.pass).toBe(false)
  })
})

describe('gear-calc modes', () => {
  it('simple lewis analysis passes flag', () => {
    const r = analyzeGearStrength({
      module: 2,
      teeth: 24,
      faceWidth: 20,
      torque: 50,
      rpm: 1500,
      gearRatio: 3,
    })
    expect(r.calcMode).toBe('simple')
    expect(r.bendingStress).toBeGreaterThan(0)
    expect(r.pass).toBeDefined()
  })
})

describe('thermal-expansion modes', () => {
  it('simple mode linear expansion only', () => {
    const r = analyzeThermalExpansion({ calcMode: 'simple', length: 100, deltaT: 100, alpha: 11.5e-6 })
    expect(r.calcMode).toBe('simple')
    expect(r.linearExpansion).toBeCloseTo(0.115, 3)
    expect(r.fit).toBeNull()
  })

  it('complete mode fit change', () => {
    const r = analyzeThermalExpansion({
      calcMode: 'complete',
      deltaT: 100,
      alpha: 23.6e-6,
      alpha2: 11.5e-6,
      shaftDiameter: 50,
      holeDiameter: 49.95,
      confirmedFields: {
        shaftDiameter: true,
        holeDiameter: true,
        deltaT: true,
      },
    })
    expect(r.fit).toBeTruthy()
    expect(r.fit.interferenceChange).toBeDefined()
  })

  it('professional mode two-stage temperature', () => {
    const r = analyzeThermalExpansion({
      calcMode: 'professional',
      alpha: 23.6e-6,
      alpha2: 11.5e-6,
      shaftDiameter: 50,
      holeDiameter: 49.95,
      assemblyDeltaT: 80,
      serviceDeltaT: 120,
      confirmedFields: {
        shaftDiameter: true,
        holeDiameter: true,
        assemblyDeltaT: true,
        serviceDeltaT: true,
      },
    })
    expect(r.assemblyFit).toBeTruthy()
    expect(r.pass).toBeDefined()
  })

  it('professional pass follows service fit instead of initial fit', () => {
    const r = analyzeThermalExpansion({
      calcMode: 'professional',
      alpha: 11.5e-6,
      alpha2: 23.6e-6,
      shaftDiameter: 50,
      holeDiameter: 49.95,
      assemblyDeltaT: 20,
      serviceDeltaT: 220,
    })
    expect(r.fit).toBeTruthy()
    expect(r.serviceFit).toBeTruthy()
    expect(r.serviceFit.becomesClearance).toBe(true)
    expect(r.pass).toBe(false)
  })
})

describe('sheet-metal modes', () => {
  const segs = [
    { type: 'straight', length: 50 },
    { type: 'bend', angle: 90 },
    { type: 'straight', length: 50 },
  ]

  it('simple unfold length', () => {
    const r = analyzeSheetMetalUnfold({ calcMode: 'simple', thickness: 1.5, segments: segs })
    expect(r.flatLength).toBeGreaterThan(100)
  })

  it('complete min flange check', () => {
    const r = analyzeSheetMetalUnfold({ calcMode: 'complete', thickness: 1.5, segments: segs })
    expect(r.minFlangeRule).toBe(6)
    expect(r.flangePass).toBeDefined()
  })

  it('professional springback compensation', () => {
    const r = analyzeSheetMetalUnfold({
      calcMode: 'professional',
      thickness: 1.5,
      segments: segs,
      springbackFactor: 0.5,
    })
    expect(r.compensatedFlatLength).toBeGreaterThan(r.flatLength)
    expect(r.springbackEstimateOnly).toBe(true)
  })

  it('rejects negative straight length instead of clamping it to zero', () => {
    const r = analyzeSheetMetalUnfold({
      calcMode: 'simple',
      thickness: 1.5,
      segments: [{ type: 'straight', length: -10 }],
    })
    expect(r.errorKey).toBe('invalid_segment_length')
  })

  it('rejects impossible bend angle and K factor', () => {
    expect(analyzeSheetMetalUnfold({
      calcMode: 'simple',
      kFactor: 0.8,
      segments: segs,
    }).errorKey).toBe('invalid_k_factor')
    expect(analyzeSheetMetalUnfold({
      calcMode: 'simple',
      thickness: 1.5,
      segments: [{ type: 'bend', angle: 180 }],
    }).errorKey).toBe('invalid_bend_angle')
  })

  it('rejects non-finite sheet metal inputs before formulas run', () => {
    expect(analyzeSheetMetalUnfold({
      calcMode: 'simple',
      thickness: Number.NaN,
      segments: segs,
    }).errorKey).toBe('invalid_thickness')
    expect(analyzeSheetMetalUnfold({
      calcMode: 'professional',
      thickness: 1.5,
      segments: segs,
      springbackFactor: Number.POSITIVE_INFINITY,
    }).errorKey).toBe('invalid_springback')
  })
})

describe('heat-treatment', () => {
  it('returns CE, jominy, hardenability, temper, and profile', () => {
    const r = analyzeHeatTreatment({ partDiameter: 50 })
    expect(r.carbonEquivalent).toBeGreaterThan(0)
    expect(r.jominyCurve.length).toBeGreaterThan(0)
    expect(r.hardenability?.idealCriticalDiameter).toBeGreaterThan(0)
    expect(r.preheatRequired).toBeDefined()
    expect(r.hardnessProfile?.length).toBeGreaterThan(0)
    expect(r.temper?.temperedHRC).toBeGreaterThan(0)
    expect(r.finalHardnessPass).toBeDefined()
    expect(typeof r.pass).toBe('boolean')
  })
})

describe('manufacturing modes', () => {
  it('machining simple two ops', () => {
    const r = calcMachiningAllowance({ calcMode: 'simple', nominalDiameter: 50, length: 100 })
    expect(r.details.length).toBe(2)
    expect(r.operations).toEqual(['rough', 'finish'])
    expect(r.endFaceAllowance).toBe(1)
  })

  it('machining complete grinding radial number', () => {
    const r = calcMachiningAllowance({ calcMode: 'complete', nominalDiameter: 50, length: 100 })
    expect(r.grindingAllowance).toBeGreaterThan(0)
    expect(typeof r.grindingAllowance).toBe('number')
  })

  it('machining professional time estimate', () => {
    const r = calcMachiningAllowance({ calcMode: 'professional', nominalDiameter: 50, length: 100 })
    expect(r.estimatedMachiningMinutes).toBeGreaterThan(0)
  })

  it('machining volume is stock minus finish cylinder', () => {
    const r = calcMachiningAllowance({
      calcMode: 'simple',
      nominalDiameter: 50,
      length: 120,
      toleranceGrade: 'medium',
    })
    expect(r.totalRadialAllowance).toBeCloseTo(2.2, 5)
    expect(r.recommendedStockDiameter).toBeCloseTo(54.4, 5)
    expect(r.recommendedStockLength).toBe(122)
    const expected =
      (Math.PI / 4) * (54.4 ** 2 * 122 - 50 ** 2 * 120)
    expect(r.materialRemovalVolume).toBeCloseTo(expected, 6)
    expect(r.materialRemovalVolume / 1000).toBeCloseTo(47.9, 1)
  })

  it('machining complete demo stock and grind', () => {
    const r = calcMachiningAllowance({
      calcMode: 'complete',
      nominalDiameter: 50,
      length: 120,
      toleranceGrade: 'medium',
    })
    expect(r.totalRadialAllowance).toBeCloseTo(2.8, 5)
    expect(r.recommendedStockDiameter).toBeCloseTo(55.6, 5)
    expect(r.recommendedStockLength).toBe(124)
    expect(r.grindingAllowance).toBeCloseTo(0.2, 5)
    expect(r.minStockDiameter).toBeCloseTo(50.4, 5)
    const expected =
      (Math.PI / 4) * (55.6 ** 2 * 124 - 50 ** 2 * 120)
    expect(r.materialRemovalVolume).toBeCloseTo(expected, 6)
  })

  it('casting complete imperfection factor', () => {
    const simple = calcDraftAngle({ calcMode: 'simple', depth: 80 })
    const complete = calcDraftAngle({ calcMode: 'complete', depth: 80 })
    expect(complete.draftAngleDeg).toBeGreaterThanOrEqual(simple.draftAngleDeg)
  })

  it('casting sand iron external demo numbers', () => {
    const simple = calcDraftAngle({
      calcMode: 'simple',
      material: 'sand_iron',
      surfaceType: 'external',
      depth: 80,
    })
    // (1.5 + 0.02√80) ≈ 1.6789°
    expect(simple.draftAngleDeg).toBeCloseTo(1.5 + 0.02 * Math.sqrt(80), 6)
    expect(simple.linearIncreasePerSide).toBeCloseTo(
      80 * Math.tan((simple.draftAngleDeg * Math.PI) / 180),
      6,
    )
    expect(simple.totalWidthIncrease).toBeCloseTo(simple.linearIncreasePerSide * 2, 6)
    expect(simple.noteKey).toBe('normal')

    const complete = calcDraftAngle({
      calcMode: 'complete',
      material: 'sand_iron',
      surfaceType: 'external',
      depth: 80,
    })
    expect(complete.imperfectionFactor).toBe(1.05)
    expect(complete.draftAngleDeg).toBeCloseTo(simple.draftAngleDeg * 1.05, 6)
    expect(complete.baseAngleDeg).toBeCloseTo(simple.draftAngleDeg, 6)
  })

  it('casting professional editable phi', () => {
    const r = calcDraftAngle({
      calcMode: 'professional',
      material: 'sand_iron',
      surfaceType: 'external',
      depth: 80,
      imperfectionFactor: 1.1,
    })
    expect(r.draftAngleDeg).toBeCloseTo(r.baseAngleDeg * 1.1, 6)
  })
})

describe('pipe-flow modes', () => {
  const base = { diameter: 25, length: 10, flowRate: 20 }

  it('simple ignores local loss', () => {
    const r = analyzePipeFlow({ ...base, calcMode: 'simple', localLossK: 5 })
    expect(r.totalPressureDropKPa).toBe(r.pressureDropKPa)
  })

  it('complete mode includes local loss in total pressure drop', () => {
    const r = analyzePipeFlow({ ...base, calcMode: 'complete', localLossK: 2 })
    expect(r.localLoss).toBeGreaterThan(0)
    expect(r.totalPressureDropKPa).toBeGreaterThan(r.pressureDropKPa)
  })

  it('treats pipe length as meters, not millimeters', () => {
    const r = analyzePipeFlow({ ...base, calcMode: 'simple' })
    expect(r.length).toBe(10)
    expect(r.pressureDropKPa).toBeGreaterThan(1)
  })

  it('complete hazen williams compare uses friction-only Darcy', () => {
    const r = analyzePipeFlow({
      ...base,
      roughness: 0.045,
      density: 998,
      viscosity: 1.002e-3,
      calcMode: 'complete',
      localLossK: 2,
      hazenC: 130,
    })
    expect(r.methodCompare).toBeTruthy()
    expect(r.methodCompare.darcyKPa).toBeCloseTo(r.pressureDropKPa, 6)
    expect(r.methodCompare.darcyKPa).toBeLessThan(r.totalPressureDropKPa)
    expect(r.methodCompare.hazenKPa).toBeCloseTo(2.94, 1)
    expect(r.methodCompare.deltaPercent).toBeLessThan(8)
  })

  it('default water demo matches hand calc', () => {
    const r = analyzePipeFlow({
      ...base,
      roughness: 0.045,
      density: 998,
      viscosity: 1.002e-3,
      calcMode: 'professional',
      localLossK: 2,
      maxVelocity: 3,
      maxPressureDropKPa: 200,
    })
    expect(r.velocity).toBeCloseTo(0.679, 2)
    expect(r.reynolds).toBeCloseTo(16909, 0)
    expect(r.pressureDropKPa).toBeCloseTo(2.82, 1)
    expect(r.totalPressureDropKPa).toBeCloseTo(3.28, 1)
    expect(r.pass).toBe(true)
    expect(r.erosionRiskKey).toBe('low')
  })

  it('professional pass flags', () => {
    const r = analyzePipeFlow({ ...base, calcMode: 'professional', maxVelocity: 10, maxPressureDropKPa: 500 })
    expect(r.pass).toBe(true)
  })
})

describe('modal modes', () => {
  it('simple sdof frequency', () => {
    const r = analyzeModal({ calcMode: 'simple', caseId: 'sdof', stiffness: 10000, mass: 10 })
    expect(r.modal.fn).toBeCloseTo(5.03, 1)
  })

  it('uses MPa-mm-density units for simply supported beam frequency', () => {
    const r = analyzeModal({ calcMode: 'simple', caseId: 'beam_ss', spanLength: 500, diameter: 30 })
    // Steel Ø30×500 mm simply supported: fn ≈ 244 Hz (N-mm-s density)
    expect(r.modal.fn).toBeCloseTo(243.7, 0)
  })

  it('complete critical speed', () => {
    const r = analyzeModal({ calcMode: 'complete', caseId: 'sdof', stiffness: 10000, mass: 10, excitationFreq: 40 })
    expect(r.criticalSpeed).toBeGreaterThan(0)
    expect(r.resonance).toBeTruthy()
  })

  it('professional amplification', () => {
    const r = analyzeModal({
      calcMode: 'professional',
      caseId: 'sdof',
      stiffness: 10000,
      mass: 10,
      excitationFreq: 5,
      dampingRatio: 0.02,
    })
    expect(r.amplificationFactor).toBeGreaterThan(1)
  })

  it('beam demo: fn, margin, transmissibility H(r)', () => {
    const r = analyzeModal({
      calcMode: 'professional',
      caseId: 'beam_ss',
      spanLength: 500,
      diameter: 30,
      excitationFreq: 45,
      rpm: 2700,
      dampingRatio: 0.02,
    })
    expect(r.modal.fn).toBeCloseTo(243.73, 1)
    expect(r.resonance.marginPercent).toBeCloseTo(81.5, 0)
    expect(r.criticalSpeed).toBeCloseTo(14624, 0)
    expect(r.amplificationFactor).toBeCloseTo(1.04, 1)
    expect(r.pass).toBe(true)
  })
})

describe('butt-weld modes', () => {
  const base = { thickness: 8, weldLength: 100, force: 50000, steelGrade: 'Q235' }

  it('simple gb only', () => {
    const r = analyzeButtWeld({ ...base, calcMode: 'simple' })
    expect(r.gb).toBeTruthy()
    expect(r.eurocode).toBeUndefined()
    expect(r.estimateOnly).toBe(true)
    expect(r.pass).toBe(false)
    expect(r.stressPass).toBe(true)
  })

  it('complete three standards', () => {
    const r = analyzeButtWeld({ ...base, calcMode: 'complete' })
    expect(r.aws).toBeTruthy()
    expect(r.pass).toBeDefined()
  })

  it('professional effective stress', () => {
    const r = analyzeButtWeld({
      ...base,
      calcMode: 'professional',
      penetrationEfficiency: 0.9,
      stressConcentration: 1.5,
    })
    expect(r.effectiveStress).toBeGreaterThan(r.normalStress)
  })
})

describe('gdt-stack modes', () => {
  const base = {
    typeId: 'flatness',
    closedRing: { min: 0, max: 0.08 },
    rings: [
      { name: '面1', tolerance: 0.03, factor: 1, type: 'increasing' },
      { name: '面2', tolerance: 0.025, factor: 1, type: 'increasing' },
    ],
  }

  it('simple mode chain only', () => {
    const r = analyzeGdtStack({ ...base, calcMode: 'simple' })
    expect(r.chainResult.totalTolerance).toBeGreaterThan(0)
    expect(r.contributions).toBeUndefined()
  })

  it('complete mode contributions', () => {
    const r = analyzeGdtStack({ ...base, calcMode: 'complete' })
    expect(r.contributions?.length).toBe(2)
  })

  it('professional worst case margin', () => {
    const r = analyzeGdtStack({ ...base, calcMode: 'professional' })
    expect(r.worstCaseMargin).toBeDefined()
  })
})

describe('fit modes', () => {
  it('simple fit type', () => {
    const r = analyzeFit(25, 'H7', 'g6', 'simple')
    expect(r.fitType).toBe('clearance')
  })

  it('complete mean clearance', () => {
    const r = analyzeFit(25, 'H7', 'g6', 'complete')
    expect(r.meanClearance).toBeDefined()
  })

  it('professional thermal shift', () => {
    const r = analyzeFit(25, 'H7', 'g6', { calcMode: 'professional', deltaT: 100 })
    expect(r.thermalShift).toBeDefined()
  })
})

describe('material-selection', () => {
  it('returns full ranked list with tradeoff picks', () => {
    const r = scoreMaterials({ minSigmaAllow: 100, maxCostIndex: 10 })
    expect(r.recommendations.length).toBeGreaterThan(5)
    expect(r.bestStrength).toBeTruthy()
    expect(r.bestWeight).toBeTruthy()
    expect(r.bestCost).toBeTruthy()
    expect(r.tradeoffNoteKey).toBeTruthy()
    expect(r.showScoreBreakdown).toBe(true)
  })
})
