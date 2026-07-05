import { describe, it, expect } from 'vitest'
import {
  runThreadDesignWizard,
  getActiveWizardSteps,
  needsSealingStep,
  DEFAULT_ANSWERS,
} from '@/utils/thread-design-wizard'

describe('thread design wizard steps', () => {
  it('fastener skips sealing step', () => {
    expect(needsSealingStep({ purpose: 'fastener' })).toBe(false)
    expect(getActiveWizardSteps({ purpose: 'fastener' })).toEqual([
      'purpose',
      'unit',
      'process',
    ])
  })

  it('pipe includes sealing step', () => {
    expect(needsSealingStep({ purpose: 'pipe' })).toBe(true)
    expect(getActiveWizardSteps({ purpose: 'pipe' })).toEqual([
      'purpose',
      'sealing',
      'unit',
      'process',
    ])
  })
})

describe('thread design recommendations', () => {
  it('metric fastener tapped hole recommends 6H/6g and tap drill samples', () => {
    const r = runThreadDesignWizard({
      purpose: 'fastener',
      unit: 'metric',
      process: 'tapped_hole',
      load: 'normal',
      material: 'steel',
    })
    expect(r.success).toBe(true)
    expect(r.primarySystem).toBe('metric')
    expect(r.toleranceInternal).toBe('6H')
    expect(r.toleranceExternal).toBe('6g')
    expect(r.showTapDrill).toBe(true)
    expect(r.sampleRows.length).toBeGreaterThan(0)
    expect(r.sampleRows.every((row) => row.system === 'metric')).toBe(true)
  })

  it('vibration prefers fine pitch for metric', () => {
    const r = runThreadDesignWizard({
      purpose: 'fastener',
      unit: 'metric',
      process: 'bolt_nut',
      load: 'vibration',
    })
    expect(r.preferFinePitch).toBe(true)
    expect(r.subSeries).toBe('fine')
  })

  it('NA inch fastener recommends UNC or UNF', () => {
    const coarse = runThreadDesignWizard({
      purpose: 'fastener',
      unit: 'inch_na',
      process: 'bolt_nut',
      load: 'normal',
    })
    expect(coarse.primarySystem).toBe('unc')
    expect(coarse.toleranceExternal).toBe('2A')

    const fine = runThreadDesignWizard({
      purpose: 'fastener',
      unit: 'inch_na',
      process: 'bolt_nut',
      load: 'vibration',
    })
    expect(fine.primarySystem).toBe('unf')
  })

  it('pipe gasket seal recommends G', () => {
    const r = runThreadDesignWizard({
      purpose: 'pipe',
      sealing: 'gasket',
      unit: 'metric',
      process: 'pipe_fitting',
    })
    expect(r.success).toBe(true)
    expect(r.primarySystem).toBe('g')
    expect(r.warnings.some((w) => w.key === 'wiz_warn_g_not_npt')).toBe(true)
  })

  it('pipe thread seal NA recommends NPT', () => {
    const r = runThreadDesignWizard({
      purpose: 'pipe',
      sealing: 'thread_seal',
      unit: 'inch_na',
      process: 'pipe_fitting',
    })
    expect(r.primarySystem).toBe('npt')
    expect(r.warnings.some((w) => w.key === 'wiz_warn_npt_not_bsp')).toBe(true)
  })

  it('pipe thread seal metric/EU recommends R', () => {
    const r = runThreadDesignWizard({
      purpose: 'pipe',
      sealing: 'thread_seal',
      unit: 'metric',
      process: 'pipe_fitting',
    })
    expect(r.primarySystem).toBe('r')
  })

  it('pipe without sealing fails with error warning', () => {
    const r = runThreadDesignWizard({
      purpose: 'pipe',
      sealing: 'none',
      unit: 'metric',
      process: 'pipe_fitting',
    })
    expect(r.success).toBe(false)
    expect(r.warnings.some((w) => w.key === 'wiz_warn_pipe_need_seal')).toBe(true)
  })

  it('leadscrew is unsupported in catalog', () => {
    const r = runThreadDesignWizard({
      ...DEFAULT_ANSWERS,
      purpose: 'leadscrew',
    })
    expect(r.success).toBe(false)
    expect(r.unsupportedKey).toBe('wiz_unsupported_leadscrew')
    expect(r.sampleRows).toHaveLength(0)
  })
})
