import { describe, it, expect } from 'vitest'
import {
  calculateChainResult,
  getGdtCalcMode,
  sizeToleranceOfRing,
  calcAutoBonusTolerance,
  resolveBonusTolerance,
} from '@/utils/gdt-chain'
import { analyzeGdtStack, buildGdtStackReportText } from '@/utils/gdt-stack-calc'

describe('gdt-chain', () => {
  it('resolves position mode', () => {
    expect(getGdtCalcMode('position')?.stack).toBe('2d-position')
  })

  it('position chain uses 2d formula', () => {
    const closed = { min: 0, max: 0.1 }
    const rings = [
      { size: 50, tolerance: 0.05, factor: 1, type: 'increasing', direction: 'right' },
      { size: 30, tolerance: 0.04, factor: 1, type: 'increasing', direction: 'up' },
    ]
    const result = calculateChainResult(closed, rings, 'rss', { typeId: 'position' })
    expect(result.contactStress ?? result.totalTolerance).toBeDefined()
    expect(result.totalTolerance).toBeGreaterThan(0)
    expect(result.modeLabel).toBe('位置度链')
  })

  it('MMC bonus increases allowable tolerance band', () => {
    const closed = { min: 0, max: 0.1 }
    const rings = [
      { size: 0.02, tolerance: 0.01, factor: 1, type: 'increasing', direction: 'right' },
    ]
    const base = calculateChainResult(closed, rings, 'rss', { typeId: 'flatness' })
    const withBonus = calculateChainResult(closed, rings, 'rss', {
      typeId: 'flatness',
      toleranceModifier: 'MMC',
      bonusTolerance: 0.02,
      autoBonus: false,
    })
    expect(withBonus.totalTolerance).toBeCloseTo(base.totalTolerance, 8)
    expect(withBonus.effectiveTolerance).toBeCloseTo(base.totalTolerance + 0.02, 8)
  })

  it('sizeToleranceOfRing prefers explicit sizeTolerance then es-ei', () => {
    expect(sizeToleranceOfRing({ sizeTolerance: 0.04 })).toBeCloseTo(0.04)
    expect(sizeToleranceOfRing({ es: 0.02, ei: -0.01 })).toBeCloseTo(0.03)
  })

  it('auto bonus sums only FOS rings', () => {
    const rings = [
      { name: 'pos', tolerance: 0.05, featureKind: '' },
      { name: 'hole', tolerance: 0.02, featureKind: 'hole', sizeTolerance: 0.03 },
      { name: 'shaft', tolerance: 0.01, featureKind: 'shaft', es: 0.01, ei: -0.02 },
    ]
    const { total, items } = calcAutoBonusTolerance(rings, { toleranceModifier: 'MMC' })
    expect(items).toHaveLength(2)
    expect(total).toBeCloseTo(0.06)
  })

  it('resolveBonusTolerance prefers auto FOS sum over manual', () => {
    const rings = [{ name: 'hole', featureKind: 'hole', sizeTolerance: 0.025 }]
    const r = resolveBonusTolerance(rings, {
      toleranceModifier: 'MMC',
      bonusTolerance: 0.1,
      autoBonus: true,
    })
    expect(r.source).toBe('auto')
    expect(r.bonus).toBeCloseTo(0.025)
  })

  it('auto MMC bonus applied in position stack', () => {
    const rings = [
      { name: 'X', tolerance: 0.05, direction: 'right', factor: 1, type: 'increasing' },
      {
        name: 'hole',
        tolerance: 0.02,
        direction: 'right',
        factor: 0.5,
        type: 'increasing',
        featureKind: 'hole',
        sizeTolerance: 0.03,
      },
    ]
    const base = calculateChainResult({ min: 0, max: 0.2 }, rings, 'rss', {
      typeId: 'position',
      toleranceModifier: 'RFS',
    })
    const mmc = calculateChainResult({ min: 0, max: 0.2 }, rings, 'rss', {
      typeId: 'position',
      toleranceModifier: 'MMC',
      autoBonus: true,
    })
    expect(mmc.bonusSource).toBe('auto')
    expect(mmc.bonusApplied).toBeCloseTo(0.03)
    expect(mmc.totalTolerance).toBeCloseTo(base.totalTolerance, 8)
    expect(mmc.effectiveTolerance).toBeCloseTo(0.23)
  })

  it('MMC bonus can turn budget check from fail to pass', () => {
    const rings = [
      {
        name: '孔',
        tolerance: 0.11,
        direction: 'right',
        factor: 1,
        type: 'increasing',
        featureKind: 'hole',
        sizeTolerance: 0.03,
      },
    ]
    const closed = { min: 0, max: 0.1 }
    const base = calculateChainResult(closed, rings, 'rss', {
      typeId: 'position',
      toleranceModifier: 'RFS',
    })
    const mmc = calculateChainResult(closed, rings, 'rss', {
      typeId: 'position',
      toleranceModifier: 'MMC',
      autoBonus: true,
    })
    expect(base.pass).toBe(false)
    expect(base.totalTolerance).toBeCloseTo(0.11, 6)
    expect(mmc.pass).toBe(true)
    expect(mmc.effectiveTolerance).toBeCloseTo(0.13, 6)
  })

  it('analyzeGdtStack exposes bonus breakdown', () => {
    const r = analyzeGdtStack({
      typeId: 'position',
      closedRing: { min: 0, max: 0.2 },
      rings: [
        {
          name: '孔径',
          tolerance: 0.02,
          direction: 'right',
          factor: 1,
          type: 'increasing',
          featureKind: 'hole',
          sizeTolerance: 0.04,
        },
      ],
      toleranceModifier: 'MMC',
      autoBonus: true,
    })
    expect(r.modifier.source).toBe('auto')
    expect(r.modifier.bonus).toBeCloseTo(0.04)
    expect(r.modifier.breakdown[0].name).toBe('孔径')
  })

  it('editor FOS rings with es-ei derive auto bonus', () => {
    const rings = [
      { name: 'A1', tolerance: 0.05, factor: 1, type: 'increasing', direction: 'right' },
      {
        name: '孔',
        tolerance: 0.02,
        factor: 1,
        type: 'increasing',
        direction: 'right',
        featureKind: 'hole',
        es: 0.02,
        ei: -0.01,
        sizeTolerance: 0.03,
      },
    ]
    const r = calculateChainResult({ min: 0, max: 0.2 }, rings, 'rss', {
      typeId: 'position',
      toleranceModifier: 'MMC',
      autoBonus: true,
    })
    expect(r.bonusSource).toBe('auto')
    expect(r.bonusApplied).toBeCloseTo(0.03)
  })

  it('buildGdtStackReportText supports simple mode without contributions', () => {
    const r = analyzeGdtStack({
      calcMode: 'simple',
      typeId: 'flatness',
      closedRing: { min: 0, max: 0.1 },
      rings: [{ name: 'A', tolerance: 0.03, factor: 1, type: 'increasing' }],
      method: 'rss',
    })
    const text = buildGdtStackReportText(r, 'zh')
    expect(text).toContain('GD&T')
    expect(text).not.toContain('undefined')
  })
})
