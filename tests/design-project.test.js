import { describe, it, expect, beforeEach, beforeAll } from 'vitest'

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
})

import { createChain } from '@/utils/design-context'
import {
  listProjects,
  createProject,
  attachChain,
  detachChain,
  deleteProject,
  findProjectsByChain,
} from '@/utils/design-project'

function resetStorage() {
  if (typeof localStorage !== 'undefined') localStorage.clear()
}

describe('design-project', () => {
  beforeEach(resetStorage)

  it('createProject seeds defaults', () => {
    const p = createProject({ name: '变速箱' })
    expect(p.id).toBeDefined()
    expect(p.name).toBe('变速箱')
    expect(p.chainRefs).toEqual([])
    expect(listProjects()).toHaveLength(1)
  })

  it('attach and detach chains', () => {
    const chain = createChain({ type: 'powertrain', name: '轴系1' })
    const project = createProject({ name: '方案A' })
    attachChain(project.id, { chainId: chain.id, chainType: chain.type })
    const updated = listProjects().find((p) => p.id === project.id)
    expect(updated.chainRefs).toHaveLength(1)
    expect(updated.chainRefs[0].chainId).toBe(chain.id)

    detachChain(project.id, chain.id)
    expect(listProjects().find((p) => p.id === project.id).chainRefs).toHaveLength(0)
  })

  it('findProjectsByChain returns linked projects', () => {
    const chain = createChain({ type: 'bolt-joint' })
    const p1 = createProject({ name: 'P1' })
    const p2 = createProject({ name: 'P2' })
    attachChain(p1.id, { chainId: chain.id, chainType: chain.type })
    expect(findProjectsByChain(chain.id)).toHaveLength(1)
    attachChain(p2.id, { chainId: chain.id, chainType: chain.type })
    expect(findProjectsByChain(chain.id)).toHaveLength(2)
    deleteProject(p1.id)
    expect(findProjectsByChain(chain.id)).toHaveLength(1)
  })
})
