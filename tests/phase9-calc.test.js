import { describe, it, expect } from 'vitest'
import {
  analyzeThreadStrength,
  calcExternalThreadShearArea,
  calcMinEngagementLength,
} from '@/utils/thread-calc'
import {
  analyzeBoltGroup,
  generateCircleBoltPositions,
} from '@/utils/bolt-group-calc'
import { analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeSpring } from '@/utils/spring-calc'
import { analyzeBearingLife } from '@/utils/bearing-calc'
import { analyzeFilletWeld } from '@/utils/weld-calc'
import { analyzeBeam } from '@/utils/beam-calc'
import { analyzeKeyConnection } from '@/utils/key-calc'
import { analyzeORingSeal } from '@/utils/o-ring-calc'
import { analyzeClutch } from '@/utils/clutch-calc'
import { analyzeBeltDrive } from '@/utils/belt-calc'
import { analyzeChainDrive } from '@/utils/chain-calc'
import { analyzeHydraulicCylinder } from '@/utils/hydraulic-calc'
import { analyzeFatigue, getStressAmplitudeBounds } from '@/utils/fatigue-calc'
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
    })
    expect(r.shearAmplitude).toBeGreaterThan(0)
    expect(r.fatigueLife).toBeGreaterThan(0)
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
    expect(r.torque).toBeGreaterThan(0)
  })

  it('complete uses effective radius', () => {
    const r = analyzeClutch({
      calcMode: 'complete',
      frictionCoeff: 0.15,
      force: 5000,
      innerDiameter: 100,
      outerDiameter: 160,
      surfaces: 2,
    })
    expect(r.effectiveRadius).toBeGreaterThan(50)
    expect(r.contactPressure).toBeGreaterThan(0)
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
})

describe('belt-calc modes', () => {
  const base = { driverDiameter: 120, drivenDiameter: 300, centerDistance: 500, rpm: 1450, power: 5.5 }

  it('simple mode computes length and tension', () => {
    const r = analyzeBeltDrive({ ...base, calcMode: 'simple', wrapAngle: 180 })
    expect(r.beltLength).toBeGreaterThan(0)
    expect(r.F1).toBeGreaterThan(r.F2)
  })

  it('complete mode auto wrap angle', () => {
    const r = analyzeBeltDrive({ ...base, calcMode: 'complete', powerPerBelt: 2.5 })
    expect(r.wrapAngle).toBeLessThan(180)
    expect(r.beltCount).toBeGreaterThan(0)
  })

  it('professional applies service factor', () => {
    const baseP = analyzeBeltDrive({ ...base, calcMode: 'simple', wrapAngle: 180 })
    const pro = analyzeBeltDrive({ ...base, calcMode: 'professional', serviceFactor: 1.5, powerPerBelt: 2.5 })
    expect(pro.F1).toBeGreaterThan(baseP.F1)
  })
})

describe('chain-calc modes', () => {
  const base = { pitch: 15.875, driverTeeth: 19, drivenTeeth: 57, centerDistance: 500, rpm: 720, power: 7.5 }

  it('simple mode basic output', () => {
    const r = analyzeChainDrive({ ...base, calcMode: 'simple' })
    expect(r.chainLength).toBeGreaterThan(0)
    expect(r.chainTension).toBeGreaterThan(0)
  })

  it('complete mode checks speed and tension', () => {
    const r = analyzeChainDrive({ ...base, calcMode: 'complete', allowTension: 50000, maxChainSpeed: 20 })
    expect(r.speedPass).toBe(true)
    expect(r.tensionPass).toBe(true)
  })

  it('professional mode estimates life', () => {
    const r = analyzeChainDrive({ ...base, calcMode: 'professional', strands: 2 })
    expect(r.estimatedLifeHours).toBeGreaterThan(0)
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
})

describe('plate-buckling modes', () => {
  const base = { thickness: 2, width: 200, length: 400, appliedStress: 50 }

  it('simple mode critical stress', () => {
    const r = calcPlateBucklingStress({ ...base, calcMode: 'simple' })
    expect(r.criticalStress).toBeGreaterThan(0)
  })

  it('complete mode lowers k with imperfection', () => {
    const ideal = calcPlateBucklingStress({ ...base, calcMode: 'simple' })
    const real = calcPlateBucklingStress({ ...base, calcMode: 'complete', imperfectionFactor: 0.7 })
    expect(real.criticalStress).toBeLessThan(ideal.criticalStress)
  })

  it('professional adds post buckling reserve', () => {
    const r = calcPlateBucklingStress({ ...base, calcMode: 'professional', appliedShear: 5 })
    expect(r.postBucklingReserve).toBeGreaterThan(r.criticalStress)
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
    })
    expect(r.assemblyFit).toBeTruthy()
    expect(r.pass).toBeDefined()
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
  })
})

describe('heat-treatment modes', () => {
  it('simple CE only', () => {
    const r = analyzeHeatTreatment({ calcMode: 'simple' })
    expect(r.carbonEquivalent).toBeGreaterThan(0)
    expect(r.jominyCurve).toEqual([])
  })

  it('complete hardenability', () => {
    const r = analyzeHeatTreatment({ calcMode: 'complete', partDiameter: 50 })
    expect(r.jominyCurve.length).toBeGreaterThan(0)
    expect(r.preheatRequired).toBeDefined()
  })

  it('professional hardness profile', () => {
    const r = analyzeHeatTreatment({ calcMode: 'professional', partDiameter: 50 })
    expect(r.hardnessProfile?.length).toBeGreaterThan(0)
    expect(r.finalHardnessPass).toBeDefined()
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

  it('casting complete imperfection factor', () => {
    const simple = calcDraftAngle({ calcMode: 'simple', depth: 80 })
    const complete = calcDraftAngle({ calcMode: 'complete', depth: 80 })
    expect(complete.draftAngleDeg).toBeGreaterThanOrEqual(simple.draftAngleDeg)
  })
})

describe('pipe-flow modes', () => {
  const base = { diameter: 25, length: 10, flowRate: 20 }

  it('simple ignores local loss', () => {
    const r = analyzePipeFlow({ ...base, calcMode: 'simple', localLossK: 5 })
    expect(r.totalPressureDropKPa).toBe(r.pressureDropKPa)
  })

  it('complete hazen williams compare', () => {
    const r = analyzePipeFlow({ ...base, calcMode: 'complete', localLossK: 2 })
    expect(r.methodCompare).toBeTruthy()
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
})

describe('butt-weld modes', () => {
  const base = { thickness: 8, weldLength: 100, force: 50000, steelGrade: 'Q235' }

  it('simple gb only', () => {
    const r = analyzeButtWeld({ ...base, calcMode: 'simple' })
    expect(r.gb).toBeTruthy()
    expect(r.eurocode).toBeUndefined()
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

describe('material-selection modes', () => {
  it('simple top 5 limit', () => {
    const r = scoreMaterials({ calcMode: 'simple', minSigmaAllow: 100, maxCostIndex: 10 })
    expect(r.recommendations.length).toBeLessThanOrEqual(5)
  })

  it('professional tradeoff picks', () => {
    const r = scoreMaterials({ calcMode: 'professional', minSigmaAllow: 100, maxCostIndex: 10 })
    expect(r.bestStrength).toBeTruthy()
    expect(r.tradeoffNoteKey).toBeTruthy()
  })
})
