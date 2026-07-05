import { describe, expect, it } from 'vitest'
import { analyzeBearingLife } from '@/utils/bearing-calc'

describe('bearing-calc', () => {
  it('professional modified life uses linear a2 factor', () => {
    const result = analyzeBearingLife({
      calcMode: 'professional',
      dynamicLoad: 35000,
      staticLoad: 18000,
      radialLoad: 5000,
      axialLoad: 1000,
      x: 1,
      y: 1.6,
      rpm: 1500,
      reliabilityFactor: 0.64,
      lifeConditionFactor: 1.0,
      temperatureFactor: 0.8,
      targetHours: 10000,
      autoLookup: false,
    })

    const expected = result.l10MillionRev * 0.64 * 1.0 * 0.8
    expect(result.modifiedLifeMillionRev).toBeCloseTo(expected, 8)
  })
})
