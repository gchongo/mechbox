import { describe, it, expect } from 'vitest'
import {
  buildCalcResult,
  diffPercent,
  getCalcReviewStatus,
  isImprovement,
  reviewAwareCheckClass,
  reviewAwareCheckMark,
} from '@/utils/calc-result'
import { bisect, gridSearch, STANDARD_SHAFT_DIAMETERS } from '@/utils/inverse-solver'
import { runSensitivityAnalysis, topSensitivities } from '@/utils/sensitivity-analysis'
import { buildComparison } from '@/utils/scenario-compare'
import {
  adaptBearing,
  adaptShaftCombined,
  adaptShaftTorsion,
  adaptBoltPreload,
  adaptKeyConnection,
  adaptBeam,
  adaptButtWeld,
  adaptFit,
  adaptGdtStack,
  adaptSpring,
  adaptFilletWeld,
  adaptWeldFatigue,
  adaptWeldHaz,
  adaptBoltGroup,
  adaptSizeChain,
} from '@/utils/calc-adapters'
import { buildEnhancedReport } from '@/utils/enhanced-report'
import { DECISION_PRESETS, runPresetInverse } from '@/utils/decision-presets'

describe('CalcResult helpers', () => {
  it('normalizes keyMetrics and clones inputs', () => {
    const inputs = { a: 1 }
    const r = buildCalcResult({
      toolId: 't', toolLabel: 'Tool', inputs,
      keyMetrics: [{ key: 'x', value: 10, unit: 'N' }],
      pass: true,
    })
    inputs.a = 999
    expect(r.inputs.a).toBe(1)
    expect(r.keyMetrics[0].label).toBe('x')
    expect(r.keyMetrics[0].direction).toBe('lower-better')
  })

  it('diffPercent handles zero base', () => {
    expect(diffPercent(0, 0)).toBe(0)
    expect(diffPercent(0, 5)).toBe(Infinity)
    expect(diffPercent(100, 110)).toBeCloseTo(10)
  })

  it('isImprovement follows direction', () => {
    expect(isImprovement('lower-better', 100, 90)).toBe(true)
    expect(isImprovement('higher-better', 100, 90)).toBe(false)
  })

  it('getCalcReviewStatus distinguishes review from fail', () => {
    expect(getCalcReviewStatus({ pass: true })).toBe('pass')
    expect(getCalcReviewStatus({ pass: false, estimateOnly: true })).toBe('review')
    expect(getCalcReviewStatus({ pass: false, releaseBlocked: true })).toBe('review')
    expect(getCalcReviewStatus({ pass: false })).toBe('fail')
  })

  it('review-aware check helpers downgrade pass marks in review state', () => {
    const reviewSnapshot = { pass: false, estimateOnly: true }
    expect(reviewAwareCheckClass(true, reviewSnapshot)).toBe('text-warning')
    expect(reviewAwareCheckMark(true, reviewSnapshot)).toContain('待复核')
    expect(reviewAwareCheckClass(false, reviewSnapshot)).toBe('text-error')
    expect(reviewAwareCheckMark(false, reviewSnapshot)).toBe('✗')
  })
})

describe('inverse-solver', () => {
  it('bisect finds minimum diameter for torsion pass', () => {
    // simple monotonic: torsion stress ~ 1/d^3
    const evaluate = (d) => {
      const tau = 100_000 / d ** 3
      return { pass: tau <= 50, metric: tau }
    }
    const r = bisect(evaluate, 5, 100, { tolerance: 0.01 })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(12)
    expect(r.solution).toBeLessThan(15)
  })

  it('bisect returns null when no solution in range', () => {
    const r = bisect((x) => x > 1000, 0, 10)
    expect(r.solution).toBeNull()
  })

  it('gridSearch picks smallest passing standard diameter', () => {
    const evaluate = (d) => d >= 42
    const r = gridSearch(evaluate, STANDARD_SHAFT_DIAMETERS)
    expect(r.solution).toBe(42)
  })
})

describe('sensitivity-analysis', () => {
  const evaluate = (inputs) => ({
    metrics: {
      power: inputs.torque * inputs.rpm,
      other: inputs.torque + inputs.rpm,
    },
  })
  const base = { torque: 100, rpm: 1500 }

  it('produces tornado rows with swing percents', () => {
    const a = runSensitivityAnalysis({
      baseInputs: base,
      parameters: [
        { key: 'torque', label: 'T' },
        { key: 'rpm', label: 'n' },
      ],
      evaluate,
      metrics: ['power', 'other'],
    })
    expect(a.rows).toHaveLength(2)
    expect(a.rows[0].effects.power.swingPercent).toBeCloseTo(20, 5)
    expect(a.rankings.power[0].parameter).toBeDefined()
  })

  it('topSensitivities returns sorted list', () => {
    const a = runSensitivityAnalysis({
      baseInputs: base,
      parameters: [{ key: 'torque' }, { key: 'rpm' }],
      evaluate,
      metrics: ['other'],
    })
    const top = topSensitivities(a, 'other', 1)
    expect(top).toHaveLength(1)
  })
})

describe('scenario-compare buildComparison', () => {
  it('columns diff base against others', () => {
    const scenarios = [
      { id: 'a', name: 'A', snapshot: buildCalcResult({ toolId: 'x', toolLabel: 'X', keyMetrics: [{ key: 'life', value: 10000, direction: 'higher-better' }] }) },
      { id: 'b', name: 'B', snapshot: buildCalcResult({ toolId: 'x', toolLabel: 'X', keyMetrics: [{ key: 'life', value: 15000, direction: 'higher-better' }] }) },
    ]
    const cmp = buildComparison(scenarios)
    expect(cmp.metrics).toHaveLength(1)
    expect(cmp.metrics[0].columns.b.diffPercent).toBeCloseTo(50)
    expect(cmp.metrics[0].columns.b.improved).toBe(true)
  })

  it('preserves review status for estimate-only scenarios', () => {
    const scenarios = [
      {
        id: 'a',
        name: 'A',
        snapshot: buildCalcResult({
          toolId: 'x',
          toolLabel: 'X',
          keyMetrics: [{ key: 'life', value: 10000, direction: 'higher-better', status: 'pass' }],
          pass: false,
          estimateOnly: true,
        }),
      },
      {
        id: 'b',
        name: 'B',
        snapshot: buildCalcResult({
          toolId: 'x',
          toolLabel: 'X',
          keyMetrics: [{ key: 'life', value: 8000, direction: 'higher-better', status: 'fail' }],
          pass: false,
        }),
      },
    ]
    const cmp = buildComparison(scenarios)
    expect(cmp.scenarios[0].reviewStatus).toBe('review')
    expect(cmp.metrics[0].columns.a.reviewStatus).toBe('review')
    expect(cmp.scenarios[1].reviewStatus).toBe('fail')
  })
})

describe('calc adapters', () => {
  it('adaptBearing produces CalcResult with lifeHours metric', () => {
    const r = adaptBearing({
      calcMode: 'simple',
      dynamicLoad: 30000,
      radialLoad: 5000,
      rpm: 1500,
      targetHours: 10000,
    })
    expect(r.toolId).toBe('bearing')
    const life = r.keyMetrics.find((m) => m.key === 'lifeHours')
    expect(life.value).toBeGreaterThan(0)
    expect(r.standards).toContain('ISO 281:2007')
  })

  it('adaptShaftTorsion suggests larger diameter when fail', () => {
    const r = adaptShaftTorsion({
      calcMode: 'complete',
      diameter: 10,
      torque: 500,
      yieldStrength: 235,
    })
    expect(r.pass).toBe(false)
    expect(r.suggestions.join('\n')).toContain('直径')
  })

  it('adaptShaftTorsion keeps shear metric pass when only twist angle fails', () => {
    const r = adaptShaftTorsion({
      calcMode: 'complete',
      diameter: 30,
      torque: 200,
      length: 4000,
      yieldStrength: 235,
      maxTwistAngle: 0.5,
    })
    expect(r.pass).toBe(false)
    expect(r.keyMetrics.find((m) => m.key === 'shearStress')?.status).toBe('pass')
    expect(r.keyMetrics.find((m) => m.key === 'twistAngle')?.status).toBe('fail')
  })

  it('adaptShaftCombined keeps equivalent stress metric pass when fatigue fails', () => {
    const r = adaptShaftCombined({
      calcMode: 'professional',
      materialId: '45',
      diameter: 40,
      torque: 20,
      bendingMoment: 20,
      yieldStrength: 355,
      stressConcentrationBending: 1,
      stressConcentrationTorsion: 1,
      bendingAmplitude: 2000,
      targetCycles: 1e6,
    })
    expect(r.pass).toBe(false)
    expect(r.outputs.combinedPass).toBe(true)
    expect(r.outputs.fatiguePass).toBe(false)
    expect(r.keyMetrics.find((m) => m.key === 'equivalentStress')?.status).toBe('pass')
    expect(r.keyMetrics.find((m) => m.key === 'fatigueLife')?.status).toBe('fail')
  })

  it('adaptBoltPreload flags separation risk', () => {
    const r = adaptBoltPreload({
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
      outerDiameter: 18,
      embedmentUm: 11,
      preload: 3000,
      externalAxialLoad: 200_000,
    })
    expect(r.pass).toBe(false)
    expect(r.suggestions.join(' ')).toMatch(/分离|应力/)
  })

  it('adaptBoltPreload simple mode remains review-only when stress passes', () => {
    const r = adaptBoltPreload({
      calcMode: 'simple',
      mode: 'force2torque',
      diameter: 12,
      pitch: 1.75,
      grade: '8.8',
      preload: 30000,
      frictionCoeff: 0.2,
    })
    const stress = r.keyMetrics.find((m) => m.key === 'stress')
    expect(stress?.status).toBe('pass')
    expect(getCalcReviewStatus(r)).toBe('review')
  })
})

describe('preset inverse solvers', () => {
  it('shaft: reverse solves minimum standard diameter', () => {
    const preset = DECISION_PRESETS.shaft
    const r = runPresetInverse(preset, 'min-diameter-standard', {
      calcMode: 'complete',
      torque: 200,
      yieldStrength: 235,
    })
    expect(r.converged).toBe(true)
    expect(STANDARD_SHAFT_DIAMETERS).toContain(r.solution)
  })

  it('bearing: reverse solves minimum dynamic load C', () => {
    const preset = DECISION_PRESETS.bearing
    const r = runPresetInverse(preset, 'min-dynamic-load', {
      calcMode: 'simple',
      radialLoad: 5000,
      axialLoad: 0,
      x: 1, y: 0,
      rpm: 1500,
      targetHours: 20000,
    })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(5000)
  })

  it('bolt-preload: reverse solves minimum preload against separation', () => {
    const preset = DECISION_PRESETS['bolt-preload']
    const r = runPresetInverse(preset, 'no-separation', {
      diameter: 10,
      pitch: 1.5,
      grade: '8.8',
      muG: 0.12,
      muK: 0.12,
      dKm: 14.5,
      gripLength: 20,
      holeDiameter: 11,
      headContactDiameter: 15,
      outerDiameter: 18,
      embedmentUm: 11,
      externalAxialLoad: 50000,
    })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(0)
    expect(r.solution).toBeLessThan(60_000)
  })

  it('key: reverse solves minimum length under review-only simple mode', () => {
    const preset = DECISION_PRESETS.key
    const r = runPresetInverse(preset, 'min-key-length', {
      calcMode: 'simple',
      torque: 200,
      shaftDiameter: 30,
      keyWidth: 8,
      keyLength: 28,
    })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(0)
  })
})

describe('extra adapters', () => {
  it('adaptKeyConnection recommends longer length when fail', () => {
    const r = adaptKeyConnection({
      calcMode: 'complete',
      torque: 500,
      shaftDiameter: 30,
      keyWidth: 8,
      keyHeight: 7,
      keyLength: 10,
      hubLength: 10,
      allowShear: 100,
      allowCrush: 150,
    })
    expect(r.pass).toBe(false)
    expect(r.suggestions.join(' ')).toMatch(/键长/)
  })

  it('adaptKeyConnection simple mode remains review-only when local stresses pass', () => {
    const r = adaptKeyConnection({
      calcMode: 'simple',
      torque: 200,
      shaftDiameter: 30,
      keyWidth: 8,
      keyLength: 28,
    })
    const shear = r.keyMetrics.find((m) => m.key === 'shearStress')
    const crush = r.keyMetrics.find((m) => m.key === 'crushStress')
    expect(shear?.status).toBe('pass')
    expect(crush?.status).toBe('pass')
    expect(getCalcReviewStatus(r)).toBe('review')
  })

  it('adaptBeam produces stress + deflection metrics', () => {
    const r = adaptBeam({
      calcMode: 'complete',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 20,
      spanLength: 800,
      load: 3000,
      elasticModulus: 210000,
      allowableStress: 160,
      allowableDeflection: 0.8,
    })
    const keys = r.keyMetrics.map((m) => m.key)
    expect(keys).toContain('stress')
    expect(keys).toContain('deflection')
  })

  it('adaptBeam marks slenderness-limited result as review', () => {
    const r = adaptBeam({
      calcMode: 'simple',
      materialId: 'q235',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      diameter: 20,
      spanLength: 900,
      load: 50,
    })
    expect(r.pass).toBe(true)
    expect(getCalcReviewStatus(r)).toBe('review')
    expect(r.warnings.some((w) => w.key === 'slenderness')).toBe(true)
  })

  it('adaptFit keeps classification-only results as review', () => {
    const r = adaptFit({
      nominal: 25,
      holeCode: 'H7',
      shaftCode: 'g6',
      calcMode: 'complete',
      deltaT: 0,
    })
    expect(r.pass).toBe(true)
    expect(getCalcReviewStatus(r)).toBe('review')
    expect(r.assumptions.some((a) => a.includes('仅用于分类与复核'))).toBe(true)
  })

  it('adaptFit turns thermal intent break into fail', () => {
    const r = adaptFit({
      nominal: 25,
      holeCode: 'H9',
      shaftCode: 'd9',
      calcMode: 'professional',
      deltaT: 200,
      alphaHole: 11.5e-6,
      alphaShaft: 23.6e-6,
    })
    expect(r.pass).toBe(false)
    expect(getCalcReviewStatus(r)).toBe('fail')
    expect(r.warnings.some((w) => w.key === 'thermal_interference_risk')).toBe(true)
  })

  it('adaptGdtStack exposes datum-stack warning when overall result fails', () => {
    const r = adaptGdtStack({
      calcMode: 'complete',
      typeId: 'position',
      method: 'rss',
      closedMax: 0.04,
      toleranceModifier: 'RFS',
      autoBonus: true,
      bonusTolerance: 0,
      rings: [{ name: 'X定位', tolerance: 0.001, factor: 1, type: 'increasing', direction: 'right' }],
      datums: [{ label: 'A', priority: 'primary', tolerance: 0.05 }],
    })
    expect(r.pass).toBe(false)
    expect(r.outputs.chainResult.pass).toBe(true)
    expect(r.warnings.some((w) => w.key === 'datum_stack_exceeded')).toBe(true)
  })

  it('adaptGdtStack marks simple mode with datums as review-only', () => {
    const r = adaptGdtStack({
      calcMode: 'simple',
      typeId: 'position',
      method: 'rss',
      closedMax: 0.04,
      toleranceModifier: 'RFS',
      autoBonus: true,
      bonusTolerance: 0,
      rings: [{ name: 'X定位', tolerance: 0.001, factor: 1, type: 'increasing', direction: 'right' }],
      datums: [{ label: 'A', priority: 'primary', tolerance: 0.05 }],
    })
    expect(r.pass).toBe(true)
    expect(getCalcReviewStatus(r)).toBe('review')
    expect(r.warnings.some((w) => w.key === 'simple_datums_ignored')).toBe(true)
  })

  it('adaptSpring flags index out of range', () => {
    const r = adaptSpring({
      calcMode: 'complete',
      material: 'oil_tempered',
      wireDiameter: 0.5,
      meanDiameter: 30,
      activeCoils: 6,
      load: 100,
      allowableShear: 600,
      freeLength: 40,
      endType: 'fixed',
    })
    expect(r.pass).toBe(false)
  })

  it('adaptFilletWeld returns shear stress + throat', () => {
    const r = adaptFilletWeld({
      calcMode: 'complete',
      legSize: 6,
      weldLength: 100,
      force: 20000,
      steelGrade: 'Q235',
    })
    const keys = r.keyMetrics.map((m) => m.key)
    expect(keys).toContain('shearStress')
    expect(keys).toContain('throat')
  })

  it('adaptFilletWeld simple mode remains review-only when shear passes', () => {
    const r = adaptFilletWeld({
      calcMode: 'simple',
      legSize: 6,
      weldLength: 100,
      force: 20000,
      steelGrade: 'Q235',
    })
    const shear = r.keyMetrics.find((m) => m.key === 'shearStress')
    expect(shear?.status).toBe('pass')
    expect(getCalcReviewStatus(r)).toBe('review')
  })

  it('adaptButtWeld simple mode remains review-only', () => {
    const r = adaptButtWeld({
      calcMode: 'simple',
      thickness: 8,
      weldLength: 120,
      force: 50000,
      steelGrade: 'Q235',
    })
    expect(r.keyMetrics.find((m) => m.key === 'normalStress')?.status).toBe('pass')
    expect(getCalcReviewStatus(r)).toBe('review')
  })

  it('adaptWeldFatigue fails with excessive stress range', () => {
    const r = adaptWeldFatigue({
      stressRange: 120,
      cycles: 2e6,
      detailCategory: 'medium',
    })
    expect(r.pass).toBe(false)
    expect(r.keyMetrics.find((m) => m.key === 'stressRange')?.status).toBe('fail')
  })

  it('adaptWeldHaz reports HAZ stress status separately', () => {
    const pass = adaptWeldHaz({
      heatInput: 1.2,
      plateThickness: 8,
      steelGrade: 'Q235',
      legSize: 6,
      force: 8000,
      weldLength: 100,
    })
    const fail = adaptWeldHaz({
      heatInput: 3.0,
      plateThickness: 8,
      steelGrade: 'Q235',
      legSize: 4,
      force: 30000,
      weldLength: 40,
    })
    expect(pass.keyMetrics.find((m) => m.key === 'weldStress')?.status).toBe('pass')
    expect(fail.keyMetrics.find((m) => m.key === 'weldStress')?.status).toBe('fail')
  })

  it('adaptBoltGroup returns max bolt force metric', () => {
    const r = adaptBoltGroup({
      calcMode: 'complete',
      boltCount: 8,
      boltCircleRadius: 60,
      shearX: 5000,
      shearY: 2000,
      moment: 120000,
      allowPerBolt: 8000,
    })
    expect(r.keyMetrics.find((m) => m.key === 'maxBoltForce')).toBeDefined()
  })

  it('adaptBoltGroup simple mode remains review-only when scalar check passes', () => {
    const r = adaptBoltGroup({
      calcMode: 'simple',
      boltCount: 8,
      boltCircleRadius: 60,
      shearX: 5000,
      shearY: 2000,
      moment: 120000,
      allowPerBolt: 8000,
    })
    const maxBolt = r.keyMetrics.find((m) => m.key === 'maxBoltForce')
    expect(maxBolt?.status).toBe('pass')
    expect(getCalcReviewStatus(r)).toBe('review')
  })

  it('adaptSizeChain returns tolerance metrics when configured', () => {
    const r = adaptSizeChain({
      closedRing: { min: -0.1, max: 0.1, unit: 'mm' },
      componentRings: [
        { name: 'A1', size: 10, tolerance: 0.05, factor: 1, type: 'increasing' },
        { name: 'A2', size: 20, tolerance: 0.05, factor: 1, type: 'decreasing' },
      ],
      method: 'rss',
    })
    expect(r.keyMetrics.map((m) => m.key)).toContain('totalTolerance')
    expect(r.keyMetrics.map((m) => m.key)).toContain('worstMargin')
    expect(getCalcReviewStatus(r)).toBe('review')
    expect(r.warnings.some((w) => w.key === 'statistical_method_review_only')).toBe(true)
  })
})

describe('extra inverse presets', () => {
  it('key: reverse solves min key length', () => {
    const preset = DECISION_PRESETS.key
    const r = runPresetInverse(preset, 'min-key-length', {
      calcMode: 'complete',
      torque: 500,
      shaftDiameter: 30,
      keyWidth: 8,
      keyHeight: 7,
      allowShear: 100,
      allowCrush: 150,
    })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(10)
  })

  it('beam: reverse solves min diameter', () => {
    const preset = DECISION_PRESETS.beam
    const r = runPresetInverse(preset, 'min-diameter-round', {
      calcMode: 'complete',
      caseId: 'simply_center',
      sectionType: 'solid_round',
      spanLength: 800,
      load: 3000,
      elasticModulus: 210000,
      allowableStress: 160,
      allowableDeflection: 0.8,
    })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(10)
  })

  it('weld: reverse selects min standard leg size', () => {
    const preset = DECISION_PRESETS.weld
    const r = runPresetInverse(preset, 'min-leg-size', {
      calcMode: 'complete',
      legSize: 6,
      weldLength: 100,
      force: 30000,
      steelGrade: 'Q235',
    })
    expect(r.converged).toBe(true)
    expect([3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20]).toContain(r.solution)
  })

  it('bearing catalog: returns recommended model + full candidate list', () => {
    const preset = DECISION_PRESETS.bearing
    const r = runPresetInverse(preset, 'pick-standard-model', {
      calcMode: 'simple',
      radialLoad: 5000,
      axialLoad: 0,
      x: 1,
      y: 0,
      rpm: 1500,
      targetHours: 5000,
      shaftDiameter: 25,
      bearingType: 'ball',
    })
    expect(r.strategy).toBe('catalog')
    expect(r.candidates.length).toBeGreaterThan(0)
    expect(r.solution).toBeTruthy()
    expect(r.solutionRow).toHaveProperty('C')
  })

  it('bolt-group: reverse solves min bolt count', () => {
    const preset = DECISION_PRESETS['bolt-group']
    const r = runPresetInverse(preset, 'min-bolt-count', {
      calcMode: 'simple',
      boltCount: 4,
      boltCircleRadius: 60,
      shearX: 6000,
      shearY: 2000,
      moment: 100000,
      allowPerBolt: 8000,
    })
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThanOrEqual(4)
  })

  it('editor: reverse finds max critical ring tolerance', () => {
    const preset = DECISION_PRESETS.editor
    const rings = [
      { name: 'A1', size: 10, tolerance: 0.05, es: 0.025, ei: -0.025, factor: 1, type: 'increasing' },
      { name: 'A2', size: 20, tolerance: 0.05, es: 0.025, ei: -0.025, factor: 1, type: 'decreasing' },
    ]
    const base = {
      closedRing: { min: -10.2, max: -9.8, unit: 'mm' },
      componentRings: rings,
      method: 'rss',
      criticalRingIndex: 0,
    }
    expect(adaptSizeChain(base).pass).toBe(true)
    const r = runPresetInverse(preset, 'relax-critical-tolerance', base)
    expect(r.converged).toBe(true)
    expect(r.solution).toBeGreaterThan(0.05)
  })

  it('editor: sensitivity parameters track ring tolerances', () => {
    const preset = DECISION_PRESETS.editor
    const rings = [
      { name: 'A1', size: 10, tolerance: 0.05, es: 0.025, ei: -0.025, factor: 1, type: 'increasing' },
      { name: 'A2', size: 20, tolerance: 0.05, es: 0.025, ei: -0.025, factor: 1, type: 'decreasing' },
    ]
    const base = {
      closedRing: { min: -10.2, max: -9.8, unit: 'mm' },
      componentRings: rings,
      method: 'rss',
      tol_0: 0.05,
      tol_1: 0.05,
    }
    const params = preset.sensitivity.buildParameters(base)
    expect(params).toHaveLength(2)
    expect(params[0].key).toBe('tol_0')

    const analysis = runSensitivityAnalysis({
      baseInputs: base,
      parameters: params,
      metrics: preset.sensitivity.metrics,
      evaluate: (inputs) => {
        const prepared = preset.sensitivity.remapInputs(inputs)
        const snap = adaptSizeChain(prepared)
        const metrics = {}
        for (const m of snap.keyMetrics) {
          if (typeof m.value === 'number') metrics[m.key] = m.value
        }
        return { metrics }
      },
    })
    expect(analysis.rows.length).toBe(2)
    expect(analysis.rows.every((r) => Number.isFinite(r.effects.worstMargin.swingPercent))).toBe(true)
  })
})

describe('enhanced report', () => {
  it('builds structured sections including standards and suggestions', () => {
    const snapshot = adaptShaftTorsion({
      calcMode: 'complete',
      diameter: 20,
      torque: 500,
      yieldStrength: 235,
    })
    const report = buildEnhancedReport({ snapshot })
    const headings = report.sections.map((s) => s.heading).filter(Boolean)
    expect(headings).toContain('关键结果')
    expect(headings).toContain('引用标准 / 方法')
    expect(headings).toContain('建议')
    expect(headings).toContain('免责声明')
  })

  it('renders release-blocked results as review instead of fail', () => {
    const snapshot = buildCalcResult({
      toolId: 'bearing',
      toolLabel: '轴承寿命',
      calcMode: 'complete',
      keyMetrics: [{ key: 'lifeHours', label: '寿命', value: 12000, unit: 'h' }],
      pass: false,
      estimateOnly: true,
      unconfirmedCriticalInputs: ['dynamicLoad'],
    })
    snapshot.releaseBlocked = true
    const report = buildEnhancedReport({ snapshot })
    const summary = report.sections.find((s) => s.heading === '判定汇总')
    expect(summary.rows[0].value).toContain('未放行')
  })
})
