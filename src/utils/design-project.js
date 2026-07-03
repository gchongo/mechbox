/**
 * 设计项目 —— 将多条设计链组织到同一项目下
 *
 * localStorage: mechbox.designProjects
 * [{ id, name, description, chainRefs: [{ chainId, chainType }], createdAt, updatedAt }]
 */

const STORAGE_KEY = 'mechbox.designProjects'
const MAX_PROJECTS = 30

function readStore() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeStore(store) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore quota */
  }
}

function makeId() {
  return `dp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function listProjects() {
  return [...readStore()].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
}

export function getProject(id) {
  return readStore().find((p) => p.id === id) ?? null
}

export function createProject({ name, description } = {}) {
  const store = readStore()
  const project = {
    id: makeId(),
    name: name?.trim() || `设计项目 ${store.length + 1}`,
    description: description?.trim() ?? '',
    chainRefs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const next = [project, ...store].slice(0, MAX_PROJECTS)
  writeStore(next)
  return project
}

export function updateProject(id, patch) {
  const store = readStore()
  const idx = store.findIndex((p) => p.id === id)
  if (idx < 0) return null
  store[idx] = {
    ...store[idx],
    ...patch,
    updatedAt: Date.now(),
  }
  writeStore(store)
  return store[idx]
}

export function renameProject(id, name) {
  return updateProject(id, { name: name?.trim() || getProject(id)?.name })
}

export function deleteProject(id) {
  const store = readStore()
  const next = store.filter((p) => p.id !== id)
  if (next.length === store.length) return false
  writeStore(next)
  return true
}

export function attachChain(projectId, { chainId, chainType }) {
  if (!chainId || !chainType) return null
  const project = getProject(projectId)
  if (!project) return null
  const exists = project.chainRefs.some((r) => r.chainId === chainId)
  if (exists) return project
  return updateProject(projectId, {
    chainRefs: [...project.chainRefs, { chainId, chainType }],
  })
}

export function detachChain(projectId, chainId) {
  const project = getProject(projectId)
  if (!project) return null
  return updateProject(projectId, {
    chainRefs: project.chainRefs.filter((r) => r.chainId !== chainId),
  })
}

/** 查找包含某条设计链的项目 */
export function findProjectsByChain(chainId) {
  return listProjects().filter((p) => p.chainRefs.some((r) => r.chainId === chainId))
}
