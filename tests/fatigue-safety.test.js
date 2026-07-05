import { describe, it, expect } from 'vitest'
import {
  analyzeFatigue,
  calcMinerDamage,
  calcLifeFromStress,
  buildFatigueReportText,
  parseLoadSpectrum,
} from '@/utils/fatigue-calc'

const confirmed = {
  enforceCriticalConfirm: true,
  confirmedFields: {
    material: true,
    stressAmplitude: true,
    targetLife: true,
    meanStress: true,
    meanStressMethod: true,
    surfaceFactor: true,
    sizeFactor: true,
  },
}

describe('fatigue engineering safety', () => {
  it('targetLife gates single-level pass when no miner', () => {
    const r = analyzeFatigue({
      calcMode: 'complete',
      material: 'steel_45',
      stressAmplitude: 350,
      targetLife: 1e10,
      ...confirmed,
    })
    expect(r.singleLevelPass).toBe(false)
    expect(r.pass).toBe(false)
  })

  it('with miner, pass follows miner not single-level when they diverge', () => {
    const r = analyzeFatigue({
      calcMode: 'complete',
      material: 'steel_45',
      stressAmplitude: 350,
      targetLife: 1e10,
      loads: [{ stress: 280, cycles: 1000 }],
      ...confirmed,
    })
    expect(r.miner.pass).toBe(true)
    expect(r.singleLevelPass).toBe(false)
    expect(r.pass).toBe(true)
  })

  it('professional miner applies Goodman per block with constant Sm', () => {
    const loads = [{ stress: 300, cycles: 1e5 }]
    const plain = calcMinerDamage('steel_45', loads, { enduranceFactor: 1 })
    const corrected = calcMinerDamage('steel_45', loads, {
      enduranceFactor: 1,
      meanStress: 150,
      meanStressMethod: 'goodman',
    })
    expect(corrected.details[0].effectiveStress).toBeGreaterThan(plain.details[0].stress)
    expect(corrected.totalDamage).toBeGreaterThan(plain.totalDamage)
  })

  it('professional miner uses adjusted endurance Se prime for Nf', () => {
    const loads = [{ stress: 220, cycles: 1e6 }]
    const loose = calcMinerDamage('steel_45', loads, { enduranceFactor: 1 })
    const tight = calcMinerDamage('steel_45', loads, { enduranceFactor: 0.765 })
    expect(loose.details[0].lifeAtStress).toBe('∞')
    expect(tight.details[0].lifeAtStress).not.toBe('∞')
    expect(tight.totalDamage).toBeGreaterThan(0)
  })

  it('does not double-apply goodmanPass when miner present', () => {
    const r = analyzeFatigue({
      calcMode: 'professional',
      material: 'steel_45',
      stressAmplitude: 120,
      meanStress: 150,
      meanStressMethod: 'goodman',
      surfaceFactor: 0.9,
      sizeFactor: 0.85,
      loads: [{ stress: 200, cycles: 5000 }],
      ...confirmed,
    })
    expect(r.miner).toBeTruthy()
    expect(r.goodmanPass).toBe(true)
    expect(r.pass).toBe(r.miner.pass)
  })

  it('release allowed when all critical keys marked confirmed', () => {
    const r = analyzeFatigue({
      calcMode: 'professional',
      material: 'steel_45',
      stressAmplitude: 200,
      targetLife: 1e6,
      meanStress: 100,
      meanStressMethod: 'goodman',
      surfaceFactor: 0.9,
      sizeFactor: 0.85,
      loads: [{ stress: 250, cycles: 5000 }],
      enforceCriticalConfirm: true,
      confirmedFields: {
        material: true,
        stressAmplitude: true,
        targetLife: true,
        meanStress: true,
        meanStressMethod: true,
        surfaceFactor: true,
        sizeFactor: true,
      },
    })
    expect(r.releaseBlocked).toBeUndefined()
    expect(r.unconfirmedCriticalInputs ?? []).toHaveLength(0)
  })

  it('blocks pass when critical inputs unconfirmed', () => {
    const r = analyzeFatigue({
      calcMode: 'complete',
      material: 'steel_45',
      stressAmplitude: 200,
      loads: [{ stress: 200, cycles: 1000 }],
      enforceCriticalConfirm: true,
      confirmedFields: { material: true },
    })
    expect(r.releaseBlocked).toBe(true)
    expect(r.pass).toBe(false)
  })

  it('contributionPct sums to ~100% for finite damage', () => {
    const r = calcMinerDamage('steel_45', parseLoadSpectrum('350,10000\n300,50000'))
    const sum = r.details.reduce((a, d) => a + d.contributionPct, 0)
    expect(sum).toBeCloseTo(100, 5)
  })

  it('parseLoadSpectrum rejects non-positive stress or cycles', () => {
    const rows = parseLoadSpectrum('-100,1000\n200,0\n250,5000')
    expect(rows).toEqual([{ stress: 250, cycles: 5000 }])
  })

  it('buildFatigueReportText marks release blocked state', () => {
    const text = buildFatigueReportText(
      { pass: false, releaseBlocked: true, calcMode: 'complete', stressAmplitude: 200 },
      'zh',
    )
    expect(text).toContain('未放行')
  })

  it('calcLifeFromStress respects adjusted endurance limit option', () => {
    const nRaw = calcLifeFromStress('steel_45', 250)
    const nAdj = calcLifeFromStress('steel_45', 250, { enduranceLimit: 214 })
    expect(nRaw).toBe(Infinity)
    expect(nAdj).toBeGreaterThan(1)
    expect(Number.isFinite(nAdj)).toBe(true)
  })

  it('impossible mean stress fails professional miner', () => {
    const r = calcMinerDamage(
      'steel_45',
      [{ stress: 200, cycles: 1e4 }],
      { meanStress: 650, meanStressMethod: 'goodman' },
    )
    expect(r.pass).toBe(false)
    expect(r.totalDamage).toBe(Infinity)
  })

  it('complete vs professional: same spectrum, different Miner D by design', () => {
    const loads = parseLoadSpectrum('350,10000\n300,50000\n250,100000\n220,200000')
    const base = { material: 'steel_45', stressAmplitude: 444, targetLife: 300000, loads }
    const complete = analyzeFatigue({ ...base, calcMode: 'complete' })
    const professional = analyzeFatigue({
      ...base,
      calcMode: 'professional',
      meanStress: 100,
      meanStressMethod: 'goodman',
      surfaceFactor: 0.9,
      sizeFactor: 0.85,
    })
    expect(complete.correctionSummary.minerMeanStress).toBe(false)
    expect(professional.correctionSummary.minerMeanStress).toBe(true)
    expect(complete.miner.totalDamage).toBeLessThan(0.5)
    expect(professional.miner.totalDamage).toBeGreaterThan(1)
    expect(complete.pass).toBe(true)
    expect(professional.pass).toBe(false)
  })
})
