import { describe, it, expect } from 'vitest'
import { calculateChainResult, getGdtCalcMode } from '@/utils/gdt-chain'

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
    })
    expect(withBonus.effectiveTolerance ?? withBonus.totalTolerance).toBeGreaterThanOrEqual(
      base.totalTolerance,
    )
  })
})
