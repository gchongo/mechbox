import { describe, it, expect } from 'vitest'
import { getThreadSystemDef } from '@/constants/thread-standards/taxonomy'
import { resolveDiagramKind, buildProfilePath, buildDetailedDiagram } from '@/utils/thread-profile-diagram'

describe('thread profile diagram', () => {
  it('resolves distinct kinds per system', () => {
    expect(resolveDiagramKind(getThreadSystemDef('metric_coarse'))).toBe('triangular_60')
    expect(resolveDiagramKind(getThreadSystemDef('npt'))).toBe('triangular_60_taper')
    expect(resolveDiagramKind(getThreadSystemDef('bspp_g'))).toBe('triangular_55')
    expect(resolveDiagramKind(getThreadSystemDef('bspt_r'))).toBe('triangular_55_taper')
    expect(resolveDiagramKind(getThreadSystemDef('tr'))).toBe('trapezoidal_tr')
    expect(resolveDiagramKind(getThreadSystemDef('acme'))).toBe('trapezoidal_acme')
    expect(resolveDiagramKind(getThreadSystemDef('square'))).toBe('square')
    expect(resolveDiagramKind(getThreadSystemDef('rd'))).toBe('round')
  })

  it('generates different paths for triangular vs trapezoidal', () => {
    const m = buildProfilePath('triangular_60', 'external')
    const tr = buildProfilePath('trapezoidal_tr', 'external')
    expect(m).not.toBe(tr)
    expect(tr).toContain('135')
  })

  it('builds detailed mating profile with dimensions', () => {
    const scene = buildDetailedDiagram('triangular_60')
    expect(scene.regions).toHaveLength(2)
    expect(scene.dims.some((d) => d.label === 'P')).toBe(true)
    expect(scene.dims.some((d) => d.label === 'd / D')).toBe(true)
    expect(scene.ghosts.length).toBeGreaterThan(0)
    expect(scene.angleMark?.label).toBe('60°')
  })

  it('includes sample row values when provided', () => {
    const scene = buildDetailedDiagram('triangular_60', {
      sample: { designation: 'M8', pitch: '1.25 mm', major: '8.000' },
    })
    expect(scene.sampleParams.some((p) => p.value === 'M8')).toBe(true)
  })
})
