import { describe, it, expect, beforeEach, beforeAll } from 'vitest'

// In-memory shim for localStorage / sessionStorage (Node test env doesn't provide them)
function makeMemoryStorage() {
  const store = new Map()
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  }
}

beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = makeMemoryStorage()
  }
  if (typeof globalThis.sessionStorage === 'undefined') {
    globalThis.sessionStorage = makeMemoryStorage()
  }
})

import {
  createChain,
  getChain,
  listChains,
  saveStep,
  updateSharedInputs,
  renameChain,
  deleteChain,
  chainSummary,
  CHAIN_TYPES,
} from '@/utils/design-context'
import {
  buildChainSnapshots,
  buildStepInputs,
  resolveInverseApply,
  CHAIN_INVERSE_APPLY,
} from '@/utils/chain-snapshots'
import {
  writeChainHandoff,
  consumeChainHandoff,
  applyHandoffInputs,
  clearChainHandoff,
} from '@/utils/chain-handoff'
import { buildChainReport } from '@/utils/chain-report'
import { adaptShaftTorsion, adaptBearing, adaptKeyConnection } from '@/utils/calc-adapters'

function resetStorage() {
  if (typeof localStorage !== 'undefined') localStorage.clear()
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
}

describe('design-context', () => {
  beforeEach(resetStorage)

  it('createChain seeds defaults from schema', () => {
    const c = createChain({ type: 'powertrain', name: 'test' })
    expect(c.id).toBeDefined()
    expect(c.type).toBe('powertrain')
    expect(c.sharedInputs.torque).toBe(CHAIN_TYPES.powertrain.sharedInputSchema.torque.default)
    expect(c.steps).toHaveLength(3)
    expect(c.steps[0].snapshot).toBeNull()
  })

  it('saveStep persists snapshots and updateSharedInputs merges', () => {
    const c = createChain({ type: 'powertrain', name: 't' })
    const shaft = adaptShaftTorsion({
      calcMode: 'complete',
      diameter: 30,
      torque: 200,
      yieldStrength: 235,
    })
    saveStep(c.id, 'shaft', { snapshot: shaft, notes: 'basic' })
    updateSharedInputs(c.id, { torque: 300 })

    const updated = getChain(c.id)
    expect(updated.sharedInputs.torque).toBe(300)
    expect(updated.steps.find((s) => s.key === 'shaft').snapshot).toBeTruthy()
    expect(updated.steps.find((s) => s.key === 'shaft').notes).toBe('basic')
  })

  it('chainSummary reports pass/fail/incomplete correctly', () => {
    const c = createChain({ type: 'powertrain' })
    expect(chainSummary(c).status).toBe('incomplete')

    // Fill all 3 with pass snapshots
    const shared = c.sharedInputs
    saveStep(c.id, 'shaft', {
      snapshot: adaptShaftTorsion({
        calcMode: 'complete',
        diameter: shared.shaftDiameter,
        torque: shared.torque,
        yieldStrength: shared.yieldStrength,
      }),
    })
    saveStep(c.id, 'bearing', {
      snapshot: adaptBearing({
        calcMode: 'simple',
        dynamicLoad: 50000,
        radialLoad: shared.radialLoad,
        rpm: shared.rpm,
        x: 1,
        y: 0,
        targetHours: shared.targetHours,
      }),
    })
    saveStep(c.id, 'key', {
      snapshot: adaptKeyConnection({
        calcMode: 'complete',
        torque: shared.torque,
        shaftDiameter: shared.shaftDiameter,
        keyWidth: 8,
        keyHeight: 7,
        keyLength: 40,
        hubLength: 40,
      }),
    })
    const summary = chainSummary(getChain(c.id))
    expect(summary.total).toBe(3)
    expect(summary.status === 'pass' || summary.status === 'fail').toBe(true)
  })

  it('rename and delete', () => {
    const c = createChain({ type: 'powertrain' })
    renameChain(c.id, 'renamed')
    expect(getChain(c.id).name).toBe('renamed')
    expect(deleteChain(c.id)).toBe(true)
    expect(getChain(c.id)).toBeNull()
  })

  it('listChains returns per-type', () => {
    createChain({ type: 'powertrain' })
    createChain({ type: 'powertrain' })
    expect(listChains('powertrain')).toHaveLength(2)
  })
})

describe('bolt-joint chain', () => {
  beforeEach(resetStorage)

  it('createChain seeds bolt-joint defaults', () => {
    const c = createChain({ type: 'bolt-joint', name: 'joint1' })
    expect(c.steps).toHaveLength(3)
    expect(c.sharedInputs.preload).toBe(25000)
    expect(c.sharedInputs.boltCount).toBe(8)
  })

  it('buildChainSnapshots evaluates all bolt-joint steps', () => {
    const c = createChain({ type: 'bolt-joint' })
    const snaps = buildChainSnapshots('bolt-joint', c.sharedInputs)
    expect(snaps['bolt-preload']).toBeDefined()
    expect(snaps['bolt-group']).toBeDefined()
    expect(snaps.weld).toBeDefined()
    expect(snaps['bolt-preload'].toolId).toBe('bolt-preload')
  })

  it('bolt-group clampForcePerBolt tracks preload', () => {
    const c = createChain({ type: 'bolt-joint' })
    updateSharedInputs(c.id, { preload: 32000 })
    const shared = getChain(c.id).sharedInputs
    const inputs = buildStepInputs('bolt-joint', 'bolt-group', shared)
    expect(inputs.clampForcePerBolt).toBe(32000)
  })
})

describe('chain-handoff', () => {
  beforeEach(resetStorage)

  it('write/consume is one-shot and tool-scoped', () => {
    writeChainHandoff({
      chainId: 'dc_1',
      chainType: 'powertrain',
      stepKey: 'shaft',
      toolId: 'shaft',
      inputs: { diameter: 40, torque: 300 },
    })
    expect(consumeChainHandoff('bearing')).toBeNull()
    const handoff = consumeChainHandoff('shaft')
    expect(handoff.inputs.diameter).toBe(40)
    expect(handoff.inputs.torque).toBe(300)
    expect(consumeChainHandoff('shaft')).toBeNull()
  })

  it('applyHandoffInputs only writes existing form keys', () => {
    const form = { diameter: 30, torque: 200, length: 500 }
    const applied = applyHandoffInputs(form, {
      diameter: 42,
      torque: 280,
      unknownField: 1,
      nested: { a: 1 },
    })
    expect(form.diameter).toBe(42)
    expect(form.torque).toBe(280)
    expect(form.length).toBe(500)
    expect(applied).toEqual(['diameter', 'torque'])
    clearChainHandoff()
  })
})

describe('resolveInverseApply', () => {
  it('maps catalog solutionRow.C to dynamicLoad', () => {
    const spec = CHAIN_INVERSE_APPLY.powertrain.bearing['pick-standard-model']
    const applied = resolveInverseApply(spec, {
      strategy: 'catalog',
      solution: '6208',
      solutionRow: { model: '6208', C: 41000 },
    })
    expect(applied).toEqual({ field: 'dynamicLoad', value: 41000 })
  })
})

describe('chain-report', () => {
  beforeEach(resetStorage)

  it('buildChainReport contains overview + shared + step sections', () => {
    const c = createChain({ type: 'powertrain' })
    const shared = c.sharedInputs
    saveStep(c.id, 'shaft', {
      snapshot: adaptShaftTorsion({
        calcMode: 'complete',
        diameter: shared.shaftDiameter,
        torque: shared.torque,
        yieldStrength: shared.yieldStrength,
      }),
    })
    const report = buildChainReport(getChain(c.id))
    const headings = report.sections.map((s) => s.heading).filter(Boolean)
    expect(headings).toContain('链概览')
    expect(headings).toContain('共享输入')
    expect(headings.some((h) => h.includes('轴强度'))).toBe(true)
    expect(headings).toContain('免责声明')
  })
})
