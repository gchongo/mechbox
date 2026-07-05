import { describe, expect, it } from 'vitest'
import { analyzeFilletWeldProfessional } from '@/utils/weld-calc'

describe('weld-calc', () => {
  it('professional returns errorKey for invalid weld geometry', () => {
    const result = analyzeFilletWeldProfessional({
      legSize: 0,
      weldLength: 0,
      force: 1000,
    })
    expect(result.errorKey).toBe('weld_geometry_invalid')
  })
})
