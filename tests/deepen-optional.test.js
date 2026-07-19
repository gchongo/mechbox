import { describe, expect, it } from 'vitest'
import {
  analyzePunchBlanking,
  analyzeFlangeForm,
  analyzeSheetMetalUnfold,
} from '@/utils/sheet-metal-calc'
import { analyzePipeFlow, sumFittingLosses } from '@/utils/pipe-flow-calc'
import { analyzeTapDrill } from '@/utils/thread-tap-drill-calc'
import { analyzeVibrationIsolation, RUBBER_MOUNT_CATALOG } from '@/utils/vibration-isolation-calc'
import { GDT_CATEGORIES, GDT_MODIFIERS } from '@/constants/gdt-symbols'
import { getRelatedToolLinks } from '@/constants/related-tools'
import { getAllThreadRows } from '@/constants/thread-standards'

describe('sheet-metal punch & flange', () => {
  it('estimates punch force and clearance', () => {
    const r = analyzePunchBlanking({
      calcMode: 'complete',
      thickness: 2,
      perimeter: 314,
      shearMPa: 320,
      clearancePct: 10,
      pressCapacitykN: 500,
    })
    expect(r.punchForcekN).toBeCloseTo((314 * 2 * 320) / 1000, 5)
    expect(r.sideClearance).toBeCloseTo(0.2, 5)
    expect(r.capacityPass).toBe(true)
  })

  it('estimates flange pre-hole', () => {
    const r = analyzeFlangeForm({
      calcMode: 'complete',
      thickness: 1.5,
      holeDia: 20,
      flangeHeight: 6,
    })
    expect(r.preHoleDia).toBeGreaterThan(0)
    expect(r.preHoleDia).toBeLessThan(20)
    expect(r.hdRatio).toBeCloseTo(0.3, 5)
  })

  it('unfold still works', () => {
    const r = analyzeSheetMetalUnfold({
      calcMode: 'simple',
      thickness: 1.5,
      segments: [
        { type: 'straight', length: 50 },
        { type: 'bend', angle: 90 },
        { type: 'straight', length: 50 },
      ],
    })
    expect(r.flatLength).toBeGreaterThan(100)
  })
})

describe('pipe fitting library', () => {
  it('sums K and Le/D', () => {
    const s = sumFittingLosses(
      [
        { type: 'elbow_90_std', qty: 2 },
        { type: 'gate_open', qty: 1 },
      ],
      'K',
      50,
    )
    expect(s.totalK).toBeCloseTo(0.9 * 2 + 0.15, 5)
    expect(s.equivalentLengthM).toBeGreaterThan(0)
  })

  it('adds fitting K to local loss in complete mode', () => {
    const base = {
      calcMode: 'complete',
      diameter: 25,
      length: 10,
      flowRate: 20,
      density: 998,
      viscosity: 1.002e-3,
      roughness: 0.045,
      localLossK: 0,
      lossMethod: 'K',
      fittings: [{ type: 'elbow_90_std', qty: 2 }],
    }
    const r = analyzePipeFlow(base)
    expect(r.localLossK).toBeCloseTo(1.8, 5)
    expect(r.fittingSummary.items).toHaveLength(1)
  })

  it('Le/D increases effective length', () => {
    const r = analyzePipeFlow({
      calcMode: 'complete',
      diameter: 50,
      length: 10,
      flowRate: 30,
      localLossK: 0,
      lossMethod: 'LeD',
      fittings: [{ type: 'elbow_90_std', qty: 1 }],
    })
    expect(r.effectiveLength).toBeGreaterThan(10)
    expect(r.localLossK).toBe(0)
  })
})

describe('tap torque', () => {
  it('returns torque range for metric thread', () => {
    const row = getAllThreadRows().find((r) => r.designation === 'M8')
    expect(row).toBeTruthy()
    const r = analyzeTapDrill(row, {
      material: 'steel',
      holeType: 'through',
      lubrication: 'cutting_oil',
      engagementLength: 12,
    })
    expect(r.ok).toBe(true)
    expect(r.torqueOk).toBe(true)
    expect(r.tapTorqueNm).toBeGreaterThan(0)
    expect(r.tapTorqueMaxNm).toBeGreaterThan(r.tapTorqueMinNm)
  })
})

describe('vibration rubber mount', () => {
  it('uses mount catalog and suggests mount in professional', () => {
    expect(Object.keys(RUBBER_MOUNT_CATALOG).length).toBeGreaterThan(2)
    const r = analyzeVibrationIsolation({
      calcMode: 'professional',
      mass: 50,
      mountId: 'cyl_med',
      mountCount: 4,
      excitationFreq: 25,
      maxTransmissibility: 0.5,
      isolationTargetDb: 5,
    })
    expect(r.stiffness).toBe(RUBBER_MOUNT_CATALOG.cyl_med.stiffness)
    expect(r.staticDeflectionMm).toBeGreaterThan(0)
    expect(r.suggestedMount).toBeTruthy()
  })
})

describe('gdt symbols & related', () => {
  it('has symbol categories', () => {
    expect(GDT_CATEGORIES.length).toBeGreaterThanOrEqual(5)
    expect(GDT_MODIFIERS.some((m) => m.id === 'mmc')).toBe(true)
  })

  it('related links for gdt-symbols', () => {
    const links = getRelatedToolLinks('gdt-symbols')
    expect(links.some((l) => l.path === '/gdt-stack')).toBe(true)
  })
})
