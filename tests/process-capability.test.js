import { describe, expect, it } from 'vitest'
import { calcProcessCapability } from '@/utils/process-capability'

describe('process-capability', () => {
  it('returns explicit edge-case payload when sigma is non-positive', () => {
    const cap = calcProcessCapability({
      lsl: 9.9,
      usl: 10.1,
      mean: 10.0,
      sigma: 0,
    })
    expect(cap.edgeCaseKey).toBe('sigma_non_positive')
    expect(Number.isNaN(cap.cpk)).toBe(true)
    expect(Number.isNaN(cap.c)).toBe(true)
    expect(cap.passRate).toBe(1)
  })
})
